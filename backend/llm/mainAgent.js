import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";

config();

// Initialize the Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function reason(query) {
  try {
    const systemPrompt = `You are an intelligent component in a server that selects the most suitable internal tool based on a user query. Your only job is to determine which tool is appropriate.

The available tools are:
1. 📅 Google Calendar: Schedule, reschedule, cancel, or view meetings and events.
2. 📧 Mailing Service: Compose, send, schedule, or manage emails.
3. ✅ Task Management: Create, assign, track, or manage tasks.
4. 📄 Documenting service: Create, edit, and manage documents.

Read the user's query and reason which tool is best. Output only the tool name in plain lowercase.
Your response must strictly be one of: "google calendar", "mailing service", "task management", "documenting service".`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-latest",
      systemInstruction: systemPrompt,
    });

    const generationConfig = {
      temperature: 0, // Set to 0 for deterministic classification
      maxOutputTokens: 50,
    };

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `query by user: ${query}` }] }],
      generationConfig,
    });
    
    const cleanedResponse = result.response.text().trim().toLowerCase();

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
      console.warn("Received unknown tool from AI:", cleanedResponse);
      return "unknown";
    }
  } catch (err) {
    console.error("Error in tool selection agent:", err);
    return "unknown";
  }
}