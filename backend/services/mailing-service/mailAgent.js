import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";

config();

// Initialize the Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function mailAgent(query) {
  try {
    const systemPrompt = `You are a mailing assistant. Your job is to:
- Extract the recipient's email address from the query.
- Determine a suitable subject line.
- Generate a professional email message body based on the query.

Return only a valid JSON object in the following format, with no other text or markdown:
{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "message": "Email body message."
}

If no email is clearly mentioned, return an empty string for the "to" field.`;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      systemInstruction: systemPrompt,
    });
    
    // Using Gemini's dedicated JSON mode
    const generationConfig = {
      temperature: 0.1,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    };

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `Query: ${query}` }] }],
      generationConfig,
    });

    // The response text is a guaranteed JSON string, so we just parse it.
    const responseText = result.response.text();
    return JSON.parse(responseText);

  } catch (err) {
    console.error("Error in mailing reasoning agent:", err);
    return null;
  }
}