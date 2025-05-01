import { google } from 'googleapis';
import { authorize } from '../../mailing-service/authAndCompose.js';

export async function deleteEventAPI({ eventSummary, date }) {
  try {
    const auth = await authorize();
    const calendar = google.calendar({ version: 'v3', auth });

    const listParams = {
      calendarId: 'primary',
      q: eventSummary,
      singleEvents: true,
      orderBy: 'startTime',
      timeMin: date ? new Date(date + 'T00:00:00').toISOString() : new Date().toISOString(),
      timeMax: date ? new Date(date + 'T23:59:59').toISOString() : undefined,
      maxResults: 5
    };

    const listRes = await calendar.events.list(listParams);

    const targetEvent = listRes.data.items.find(event =>
      event.summary.toLowerCase().includes(eventSummary.toLowerCase())
    );

    if (!targetEvent) {
      return ('Event not found');
    }

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: targetEvent.id
    });

    return { success: true, message: 'Event deleted successfully.' };

  } catch (err) {
    
    return { success: false, message: err.message };
  }
}
