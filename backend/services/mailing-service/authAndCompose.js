import fs from 'fs/promises';
import path from 'path';
import { google } from 'googleapis';

// Define scopes for Gmail and Calendar
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/calendar'
];

// Environment-specific paths
const TOKEN_PATH = process.env.NODE_ENV === 'production'
  ? '/etc/secrets/token.json'
  : path.join(process.cwd(), 'token.json');

const CREDENTIALS_PATH = process.env.NODE_ENV === 'production'
  ? '/etc/secrets/client_secret.json'
  : path.join(process.cwd(), '../googlesecrets/client_secret.json');

// Debug paths
console.log('Current working directory:', process.cwd());
console.log('Token path:', TOKEN_PATH);
console.log('Credentials path:', CREDENTIALS_PATH);

/**
 * Load and create OAuth2 client
 */
async function getOAuth2Client() {
  try {
    await fs.access(CREDENTIALS_PATH);
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
 * Authorize and refresh token if expired
 */
export async function authorize() {
  const oauth2Client = await getOAuth2Client();

  try {
    const tokenContent = await fs.readFile(TOKEN_PATH, 'utf8');
    const token = JSON.parse(tokenContent);
    oauth2Client.setCredentials(token);

    const now = Date.now();
    const expiryDate = token.expiry_date || 0;

    if (expiryDate <= now) {
      console.log('Token expired. Refreshing...');
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);
      await fs.writeFile(TOKEN_PATH, JSON.stringify(credentials));
    }

    return oauth2Client;
  } catch (err) {
    console.error('❌ No valid token found and cannot auth on server. Aborting.');
    throw new Error('OAuth token missing or expired and cannot refresh in production.');
  }
}

/**
 * Send an email using Gmail API
 */
export async function sendMail({ to, subject, message }) {
  try {
    const auth = await authorize();
    const gmail = google.gmail({ version: 'v1', auth });

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

    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: base64EncodedEmail }
    });

    console.log('✅ Email sent successfully:', result.data.id);
    return result.data;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}
