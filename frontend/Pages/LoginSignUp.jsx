import { useEffect, useState } from 'react'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { useNavigate } from 'react-router-dom'


function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const navigate= useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decoded = jwtDecode(token)
        const now = Date.now() / 1000
        if (decoded.exp && now < decoded.exp) {
          navigate('/chat')
        } else {
          localStorage.removeItem('token')
        }
      } catch (err) {
        localStorage.removeItem('token')
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg border border-gray-200">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {isLogin ? 'Welcome Back' : 'Join Us'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isLogin ? 'Sign in to continue' : 'Create your account today'}
          </p>
        </div>

        {isLogin ? (
          <LoginForm switchToSignup={() => setIsLogin(false)} />
        ) : (
          <SignupForm switchToLogin={() => setIsLogin(true)} />
        )}
      </div>

      {/* Notification (now gray instead of green) */}
      <div
        id="successNotification"
        className="hidden fixed top-4 right-4 bg-gray-700 text-white px-6 py-3 rounded shadow-lg items-center space-x-2"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span>Success!</span>
      </div>
    </div>
  )
}

export default AuthPage

function LoginForm({ switchToSignup }) {
  const navigate= useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')

  const validateForm = () => {
    const newErrors = {}
    if (!username) newErrors.username = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(username))
      newErrors.username = 'Please enter a valid email'
    if (!password) newErrors.password = 'Password is required'
    else if (password.length < 6)
      newErrors.password = 'Password must be at least 6 characters'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setGeneralError('')

    try {
      const res = await axios.post('https://mcp-assistant-backend.onrender.com/api/login', {
        email: username,
        password,
      })

      localStorage.setItem('token', res.data.user.token)
      localStorage.setItem('email', username)

      const successEl = document.getElementById('successNotification')
      if (successEl) {
        successEl.children[1].textContent = 'Logged in successfully!'
        successEl.classList.remove('hidden')
        successEl.classList.add('flex')
      }

      setTimeout(() => {navigate('/chat')}, 1000)
    } catch (err) {
      const message = err.response?.data?.error || 'Authentication failed'
      if (message.includes('password')) {
        setErrors({ ...errors, password: 'Incorrect password' })
      } else if (message.includes('user') || message.includes('email')) {
        setErrors({ ...errors, username: 'User not found' })
      } else {
        setGeneralError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <Input
        label="Email"
        type="email"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        error={errors.username}
        placeholder="you@example.com"
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        placeholder="••••••••"
      />

      {generalError && (
        <div className="text-sm text-gray-800 bg-gray-200 border border-gray-400 p-3 rounded">
          {generalError}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 focus:outline-none disabled:bg-gray-400"
      >
        {loading ? 'Logging in...' : 'Sign In'}
      </button>

      <p className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <button
          type="button"
          className="text-gray-700 hover:underline"
          onClick={switchToSignup}
        >
          Sign Up
        </button>
      </p>
    </form>
  )
}

function SignupForm({ switchToLogin }) {
  const navigate= useNavigate()
  const [fullname, setFullname] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')

  const validateForm = () => {
    const newErrors = {}
    if (!fullname) newErrors.fullname = 'Full name is required'
    if (!username) newErrors.username = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(username))
      newErrors.username = 'Invalid email address'
    if (!password) newErrors.password = 'Password is required'
    else if (password.length < 8)
      newErrors.password = 'Password must be at least 8 characters'
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password))
      newErrors.password =
        'Include uppercase, lowercase and a number'
    if (!confirmPassword)
      newErrors.confirmPassword = 'Please confirm your password'
    else if (password !== confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setGeneralError('')

    try {
      const res = await axios.post('https://mcp-assistant-backend.onrender.com/api/register', {
        name: fullname,
        email: username,
        password,
      })

      localStorage.setItem('token', res.data.user.token)

      const successEl = document.getElementById('successNotification')
      if (successEl) {
        successEl.children[1].textContent = 'Account created successfully!'
        successEl.classList.remove('hidden')
        successEl.classList.add('flex')
      }

      setTimeout(() =>{navigate('/chat')}, 1000)
    } catch (err) {
      const message = err.response?.data?.error || 'Registration failed'
      if (message.includes('exists')) {
        setErrors({ ...errors, username: 'Email already registered' })
      } else {
        setGeneralError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSignup} className="space-y-5">
      <Input
        label="Full Name"
        type="text"
        value={fullname}
        onChange={(e) => setFullname(e.target.value)}
        error={errors.fullname}
        placeholder="Your Name"
      />
      <Input
        label="Email"
        type="email"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        error={errors.username}
        placeholder="you@example.com"
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        placeholder="Strong password"
      />
      <Input
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword}
        placeholder="Repeat password"
      />

      {generalError && (
        <div className="text-sm text-gray-800 bg-gray-200 border border-gray-400 p-3 rounded">
          {generalError}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 focus:outline-none disabled:bg-gray-400"
      >
        {loading ? 'Signing up...' : 'Create Account'}
      </button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <button
          type="button"
          className="text-gray-700 hover:underline"
          onClick={switchToLogin}
        >
          Sign In
        </button>
      </p>
    </form>
  )
}

function Input({ label, type, value, onChange, error, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2 border ${
          error ? 'border-gray-500' : 'border-gray-300'
        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500`}
      />
      {error && <p className="text-sm text-gray-700 mt-1">{error}</p>}
    </div>
  )
}