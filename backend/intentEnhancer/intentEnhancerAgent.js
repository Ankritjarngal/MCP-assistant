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

export async function enhancedIntent( query,intent,email) {
  
  const data = await getIntentsData(query,intent, email);
  const finalQuery = await Agent(data, query);
  console.log("Final query:", finalQuery);

  return finalQuery;
}

async function Agent(data, query) {
  const contextSummary = data.length > 0
    ? `Previous related queries: ${data.join("; ")}.`
    : "No previous related queries found.";

  const detailedPrompt = `
You are an intelligent assistant component within a modular command processing (MCP) server designed to refine and curate user queries. Your goal is to produce a clear, concise, and enriched version of the user's query by considering previous related queries.

User query: "${query}"
Context: ${contextSummary}

Please provide a refined version of this query in plain text, making it as clear and detailed as possible for downstream processing 
**dont mention what changes you made just give a refined query**
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

  return cleanedResponse; }
