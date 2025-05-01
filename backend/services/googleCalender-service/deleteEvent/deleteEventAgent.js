import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
config();

const api_key = process.env.GOOGLE_KEY;
const genAI = new GoogleGenerativeAI(api_key);

export async function deleteEventAgent(query) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const systemPrompt = `You are a calendar assistant. Your job is to extract the necessary information from a user's query to delete a specific event from Google Calendar.

Return ONLY a valid JSON object with the following structure:
{
  "eventSummary": "title of the event to delete",  // Required
  "date": "2025-05-01"                             // Optional, ISO format (YYYY-MM-DD) to help narrow down the search
}

💡 Notes:
- Only include fields that the user provides or implies.
- Omit the "date" field if no specific date is mentioned.
- DO NOT include any explanation, markdown, or formatting. Output ONLY the raw JSON object.

Example:
Query: "Cancel my call with Sarah on May 3rd"
Response:
{
  "eventSummary": "call with Sarah",
  "date": "2025-05-03"
}
`;

    const userPrompt = `Query: ${query}`;

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "user", parts: [{ text: userPrompt }] }
      ],
      generationConfig: { maxOutputTokens: 2048 },
    });

    const responseText = result.response.text().trim();

    try {
      return JSON.parse(responseText);
    } catch (e) {
      const cleanedResponse = responseText
        .replace(/^```json\s*/, "")
        .replace(/```$/, "")
        .trim();
      try {
        return JSON.parse(cleanedResponse);
      } catch (innerErr) {
        console.warn("Could not parse response JSON even after cleaning. Raw:", responseText);
        return null;
      }
    }
  } catch (err) {
    console.error("Error in event reasoning:", err);
    return null;
  }
}
