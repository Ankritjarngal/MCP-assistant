import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
config();

// Initialize the Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function deleteEventAgent(query) {
  try {
    const systemPrompt = `You are a smart calendar assistant. Your job is to extract the details needed to delete a Google Calendar event from a user's query. The current date is Thursday, September 4, 2025; use this to resolve relative dates like "today" or "tomorrow".

Return ONLY a valid JSON object with the following structure:
{
  "eventSummary": "title of the event to delete",
  "date": "YYYY-MM-DD" 
}

🧠 Instructions:
- The "eventSummary" should be the most specific event title from the query.
- The "date" is optional; only include it if mentioned. Parse natural language (e.g., "today", "tomorrow", "May 16th 2025") into YYYY-MM-DD format.
- Ignore words like "delete," "cancel," or "remove" in the summary.

⚠️ Strict Output Rules:
- Output ONLY a valid raw JSON object.
- No explanations, markdown, backticks, or additional text.

✅ Examples:
Query: "Cancel my call with Sarah on May 3rd"
Response:
{
  "eventSummary": "call with Sarah",
  "date": "2025-05-03"
}

Query: "remove my dentist appointment tomorrow"
Response:
{
  "eventSummary": "dentist appointment",
  "date": "2025-09-05"
}

Query: "cancel the team meeting"
Response:
{
  "eventSummary": "team meeting"
}`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-latest",
      systemInstruction: systemPrompt,
    });

    // Configure the model to output JSON
    const generationConfig = {
      temperature: 0.2,
      maxOutputTokens: 1024,
      responseMimeType: 'application/json',
    };

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `Query: ${query}` }] }],
      generationConfig,
    });

    // Directly parse the guaranteed JSON response
    const responseText = result.response.text();
    return JSON.parse(responseText);

  } catch (err) {
    console.error("Error in deleteEventAgent:", err);
    return null;
  }
}