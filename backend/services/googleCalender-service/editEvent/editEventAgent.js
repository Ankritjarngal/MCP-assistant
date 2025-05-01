import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
config();

const api_key = process.env.GOOGLE_KEY;
const genAI = new GoogleGenerativeAI(api_key);

export async function editEventAgent(query) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const systemPrompt = `
You are a calendar assistant that helps extract the details needed to update an existing Google Calendar event.

Return ONLY a **valid JSON** object in the following format:
{
  "eventSummary": "existing event title or keyword",   // Required. Used to identify the event to update.
  "newSummary": "updated event title",                 // Optional.
  "newStart": "2025-05-03T14:00:00",                   // Optional. ISO 8601 format.
  "newEnd": "2025-05-03T15:00:00",                     // Optional. ISO 8601 format.
  "newDescription": "updated description",             // Optional.
  "newLocation": "updated location",                   // Optional.
  "newAttendees": ["person1@example.com"]              // Optional. List of emails.
}

🧠 Notes:
- You MUST include the "eventSummary" so we know which event to update.
- Omit fields that are not mentioned in the user's query.
- Use ISO 8601 format for date/time.
- NEVER include markdown, triple backticks, or any extra explanation—just the raw JSON.

🧠 Example:
Query: "Change the team sync on Monday to 3pm and update the title to 'Weekly Sync'"
Response:
{
  "eventSummary": "team sync",
  "newSummary": "Weekly Sync",
  "newStart": "2025-05-05T15:00:00"
}
`;

    const userPrompt = `Query: ${query}`;

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "user", parts: [{ text: userPrompt }] },
      ],
      generationConfig: { maxOutputTokens: 2048 },
    });

    const responseText = result.response.text().trim();

    try {
      return JSON.parse(responseText);
    } catch (e) {
      const cleaned = responseText.replace(/^```json\s*/, "").replace(/```$/, "").trim();
      try {
        return JSON.parse(cleaned);
      } catch (err) {
        console.warn("Failed to parse even after cleaning. Raw output:", responseText);
        return null;
      }
    }
  } catch (err) {
    console.error("Error extracting edit event parameters:", err);
    return null;
  }
}
