import { config } from "dotenv";
config();

export async function deleteEventAgent(query) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY is not set in the environment variables.");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-latest:generateContent?key=${apiKey}`;

    const systemPrompt = `You are a smart calendar assistant. Your job is to extract the details needed to delete a Google Calendar event from a user's query. The current date is Thursday, September 4, 2025; use this to resolve relative dates like "today" or "tomorrow".

Return ONLY a valid JSON object matching the required schema.
- The "eventSummary" should be the most specific event title from the query.
- The "date" is optional; only include it if mentioned. Parse natural language (e.g., "today", "tomorrow", "May 16th 2025") into YYYY-MM-DD format.
- Ignore words like "delete," "cancel," or "remove" in the summary.`;

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
              description: "The title of the event to be deleted.",
            },
            date: {
              type: "STRING",
              description: "The event date in YYYY-MM-DD format. Optional.",
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
    console.error("Error in deleteEventAgent:", err);
    return null;
  }
}