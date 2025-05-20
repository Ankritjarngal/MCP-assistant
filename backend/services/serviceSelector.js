import { googleCalnder } from "./google-calender.js";
import { mailingService } from "./mailing-service.js";
import { taskMangament } from "./task-management.js";
import { enhancedIntent } from "../intentEnhancer/intentEnhancerAgent.js";

export async function serviceSelect(input, query,email) {
    if (input === "mailing service") {
        const enhancedQuery= await enhancedIntent(query, "mailing service",email);
        const data = await mailingService(enhancedQuery); 
        return { service: "mailing service", item: data };
    } else if (input === "google calendar") {
        const enhancedQuery= await enhancedIntent(query, "google calendar",email);
        const data = await googleCalnder(enhancedQuery);
        return { service: "google calendar", item: data };
    } else if (input === "task management") {
        const enhancedQuery= await enhancedIntent(query, "task management",email);
        const data = await taskMangament(enhancedQuery); 
        return { service: "task management", item: data };
    } else if (input === "documenting service") {

        console.log("Documenting service is not implemented yet.");
        return { service: "documenting service", item: null };
    }
    else {
        console.log("Invalid input");
        return { service: "unknown", item: null };
    }
}
