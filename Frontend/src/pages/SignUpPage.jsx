import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'

// 1. Add Component Declaration (SignupPage)
export default function SignupPage() {
  const navigate = useNavigate()

  // State: backend expects key 'username'
  const [formData, setFormData] = useState({
    username: '',   // UI label is "Full Name", but the payload key is 'username'
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // 2. Add function name (const onSubmit =)
  const onSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.username || !formData.password) {
      alert('Full Name and Password are required.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        
        // Get generated ID (username) from backend
        const generatedId = data.username || data.employeeId || "Unknown"
        
        alert(`✅ Account Created Successfully!\n\nYOUR ID: [ ${generatedId} ]\n\nPlease remember this ID to login.`)
        navigate('/login') 
      } else {
        const errorText = await response.text()
        if (response.status === 409) {
             alert("This name is already registered.")
        } else {
             alert(`Signup failed: ${errorText}`)
        }
      }
    } catch (error) {
      console.error('Network Error:', error)
      alert('Server connection failed.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-[--font-display]">
      <AppHeader title="Sign Up" subtitle="Create a new account." icon="person_add" showBack />

      <main className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
            <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 mb-4">
                    <span className="material-symbols-outlined text-2xl">person_add</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
                <p className="text-slate-500 text-sm mt-2">Enter your name to generate an ID</p>
            </div>
            
            <form onSubmit={onSubmit} className="space-y-6">
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Full Name (English)</label>
                <div className="relative">
                    <input 
                        type="text" 
                        name="username" 
                        value={formData.username} 
                        onChange={handleChange} 
                        placeholder="Ex: Jin Kim" 
                        className="w-full h-12 pl-4 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium" 
                    />
                </div>
                <p className="text-[11px] text-blue-500 mt-1.5 ml-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">info</span>
                    Login ID will be auto-generated from this name.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Password</label>
                <input 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder="Create a password" 
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium" 
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        Get My ID <span className="material-symbols-outlined">arrow_forward</span>
                    </>
                )}
              </button>
            </form>
            
            <div className="mt-8 text-center pt-6 border-t border-slate-100">
                <p className="text-slate-500 text-sm">
                    Already have an ID?{' '}
                    <button type="button" onClick={() => navigate('/login')} className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-colors">
                        Sign In
                    </button>
                </p>
            </div>
        </div>
      </main>
    </div>
  )
}