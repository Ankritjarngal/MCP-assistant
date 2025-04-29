import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";

config();

const api_key =process.env.GOOGLE_KEY;
const genAI = new GoogleGenerativeAI(api_key);

export async function reason(query) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

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

🧠 Your task is to read the user's natural language query and reason out which of the above tools is best suited to handle it. Output only the tool name in plain lowercase (e.g., "google calendar", "mailing service", or "task management"). If multiple tools are equally relevant, choose the most directly applicable one.

The response must strictly be:
"google calendar", "mailing service", or "task management".
    `;

    const msg = `query by user: ${query}`;

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "user", parts: [{ text: msg }] }
      ],
      generationConfig: { maxOutputTokens: 2048 },
    });

    return result.response.text().trim().toLowerCase();
  } catch (err) {
    console.error("Error in tool selection:", err);
    return null;
  }
}
