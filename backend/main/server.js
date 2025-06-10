import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { google } from 'googleapis';
import { reason } from '../llm/mainAgent.js';
import { serviceSelect } from '../services/serviceSelector.js';
import { UsersForMcp } from '../database/db.js';
import { createToken, verifyToken } from '../jsonWebtoken/Token.js';
import { saveToken, getToken, deleteToken } from './tokenStore.js';
import { tokensUsers } from '../database/tokens.js';

// Environment variables for Google OAuth
const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:5173';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// AUTH route - Updated to handle authorization code flow
app.post('/api/auth', async (req, res) => {
  try {
    // Check if this is the old flow (token) or new flow (code)
    const { token, code, email: directEmail, name: directName } = req.body;

    if (code) {
      // New authorization code flow
      console.log("Received authorization code:", code.substring(0, 20) + "...");

      if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        console.error("Missing Google OAuth credentials");
        return res.status(500).json({ error: 'Server configuration error' });
      }

      // Initialize OAuth2 client
      const oauth2Client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        REDIRECT_URI
      );

      try {
        // Exchange authorization code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        console.log("Successfully exchanged code for tokens");
        
        // Set credentials to get user info
        oauth2Client.setCredentials(tokens);

        // Get user information
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const { data: userInfo } = await oauth2.userinfo.get();

        const userEmail = userInfo.email;
        const userName = userInfo.name;

        console.log("Retrieved user info - Email:", userEmail, "Name:", userName);

        // Process user and store tokens
        await processUserAndTokens(userEmail, userName, JSON.stringify(tokens));

        // Generate JWT
        const jwt = createToken(userEmail);
        console.log("Generated JWT:", jwt);

        // Store access token temporarily if needed
        const previous = getToken();
        if (previous) {
          console.log("Previous token found, clearing it.");
          deleteToken();
        }
        saveToken(tokens.access_token);

        // Respond with JWT and email
        res.status(200).json({ token: jwt, email: userEmail, name: userName });

      } catch (tokenError) {
        console.error("Token exchange error:", tokenError);
        
        if (tokenError.code === 'invalid_grant') {
          return res.status(400).json({ 
            error: 'Invalid authorization code. Please try signing in again.' 
          });
        }
        
        return res.status(500).json({ 
          error: 'Failed to exchange authorization code for tokens' 
        });
      }

    } else if (token && directEmail) {
      // Fallback to old flow for compatibility
      console.log("Using legacy token flow");
      console.log("Received Google Token:", token.substring(0, 20) + "...");
      console.log("Email:", directEmail);
      console.log("Name:", directName);

      await processUserAndTokens(directEmail, directName, token);

      // Generate JWT
      const jwt = createToken(directEmail);
      console.log("Generated JWT:", jwt);

      // Store access token temporarily if needed
      const previous = getToken();
      if (previous) {
        console.log("Previous token found, clearing it.");
        deleteToken();
      }
      saveToken(token);

      // Respond with JWT and email
      res.status(200).json({ token: jwt, email: directEmail, name: directName });

    } else {
      return res.status(400).json({ 
        error: 'Either authorization code or token with email is required' 
      });
    }

  } catch (err) {
    console.error("Error in /api/auth:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to process user and tokens
async function processUserAndTokens(email, name, tokenData) {
  try {
    let user = await UsersForMcp.findOne({ email });

    if (!user) {
      // Create new user
      user = new UsersForMcp({ name, email });
      await user.save();
      console.log("New user created:", user);

      const newUser = new tokensUsers({
        email: email,
        access_token: tokenData
      });
      await newUser.save();
      console.log("New user token saved");
    } else {
      console.log("User already exists:", user);

      const existingUser = await tokensUsers.findOne({ email: email });
      if (existingUser) {
        existingUser.access_token = tokenData;
        await existingUser.save();
        console.log(`Token updated for user with email ${email}`);
      } else {
        const newUser = new tokensUsers({ email, access_token: tokenData });
        await newUser.save();
        console.log("Token entry created for existing user");
      }
    }
  } catch (dbError) {
    console.error("Database error in processUserAndTokens:", dbError);
    throw dbError;
  }
}

app.post('/api/validate', verifyToken, async (req, res) => {
  res.status(200).json({ message: "Token is valid" });
});

app.post('/api/submit', verifyToken, async (req, res) => {
  const data = req.body;
  const { query, email } = data;

  console.log("Received query:", query);

  try {
    const choice = await reason(query);
    const responseFromMCP = await serviceSelect(choice, query, email);
    res.json({ message: choice, res: responseFromMCP });
  } catch (err) {
    console.error("Error in /api/submit:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
app.listen(3001, () => {
  console.log('Server is running on port 3001');
  console.log('Google Client ID configured:', !!GOOGLE_CLIENT_ID);
  console.log('Google Client Secret configured:', !!GOOGLE_CLIENT_SECRET);
});