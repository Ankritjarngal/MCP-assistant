import { config } from "dotenv";
config();

export async function createEventAgent(query) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY is not set in the environment variables.");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-latest:generateContent?key=${apiKey}`;

    const systemPrompt = `You are a calendar assistant. Your task is to extract structured event information from a natural language query. The current date is Thursday, September 4, 2025. Use this for resolving relative dates like "tomorrow".

You must return a valid JSON object matching the specified schema.
- Times must be in ISO 8601 format (YYYY-MM-DDTHH:MM:SS).
- If no attendees are mentioned, return an empty array [].
- If no description is provided, return an empty string "".
- NEVER include any text outside of the JSON object.`;

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
            summary: {
              type: "STRING",
              description: "The title or summary of the event.",
            },
            start: {
              type: "STRING",
              description: "The event start time in ISO 8601 format.",
            },
            end: {
              type: "STRING",
              description: "The event end time in ISO 8601 format.",
            },
            attendees: {
              type: "ARRAY",
              description: "A list of attendee email addresses.",
              items: { type: "STRING" },
            },
            description: {
              type: "STRING",
              description: "A detailed description for the event.",
            },
          },
          required: ["summary", "start", "end", "attendees", "description"],
        },
        temperature: 0.2,
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
    console.error("Error in createEventAgent:", err);
    return null;
  }
}