import fs from 'fs/promises';
import path from 'path';
import { google } from 'googleapis';
import { tokensUsers } from '../../database/tokens.js';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/calendar'
];

const path = require('path');

const IS_PROD = process.env.NODE_ENV === 'production';

const TOKEN_PATH = IS_PROD
  ? '/etc/secrets/token.json'
  : path.join(process.cwd(), 'token.json');

const TOKEN_WRITE_PATH = IS_PROD
  ? '/tmp/token.json'
  : TOKEN_PATH;

// Prefer env var for client secret path in production
const CREDENTIALS_PATH = IS_PROD
  ? process.env.CLIENT_SECRET_PATH
  : path.join(process.cwd(), '../googlesecrets/client_secret.json');

/**
 * Load and return an authorized OAuth2 client with token validation and refresh
 */
export async function authorize(userEmail) {
  const oauth2Client = await getOAuth2Client();
  
  try {
    console.log(`🔍 Looking up token for user: ${userEmail}`);
    const user = await tokensUsers.findOne({ email: userEmail });
    
    if (!user) {
      throw new Error(`No user found with email: ${userEmail}`);
    }
    
    const rawToken = user.access_token;
    
    // Validate token
    if (!rawToken || rawToken === 'undefined' || rawToken === 'null' || rawToken === '') {
      throw new Error(`Invalid or missing access token for user: ${userEmail}`);
    }
    
    // Check if we have a full token object or just access token
    let tokenObj;
    try {
      // Try to parse as JSON in case it's a full token object
      tokenObj = typeof rawToken === 'string' ? JSON.parse(rawToken) : rawToken;
    } catch {
      // If parsing fails, treat as raw access token
      tokenObj = { access_token: rawToken.trim() };
    }
    
    // Set credentials for validation
    oauth2Client.setCredentials(tokenObj);
    
    // Test if token is valid by making a simple API call
    const isValid = await validateToken(oauth2Client);
    
    if (!isValid) {
      console.log('🔄 Token invalid, attempting to refresh...');
      
      if (!tokenObj.refresh_token) {
        throw new Error(`Token is invalid and no refresh token available for user: ${userEmail}`);
      }
      
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        const updatedToken = { ...tokenObj, ...credentials };
        
        // Update credentials
        oauth2Client.setCredentials(updatedToken);
        
        // Save updated token back to database
        await tokensUsers.updateOne(
          { email: userEmail },
          { 
            $set: { 
              access_token: JSON.stringify(updatedToken)
            }
          }
        );
        
        console.log('✅ Token refreshed and updated in database');
      } catch (refreshError) {
        console.error('❌ Failed to refresh token:', refreshError);
        throw new Error(`Token refresh failed for user ${userEmail}: ${refreshError.message}`);
      }
    } else {
      console.log('✅ Token is valid');
    }
    
    console.log(`✅ Successfully authorized user: ${userEmail}`);
    return oauth2Client;
    
  } catch (err) {
    console.error('❌ Failed to authorize:', err);
    throw new Error(`Authorization failed for ${userEmail}: ${err.message}`);
  }
}

/**
 * Validate token by making a simple API call
 */
async function validateToken(oauth2Client) {
  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    // Make a simple API call to check if token is valid
    await gmail.users.getProfile({ userId: 'me' });
    return true;
  } catch (error) {
    console.log('🔍 Token validation failed:', error.message);
    return false;
  }
}

/**
 * Check if token is expired
 */
function isTokenExpired(token) {
  if (!token.expiry_date) return false;
  
  // Add 5 minute buffer before actual expiry
  const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
  const now = Date.now();
  
  return now >= (token.expiry_date - bufferTime);
}

/**
 * Load credentials from file and return OAuth2 client
 */
async function getOAuth2Client() {
  try {
    await fs.access(CREDENTIALS_PATH);
    const content = await fs.readFile(CREDENTIALS_PATH, 'utf8');
    const credentials = JSON.parse(content);
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  } catch (err) {
    console.error('❌ Failed to load client secret file:', err);
    throw err;
  }
}

/**
 * Send email with automatic token refresh
 */
export async function sendMail({ to, subject, message, email: senderEmail }) {
  try {
    console.log(`📧 Attempting to send email from: ${senderEmail} to: ${to}`);
    
    if (!senderEmail) {
      throw new Error('Sender email is required');
    }
    
    const auth = await authorize(senderEmail);
    const gmail = google.gmail({ version: 'v1', auth });
    
    const emailLines = [
      `To: ${to}`,
      `Subject: ${subject}`,
      '',
      message
    ];
    
    const emailContent = emailLines.join('\r\n');
    const base64EncodedEmail = Buffer.from(emailContent)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: base64EncodedEmail }
    });

    console.log('✅ Email sent successfully:', result.data.id);
    return result.data;
    
  } catch (error) {
    console.error('❌ Error sending email:', error);
    
    // If it's an authentication error, try once more with fresh authorization
    if (error.code === 401 || error.message?.includes('invalid_token') || error.message?.includes('invalid_grant')) {
      console.log('🔄 Authentication error detected, attempting fresh authorization...');
      
      try {
        // Try to get fresh auth and retry
        const auth = await authorize(senderEmail);
        const gmail = google.gmail({ version: 'v1', auth });
        
        const emailLines = [
          `To: ${to}`,
          `Subject: ${subject}`,
          '',
          message
        ];
        
        const emailContent = emailLines.join('\r\n');
        const base64EncodedEmail = Buffer.from(emailContent)
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        const result = await gmail.users.messages.send({
          userId: 'me',
          requestBody: { raw: base64EncodedEmail }
        });

        console.log('✅ Email sent successfully after re-authorization:', result.data.id);
        return result.data;
        
      } catch (retryError) {
        console.error('❌ Failed even after re-authorization:', retryError);
        throw retryError;
      }
    }
    
    throw error;
  }
}