import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
config();

const api_key = process.env.GOOGLE_KEY;
const genAI = new GoogleGenerativeAI(api_key);

export async function calendarOperationAgent(query) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const systemPrompt = `
You are a calendar operation classifier.
Your job is to analyze the user's query and return the most appropriate calendar operation from the list below.

Valid operations:
- create_event
- reschedule_event
- cancel_event
- list_events
- check_availability

🧠 Example Inputs and Outputs:
Query: "Set up a meeting with Ankit tomorrow at 10am"
Response: create_event

Query: "Cancel the demo meeting on Friday"
Response: cancel_event

Query: "Show me my meetings next week"
Response: list_events

Query: "Is 4 PM free for me and Alex on Monday?"
Response: check_availability

⚠️ IMPORTANT:
- Return only the operation name as plain text. No JSON, no formatting, no explanation.
- If unsure, return "unknown".
`;

    const userPrompt = `Query: ${query}`;

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "user", parts: [{ text: userPrompt }] },
      ],
      generationConfig: { maxOutputTokens: 50 },
    });

    const responseText = result.response.text().trim().toLowerCase();

    const validOps = [
      "create_event",
      "reschedule_event",
      "cancel_event",
      "list_events",
      "check_availability",
    ];

    if (validOps.includes(responseText)) {
      return responseText;
    } else {
      console.warn("Unknown or invalid calendar operation returned:", responseText);
      return "unknown";
    }
  } catch (err) {
    console.error("Error classifying calendar operation:", err);
    return "unknown";
  }
}
