import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios'

function App() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [queryHistory, setQueryHistory] = useState([])

  function handleClick() {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(false);
    setResponse(null);
    
    // Add query to history immediately
    const newHistoryItem = {
      id: Date.now(),
      query: query.trim(),
      timestamp: new Date().toLocaleTimeString(),
      status: 'pending'
    };
    
    setQueryHistory(prev => [newHistoryItem, ...prev]);
    
    axios.post('http://localhost:3001/api/submit', {
      query: query
    })
    .then((res) => {
      console.log(res.data);
      setResponse(res.data);
      setLoading(false);
      
      // Update history item with success status
      setQueryHistory(prev => 
        prev.map(item => 
          item.id === newHistoryItem.id 
            ? { ...item, status: 'success', response: res.data }
            : item
        )
      );
    })
    .catch((error) => {
      console.error(error);
      setError(true);
      setLoading(false);
      
      // Update history item with error status
      setQueryHistory(prev => 
        prev.map(item => 
          item.id === newHistoryItem.id 
            ? { ...item, status: 'error' }
            : item
        )
      );
    });
    
    setQuery(''); // Clear input after submission
  }

  // Function to render JSON response in a readable format
  const renderResponse = (data) => {
    if (!data) return null;
    
    // If it's a string, render directly
    if (typeof data === 'string') {
      return <div className="text-gray-800">{data}</div>;
    }
    
    // If it's an object, render as formatted JSON
    return (
      <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  // Function to handle clicking on a history item
  const handleHistoryClick = (historyItem) => {
    setQuery(historyItem.query);
    if (historyItem.response) {
      setResponse(historyItem.response);
    }
    setError(historyItem.status === 'error');
  };

  // Function to clear history
  const clearHistory = () => {
    setQueryHistory([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Query History */}
      <div className="w-80 bg-white shadow-lg border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Query History</h2>
            {queryHistory.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
        
        <div className="h-full overflow-y-auto pb-4">
          {queryHistory.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <div className="text-gray-400 mb-2">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm">No queries yet</p>
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {queryHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleHistoryClick(item)}
                  className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.query}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.timestamp}
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      {item.status === 'pending' && (
                        <div className="h-2 w-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      )}
                      {item.status === 'success' && (
                        <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                      )}
                      {item.status === 'error' && (
                        <div className="h-2 w-2 bg-red-400 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
                  Assistant
                </h1>
                
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleClick()}
                      placeholder="Enter your query..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {!loading && (
                      <button 
                        onClick={handleClick}
                        disabled={!query.trim()}
                        className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        Submit
                      </button>
                    )}
                    {loading && (
                      <div className="flex items-center px-6">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                  
                  {loading && (
                    <div className="flex items-center justify-center py-4">
                      <span className="text-gray-600">Processing your query...</span>
                    </div>
                  )}
                  
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">
                            Error occurred while processing your request.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {response && (
                    <div className="mt-6">
                      <h2 className="text-lg font-medium text-gray-900 mb-3">Response:</h2>
                      <div className="bg-gray-50 rounded-lg p-4 border max-h-96 overflow-y-auto">
                        {renderResponse(response)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App