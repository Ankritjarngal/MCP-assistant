import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from "https://unpkg.com/jwt-decode@4.0.0/build/esm/index.js";
import { 
  LogOut, 
  Menu, 
  X, 
  Trash2, 
  FileText, 
  Sun, 
  Moon,
  CheckCircle, 
  XCircle, 
  ChevronDown, 
  Mail, 
  CalendarDays 
} from 'lucide-react';

//================================================================================
// RenderScore Component
// This component now intelligently renders responses based on the service type.
//================================================================================
function RenderScore({ res }) {
  const [expanded, setExpanded] = useState(true);

  // Check for a valid, non-empty response
  const hasResponse = res && res.message && res.res;
  const service = hasResponse ? res.message.toLowerCase() : null;
  const item = hasResponse ? res.res.item : null;

  const ServiceCard = ({ icon, title, children, color }) => (
    <div className="mt-6 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900/50">
      <div className={`flex items-center space-x-3 px-4 py-3 bg-${color}-50 dark:bg-${color}-900/20 border-b border-gray-200 dark:border-gray-700 rounded-t-md`}>
        {icon}
        <span className={`text-sm font-semibold text-${color}-800 dark:text-${color}-200`}>{title}</span>
      </div>
      <div className="p-4 space-y-3 text-sm">
        {children}
      </div>
    </div>
  );

  const DataField = ({ label, value }) => (
    <div>
      <p className="font-mono text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-gray-800 dark:text-gray-200">{value}</p>
    </div>
  );

  const renderServiceDetails = () => {
    if (!item) {
      return (
         <pre
            id="response-details"
            className="p-4 text-sm text-gray-800 dark:text-gray-200 overflow-x-auto max-h-64 font-mono bg-white dark:bg-gray-800 rounded-b-md"
          >
           {JSON.stringify(res, null, 2)}
         </pre>
      );
    }
    
    switch (service) {
      case 'mailing service':
        return (
          <ServiceCard 
            icon={<Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />} 
            title="Mailing Service"
            color="blue"
          >
            <DataField label="To" value={item.to} />
            <DataField label="Subject" value={item.subject} />
             <div>
              <p className="font-mono text-xs text-gray-500 dark:text-gray-400">Message</p>
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{item.message}</p>
            </div>
          </ServiceCard>
        );
      case 'google calendar':
         return (
          <ServiceCard 
            icon={<CalendarDays className="w-5 h-5 text-purple-600 dark:text-purple-400" />} 
            title="Google Calendar Event"
            color="purple"
          >
            <DataField label="Summary" value={item.summary || 'N/A'} />
            <DataField label="Location" value={item.location || 'N/A'} />
            <DataField label="Start" value={item.start ? new Date(item.start.dateTime).toLocaleString() : 'N/A'} />
            <DataField label="End" value={item.end ? new Date(item.end.dateTime).toLocaleString() : 'N/A'} />
          </ServiceCard>
        );
      default:
        return (
          <div className="mt-6 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800">
             <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 rounded-t-md">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Raw JSON Response</span>
             </div>
             <pre
                id="response-details"
                className="p-4 text-sm text-gray-800 dark:text-gray-200 overflow-x-auto max-h-64 font-mono bg-white dark:bg-gray-800/50 rounded-b-md"
             >
                {JSON.stringify(res, null, 2)}
             </pre>
          </div>
        );
    }
  };

  return (
    <div className="w-full mx-auto mt-8">
      <div
        className={`border rounded-lg shadow-sm bg-white dark:bg-gray-800 transition-colors duration-200 ${
          hasResponse 
            ? "border-green-200 dark:border-green-700/50 shadow-green-500/5 dark:shadow-green-500/10" 
            : "border-red-200 dark:border-red-700/50 shadow-red-500/5 dark:shadow-red-500/10"
        }`}
        role="alert"
        aria-live="polite"
      >
        <div 
          className={`h-1.5 rounded-t-lg ${
            hasResponse ? "bg-green-500" : "bg-red-500"
          }`}
        />
        
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              {hasResponse ? (
                <CheckCircle className="w-7 h-7 text-green-500" aria-hidden="true" />
              ) : (
                <XCircle className="w-7 h-7 text-red-500" aria-hidden="true" />
              )}
              
              <div>
                <h3 className={`text-lg font-semibold ${
                  hasResponse ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"
                }`}>
                  {hasResponse ? "Request Successful" : "Request Failed"}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {hasResponse ? `Service: ${res.message}` : "No response data available"}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              aria-controls="response-details"
              className="flex-shrink-0 w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-150"
            >
              <span className="mr-2">
                {expanded ? "Hide Details" : "View Details"}
              </span>
              <ChevronDown 
                className={`w-4 h-4 transition-transform duration-200 ${
                  expanded ? "rotate-180" : "rotate-0"
                }`} 
                aria-hidden="true" 
              />
            </button>
          </div>
          
          {expanded && renderServiceDetails()}
        </div>
      </div>
    </div>
  );
}


//================================================================================
// Main Application Component
// Includes state management for dark mode and query history.
//================================================================================
function App() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  const [queryHistory, setQueryHistory] = useState(() => {
    const storedHistory = localStorage.getItem('queryHistory');
    return storedHistory ? JSON.parse(storedHistory) : [];
  });
  
  // Effect to manage theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Effect to manage authentication token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;
        if (!decoded.exp || now >= decoded.exp) {
          console.log('[DEBUG] Token expired');
          handleLogout(false);
        } else {
          setAuthChecked(true);
        }
      } catch (err) {
        console.log('[DEBUG] Error decoding token:', err);
        handleLogout(false);
      }
    } else {
      // Uncomment the line below to enforce login
      // window.location.href = '/'; 
    }
  }, []);
  
  // Effect to sync query history with localStorage
  useEffect(() => {
    localStorage.setItem('queryHistory', JSON.stringify(queryHistory));
  }, [queryHistory]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = (redirect = true) => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('queryHistory');
    setQueryHistory([]);
    if (redirect) {
      // Uncomment the line below to redirect on logout
      // window.location.href = '/';
    }
  };

  function handleClick() {
    if (!query.trim()) return;

    setLoading(true);
    setError(false);
    setResponse(null);

    const newHistoryItem = {
      id: Date.now(),
      query: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'pending'
    };

    setQueryHistory(prev => [newHistoryItem, ...prev]);

    axios.post(
        'https://mcp-assistant-backend.onrender.com/api/submit',
        { query, email: localStorage.getItem('email') },
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      .then(res => {
        setResponse(res.data);
        setLoading(false);
        setQueryHistory(prev =>
          prev.map(item =>
            item.id === newHistoryItem.id
              ? { ...item, status: 'success', response: res.data }
              : item
          )
        );
      })
      .catch(err => {
        console.error(err);
        setError(true);
        setLoading(false);
        setQueryHistory(prev =>
          prev.map(item =>
            item.id === newHistoryItem.id
              ? { ...item, status: 'error' }
              : item
          )
        );
      });

    setQuery('');
    setSidebarOpen(false);
  }

  const handleHistoryClick = historyItem => {
    setQuery(historyItem.query);
    if (historyItem.response) {
      setResponse(historyItem.response);
      setError(false);
    } else {
      setResponse(null);
      setError(historyItem.status === 'error');
    }
    setSidebarOpen(false);
  };

  const clearHistory = () => {
    setQueryHistory([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex flex-col lg:flex-row font-sans">
      
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-60 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 fixed lg:relative z-40 w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col transition-transform duration-300 ease-in-out
      `}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Query History</h2>
          {queryHistory.length > 0 && (
            <button
              onClick={clearHistory}
              className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400"
              title="Clear all history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex-grow overflow-y-auto">
          {queryHistory.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 mt-10">
              <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />
              <p className="text-sm">No queries yet</p>
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {queryHistory.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleHistoryClick(item)}
                  className="p-3 rounded-lg border border-transparent hover:border-blue-500/30 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                        {item.query}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.timestamp}</p>
                    </div>
                    <div className="ml-2 flex-shrink-0 mt-1">
                      {item.status === 'pending' && <div className="h-2 w-2 bg-yellow-400 rounded-full animate-pulse" title="Pending"></div>}
                      {item.status === 'success' && <div className="h-2 w-2 bg-green-400 rounded-full" title="Success"></div>}
                      {item.status === 'error' && <div className="h-2 w-2 bg-red-400 rounded-full" title="Error"></div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-2 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
           <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800/50 shadow-sm transition-all duration-200 font-medium"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
          {/* Header for Mobile */}
          <header className="lg:hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {sidebarOpen ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
              </button>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Assistant</h1>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Toggle theme"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
          </header>

          <main className="flex-1 py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">

              {/* Header for Desktop */}
              <div className="hidden lg:flex items-center justify-between mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Assistant</h1>
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Toggle theme"
                  >
                    {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                  </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-2xl dark:shadow-blue-900/20 p-4 sm:p-6">
                <div className="space-y-6">
                  <div className="relative">
                    <textarea
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleClick(); } }}
                      placeholder="Enter your query... (Press Enter to submit, Shift+Enter for new line)"
                      rows="3"
                      className="w-full px-4 py-3 pr-28 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-transparent placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 resize-none transition"
                    />
                    {!loading ? (
                      <button
                        onClick={handleClick}
                        disabled={!query.trim()}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-blue-600 text-white py-2 px-5 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
                      >
                        Submit
                      </button>
                    ) : (
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center py-2 px-6">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 dark:border-blue-400"></div>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="text-red-500 dark:text-red-400 font-medium mt-4 text-center">
                      An error occurred. Please try again later.
                    </div>
                  )}

                  {response && (
                    <div>
                      <RenderScore res={response} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
      </div>
    </div>
  );
}

export default App;

