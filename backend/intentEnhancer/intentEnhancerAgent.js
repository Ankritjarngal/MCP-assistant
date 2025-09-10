import { config } from "dotenv";
import { getIntentsData } from "./AllQueries.js"; // Assuming this function exists

config();

export async function enhancedIntent(query, intent, email) {
  const data = await getIntentsData(query, intent, email);
  // The full query with timestamp and username is passed to the Agent
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

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    // Extract timestamp and username from the query using regex
    const timestampRegex = /\[timestamp:(\d+)\]/;
    const usernameRegex = /\[username:(.*?)\]/; // Non-greedy match for the name

    const timestampMatch = query.match(timestampRegex);
    const usernameMatch = query.match(usernameRegex);

    const timestamp = timestampMatch ? new Date(parseInt(timestampMatch[1])).toLocaleString() : 'Not available';
    const username = usernameMatch ? usernameMatch[1].trim() : 'Sender'; // Fallback to 'Sender' if not found

    // Clean both tags from the query for the AI
    const cleanQuery = query.replace(timestampRegex, '').replace(usernameRegex, '').trim();

    const contextSummary = data.length > 0 ?
      `Previous related queries: ${data.join("; ")}.` :
      "No previous related queries found.";

    const systemPrompt = `You are an intelligent assistant that enhances user queries. Your goal is to create a complete, actionable query by filling in missing details from past context and using the provided sender's name.

- Analyze the "Current user query".
- Use the "Context summary" of previous related queries to find missing information.
- Use the "Current time" to add temporal context.
- Use the "Sender's Name" as the author/sender for any generated content. **Never use a placeholder like '[your name]' or '[sender's name]'.**

- **For 'mailing service' intents:** If the query uses a shorthand name (e.g., "ankrit"), find the full email address (e.g., "jarngalakrit@gmail.com") from the context. The final query must be explicit. For example, if the user says "tell ankrit bye", the refined query should be "write a mail to jarngalakrit@gmail.com saying bye". The mail should be signed off with the provided **Sender's Name**.

- **For 'google calendar' intents:** Use context, current time, and the **Sender's Name** to add clarity to event names, participants, or times. The sender's name is the event organizer.

- Your output must be a JSON object containing only the refined plain text query in the 'refinedQuery' field. Do not add any explanations.`;


    const userPrompt = `Current user query: "${cleanQuery}"\nContext summary: ${contextSummary}\nCurrent time: ${timestamp}\nSender's Name: "${username}"`;

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
        return cleanQuery;
    }

    const result = await response.json();
    const content = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      console.error("No valid content found in API response.");
      return cleanQuery;
    }

    const parsed = JSON.parse(content);
    return parsed.refinedQuery.trim();

  } catch (err) {
    console.error("Error in Agent function:", err);
    return query.replace(/\[timestamp:(\d+)\]/, '').trim();
  }
}