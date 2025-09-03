import { config } from "dotenv";
config();

export async function calendarOperationAgent(query) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in the environment variables.");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const systemPrompt = `You are a calendar operation classifier. Your job is to analyze the user's query and determine the most appropriate calendar operation.

Your response must be a JSON object with a single key "operation", and its value must be one of the following strings:
- create_event
- reschedule_event
- cancel_event
- list_events
- check_availability`;

    const payload = {
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          parts: [{ text: `Query: ${query}` }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            operation: {
              type: "STRING",
              enum: [
                "create_event",
                "reschedule_event",
                "cancel_event",
                "list_events",
                "check_availability",
              ],
            },
          },
          required: ["operation"],
        },
        temperature: 0,
        maxOutputTokens: 50,
      },
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error("API request failed with status:", response.status);
      return "unknown";
    }

    const result = await response.json();
    const content = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      console.error("No valid content found in API response.");
      return "unknown";
    }

    const parsed = JSON.parse(content);
    return parsed.operation;

  } catch (err) {
    console.error("Error classifying calendar operation:", err);
    return "unknown";
  }
}