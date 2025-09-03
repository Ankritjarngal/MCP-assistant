import { useState, useEffect } from 'react'
import axios from 'axios'
import '../src/App.css'
import RenderScore from './RenderScore'
import { jwtDecode } from 'jwt-decode'
import { FiLogOut, FiMoon, FiSun } from 'react-icons/fi'  

function Main() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  const [queryHistory, setQueryHistory] = useState(() => {
    const storedHistory = localStorage.getItem('queryHistory')
    return storedHistory ? JSON.parse(storedHistory) : []
  })

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add('dark')
      document.body.style.backgroundColor = '#111827' // gray-900
      document.documentElement.style.backgroundColor = '#111827'
    } else {
      document.documentElement.classList.remove('dark')
      document.body.style.backgroundColor = '#f9fafb' // gray-50
      document.documentElement.style.backgroundColor = '#f9fafb'
    }
  }, [darkMode])
  
  useEffect(() => {
    const token = localStorage.getItem('token')
  
    if (token) {
      try {
        const decoded = jwtDecode(token)
        const now = Date.now() / 1000
  
        if (!decoded.exp || now >= decoded.exp) {
          console.log('[DEBUG] Token expired')
          localStorage.removeItem('token')
          localStorage.removeItem('email')
          window.location.href = '/'
        } else {
          setAuthChecked(true)
        }
      } catch (err) {
        console.log('[DEBUG] Error decoding token:', err)
        localStorage.removeItem('token')
        localStorage.removeItem('email')
        window.location.href = '/'
      }
    } else {
      window.location.href = '/'
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('queryHistory', JSON.stringify(queryHistory))
  }, [queryHistory])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    setQueryHistory([])
    window.location.href = '/'
  }

  function handleClick() {
    if (!query.trim()) return

    setLoading(true)
    setError(false)
    setResponse(null)

    const newHistoryItem = {
      id: Date.now(),
      query: query.trim(),
      timestamp: new Date().toLocaleTimeString(),
      status: 'pending'
    }

    setQueryHistory(prev => [newHistoryItem, ...prev])

    axios
      .post(
        'https://mcp-assistant-backend.onrender.com/api/submit',
        { query, email: localStorage.getItem('email') },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      .then(res => {
        setResponse(res.data)
        setLoading(false)

        setQueryHistory(prev =>
          prev.map(item =>
            item.id === newHistoryItem.id
              ? { ...item, status: 'success', response: res.data }
              : item
          )
        )
      })
      .catch(err => {
        console.error(err)
        setError(true)
        setLoading(false)

        setQueryHistory(prev =>
          prev.map(item =>
            item.id === newHistoryItem.id
              ? { ...item, status: 'error' }
              : item
          )
        )
      })

    setQuery('')
    setSidebarOpen(false)
  }

  const handleHistoryClick = historyItem => {
    setQuery(historyItem.query)
    if (historyItem.response) {
      setResponse(historyItem.response)
      setError(false)
    } else {
      setResponse(null)
      setError(historyItem.status === 'error')
    }
    setSidebarOpen(false)
  }

  const clearHistory = () => {
    setQueryHistory([])
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex flex-col lg:flex-row transition-colors duration-200`}>
      {/* Mobile Header */}
      <div className={`lg:hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b px-4 py-3 flex items-center justify-between transition-colors duration-200`}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-900'} transition-colors duration-200`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Assistant</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-md ${darkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition-colors duration-200`}
            title="Toggle theme"
          >
            {darkMode ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
          </button>
          <button
            onClick={handleLogout}
            className={`flex items-center space-x-1 px-3 py-2 rounded-md ${darkMode ? 'bg-blue-900 text-blue-200 hover:bg-blue-800 border-blue-700' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200'} border transition-colors duration-200`}
          >
            <span className="text-sm">Logout</span>
            <FiLogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Desktop Controls */}
      <div className="hidden lg:flex absolute top-4 right-4 z-20 items-center space-x-2">
        <button
          onClick={toggleDarkMode}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md ${darkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700 border-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-300'} border shadow-sm transition-all duration-200 font-medium`}
          title="Toggle theme"
        >
          {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
        </button>
        <button
          onClick={handleLogout}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md ${darkMode ? 'bg-blue-900 text-blue-200 hover:bg-blue-800 border-blue-700' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200'} border shadow-sm transition-all duration-200 font-medium`}
          title="Logout"
        >
          <span>Logout</span>
          <FiLogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 fixed lg:relative z-40 w-80 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg border-r h-full lg:h-auto transition-all duration-300 ease-in-out
      `}>
        <div className={`p-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b flex items-center justify-between`}>
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Query History</h2>
          <div className="flex items-center space-x-2">
            {queryHistory.length > 0 && (
              <button
                onClick={clearHistory}
                className={`text-sm font-medium ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'} transition-colors duration-200`}
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        <div className="h-full overflow-y-auto pb-4">
          {queryHistory.length === 0 ? (
            <div className={`p-4 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className={`mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-sm">No queries yet</p>
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {queryHistory.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleHistoryClick(item)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors duration-200 ${
                    darkMode 
                      ? 'border-gray-600 hover:bg-gray-700 bg-gray-750' 
                      : 'border-gray-200 hover:bg-gray-50 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        {item.query}
                      </p>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.timestamp}</p>
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
      <div className="flex-1 py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 sm:p-6 transition-colors duration-200`}>
            <div className="space-y-6">
              <h1 className={`text-xl sm:text-2xl font-bold text-center mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Assistant</h1>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleClick()}
                  placeholder="Enter your query..."
                  className={`flex-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                    darkMode 
                      ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400 focus:border-blue-400' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-blue-500'
                  }`}
                />
                {!loading ? (
                  <button
                    onClick={handleClick}
                    disabled={!query.trim()}
                    className={`w-full sm:w-auto py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                      !query.trim()
                        ? darkMode ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : darkMode ? 'bg-blue-700 text-white hover:bg-blue-600' : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Submit
                  </button>
                ) : (
                  <div className="flex items-center justify-center py-2 px-6">
                    <div className={`animate-spin rounded-full h-5 w-5 border-b-2 ${darkMode ? 'border-blue-400' : 'border-blue-600'}`}></div>
                  </div>
                )}
              </div>

              {error && (
                <div className={`font-medium mt-4 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                  An error occurred. Please try again.
                </div>
              )}

              {response && (
                <div>
                  <RenderScore res={response} darkMode={darkMode} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Main