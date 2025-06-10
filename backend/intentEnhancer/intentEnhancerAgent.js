import { OpenAI } from "openai";
import { config } from "dotenv";
import { UsersForMcp } from "../database/db.js";
import { getIntentsData } from "./AllQueries.js";

config();

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

function cleanPlainMarkdown(response) {
  return response
    .replace(/^```plain\s*/, "")
    .replace(/```$/, "")
    .trim();
}

export async function enhancedIntent(query, intent, email) {
  const data = await getIntentsData(query, intent, email);
  const finalQuery = await Agent(data, query, intent);
  console.log("Final query:", finalQuery);

  return finalQuery;
}

async function Agent(data, query, intent) {
  const contextSummary = data.length > 0
    ? `Previous related queries: ${data.join("; ")}.`
    : "No previous related queries found.";

  const detailedPrompt = `
You are an intelligent assistant module within a modular command processing (MCP) system. Your task is to enhance and refine user queries to make them clearer and more actionable for downstream agents. Your output must be a well-structured plain text version of the user's intent — without altering its core meaning.

Use the following guidelines:
- Analyze past related queries only if they are clearly relevant to the current one.
- Do not force inclusion of past context if it doesn't apply.
${intent === "google calendar"
    ? "- If the intent is related to Google Calendar, carefully assess previous queries for helpful context (like recurring meeting names, participants, or event timing) and enhance accordingly, only if appropriate."
    : "- For all other intents, prioritize the clarity of the current query over historical context unless it's directly applicable."
}
- Ensure the refined query is clean, coherent, and ready for further processing.
- Do not mention what changes were made.
- Output only the improved plain query.

Current user query: "${query}"
Context summary: ${contextSummary}
`;

  const result = await openai.chat.completions.create({
    model: "meta-llama/llama-3.3-8b-instruct:free",
    messages: [
      { role: "system", content: "You are a helpful assistant that refines queries for downstream agents." },
      { role: "user", content: detailedPrompt }
    ],
    temperature: 0.3,
    max_tokens: 150,
  });

  const rawResponse = result.choices[0].message.content;
  const cleanedResponse = cleanPlainMarkdown(rawResponse);

  return cleanedResponse;
}
