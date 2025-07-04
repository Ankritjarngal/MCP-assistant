import { OpenAI } from "openai";
import { config } from "dotenv";
config();

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function deleteEventAgent(query) {
  try {
    const systemPrompt = `You are a smart calendar assistant. Your job is to extract the required details from a user's natural language query for the purpose of deleting an event from their Google Calendar.
Return ONLY a valid JSON object with the following structure:
{
"eventSummary": "title of the event to delete", // Required
"date": "YYYY-MM-DD" // Optional — include only if mentioned or implied
}
🧠 Instructions:

The "eventSummary" should be the main event/activity mentioned. Look for key nouns or activity names (e.g., "meeting", "call", "session", "appointment").
Extract the most specific event title from the query. If multiple activities are mentioned, prioritize the main one.
Include time information (like "9 AM") in the summary only if it helps identify the specific event.
For dates, parse natural language like "today", "tomorrow", "18 may", "May 16th 2025" and convert to YYYY-MM-DD format.
If "today" is mentioned, assume the current date context (you'll need to determine this from context).
Ignore redundant words like "delete", "cancel", "remove" in the summary.

📅 Date Parsing Examples:

"today" → use current date
"tomorrow" → current date + 1 day
"18 may" → "2025-05-18" (assume current year if not specified)
"May 16th 2025" → "2025-05-16"
"monday" → calculate the date of the upcoming/current Monday

⚠️ Strict Output Rules:

Output ONLY a valid raw JSON object
No explanations, markdown, backticks, or additional text
If the query is unclear, make the best interpretation

✅ Examples:
Query: "Cancel my call with Sarah on May 3rd"
Response:
{
"eventSummary": "call with Sarah",
"date": "2025-05-03"
}
Query: "Delete the scheduling at 9 am on 16th May 2025 for TOC"
Response:
{
"eventSummary": "scheduling at 9 am for TOC",
"date": "2025-05-16"
}
Query: "delete 9 am 18 may morning today playsession"
Response:
{
"eventSummary": "playsession at 9 am",
"date": "2025-05-18"
}
Query: "remove my dentist appointment tomorrow"
Response:
{
"eventSummary": "dentist appointment",
"date": "2025-05-19"
}
Query: "cancel the team meeting"
Response:
{
"eventSummary": "team meeting"
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
