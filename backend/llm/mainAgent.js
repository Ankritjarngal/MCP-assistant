import { config } from "dotenv";

config();

export async function reason(query) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY is not set in the environment variables.");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const systemPrompt = `You are an intelligent component in a server that selects the most suitable internal tool based on a user query. Your only job is to determine which tool is appropriate.

The available tools are:
1. 📅 Google Calendar: Schedule, reschedule, cancel, or view meetings and events.
2. 📧 Mailing Service: Compose, send, schedule, or manage emails.
3. ✅ Task Management: Create, assign, track, or manage tasks.
4. 📄 Documenting service: Create, edit, and manage documents.

Analyze the user's query. Your response must be a JSON object with a 'tool' key, and its value must strictly be one of: "google calendar", "mailing service", "task management", or "documenting service". Strictly return only the JSON object with no extra text, markdown, or explanations.`;

    const payload = {
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          parts: [{ text: `query by user: ${query}` }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            tool: {
              type: "STRING",
              enum: [
                "google calendar",
                "mailing service",
                "task management",
                "documenting service",
              ],
            },
          },
          required: ["tool"],
        },
        temperature: 0,
        maxOutputTokens: 100,
      },
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("API request failed with status:", response.status, "and body:", errorBody);
      return "unknown";
    }

    const result = await response.json();
    const content = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      console.error("No valid content found in API response.");
      return "unknown";
    }

    // DEBUG: Log the raw string from the API before parsing
    console.log("Raw content from API:", content);

    const parsed = JSON.parse(content);
    return parsed.tool;
    
  } catch (err) {
    console.error("Error in tool selection agent:", err);
    return "unknown";
  }
}

