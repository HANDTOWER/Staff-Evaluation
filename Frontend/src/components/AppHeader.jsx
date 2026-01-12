import { useNavigate } from 'react-router-dom'

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

  return (
    <header className="w-full border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          {showBack && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-100 text-slate-600 hover:text-[--color-primary] transition-colors"
              aria-label="Go back"
              title="Back"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          )}

          <div className="flex items-start gap-3">
            {icon && (
              <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-[color:rgba(19,109,236,0.10)] text-[--color-primary]">
                <span className="material-symbols-outlined text-[22px]">{icon}</span>
              </div>
            )}

            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">{title}</h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-slate-500">{subtitle}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {showReset && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-500 bg-white text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              Reset
            </button>
          )}
          {rightSlot}
        </div>
      </div>
    </header>
  )
}
