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
  "eventSummary": "title of the event to delete",  // Required
  "date": "YYYY-MM-DD"                             // Optional — include only if mentioned or implied
}

🧠 Instructions:
- The "eventSummary" should clearly describe the event. If no official title is mentioned, infer a reasonable title from the query (e.g., "scheduling at 9 AM").
- If a specific date is mentioned, extract and format it as "YYYY-MM-DD".
- You may omit the "date" field only if it’s not mentioned or cannot be inferred.
- Times (e.g., 9 AM) help define the summary but DO NOT go in the "date" field.
- Your job is not to delete the event but to identify which one needs deletion.

⚠️ Strict Output Rules:
- Output a single valid **raw JSON** object.
- No explanations, no markdown, no backticks, and no additional text.

✅ Example 1:
Query: "Cancel my call with Sarah on May 3rd"
Response:
{
  "eventSummary": "call with Sarah",
  "date": "2025-05-03"
}

✅ Example 2:
Query: "Delete the scheduling at 9 am on 16th May 2025 for TOC"
Response:
{
  "eventSummary": "scheduling at 9 am for TOC",
  "date": "2025-05-16"
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
    console.error("Error in event reasoning:", err);
    return null;
  }
}
