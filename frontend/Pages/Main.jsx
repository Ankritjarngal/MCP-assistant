import { useState, useEffect } from 'react';
import axios from 'axios';
import '../src/App.css';
import RenderScore from './RenderScore';
import { jwtDecode } from 'jwt-decode';
import { FiLogOut, FiMoon, FiSun, FiMail, FiCalendar, FiTrash2, FiMenu, FiX, FiClock } from 'react-icons/fi';
import MailsModal from '../Components/MailModal';
import CalendarModal from '../Components/CalendarModal';

// Import the newly created components
import UserProfile from '../Components/UserProfile';
import ProfileModal from '../Components/ProfileModal';

function Main() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode')) || false);
  const [queryHistory, setQueryHistory] = useState(() => JSON.parse(localStorage.getItem('queryHistory')) || []);

  const [showMailsModal, setShowMailsModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  
  const [username, setUsername] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    } else if (authChecked) {
      setShowProfileModal(true);
    }
  }, [authChecked]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#111827';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f9fafb';
    }
  }, [darkMode]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (Date.now() / 1000 >= decoded.exp) {
          handleLogout(true);
        } else {
          setAuthChecked(true);
        }
      } catch (err) {
        handleLogout(true);
      }
    } else {
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('queryHistory', JSON.stringify(queryHistory));
  }, [queryHistory]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleLogout = (preserveUsername = false) => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('queryHistory');
    if (!preserveUsername) {
      localStorage.removeItem('username');
    }
    window.location.href = '/';
  };
  
  const handleSaveUsername = (newName) => {
    localStorage.setItem('username', newName);
    setUsername(newName);
    setShowProfileModal(false);
  };

  function handleClick() {
    if (!query.trim()) return;

    setLoading(true);
    setError(false);
    setResponse(null);

    const now = new Date();
    const formattedTimestamp = now.toLocaleString();

    const newHistoryItem = {
      id: Date.now(),
      query: query.trim(),
      timestamp: formattedTimestamp,
      status: 'pending',
    };

    setQueryHistory((prev) => [newHistoryItem, ...prev]);

    const fullQuery = `${query.trim()} [timestamp:${Date.now()}] [username:${username}]`;
    axios
      .post(
        'https://mcp-assistant-backend.onrender.com/api/submit',
        { query: fullQuery, email: localStorage.getItem('email') },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )
      .then((res) => {
        setResponse(res.data);
        setLoading(false);

        setQueryHistory((prev) =>
          prev.map((item) =>
            item.id === newHistoryItem.id
              ? { ...item, status: 'success', response: res.data }
              : item
          )
        );
      })
      .catch((err) => {
        console.error(err);
        setError(true);
        setLoading(false);

        setQueryHistory((prev) =>
          prev.map((item) =>
            item.id === newHistoryItem.id ? { ...item, status: 'error' } : item
          )
        );
      });

    setQuery('');
    setSidebarOpen(false);
  }

  const handleHistoryClick = (historyItem) => {
    setQuery(historyItem.query);
    setResponse(historyItem.response || null);
    setError(historyItem.status === 'error');
    setSidebarOpen(false);
  };

  const clearHistory = () => setQueryHistory([]);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex flex-col lg:flex-row transition-colors duration-200`}>
      {/* Mobile Header */}
      <div className={`lg:hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b px-4 py-3 flex items-center justify-between`}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-900'}`}>
          <FiMenu className="w-6 h-6" />
        </button>
        <h1 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Assistant</h1>
        <div className="flex items-center gap-2">
          <button onClick={toggleDarkMode} className={`p-2 rounded-md ${darkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
          </button>
          <UserProfile username={username} onEdit={() => setShowProfileModal(true)} onLogout={handleLogout} darkMode={darkMode} />
        </div>
      </div>

      {/* Desktop Controls */}
      <div className="hidden lg:flex absolute top-4 right-4 z-20 items-center gap-4">
        <button onClick={toggleDarkMode} className={`flex items-center gap-2 px-4 py-2 rounded-md ${darkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700 border-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-300'} border shadow-sm font-medium`}>
          {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
        </button>
        <UserProfile username={username} onEdit={() => setShowProfileModal(true)} onLogout={handleLogout} darkMode={darkMode} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 fixed lg:relative z-40 w-full max-w-xs sm:w-80 
          ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
          shadow-lg border-r h-full flex flex-col transition-transform duration-300 ease-in-out
        `}>
        <div className={`p-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b flex items-center justify-between`}>
          <h2 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            History & Tools
          </h2>
          <button onClick={() => setSidebarOpen(false)} className={`p-2 rounded lg:hidden ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}>
            <FiX className="w-6 h-6"/>
          </button>
        </div>
        
        {/* MODIFIED: Context buttons moved here from main content */}
        <div className={`p-2 space-y-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
            <button onClick={() => { setShowMailsModal(true); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                <FiMail className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Recent Mails</span>
            </button>
             <button onClick={() => { setShowCalendarModal(true); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                <FiCalendar className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Upcoming Events</span>
            </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {queryHistory.length === 0 ? (
            <div className={`p-4 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-8`}>
              <FiClock className="mx-auto h-12 w-12 mb-2 text-gray-400" />
              <p className="text-sm font-medium">Query history will appear here</p>
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {queryHistory.map((item) => (
                <div key={item.id} onClick={() => handleHistoryClick(item)} className={`p-3 rounded-lg border cursor-pointer transition-colors duration-200 ${darkMode ? 'border-gray-700 hover:bg-gray-700 bg-gray-750' : 'border-gray-200 hover:bg-gray-50 bg-white'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        {item.query}
                      </p>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {item.timestamp}
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0 pt-1">
                      {item.status === 'pending' && <div className="h-2.5 w-2.5 bg-yellow-400 rounded-full animate-pulse"></div>}
                      {item.status === 'success' && <div className="h-2.5 w-2.5 bg-green-400 rounded-full"></div>}
                      {item.status === 'error' && <div className="h-2.5 w-2.5 bg-red-400 rounded-full"></div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {queryHistory.length > 0 && (
          <div className={`p-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-t`}>
             <button onClick={clearHistory} className={`w-full flex items-center justify-center gap-2 p-2 rounded-md text-sm font-medium ${darkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}>
                <FiTrash2 className="w-4 h-4" />
                Clear History
              </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 sm:p-6 transition-colors duration-200`}>
            <div className="space-y-6">
              <h1 className={`text-2xl sm:text-3xl font-bold text-center mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                MCP Assistant
              </h1>
              
              {/* REMOVED: Mail/Calendar buttons were here */}

              <div className="flex flex-col sm:flex-row gap-2">
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleClick()} placeholder="Enter your query..." className={`flex-1 px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200 ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'}`} />
                <button onClick={handleClick} disabled={!query.trim() || loading} className={`w-full sm:w-auto py-3 px-6 rounded-md font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${!query.trim() || loading ? (darkMode ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-400 text-gray-600 cursor-not-allowed') : (darkMode ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-indigo-600 hover:bg-indigo-700')}`}>
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                  ) : (
                    'Submit'
                  )}
                </button>
              </div>

              {error && (
                <div className={`font-medium mt-4 text-center p-3 bg-red-500/10 text-red-500 rounded-md`}>
                  An error occurred. Please try again.
                </div>
              )}

              {response && (
                <div className='mt-6'>
                  <RenderScore res={response} darkMode={darkMode} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* RENDER MODALS */}
      {showMailsModal && <MailsModal onClose={() => setShowMailsModal(false)} darkMode={darkMode} />}
      {showCalendarModal && <CalendarModal onClose={() => setShowCalendarModal(false)} darkMode={darkMode} />}
      
      {showProfileModal && (
        <ProfileModal
          currentUsername={username}
          onSave={handleSaveUsername}
          onClose={() => setShowProfileModal(false)}
          darkMode={darkMode}
          forceAction={!localStorage.getItem('username')}
        />
      )}
    </div>
  );
}

export default Main;