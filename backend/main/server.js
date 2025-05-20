import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { reason } from '../llm/mainAgent.js';
import { serviceSelect } from '../services/serviceSelector.js';
import { UsersForMcp } from '../database/db.js';
import { createToken,verifyToken } from '../jsonWebtoken/Token.js';
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
}
);
app.post('/api/login', async (req, res) => {
    const { email, name } = req.body;

    try {
        const find=UsersForMcp.find({ email });
       
        
        const token = createToken(email);
        res.status(201).json({ message: "User", user: {
            email: find.email,
            name: find.name,
            token: token
        }});
    } catch (err) {
        console.error("Error in /api/login:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/api/register', async (req, res) => {
    const data = req.body;
    const { email,name,password } = data;
    try{
        const alreadyExists = await UsersForMcp.findOne({ email });
        if (alreadyExists) {
            console.log("User already exists:", alreadyExists);
            return res.status(409).json({ message: "User already exists" });
        }
        const newUser = new UsersForMcp({ name, email, password });
        await newUser.save();
        console.log("New user created:", newUser);
        const token = createToken(email);
        res.status(201).json({ message: "User saved", user: {
            email: newUser.email,
            name: newUser.name,
            password: newUser.password,
            token: token
        }});
    }
    catch (err) {
        console.error("Error in /api/register:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
    
})


app.post('/api/submit', verifyToken,async (req, res) => {
    
    const data = req.body;
    console.log("Received:", data);
    const email=data.email;

    try {
        const choice = await reason(data.query);  
        const responseFromMCP = await serviceSelect(choice, data.query,email);

        res.json({ message: choice, res: responseFromMCP });
    } catch (err) {
        console.error("Error in /api/submit:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
