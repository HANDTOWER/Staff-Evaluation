import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="bg-[--color-background-light] text-[--color-text-main] font-[--font-display] antialiased min-h-screen flex flex-col">
      {/* Header */}
      <AppHeader
        title="StaffEval App"
        subtitle="Privacy-first Edge AI workflow selection."
        icon="admin_panel_settings"
        rightSlot={
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium text-slate-600"
            >
              <span className="material-symbols-outlined text-[20px]">help</span>
              <span className="hidden sm:inline">Help</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2 rounded-full border border-slate-200 bg-white text-slate-700 hover:border-[--color-primary] hover:text-[--color-primary] transition-colors cursor-pointer focus:outline-none"
              aria-label="Profile"
              title="Profile"
            >
              <span className="material-symbols-outlined">account_circle</span>
            </button>
          </div>
        }
      />

      {/* Main */}
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
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100">
              <span className="material-symbols-outlined text-[--color-primary] text-sm">
                shield_lock
              </span>
              <span className="text-xs font-semibold text-[--color-primary] uppercase tracking-wide">
                Privacy First • Edge AI
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 w-full">
            <button
              type="button"
              onClick={() => navigate('/registration')}
              className="group card-hover-effect relative flex flex-col items-start p-8 h-full bg-white border border-slate-200 rounded-xl text-left focus:outline-none focus:ring-4 focus:ring-[color:rgba(19,109,236,0.20)]"
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

              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                Face Registration
              </h2>
              <p className="text-slate-500 mb-8 flex-grow leading-relaxed">
                Enroll new employees into the local secure database. Capture facial data to enable future
                automated assessments. No data leaves this device.
              </p>
              <div className="flex items-center text-[color:var(--color-primary)] font-bold text-sm uppercase tracking-wider group-hover:translate-x-1 transition-transform duration-300">
                Start Registration
                <span className="material-symbols-outlined ml-2 text-lg text-[color:var(--color-primary)]">
                  arrow_forward
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate('/assessment')}
              className="group card-hover-effect relative flex flex-col items-start p-8 h-full bg-white border border-slate-200 rounded-xl text-left focus:outline-none focus:ring-4 focus:ring-[color:rgba(19,109,236,0.20)]"
            >
              <div className="size-14 rounded-xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors duration-300">
                <span className="material-symbols-outlined text-emerald-600 text-3xl group-hover:text-white transition-colors duration-300">
                  fact_check
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                Grooming Assessment
              </h2>
              <p className="text-slate-500 mb-8 flex-grow leading-relaxed">
                Launch the camera to automatically check uniform compliance, grooming standards, and PPE
                usage using real-time AI analysis.
              </p>
              <div className="flex items-center text-emerald-600 font-bold text-sm uppercase tracking-wider group-hover:translate-x-1 transition-transform duration-300">
                Start Assessment
                <span className="material-symbols-outlined ml-2 text-lg">arrow_forward</span>
              </div>
            </button>
          </div>
        </div>

        {/* First-time user hint */}
        <div className="mt-10 flex justify-center">
        <p className="text-lg text-slate-500">
            New here?{' '}
            <span className="font-semibold text-[--color-primary]">
            Please start with Face Registration.
            </span>
        </p>
        </div>


      </main>

      <footer className="w-full bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-slate-500">
            © 2026 CodeComplet Inc. Version 1.0.0
          </div>
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
