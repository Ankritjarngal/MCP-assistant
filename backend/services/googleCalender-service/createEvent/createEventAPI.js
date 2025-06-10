import { google } from 'googleapis';
import { authorize } from '../../mailing-service/authAndCompose.js';  // Adjust the import as necessary
export async function createEventAPI(eventData,email) {
  try {
    // Get authorized OAuth2 client
    const oauth2Client = await authorize(email);

    // Create calendar API client using the oauth2Client
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Helper function to validate email format
    const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Filter and format attendees (only valid emails)
    const validAttendees = Array.isArray(eventData.attendees)
      ? eventData.attendees.filter(isValidEmail).map(email => ({ email }))
      : [];

    // Prepare the event data
    const event = {
      summary: eventData.summary,
      description: eventData.description || "",
      start: {
        dateTime: eventData.start,
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: eventData.end,
        timeZone: 'Asia/Kolkata',
      },
      ...(validAttendees.length > 0 && { attendees: validAttendees }), // Only include if not empty
    };

    // Insert the event
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
