import { google } from 'googleapis';
import { authorize } from '../../mailing-service/authAndCompose.js'; 

export async function editEventAPI(updateData,email) {
  try {
    const auth = await authorize(email);
    const calendar = google.calendar({ version: 'v3', auth });

    // Step 1: Search for the event to update
    const listRes = await calendar.events.list({
      calendarId: 'primary',
      q: updateData.eventSummary,
      timeMin: new Date().toISOString(),
      maxResults: 5,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const matchingEvent = listRes.data.items.find(event =>
      event.summary.toLowerCase().includes(updateData.eventSummary.toLowerCase())
    );

    if (!matchingEvent) {
      return ('Event not found');
    }

    // Step 2: Update fields as needed
    const eventId = matchingEvent.id;
    const updatedEvent = {
      summary: updateData.newSummary || matchingEvent.summary,
      description: updateData.newDescription || matchingEvent.description,
      location: updateData.newLocation || matchingEvent.location,
      start: {
        dateTime: updateData.newStart || matchingEvent.start.dateTime,
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: updateData.newEnd || matchingEvent.end.dateTime,
        timeZone: 'Asia/Kolkata',
      },
      attendees: updateData.newAttendees
        ? updateData.newAttendees.map(email => ({ email }))
        : matchingEvent.attendees,
    };

    const updateRes = await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      resource: updatedEvent,
    });

    return updateRes.data;

  } catch (err) {
    return ('Error editing calendar event:', err);
    
  }
}
