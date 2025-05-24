import fs from 'fs/promises';
import path from 'path';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';

// Define scopes for Gmail API
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/calendar'
];
;

// Define paths relative to this file's location
const TOKEN_PATH = path.join(process.cwd(), 'token.json');

// Corrected path to client secrets - adjust this to match your folder structure
const CREDENTIALS_PATH = path.join(process.cwd(), '../../main/client_secret.json');

// Log paths for debugging
console.log('Current working directory:', process.cwd());
console.log('Token path:', TOKEN_PATH);
console.log('Credentials path:', CREDENTIALS_PATH);

/**
 * Creates an OAuth2 client using stored credentials
 */
async function getOAuth2Client() {
  try {
    // Check if the credentials file exists
    try {
      await fs.access(CREDENTIALS_PATH);
    } catch (error) {
      console.error(`Credentials file not found at: ${CREDENTIALS_PATH}`);
      console.error('Please check the path and ensure the file exists');
      throw new Error(`Credentials file not found at: ${CREDENTIALS_PATH}`);
    }

    const content = await fs.readFile(CREDENTIALS_PATH, 'utf8');
    const credentials = JSON.parse(content);
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  } catch (err) {
    console.error('Error loading client secret file:', err);
    throw err;
  }
}

/**
 * Gets a token silently if one exists, or generates a new one
 * with minimal UI interruption if necessary
 */
export async function authorize() {
  const oauth2Client = await getOAuth2Client();
  
  try {
    // Try to use existing token
    const tokenContent = await fs.readFile(TOKEN_PATH, 'utf8');
    const token = JSON.parse(tokenContent);
    oauth2Client.setCredentials(token);
    
    // Refresh token if expired
    if (oauth2Client.isTokenExpiring()) {
      const refreshResponse = await oauth2Client.refreshAccessToken();
      const tokens = refreshResponse.credentials;
      oauth2Client.setCredentials(tokens);
      await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
    }
    
    return oauth2Client;
  } catch (err) {
    // If no token exists or it's invalid, generate a new one
    console.log('No valid token found. Generating a new token...');
    return await generateNewToken();
  }
}

/**
 * Generate a new token using OAuth flow
 * This will open a browser window once
 */
 async  function generateNewToken() {
  try {
    console.log('Starting OAuth authentication flow...');
    console.log('A browser window will open. Please authenticate and then return here.');
    
    const auth = await authenticate({
      keyfilePath: CREDENTIALS_PATH,
      scopes: SCOPES,
    });
    
    // Save the token for future use
    await fs.writeFile(TOKEN_PATH, JSON.stringify(auth.credentials));
    console.log('Authentication successful! Token saved.');
    
    return auth;
  } catch (error) {
    console.error('Error during authentication:', error);
    throw error;
  }
}

/**
 * Send an email using Gmail API
 */
export async function sendMail({ to, subject, message }) {
  try {
    const auth = await authorize();
    const gmail = google.gmail({ version: 'v1', auth });
    
    // Create the email content
    const emailLines = [
      `To: ${to}`,
      `Subject: ${subject}`,
      '',
      message
    ];
    
    const email = emailLines.join('\r\n');
    const base64EncodedEmail = Buffer.from(email)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    // Send the email
    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: base64EncodedEmail
      }
    });
    
    console.log('Email sent successfully:', result.data.id);
    return result.data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}