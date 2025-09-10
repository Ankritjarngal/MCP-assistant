import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX } from 'react-icons/fi';

const MailsModal = ({ onClose, darkMode }) => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(
            'https://mcp-assistant-backend.onrender.com/api/mails',
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        setEmails(response.data.emails);
      } catch (err) {
        console.error('Error fetching emails:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchEmails();
  }, []);

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
            Recent Mails
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
                  darkMode ? 'border-purple-400' : 'border-purple-600'
                }`}
              ></div>
            </div>
          ) : error ? (
            <p
              className={`text-center font-medium ${
                darkMode ? 'text-red-400' : 'text-red-600'
              }`}
            >
              Failed to load emails. Please try again.
            </p>
          ) : emails.length === 0 ? (
            <p
              className={`text-center ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              No recent emails found.
            </p>
          ) : (
            <div className="space-y-3">
              {emails.map((email) => (
                <div
                  key={email.id}
                  className={`p-3 rounded-lg border ${
                    darkMode ? 'border-gray-800 bg-gray-800' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <p
                    className={`text-sm font-semibold truncate ${
                      darkMode ? 'text-gray-100' : 'text-gray-900'
                    }`}
                  >
                    From: {email.from}
                  </p>
                  <p
                    className={`text-sm font-medium truncate mt-1 ${
                      darkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}
                  >
                    Subject: {email.subject}
                  </p>
                  <p
                    className={`text-xs mt-2 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {email.snippet}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MailsModal;