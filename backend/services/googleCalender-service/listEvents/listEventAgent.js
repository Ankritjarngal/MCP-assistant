import { config } from "dotenv";
config();

export async function listEventAgent(query) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in the environment variables.");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const systemPrompt = `You are a calendar assistant. Your task is to extract filter parameters from a user's natural language query for listing Google Calendar events.

Return ONLY a valid JSON object with the specified structure.
- If a time range is not explicitly mentioned, omit that field.
- If no search keyword is mentioned, set "query" to an empty string.
- NEVER include markdown, triple backticks, or any extra text.
- Use ISO 8601 format for all dates (e.g., "2025-05-01T00:00:00").`;

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
            timeMin: {
              type: "STRING",
              description: "Optional. Start of the date/time range in ISO 8601 format.",
            },
            timeMax: {
              type: "STRING",
              description: "Optional. End of the date/time range in ISO 8601 format.",
            },
            query: {
              type: "STRING",
              description: "Optional. A keyword or phrase to filter events.",
            },
          },
        },
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error("API request failed with status:", response.status);
      return null;
    }

    const result = await response.json();
    const content = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      console.error("No valid content found in API response.");
      return null;
    }

    return JSON.parse(content);

  } catch (err) {
    console.error("Error extracting list event parameters:", err);
    return null;
  }
}