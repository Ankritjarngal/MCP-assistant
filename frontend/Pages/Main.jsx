import { useState, useEffect } from 'react'
import axios from 'axios'
import '../src/App.css'
import RenderScore from '../src/RenderScore'
import { jwtDecode } from 'jwt-decode'
import { FiLogOut } from 'react-icons/fi'  

function Main() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authChecked, setAuthChecked] = useState(false);

  const [queryHistory, setQueryHistory] = useState(() => {
    const storedHistory = localStorage.getItem('queryHistory')
    return storedHistory ? JSON.parse(storedHistory) : []
  })
  
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
        'http://localhost:3001/api/submit',
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
    setSidebarOpen(false) // Close sidebar on mobile after submission
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
    setSidebarOpen(false) // Close sidebar on mobile after selection
  }

  const clearHistory = () => {
    setQueryHistory([])
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Mobile Header - only visible on small screens */}
      <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded hover:bg-gray-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Assistant</h1>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-1 px-3 py-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
        >
          <span className="text-sm">Logout</span>
          <FiLogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Desktop Logout Button - only visible on large screens */}
      <button
        onClick={handleLogout}
        className="hidden lg:flex absolute top-4 right-4 z-20 items-center space-x-2 px-4 py-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 border border-blue-200 shadow-sm transition-all duration-200 font-medium"
        title="Logout"
      >
        <span>Logout</span>
        <FiLogOut className="w-5 h-5" />
      </button>

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
        lg:translate-x-0 fixed lg:relative z-40 w-80 bg-white shadow-lg border-r border-gray-200 h-full lg:h-auto transition-transform duration-300 ease-in-out
      `}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Query History</h2>
          <div className="flex items-center space-x-2">
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
                  className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.query}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{item.timestamp}</p>
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
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="space-y-6">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-6">Assistant</h1>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleClick()}
                  placeholder="Enter your query..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {!loading ? (
                  <button
                    onClick={handleClick}
                    disabled={!query.trim()}
                    className="w-full sm:w-auto bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Submit
                  </button>
                ) : (
                  <div className="flex items-center justify-center py-2 px-6">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>

              {error && (
                <div className="text-red-600 font-medium mt-4">
                  An error occurred. Please try again.
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
      </div>
    </div>
  )
}

export default Main  