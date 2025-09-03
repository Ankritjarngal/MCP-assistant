import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
config();

// Initialize the Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function editEventAgent(query) {
  try {
    const systemPrompt = `You are a calendar assistant that extracts details to update an existing event. The current date is Thursday, September 4, 2025. Use this to resolve relative dates.

Return ONLY a **valid JSON** object with the following structure:
{
  "eventSummary": "existing event title or keyword",
  "newSummary": "updated event title",
  "newStart": "YYYY-MM-DDTHH:MM:SS",
  "newEnd": "YYYY-MM-DDTHH:MM:SS",
  "newDescription": "updated description",
  "newLocation": "updated location",
  "newAttendees": ["person1@example.com"]
}

🧠 Notes:
- "eventSummary" is REQUIRED to identify the event.
- Omit any fields that are not mentioned in the query.
- Use ISO 8601 format for date/time (e.g., "2025-09-05T15:00:00").
- NEVER include markdown or any text outside the JSON object.

🧠 Example:
Query: "Change the team sync tomorrow to 3pm and update the title to 'Weekly Sync'"
Response:
{
  "eventSummary": "team sync",
  "newSummary": "Weekly Sync",
  "newStart": "2025-09-05T15:00:00"
}`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-latest",
      systemInstruction: systemPrompt,
    });

    // Configure the model for JSON output
    const generationConfig = {
      temperature: 0.2,
      maxOutputTokens: 1024,
      responseMimeType: 'application/json',
    };

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `Query: ${query}` }] }],
      generationConfig,
    });

    // Directly parse the guaranteed JSON response
    const responseText = result.response.text();
    return JSON.parse(responseText);

  } catch (err) {
    console.error("Error extracting edit event parameters:", err);
    return null;
  }
}