import { calendarOperationAgent} from './googleCalender-service/mainCalenderAgent.js'
import { createEventAgent } from './googleCalender-service/createEvent/createEventAgnet.js';
import { createEventAPI } from './googleCalender-service/createEvent/createEventAPI.js';
import { listEventAgent } from './googleCalender-service/listEvents/listEventAgent.js';
import { listEventAPI } from './googleCalender-service/listEvents/listEventAPI.js';
export async function googleCalnder(query){
    
     try{
        const res=await calendarOperationAgent(query);
    if (!res) {
        console.error("calendarOperationAgent returned null or undefined");
        throw new Error("Calendar agent failed to generate response.");
      }
        if(res=="create_event"){
          const res = await createEventAgent(query);
          const createdEvent = await createEventAPI(res);
          console.log("Event created:", createdEvent);
        }
        else if(res=="reschedule_event"){
          
        }
  
        else if(res=="cancel_event"){
      
          }
  
      else if(res=="list_events"){
        const res= await listEventAgent(query);
        const listedEvents = await listEventAPI(res);
        console.log("Listed events:", listedEvents);
          
          
      
          }
     }
     catch(err){
        console.error("Error in calendar operation:", err);
        throw err;
      }
    

}
