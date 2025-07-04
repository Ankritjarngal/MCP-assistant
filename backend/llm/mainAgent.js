import { OpenAI } from "openai";
import { config } from "dotenv";
config();

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

function cleanPlainMarkdown(response) {
  return response
    .replace(/^```plain\s*/, "")
    .replace(/```$/, "")
    .trim();
}

export async function reason(query) {
  try {
    const systemPrompt = `
You are an intelligent assistant component within a modular command processing (MCP) server designed to select the most suitable internal tool based on user queries. You do not execute the commands but determine which tool is appropriate for handling the query. 

The assistant currently supports the following tools and their capabilities:

1. 📅 Google Calendar
   - Schedule, reschedule, or cancel meetings.
   - Find mutually available time slots.
   - Set up recurring meetings.
   - Send meeting notifications and reminders.
   - View or manage upcoming events.

2. 📧 Mailing Service
   - Compose and send emails.
   - Schedule emails to be sent at a future time.
   - Use email templates for faster composition.
   - Track follow-ups or send reminders for replies.
   - Manage draft messages.

3. ✅ Task Management (internal service)
   - Create new tasks and set their priority.
   - Assign deadlines and configure reminders.
   - Track task completion and generate reports.
   - View, edit, or delete tasks.

4. Documenting service 
   - Create, edit, and manage documents.
   - Collaborate with team members on documents.
   - Store and organize documents in folders.
    

🧠 Your task is to read the user's natural language query and reason out which of the above tools is best suited to handle it. Output only the tool name in plain lowercase (e.g., "google calendar", "mailing service", "documenting service" or "task management"). If multiple tools are equally relevant, choose the most directly applicable one.

The response must strictly be:
"google calendar", "mailing service", "documenting service", or "task management".
    `;

    const msg = `query by user: ${query}`;

    const result = await openai.chat.completions.create({
      model: "openrouter/cypher-alpha:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: msg }
      ],
      temperature: 0,
      max_tokens: 100,
    });

    let rawResponse = result.choices[0].message.content.trim();
    const cleanedResponse = cleanPlainMarkdown(rawResponse).toLowerCase();

    // Validate response against allowed tools
    const validTools = [
      "google calendar",
      "mailing service",
      "task management",
      "documenting service",
    ];

    if (validTools.includes(cleanedResponse)) {
      return cleanedResponse;
    } else {
      console.warn("Received unknown tool:", cleanedResponse);
      return "unknown";
    }
  } catch (err) {
    console.error("Error in tool selection:", err);
    return "unknown";
  }
}
