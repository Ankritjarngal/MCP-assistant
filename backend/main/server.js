import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { reason } from '../llm/mainAgent.js';
import { serviceSelect } from '../services/serviceSelector.js';
import { UsersForMcp } from '../database/db.js';
import { createToken, verifyToken } from '../jsonWebtoken/Token.js';
import { saveToken, getToken, deleteToken } from './tokenStore.js';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// AUTH route
app.post('/api/auth', async (req, res) => {
  const { token, email, name } = req.body;

  if (!token || !email) {
    return res.status(400).json({ error: 'Token and email required' });
  }

  console.log("Received Google Token:", token);
  console.log("Email:", email);
  console.log("Name:", name);

  try {
    // Check if user exists
    let user = await UsersForMcp.findOne({ email });

    if (!user) {
      // Create new user
      user = new UsersForMcp({ name, email });
      await user.save();
      console.log("New user created:", user);
    } else {
      console.log("User already exists:", user);
    }

    // Generate JWT
    const jwt = createToken(email);
    console.log("Generated JWT:", jwt);

    // Store access token temporarily if needed
    const previous = getToken();
    if (previous) {
      console.log("Previous token found, clearing it.");
      deleteToken();
    }
    saveToken(token);

    // Respond with JWT and email
    res.status(200).json({ token: jwt, email });

  } catch (err) {
    console.error("Error in /api/auth:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Token validation route
app.post('/api/validate', verifyToken, async (req, res) => {
  res.status(200).json({ message: "Token is valid" });
});

// Submit query
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
});
