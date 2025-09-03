import { config } from "dotenv";

config();

export async function mailAgent(query) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY is not set in the environment variables.");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const systemPrompt = `You are a mailing assistant. Your job is to:
- Extract the recipient's email address from the query.
- Determine a suitable subject line.
- Generate a professional email message body based on the query.

Return only a valid JSON object in the specified format.
If no email is clearly mentioned, return an empty string for the "to" field.`;

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
            to: {
              type: "STRING",
              description: "The recipient's email address.",
            },
            subject: {
              type: "STRING",
              description: "A suitable subject line for the email.",
            },
            message: {
              type: "STRING",
              description: "The generated professional email body.",
            },
          },
          required: ["to", "subject", "message"],
        },
        temperature: 0.1,
        maxOutputTokens: 2048,
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
    console.error("Error in mailing reasoning agent:", err);
    return null;
  }
}