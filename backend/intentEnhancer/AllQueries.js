export const intents = {
    "google calendar": [],
    "mailing service": [],
    "task management": [],
    "documenting service": []
  };
  
  export function getIntentsData(givenIntent) {
    if (givenIntent in intents) {
      return intents[givenIntent];
    } else {
      return [];
    }
  }
  