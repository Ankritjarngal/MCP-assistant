import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX } from 'react-icons/fi';

const CalendarModal = ({ onClose, darkMode }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(
          'https://mcp-assistant-backend.onrender.com/api/calendar',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setEvents(response.data.events);
      } catch (err) {
        console.error('Error fetching calendar events:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto ${
        darkMode ? 'bg-black bg-opacity-75' : 'bg-gray-900 bg-opacity-75'
      } flex items-center justify-center p-4`}
    >
      <div
        className={`relative w-full max-w-lg mx-auto rounded-lg shadow-xl ${
          darkMode ? 'bg-gray-900' : 'bg-white'
        } transition-all duration-300 transform scale-100`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3
            className={`text-xl font-semibold ${
              darkMode ? 'text-gray-100' : 'text-gray-900'
            }`}
          >
            Upcoming Events
          </h3>
          <button
            onClick={onClose}
            className={`p-1 rounded-md ${
              darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div
                className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                  darkMode ? 'border-indigo-400' : 'border-indigo-600'
                }`}
              ></div>
            </div>
          ) : error ? (
            <p
              className={`text-center font-medium ${
                darkMode ? 'text-red-400' : 'text-red-600'
              }`}
            >
              Failed to load calendar events. Please try again.
            </p>
          ) : events.length === 0 ? (
            <p
              className={`text-center ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              No upcoming events found.
            </p>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`p-3 rounded-lg border ${
                    darkMode ? 'border-gray-800 bg-gray-800' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <p
                    className={`text-sm font-semibold truncate ${
                      darkMode ? 'text-gray-100' : 'text-gray-900'
                    }`}
                  >
                    {event.summary}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    Start: {formatDate(event.start)}
                  </p>
                  <p
                    className={`text-xs ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    End: {formatDate(event.end)}
                  </p>
                  {event.location && (
                    <p
                      className={`text-xs mt-1 italic ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      Location: {event.location}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarModal;