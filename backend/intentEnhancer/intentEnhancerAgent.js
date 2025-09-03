import { config } from "dotenv";
import { getIntentsData } from "./AllQueries.js"; // Assuming this function exists

config();

export async function enhancedIntent(query, intent, email) {
  const data = await getIntentsData(query, intent, email);
  const finalQuery = await Agent(data, query, intent); 
  console.log("Final query:", finalQuery);
  return finalQuery;
}

async function Agent(data, query, intent) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY is not set in the environment variables.");
    }
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const contextSummary = data.length > 0 ?
      `Previous related queries: ${data.join("; ")}.` :
      "No previous related queries found.";

    const systemPrompt = `You are an intelligent assistant that enhances user queries to make them clearer for other system agents. Your primary goal is to create a complete, actionable query by filling in missing details from past context.

- Analyze the "Current user query".
- Use the "Context summary" of previous related queries to find missing information.

- **For 'mailing service' intents:** If the current query uses a shorthand name (e.g., "ankrit"), find the full email address (e.g., "jarngalakrit@gmail.com") from the context and use that full email address in the refined query. The final query must be explicit. For example, if the user says "tell ankrit bye", the refined query should be "write a mail to jarngalakrit@gmail.com saying bye".

- **For 'google calendar' intents:** Use context to add clarity to event names, participants, or times if appropriate.

- Your output must be a JSON object containing only the refined plain text query in the 'refinedQuery' field. Do not add any explanations.`;

    const userPrompt = `Current user query: "${query}"\nContext summary: ${contextSummary}`;

    const payload = {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [{
        parts: [{ text: userPrompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            refinedQuery: {
              type: "STRING",
              description: "The final, enhanced, and complete plain-text query."
            }
          },
          required: ["refinedQuery"]
        },
        temperature: 0.2,
        maxOutputTokens: 250
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        const errorBody = await response.text();
        console.error("API request failed with status:", response.status, "and body:", errorBody);
        return query;
    }

    const result = await response.json();
    const content = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      console.error("No valid content found in API response.");
      return query;
    }

    const parsed = JSON.parse(content);
    return parsed.refinedQuery.trim();

  } catch (err) {
    console.error("Error in Agent function:", err);
    return query;
  }
}
