import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'

// 1. 컴포넌트 선언부 추가 (LoginPage)
export default function LoginPage() {
  const navigate = useNavigate()

  const [credentials, setCredentials] = useState({
    username: '', 
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setCredentials(prev => ({ ...prev, [name]: value }))
  }

  // 2. 함수명 선언 추가 (const onSubmit =)
  const onSubmit = async (e) => {
    e.preventDefault()

    if (!credentials.username || !credentials.password) {
      alert('Please enter your Username and Password.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'omit', 
        body: JSON.stringify(credentials)
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Login Success Payload:', data)

        // Check token field names from backend response (accessToken, token, jwt, etc.)
        const token = data.accessToken || data.token || data.jwt;
        
        if (token) {
            localStorage.setItem('authToken', token)
            console.log("✅ Token successfully stored in LocalStorage")
        } else {
            console.warn("⚠️ Login was successful, but no token was found in the response body.")
        }
        
        // Store user info
        const userInfo = {
            username: data.username || credentials.username,
            name: data.name || data.username,
            role: data.role
        }
        localStorage.setItem('currentUser', JSON.stringify(userInfo))
        navigate('/') 

      } else {
        const errorText = await response.text()
        console.error('Login Error:', errorText)
        alert('Login failed. Please check your credentials.')
      }
    } catch (error) {
      console.error('Connection Error:', error)
      alert('Server connection failed.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-[--font-display]">
      <AppHeader
        title="Login"
        subtitle="Sign in with your Employee ID."
        icon="login"
        showBack
        rightSlot={
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center justify-center size-10 rounded-full bg-white text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors border border-slate-200 shadow-sm"
          >
            <span className="material-symbols-outlined">home</span>
          </button>
        }
      />

      <main className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
            <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 mb-4">
                    <span className="material-symbols-outlined text-2xl">lock</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
                <p className="text-slate-500 text-sm mt-2">Sign in to access the system</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Username (ID)</label>
                <input
                  type="text"
                  name="username"
                  value={credentials.username}
                  onChange={handleChange}
                  placeholder="Ex: jin01"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>Sign In <span className="material-symbols-outlined">login</span></>
                )}
              </button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-slate-100">
                <p className="text-slate-500 text-sm">
                    Don't have an ID?{' '}
                    <button type="button" onClick={() => navigate('/signup')} className="text-blue-600 font-bold hover:underline">
                        Create Account
                    </button>
                </p>
            </div>
        </div>
      </main>
    </div>
  )
}