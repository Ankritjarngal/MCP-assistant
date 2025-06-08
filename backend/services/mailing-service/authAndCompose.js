import fs from 'fs/promises';
import path from 'path';
import { google } from 'googleapis';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/calendar'
];

// Environment-specific paths
const IS_PROD = process.env.NODE_ENV === 'production';

const TOKEN_PATH = IS_PROD
  ? '/etc/secrets/token.json' // mounted secret, may be read-only
  : path.join(process.cwd(), 'token.json');

const TOKEN_WRITE_PATH = IS_PROD
  ? '/tmp/token.json' // fallback writable location for refreshed tokens
  : TOKEN_PATH;

const CREDENTIALS_PATH = IS_PROD
  ? '/etc/secrets/client_secret.json'
  : path.join(process.cwd(), '../googlesecrets/client_secret.json');

console.log('🛠️ Current working directory:', process.cwd());
console.log('📁 Token path:', TOKEN_PATH);
console.log('🔑 Credentials path:', CREDENTIALS_PATH);

/**
 * Load and return an authorized OAuth2 client
 */
export async function authorize() {
  const oauth2Client = await getOAuth2Client();

  try {
    const tokenPath = path.join(process.cwd(), 'google_token.txt');
    const rawToken = await fs.readFile(tokenPath, 'utf8');

    if (!rawToken) throw new Error('Token is empty');

    // Inject the raw access token
    oauth2Client.setCredentials({ access_token: rawToken.trim() });

    console.log('✅ Using raw token from token.txt for testing');
    return oauth2Client;
  } catch (err) {
    console.error('❌ Failed to read token.txt:', err);
    throw new Error('Access token missing or unreadable from token.txt');
  }
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
