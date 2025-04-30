import { calendarOperationAgent} from './googleCalender-service/mainCalenderAgent.js'
export async function googleCalnder(query){
    
     try{
        const res=await calendarOperationAgent(query);
    if (!res) {
        console.error("calendarOperationAgent returned null or undefined");
        throw new Error("Calendar agent failed to generate response.");
      }
        if(res=="create_event"){

        }
        else if(res=="reschedule_event"){
  
        }
  
        else if(res=="cancel_event"){
      
          }
  
      else if(res=="list_events"){
      
          }
     }
     catch(err){
        console.error("Error in calendar operation:", err);
        throw err;
      }
    

}
