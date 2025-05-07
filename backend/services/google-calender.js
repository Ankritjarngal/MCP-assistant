import { calendarOperationAgent} from './googleCalender-service/mainCalenderAgent.js'
import { createEventAgent } from './googleCalender-service/createEvent/createEventAgnet.js';
import { createEventAPI } from './googleCalender-service/createEvent/createEventAPI.js';
import { listEventAgent } from './googleCalender-service/listEvents/listEventAgent.js';
import { listEventAPI } from './googleCalender-service/listEvents/listEventAPI.js';
import { editEventAgent } from './googleCalender-service/editEvent/editEventAgent.js';
import { editEventAPI } from './googleCalender-service/editEvent/editEventAPI.js';
import { deleteEventAgent } from './googleCalender-service/deleteEvent/deleteEventAgent.js';
import { deleteEventAPI } from './googleCalender-service/deleteEvent/deleteEventAPI.js';
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
          return createdEvent;
        }
        else if(res=="reschedule_event"){
          const res = await editEventAgent(query);
          const updatedEvent = await editEventAPI(res);
          console.log("Rechedule event :" , updatedEvent)
          return updatedEvent;
        }
  
        else if(res=="cancel_event"){
          const res=await deleteEventAgent(query);
          const deletedEvent= await deleteEventAPI(res);
          return deletedEvent      
          }

      else if(res=="list_events"){
        const res= await listEventAgent(query);
        const listedEvents = await listEventAPI(res);
        console.log("Listed events:", listedEvents);
        return listedEvents;
          
          
      
          }
     }
     catch(err){
        console.error("Error in calendar operation:", err);
        throw err;
      }
    

}
