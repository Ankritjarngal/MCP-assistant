import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
config();

const api_key = process.env.GOOGLE_KEY;
const genAI = new GoogleGenerativeAI(api_key);

export async function mailAgent(query) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const systemPrompt = `
    You are a mailing assistant. Your job is to:
    - Extract the recipient's email address from the query.
    - Determine a suitable subject line.
    - Generate a professional email message based on the query.
    
    Return only a **valid JSON** object in the following format:
    {
      "to": "recipient@example.com",
      "subject": "Email Subject",
      "message": "Email body message."
    }
    
    **IMPORTANT: Return only the raw JSON with no backticks or markdown formatting.**

    🧠 Example:
    Query: "Write a mail to john.doe@example.com to confirm the meeting scheduled for tomorrow"
    Response:
    {
      "to": "john.doe@example.com",
      "subject": "Meeting Confirmation for Tomorrow",
      "message": "I'm writing to confirm our meeting scheduled for tomorrow. Please let me know if you have any updates or if there's anything I should prepare in advance."
    }
    
    💡 Notes:
    - If no email is clearly mentioned, return an empty string for "to".
    - Never include any explanation, markdown formatting, or triple backticks.
    `;
    
    const userPrompt = `Query: ${query}`;
    
    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "user", parts: [{ text: userPrompt }] }
      ],
      generationConfig: { maxOutputTokens: 2048 },
    });
    
    const responseText = result.response.text().trim();
    
    try {
      // Try to parse as-is first
      return JSON.parse(responseText);
    } catch (e) {
      // If that fails, try to clean up markdown formatting
      const cleanedResponse = responseText
        .replace(/^```json\s*/, "")
        .replace(/```$/, "")
        .trim();
        
      try {
        return JSON.parse(cleanedResponse);
      } catch (innerErr) {
        console.warn("Could not parse response JSON even after cleaning. Raw:", responseText);
        return null;
      }
    }
  } catch (err) {
    console.error("Error in mailing reasoning:", err);
    return null;
  }
}