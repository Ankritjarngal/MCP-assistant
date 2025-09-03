import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
import { getIntentsData } from "./AllQueries.js"; // Assuming this function exists

config();

// Initialize the Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function enhancedIntent(query, intent, email) {
  const data = await getIntentsData(query, intent, email);
  const finalQuery = await Agent(data, query, intent);
  console.log("Final query:", finalQuery);
  return finalQuery;
}

async function Agent(data, query, intent) {
  try {
    const contextSummary = data.length > 0 ?
      `Previous related queries: ${data.join("; ")}.` :
      "No previous related queries found.";

    const systemPrompt = `You are an intelligent assistant that enhances user queries to make them clearer for other system agents. Your output must be only the refined plain text query.
- Use past context only if it's clearly relevant.
${intent === "google calendar"
  ? "- For Google Calendar intents, use context like meeting names or participants to add clarity if appropriate."
  : "- For all other intents, prioritize the current query's clarity."
}
- Do not explain the changes you made. Output only the improved plain query.`;

    const userPrompt = `Current user query: "${query}"\nContext summary: ${contextSummary}`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-latest",
      systemInstruction: systemPrompt,
    });

    const generationConfig = {
      temperature: 0.3,
      maxOutputTokens: 150,
    };

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig,
    });

    return result.response.text().trim();

  } catch (error) {
    console.error("Error in enhancedIntent Agent:", error);
    return query; // Return the original query on failure
  }
}