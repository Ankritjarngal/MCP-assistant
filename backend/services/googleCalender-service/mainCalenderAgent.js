import { OpenAI } from "openai";
import { config } from "dotenv";
config();

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function calendarOperationAgent(query) {
  try {
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

    const result = await openai.chat.completions.create({
      model: "openrouter/cypher-alpha:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0,
      max_tokens: 50,
    });

    const responseText = result.choices[0].message.content.trim().toLowerCase();

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
