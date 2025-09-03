import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
config();

// Initialize the Google Generative AI client with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function listEventAgent(query) {
  try {
    const systemPrompt = `
You are a calendar assistant. Your task is to extract filter parameters from a user's natural language query for listing Google Calendar events.

Return ONLY a **valid JSON** object with the following structure:
{
  "timeMin": "2025-05-01T00:00:00",   // Optional. Start of the date/time range in ISO 8601 format.
  "timeMax": "2025-05-05T23:59:59",   // Optional. End of the date/time range in ISO 8601 format.
  "query": "search term"             // Optional. A keyword or phrase to filter events.
}

💡 Notes:
- If a time range is not explicitly mentioned, omit that field.
- If no search keyword is mentioned, set "query" to an empty string.
- NEVER include markdown, triple backticks, or any extra text. Return ONLY the raw JSON object.
- Use ISO 8601 format for all dates (e.g., "2025-05-01T00:00:00").
- Keep the times in the user's local time zone when inferable. Otherwise, assume midnight and end-of-day times.

🧠 Example:
Query: "Show meetings about design between May 2 and May 4"
Response:
{
  "timeMin": "2025-05-02T00:00:00",
  "timeMax": "2025-05-04T23:59:59",
  "query": "design"
}
`;

    // Get the Gemini 1.5 Flash model and provide the system prompt
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-latest",
      systemInstruction: systemPrompt,
    });

    const userPrompt = `Query: ${query}`;

    // Generate content with JSON output enforced
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
      },
    });

    const responseText = result.response.text();
    
    // The response is a guaranteed valid JSON string due to responseMimeType
    return JSON.parse(responseText);

  } catch (err) {
    console.error("Error extracting list event parameters:", err);
    return null;
  }
}