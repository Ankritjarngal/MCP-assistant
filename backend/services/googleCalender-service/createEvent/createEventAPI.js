import { google } from 'googleapis';
import { authorize } from '../../mailing-service/authAndCompose.js';  // Adjust the import as necessary

export async function createEventAPI(eventData) {
  try {
    // Get authorized OAuth2 client
    const oauth2Client = await authorize();
    
    // Create calendar API client using the oauth2Client
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Prepare the event data
    const event = {
      summary: eventData.summary,
      description: eventData.description,
      start: {
        dateTime: eventData.start,
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: eventData.end,
        timeZone: 'Asia/Kolkata',
      },
      attendees: eventData.attendees.map(email => ({ email })),
    };

    const res = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    return res.data;
  } catch (err) {
    console.error('Error creating calendar event:', err);
    throw err;
  }
}
