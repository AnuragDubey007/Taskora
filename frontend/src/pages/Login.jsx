import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mic } from 'lucide-react'
import useAuthStore from '../store/authStore'
import API_URL from '../config/api'

function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors]     = useState({})
  const [isLoading, setLoading] = useState(false)

  const navigate   = useNavigate()
  const loginStore = useAuthStore(s => s.login)

  function validate() {
    const e = {}
    if (!email.trim()) e.email = 'Email is required'
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email.trim())) e.email = 'Invalid email'
    if (!password) e.password = 'Password is required'
    else if (password.length < 6) e.password = 'Minimum 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    try {
      setLoading(true)
      const res  = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      loginStore({ user: data.user, token: data.token })
      navigate('/app')
    } catch (err) {
      setErrors({ server: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="flex items-center gap-3 mb-8">
          <img src="/Taskora.png" alt="Taskora" className="w-10 h-10 rounded-xl" />

          <span className="text-xl font-bold text-white tracking-tight">Taskora</span>
        </div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Your AI voice task agent awaits</p>
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <input className="auth-input" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
            {errors.email && <p className="auth-error">{errors.email}</p>}
          </div>
          <div>
            <input className="auth-input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            {errors.password && <p className="auth-error">{errors.password}</p>}
          </div>
          {errors.server && <p className="auth-error">{errors.server}</p>}
          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="auth-switch">
          No account yet?{' '}<Link to="/signup" className="auth-link">Sign up</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
