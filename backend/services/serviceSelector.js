import { googleCalnder } from "./google-calender.js";
import { mailingService } from "./mailing-service.js";
import { taskMangament } from "./task-management.js";

export async function serviceSelect(input, query) {
    if (input === "mailing service") {
        const data = await mailingService(query);  // add await if this returns a Promise
        return { service: "mailing service", item: data };
    } else if (input === "google calendar") {
        const data = await googleCalnder(query);
        return { service: "google calendar", item: data };
    } else if (input === "task management") {
        const data = await taskMangament(); // assuming it returns something
        return { service: "task management", item: data };
    } else {
        console.log("Invalid input");
        return { service: "unknown", item: null };
    }
}
