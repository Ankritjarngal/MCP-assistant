import { google } from 'googleapis';
import { authorize } from '../../mailing-service/authAndCompose.js';

export async function deleteEventAPI({ eventSummary, date }, email){
  try {
    const auth = await authorize(email);
    const calendar = google.calendar({ version: 'v3', auth });
    
    // Build search parameters
    const listParams = {
      calendarId: 'primary',
      q: eventSummary,
      singleEvents: true,
      orderBy: 'startTime',
      timeMin: date ? new Date(date + 'T00:00:00').toISOString() : new Date().toISOString(),
      timeMax: date ? new Date(date + 'T23:59:59').toISOString() : undefined,
      maxResults: 10 // Increased from 5 for better search
    };

    // Remove undefined fields to avoid API errors
    if (!listParams.timeMax) {
      delete listParams.timeMax;
    }

    console.log('Searching for events with params:', listParams);
    const listRes = await calendar.events.list(listParams);
    
    if (!listRes.data.items || listRes.data.items.length === 0) {
      console.log('No events found with the search criteria');
      return { success: false, message: 'No events found matching the criteria' };
    }

    console.log('Found events:', listRes.data.items.map(e => ({ 
      id: e.id, 
      summary: e.summary, 
      start: e.start 
    })));

    // More flexible matching - check multiple criteria
    const targetEvent = listRes.data.items.find(event => {
      if (!event.summary) return false;
      
      const eventSummaryLower = event.summary.toLowerCase();
      const searchSummaryLower = eventSummary.toLowerCase();
      
      // Try different matching strategies
      return (
        // Exact match
        eventSummaryLower === searchSummaryLower ||
        // Contains match
        eventSummaryLower.includes(searchSummaryLower) ||
        searchSummaryLower.includes(eventSummaryLower) ||
        // Word-based matching (split and check if main words match)
        searchSummaryLower.split(' ').some(word => 
          word.length > 2 && eventSummaryLower.includes(word)
        )
      );
    });

    if (!targetEvent) {
      console.log('Target event not found. Available events:', 
        listRes.data.items.map(e => e.summary)
      );
      return { 
        success: false, 
        message: `Event "${eventSummary}" not found. Available events: ${listRes.data.items.map(e => e.summary).join(', ')}` 
      };
    }

    console.log('Deleting event:', { id: targetEvent.id, summary: targetEvent.summary });
    
    // Delete the event
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: targetEvent.id
    });

    return { 
      success: true, 
      message: `Event "${targetEvent.summary}" deleted successfully.`,
      deletedEvent: {
        id: targetEvent.id,
        summary: targetEvent.summary,
        start: targetEvent.start
      }
    };
    
  } catch (err) {
    console.error('Error in deleteEventAPI:', err);
    return { 
      success: false, 
      message: `Error: ${err.message}`,
      error: err
    };
  }
}