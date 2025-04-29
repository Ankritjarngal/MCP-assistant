import { googleCalnder } from "./google-calender.js";
import { mailingService } from "./mailing-service.js";
import { taskMangament } from "./task-management.js";

export function serviceSelect(input,query) {
    if (input === "mailing service") {
        mailingService(query);
    } else if (input === "google calendar") {
        googleCalnder();
    } else if (input === "task management") {
        taskMangament();
    } else {
        console.log("Invalid input");
    }
}
