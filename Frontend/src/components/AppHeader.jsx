import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import EmployeeDirectory from './EmplyeeDirectory.jsx' 

export default function AppHeader({
  title,
  subtitle,
  icon,
  showBack = false,
  showReset = false,
  onReset,
  rightSlot,
}) {
  const navigate = useNavigate()
  
  // Local state
  const [isAdmin, setIsAdmin] = useState(false)
  const [showDirectory, setShowDirectory] = useState(false)
  const [currentUser, setCurrentUser] = useState({ name: 'Guest', role: 'Visitor' })

  // 2. useEffect 선언부 추가
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser')
    const authToken = localStorage.getItem('authToken')

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setCurrentUser({
          name: user.username || user.name || 'Evaluator',
          role: user.role || 'Staff'
        })
        
        // Important: check ADMIN role here.
        if (user.role === 'ADMIN') {
          setIsAdmin(true)
        }
      } catch (e) {
        console.error("User parsing error", e)
      }
    } else if (authToken) {
      setCurrentUser({ name: 'Evaluator', role: 'Staff' })
    }
  }, [])

  const handleProfileClick = () => {
    if (isAdmin) {
      // Admin -> go to management page (/manage)
      navigate('/manage')
    } else {
      // Staff -> open employee directory modal
      setShowDirectory(true)
    }
  }

  return (
    <>
      <header className="w-full border-b border-slate-200 bg-white shadow-sm relative z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          
          {/* Left Section */}
          <div className="flex items-center gap-4 min-w-0">
            {showBack && (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-slate-100 text-slate-600 hover:text-blue-600 transition-colors"
              >
                <span className="material-symbols-outlined text-[24px]">arrow_back</span>
              </button>
            )}

            <div className="flex items-center gap-3 min-w-0">
              {icon && (
                <div className="flex-shrink-0 flex items-center justify-center h-11 w-11 rounded-xl bg-blue-50 text-blue-600">
                  <span className="material-symbols-outlined text-[24px]">
                    {icon === 'group_manage' ? 'manage_accounts' : icon}
                  </span>
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <h1 className="text-lg font-bold text-slate-900 truncate leading-tight">{title}</h1>
                {subtitle && <p className="text-xs text-slate-500 truncate mt-0.5">{subtitle}</p>}
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3 flex-shrink-0">
            
            {showReset && (
              <button
                type="button"
                onClick={onReset}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-500 bg-white text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}

            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />

            {/* Profile button */}
            <button 
              onClick={handleProfileClick} 
              className={`flex items-center gap-3 p-1.5 pr-3 rounded-full transition-all group border border-transparent 
                ${isAdmin ? 'hover:bg-blue-50 hover:border-blue-200 cursor-pointer' : 'hover:bg-slate-50 hover:border-slate-200'}
              `}
              title={isAdmin ? "Go to Management Dashboard" : "View Staff Directory"}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm group-hover:scale-105 transition-transform
                  ${isAdmin ? 'bg-blue-600 text-white' : 'bg-indigo-100 text-indigo-600'}
              `}>
                <span className="material-symbols-outlined text-xl font-variation-fill">
                  {isAdmin ? 'admin_panel_settings' : 'account_circle'}
                </span>
              </div>
              
              <div className="text-left hidden md:block">
                <p className={`text-xs font-black leading-none transition-colors
                    ${isAdmin ? 'text-blue-700' : 'text-slate-800 group-hover:text-indigo-600'}
                `}>
                  {currentUser.name}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                  {currentUser.role}
                </p>
              </div>
            </button>

            <div className="flex items-center gap-2">
               {rightSlot}
            </div>
          </div>
        </div>
      </header>
      
      {/* Employee directory modal (non-admin only) */}
      {!isAdmin && showDirectory && (
        <EmployeeDirectory onClose={() => setShowDirectory(false)} />
      )}
    </>
  )
}