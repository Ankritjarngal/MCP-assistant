import { OpenAI } from "openai";
import { config } from "dotenv";
config();

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function mailAgent(query) {
  try {
    const systemPrompt = `
You are a mailing assistant. Your job is to:
- Extract the recipient's email address from the query.
- Determine a suitable subject line.
- Generate a professional email message based on the query.

Return only a valid JSON object in the following format:
{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "message": "Email body message."
}

IMPORTANT: Return only the raw JSON with no backticks or markdown formatting.

Example:
Query: "Write a mail to john.doe@example.com to confirm the meeting scheduled for tomorrow"
Response:
{
  "to": "john.doe@example.com",
  "subject": "Meeting Confirmation for Tomorrow",
  "message": "I'm writing to confirm our meeting scheduled for tomorrow. Please let me know if you have any updates or if there's anything I should prepare in advance."
}

Notes:
- If no email is clearly mentioned, return an empty string for "to".
- Never include any explanation, markdown formatting, or triple backticks.
`;

    const userPrompt = `Query: ${query}`;

    const result = await openai.chat.completions.create({
      model: "openrouter/cypher-alpha:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0,
      max_tokens: 2048,
    });

    let responseText = result.choices[0].message.content.trim();

    try {
      return JSON.parse(responseText);
    } catch (e) {
      // Try cleaning markdown fences
      let cleaned = responseText.replace(/^```json\s*/, "").replace(/```$/, "").trim();

      // Also strip anything before the first '{'
      cleaned = cleaned.replace(/^.*?(\{.*)$/s, "$1").trim();

      try {
        return JSON.parse(cleaned);
      } catch (err) {
        console.warn("Could not parse response JSON even after cleaning. Raw:", responseText);
        return null;
      }
    }
  } catch (err) {
    console.error("Error in mailing reasoning:", err);
    return null;
  }
}
