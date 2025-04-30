import { google } from 'googleapis';
import { authorize } from '../../mailing-service/authAndCompose.js';  

export async function listEventAPI({ timeMin, timeMax, query = '', calendarId = 'primary' }) {
  try {
    const oauth2Client = await authorize();
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const params = {
      calendarId,
      singleEvents: true,
      orderBy: "startTime",
    };

    if (timeMin) params.timeMin = new Date(timeMin).toISOString();
    if (timeMax) params.timeMax = new Date(timeMax).toISOString();
    if (query.trim()) params.q = query;

    const res = await calendar.events.list(params);
    return res.data.items;
  } catch (err) {
    console.error('Error listing events:', err);
    throw err;
  }
}
