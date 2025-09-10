import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { FiMoon, FiSun, FiCheckCircle } from 'react-icons/fi';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// New ToastNotification component
function ToastNotification({ message, isVisible, darkMode, type = 'success' }) {
  if (!isVisible) return null;

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: darkMode ? 'bg-green-700' : 'bg-green-100',
          text: darkMode ? 'text-green-200' : 'text-green-800',
          icon: darkMode ? 'text-green-300' : 'text-green-600',
          border: darkMode ? 'border-green-600' : 'border-green-300'
        };
      default:
        return {
          bg: darkMode ? 'bg-blue-700' : 'bg-blue-100',
          text: darkMode ? 'text-blue-200' : 'text-blue-800',
          icon: darkMode ? 'text-blue-300' : 'text-blue-600',
          border: darkMode ? 'border-blue-600' : 'border-blue-300'
        };
    }
  };

  const colors = getColors();

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 transform ${colors.bg} ${colors.text} border ${colors.border}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: `translate(-50%, ${isVisible ? '0' : '20px'})`,
      }}
    >
      <div className="flex items-center space-x-3">
        {type === 'success' && <FiCheckCircle className={`w-5 h-5 ${colors.icon}`} />}
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [showToast, setShowToast] = useState(false);

  // useRef to prevent duplicate requests
  const hasExchangedCode = useRef(false);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#111827';
      document.documentElement.style.backgroundColor = '#111827';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f9fafb';
      document.documentElement.style.backgroundColor = '#f9fafb';
    }
  }, [darkMode]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;
        if (decoded.exp && now < decoded.exp) {
          navigate('/chat');
          return;
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('email');
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
      }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const errorParam = urlParams.get('error');

    if (errorParam) {
      setError('Authorization was denied or failed');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (code && !hasExchangedCode.current) {
      // Set the flag to true to prevent future duplicate calls
      hasExchangedCode.current = true;
      handleAuthorizationCode(code);
    }

    initializeGoogleOAuth();
  }, [navigate]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleAuthorizationCode = async (code) => {
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('https://mcp-assistant-backend.onrender.com/apii/auth', {
        code: code,
      });

      const { token, email } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('email', email);

      // Show the new toast notification
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000); // Hide toast after 3 seconds

      window.history.replaceState({}, document.title, window.location.pathname);

      setTimeout(() => navigate('/chat'), 1000);

    } catch (err) {
      console.error('Auth code exchange error:', err);
      const message = err.response?.data?.error || err.message || 'Authentication failed';
      setError(message);
      window.history.replaceState({}, document.title, window.location.pathname);
    } finally {
      setLoading(false);
    }
  };

  const initializeGoogleOAuth = () => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = setupGoogleOAuth;
      document.head.appendChild(script);
    } else {
      setupGoogleOAuth();
    }
  };

  let codeClient;
  const setupGoogleOAuth = () => {
    codeClient = window.google.accounts.oauth2.initCodeClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/gmail.readonly',
        'email',
        'profile'
      ].join(' '),
      ux_mode: 'redirect',
      redirect_uri: 'https://mcp-assistant.vercel.app',
      access_type: 'offline',
      prompt: 'consent'
    });
  };

  const handleSignInClick = () => {
    if (window.google && window.google.accounts.oauth2 && codeClient) {
      codeClient.requestCode();
    } else {
      setError('Google OAuth not initialized');
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} flex items-center justify-center px-4 py-12 transition-colors duration-200`}>
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-all duration-200 ${
          darkMode
            ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700 border border-gray-600'
            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
        }`}
        title="Toggle theme"
      >
        {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
      </button>

      <div className={`max-w-md w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} transition-colors duration-200`}>
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Welcome</h1>
          <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Sign in with Google to continue</p>
        </div>

        <div className="space-y-6">
          <div className="flex justify-center">
            <button
              onClick={handleSignInClick}
              disabled={loading}
              className={`flex items-center justify-center px-6 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 min-w-[300px] ${
                darkMode
                  ? 'border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-100'
                  : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
              } ${
                loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="font-medium">
                {loading ? 'Signing in...' : 'Sign in with Google'}
              </span>
            </button>
          </div>

          {loading && (
            <div className="text-center">
              <div className={`inline-flex items-center px-4 py-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <svg className={`animate-spin -ml-1 mr-3 h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing you in...
              </div>
            </div>
          )}

          {error && (
            <div className={`text-sm p-3 rounded border ${
              darkMode
                ? 'text-red-300 bg-red-900/50 border-red-700'
                : 'text-red-700 bg-red-100 border-red-300'
            }`}>
              {error}
            </div>
          )}

          <div className={`text-center text-sm space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <p>This app needs access to:</p>
            <ul className="text-xs space-y-1">
              <li>• Send emails on your behalf</li>
              <li>• Access your calendar</li>
              <li>• Your basic profile information</li>
            </ul>
            <p className="mt-2">Secure authentication powered by Google</p>
          </div>
        </div>
      </div>

      {/* New Toast Notification */}
      <ToastNotification
        message="Logged in successfully!"
        isVisible={showToast}
        darkMode={darkMode}
      />
    </div>
  );
}

export default AuthPage;