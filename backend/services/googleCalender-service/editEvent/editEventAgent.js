import { OpenAI } from "openai";
import { config } from "dotenv";
config();

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function editEventAgent(query) {
  try {
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

    const result = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat-v3-0324:free",
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
