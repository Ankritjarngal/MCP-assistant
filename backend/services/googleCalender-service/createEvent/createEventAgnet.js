import { OpenAI } from "openai";
import { config } from "dotenv";
config();

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function createEventAgent(query) {
  try {
    const systemPrompt = `
You are a calendar assistant. Your task is to extract structured event information from a natural language query.

Return only a **valid JSON** object in the following format:
{
  "summary": "Event Title",
  "start": "2025-05-01T15:00:00",
  "end": "2025-05-01T16:00:00",
  "attendees": ["email1@example.com", "email2@example.com"],
  "description": "Optional description of the event"
}

💡 Notes:
- Times should be in ISO 8601 format (e.g., "2025-05-01T15:00:00").
- If no attendees are mentioned, return an empty array.
- The description is optional — return an empty string if not present.
- NEVER include markdown, triple backticks, or extra text. Return ONLY the raw JSON.

🧠 Example:
Query: "Schedule a project kickoff meeting with john@example.com and jane@example.com on May 2nd from 2 PM to 3 PM"
Response:
{
  "summary": "Project Kickoff Meeting",
  "start": "2025-05-02T14:00:00",
  "end": "2025-05-02T15:00:00",
  "attendees": ["john@example.com", "jane@example.com"],
  "description": ""
}
`;

    const userPrompt = `Query: ${query}`;

    const result = await openai.chat.completions.create({
      model: "openrouter/cypher-alpha:free",
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
    console.error("Error in event reasoning:", err);
    return null;
  }
}
