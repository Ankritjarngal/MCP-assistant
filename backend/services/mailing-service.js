import { sendMail } from "./mailing-service/authAndCompose.js";
import { mailAgent } from "./mailing-service/mailAgent.js";

export async function mailingService(query,email) {
  console.log("mailing service");
  const responseText = await mailAgent(query);
  
  if (!responseText) {
    console.error("mailAgent returned null or undefined");
    throw new Error("Mail agent failed to generate response.");
  }
  
  // The issue is here - we need to fix how we handle the response
  let parsedResponse;
  
  // If mailAgent already returned a parsed object
  if (typeof responseText === 'object' && responseText !== null) {
    parsedResponse = responseText;
  } else {
    // If mailAgent returned a string, we need to parse it
    let cleanedText = responseText.trim();
    
    // Remove markdown formatting (triple backticks and json tag)
    cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/```$/, "").trim();
    
    try {
      parsedResponse = JSON.parse(cleanedText);
    } catch (e) {
      console.error("Could not parse cleaned response JSON. Raw:", cleanedText);
      throw new Error("Invalid response format from mail agent");
    }
  }
  
  const { to, subject, message } = parsedResponse;
  
  if (!to || !subject || !message) {
    throw new Error("Missing required fields: to, subject, or message");
  }
  
  try {
    const result = await sendMail({ to, subject, message ,email});
    console.log("Mail sent:", result.id);
    return parsedResponse;
  } catch (err) {
    console.error("Failed to send mail:", err);
    throw err;
  }
}