import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
config();

// Initialize the Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function createEventAgent(query) {
  try {
    const systemPrompt = `You are a calendar assistant. Your task is to extract structured event information from a natural language query. The current date is Thursday, September 4, 2025. Use this for resolving relative dates like "tomorrow".

Return only a **valid JSON** object in the following format:
{
  "summary": "Event Title",
  "start": "YYYY-MM-DDTHH:MM:SS",
  "end": "YYYY-MM-DDTHH:MM:SS",
  "attendees": ["email1@example.com"],
  "description": "Optional event description."
}

💡 Notes:
- Times must be in ISO 8601 format.
- If no attendees are mentioned, return an empty array [].
- If no description is provided, return an empty string "".
- NEVER include any text outside of the JSON object.`;

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

    // The response text is a guaranteed JSON string, which we can parse directly.
    const responseText = result.response.text();
    return JSON.parse(responseText);

  } catch (err) {
    console.error("Error in createEventAgent:", err);
    return null; // Return null on failure
  }
}