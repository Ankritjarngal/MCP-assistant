import { UsersForMcp } from "../database/db.js";

export async function getIntentsData(query,givenIntent, email) {
  try {
    const user = await UsersForMcp.findOne({ email });

    if (!user) {
      console.error("User not found");
      return [];
    }

    const intents = user.intents[givenIntent]; 
    console.log("Intents data:", intents);
    if (!intents) {
      console.error("No intents found for the given intent");
      return [];
    }
    const updateIntent=await UsersForMcp.updateOne(
      { email },
      { $push: { [`intents.${givenIntent}`]: query } }
    );
    if(!updateIntent){
      console.error("Error updating intents");
      
    }


    return intents;
  } catch (err) {
    console.error("Error fetching intents data:", err);
    return [];
  }
}
