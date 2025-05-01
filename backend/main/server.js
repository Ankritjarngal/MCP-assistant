import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { reason } from '../llm/mainAgent.js';
import { serviceSelect } from '../services/serviceSelector.js';
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.post('/api/submit', async (req, res) => {
    const data = req.body;
    console.log("Received:", data);

    try {
        const choice = await reason(data.query);  
        const responseFromMCP = await serviceSelect(choice, data.query);

        res.json({ message: choice, res: responseFromMCP });
    } catch (err) {
        console.error("Error in /api/submit:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
