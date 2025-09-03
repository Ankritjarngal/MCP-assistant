// No longer need the GoogleGenerativeAI SDK for this approach
// import { GoogleGenerativeAI } from "@google/generative-ai"; 
import { config } from "dotenv";
import { getIntentsData } from "./AllQueries.js"; // Assuming this function exists

config();

export async function enhancedIntent(query, intent, email) {
  const data = await getIntentsData(query, intent, email);
  // This function now calls the new Agent implementation below
  const finalQuery = await Agent(data, query, intent); 
  console.log("Final query:", finalQuery);
  return finalQuery;
}

/**
 * This agent is refactored to use a direct `fetch` call to the Google AI API,
 * mirroring the structure of your `report` function.
 */
async function Agent(data, query, intent) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY is not set in the environment variables.");
    }
    
    // Using 'gemini-2.5-flash-latest' as it's more current than the preview version
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-latest:generateContent?key=${apiKey}`;

    const contextSummary = data.length > 0 ?
      `Previous related queries: ${data.join("; ")}.` :
      "No previous related queries found.";

    const systemPrompt = `You are an intelligent assistant that enhances user queries to make them clearer for other system agents. Your output must be a JSON object containing only the refined plain text query.
- Use past context only if it's clearly relevant.
${intent === "google calendar"
  ? "- For Google Calendar intents, use context like meeting names or participants to add clarity if appropriate."
  : "- For all other intents, prioritize the current query's clarity."
}
- Do not explain the changes you made.`;

    const userPrompt = `Current user query: "${query}"\nContext summary: ${contextSummary}`;

    // Define the JSON schema for the desired response format
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
              description: "The final, enhanced plain-text query."
            }
          },
          required: ["refinedQuery"]
        },
        temperature: 0.3,
        maxOutputTokens: 150
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
        return query; // Fallback to original query
    }

    const result = await response.json();
    const content = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      console.error("No valid content found in API response.");
      return query; // Fallback to original query
    }

    // Since we requested JSON, we parse the content string
    const parsed = JSON.parse(content);
    return parsed.refinedQuery.trim();

  } catch (err) {
    console.error("Error in Agent function:", err);
    return query; // Return the original query on any failure
  }
}