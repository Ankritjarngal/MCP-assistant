import { OpenAI } from "openai";
import { config } from "dotenv";
config();

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

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

    const userPrompt = `Query: ${query}`;

    const result = await openai.chat.completions.create({
      model: "meta-llama/llama-3.3-8b-instruct:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1024,
    });

    const responseText = result.choices[0].message.content.trim();

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
    console.error("Error extracting list event parameters:", err);
    return null;
  }
}
