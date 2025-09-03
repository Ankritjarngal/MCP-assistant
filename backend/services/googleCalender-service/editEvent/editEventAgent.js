import { config } from "dotenv";
config();

export async function editEventAgent(query) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY is not set in the environment variables.");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const systemPrompt = `You are a calendar assistant that extracts details to update an existing event. The current date is Thursday, September 4, 2025. Use this to resolve relative dates.

Return ONLY a valid JSON object with the specified structure.
- "eventSummary" is REQUIRED to identify the event.
- Omit any fields that are not mentioned in the query.
- Use ISO 8601 format for date/time (e.g., "2025-09-05T15:00:00").
- NEVER include markdown or any text outside the JSON object.`;

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
            eventSummary: {
              type: "STRING",
              description: "Title or keyword to identify the existing event.",
            },
            newSummary: {
              type: "STRING",
              description: "The updated event title. Optional.",
            },
            newStart: {
              type: "STRING",
              description: "The updated start time in ISO 8601 format. Optional.",
            },
            newEnd: {
              type: "STRING",
              description: "The updated end time in ISO 8601 format. Optional.",
            },
            newDescription: {
              type: "STRING",
              description: "The updated event description. Optional.",
            },
            newLocation: {
              type: "STRING",
              description: "The updated event location. Optional.",
            },
            newAttendees: {
              type: "ARRAY",
              description: "A list of new or updated attendee emails. Optional.",
              items: { type: "STRING" },
            },
          },
          required: ["eventSummary"],
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
    console.error("Error extracting edit event parameters:", err);
    return null;
  }
}