import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'

// 1. 컴포넌트 선언부 추가 (HomePage)
export default function HomePage() {
  const navigate = useNavigate()

  // 1. Login state
  const [user, setUser] = useState(null)

  // 2. Check login info on load
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error("Failed to parse user info", e)
        localStorage.removeItem('currentUser')
      }
    }
  }, [])

  // 3. Logout handler
  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('currentUser')
    window.location.href = '/login';
  }

  // 4. 함수명 선언 추가 (const handleCardClick =)
  // Card click handler (redirect to login if guest)
  const handleCardClick = (path) => {
    if (!user) {
      alert("Please login to access this feature.")
      navigate('/login')
    } else {
      navigate(path)
    }
  }

  // 5. Role helper
  const isAdmin = user?.role === 'ADMIN'
  const isGuest = !user

  // Layout: dynamic container style
  // Guest (2 cards): two-column grid
  // Logged-in (1 card): centered, max-width container
  const containerLayoutClass = isGuest 
    ? "grid grid-cols-1 md:grid-cols-2"  // 2 cards: two columns
    : "grid grid-cols-1 max-w-lg mx-auto"; // 1 card: centered with max width

  return (
    <div className="bg-[--color-background-light] text-[--color-text-main] font-[--font-display] antialiased min-h-screen flex flex-col">
      {/* Header */}
      <AppHeader
        title="StaffEval App"
        subtitle="Privacy-first Edge AI workflow selection."
        icon="admin_panel_settings"
        rightSlot={
          <div className="flex items-center gap-4">
            {user ? (
              // Logged in: show logout only
              <button
                onClick={handleLogout}
                className="
                  flex items-center gap-1 px-3 py-2 rounded-full
                  text-slate-500 hover:text-red-600 hover:bg-red-50
                  transition-colors font-medium text-sm
                "
                title="Logout"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                <span className="hidden sm:inline">Logout</span>
              </button>
            ) : (
              // Guest: show login button
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="
                  flex items-center gap-2
                  px-3 py-2 rounded-full
                  bg-slate-100 text-slate-600
                  hover:bg-slate-200 hover:text-[--color-primary]
                  transition-colors
                  cursor-pointer
                "
                aria-label="Login"
                title="Login"
              >
                <span className="material-symbols-outlined text-[22px]">
                  account_circle
                </span>
                <span className="hidden sm:inline text-sm font-semibold">
                  Login
                </span>
              </button>
            )}
          </div>
        }
      />

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden w-full">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="w-full max-w-5xl z-10 flex flex-col gap-12">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100">
              <span className="material-symbols-outlined text-[--color-primary] text-sm">
                shield_lock
              </span>
              <span className="text-xs font-semibold text-[--color-primary] uppercase tracking-wide">
                Privacy First Edge AI
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black leading-[1.1]">
              Staff Evaluation Web App
            </h1>

            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-normal">
              Choose a workflow to start. All facial recognition and AI processing runs locally in your
              browser to ensure data privacy.
            </p>
          </div>

          {/* Navigation cards container */}
          {/* Apply layout class dynamically (containerLayoutClass) */}
          <div className={`gap-6 lg:gap-8 w-full ${containerLayoutClass}`}>
            
            {/* 🟦 1. Face Registration Card (Admin Only OR Guest) */}
            {(isGuest || isAdmin) && (
              <button
                type="button"
                onClick={() => handleCardClick('/registration')}
                className="group card-hover-effect relative flex flex-col items-start p-8 w-full h-full bg-white border border-slate-200 rounded-xl text-left focus:outline-none focus:ring-4 focus:ring-[color:rgba(19,109,236,0.20)]"
              >
                <div
                  className={`
                    size-14 rounded-xl
                    bg-[color:rgba(19,109,236,0.10)]
                    flex items-center justify-center mb-6
                    transition-colors duration-300
                    group-hover:bg-[color:var(--color-primary)]
                  `}
                >
                  <span
                    className={`
                      material-symbols-outlined text-3xl
                      text-[color:var(--color-primary)]
                      transition-colors duration-300
                      group-hover:text-white
                    `}
                  >
                    person_add
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-3">Face Registration</h2>
                <p className="text-slate-500 mb-8 flex-grow leading-relaxed">
                  Enroll new employees into the local secure database. Capture facial data to enable future
                  automated assessments.
                </p>
                <div className="flex items-center text-[color:var(--color-primary)] font-bold text-sm uppercase tracking-wider group-hover:translate-x-1 transition-transform duration-300 mt-auto">
                  {isGuest ? 'Login to Register' : 'Start Registration'}
                  <span className="material-symbols-outlined ml-2 text-lg text-[color:var(--color-primary)]">
                    arrow_forward
                  </span>
                </div>
              </button>
            )}

            {/* 🟩 2. Grooming Assessment Card (Evaluator Only OR Guest) */}
            {(isGuest || !isAdmin) && (
              <button
                type="button"
                onClick={() => handleCardClick('/assessment')}
                className="group card-hover-effect relative flex flex-col items-start p-8 w-full h-full bg-white border border-slate-200 rounded-xl text-left focus:outline-none focus:ring-4 focus:ring-[color:rgba(19,109,236,0.20)]"
              >
                <div className="size-14 rounded-xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors duration-300">
                  <span className="material-symbols-outlined text-emerald-600 text-3xl group-hover:text-white transition-colors duration-300">
                    fact_check
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Grooming Assessment</h2>
                <p className="text-slate-500 mb-8 flex-grow leading-relaxed">
                  Launch the camera to automatically check uniform compliance, grooming standards, and PPE
                  usage using real-time AI analysis.
                </p>
                <div className="flex items-center text-emerald-600 font-bold text-sm uppercase tracking-wider group-hover:translate-x-1 transition-transform duration-300 mt-auto">
                   {isGuest ? 'Login to Assess' : 'Start Assessment'}
                  <span className="material-symbols-outlined ml-2 text-lg">arrow_forward</span>
                </div>
              </button>
            )}

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-slate-500">2026 CodeComplet Inc. Version 1.0.0</div>
          <div className="flex gap-6">
            <a className="text-sm text-slate-500 hover:text-[--color-primary] transition-colors" href="#">
              Privacy Policy
            </a>
            <a className="text-sm text-slate-500 hover:text-[--color-primary] transition-colors" href="#">
              Terms of Service
            </a>
            <a className="text-sm text-slate-500 hover:text-[--color-primary] transition-colors" href="#">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}