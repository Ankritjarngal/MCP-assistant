import { useState, useEffect } from 'react'
import axios from 'axios'
import '../src/App.css'
import RenderScore from '../src/RenderScore'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { FiLogOut } from 'react-icons/fi'
import { HiMenu, HiX } from 'react-icons/hi'

function Main() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)

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
          localStorage.clear()
          navigate('/')
        }
      } catch {
        localStorage.clear()
        navigate('/')
      }
    } else {
      navigate('/')
    }
  }, [navigate])

  useEffect(() => {
    localStorage.setItem('queryHistory', JSON.stringify(queryHistory))
  }, [queryHistory])

  const handleLogout = () => {
    localStorage.clear()
    setQueryHistory([])
    navigate('/')
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

    axios.post(
      'https://mcp-assistant-backend.onrender.com/api/submit',
      { query, email: localStorage.getItem('email') },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    ).then(res => {
      setResponse(res.data)
      setLoading(false)
      setQueryHistory(prev =>
        prev.map(item =>
          item.id === newHistoryItem.id
            ? { ...item, status: 'success', response: res.data }
            : item
        )
      )
    }).catch(err => {
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
  }

  const handleHistoryClick = item => {
    setQuery(item.query)
    setResponse(item.response || null)
    setError(item.status === 'error')
  }

  const clearHistory = () => {
    setQueryHistory([])
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row relative">

      {/* Mobile Menu Toggle */}
      <div className="absolute top-4 left-4 lg:hidden z-40">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="bg-white text-gray-700 px-3 py-2 rounded-md border shadow-sm flex items-center space-x-2"
        >
          {showSidebar ? (
            <HiX className="w-6 h-6" />
          ) : (
            <HiMenu className="w-6 h-6" />
          )}
          <span>Menu</span>
        </button>
      </div>

      {/* Logout */}
      {!showSidebar && (
        <div className="absolute top-4 right-4 z-30">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 border border-blue-200 shadow-sm transition-all duration-200 font-medium"
          >
            <span>Logout</span>
            <FiLogOut className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-80 bg-white border-r border-gray-200 shadow-lg z-30 transform transition-transform duration-300 ease-in-out ${
          showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } lg:relative lg:translate-x-0`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between z-30 relative">
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

        <div className="h-full overflow-y-auto pb-4">
          {queryHistory.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <svg
                className="mx-auto h-12 w-12 text-gray-300"
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
              <p className="text-sm mt-2">No queries yet</p>
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
                      {item.status === 'pending' && <div className="h-2 w-2 bg-yellow-400 rounded-full animate-pulse" />}
                      {item.status === 'success' && <div className="h-2 w-2 bg-green-400 rounded-full" />}
                      {item.status === 'error' && <div className="h-2 w-2 bg-red-400 rounded-full" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">Assistant</h1>
            <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
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
                  className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
              ) : (
                <div className="flex items-center px-6">
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
              <div className="mt-4">
                <RenderScore res={response} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Main
