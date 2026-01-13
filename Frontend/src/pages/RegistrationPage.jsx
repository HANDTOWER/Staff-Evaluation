import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CameraInput from '../components/CameraInput.jsx'
import ImageUpload from '../components/ImageUpload.jsx'
import AppHeader from '../components/AppHeader.jsx'

// Steps required for face registration.
const FACE_DIRECTIONS = [
  { key: 'front', label: 'Front View', hint: 'Look straight to the camera. Face centered, neutral expression.' },
  { key: 'left', label: 'Left Profile', hint: 'Turn your head ~45째 to the left. Keep eyes visible.' },
  { key: 'right', label: 'Right Profile', hint: 'Turn your head ~45째 to the right. Keep eyes visible.' },
  { key: 'up', label: 'Upward Tilt', hint: 'Tilt your chin slightly up. Avoid strong shadows.' },
  { key: 'down', label: 'Downward Tilt', hint: 'Tilt your chin slightly down. Keep face inside guide.' },
]

export default function FaceRegistrationPage() {
  const navigate = useNavigate()

  // Form and step state.
  const [staffId, setStaffId] = useState('')
  const [fullName, setFullName] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const [tab, setTab] = useState('camera') // 'camera' | 'upload'

  // Captured images for each direction.
  const [shots, setShots] = useState({
    front: '',
    left: '',
    right: '',
    up: '',
    down: '',
  })

  const active = FACE_DIRECTIONS[activeIdx]

  // Compute progress for the progress bar.
  const progress = useMemo(() => {
    const total = FACE_DIRECTIONS.length
    const done = FACE_DIRECTIONS.filter((d) => !!shots[d.key]).length
    return { total, done }
  }, [shots])

  // Progress percentage for the bar width.
  const progressPct = useMemo(() => {
    if (!progress.total) return 0
    return Math.round((progress.done / progress.total) * 100)
  }, [progress.done, progress.total])

  // Save the captured image into the active slot.
  const setActiveShot = (dataUrl) => {
    setShots((prev) => ({ ...prev, [active.key]: dataUrl }))
  }

  // Clear the active slot image.
  const clearActiveShot = () => {
    setShots((prev) => ({ ...prev, [active.key]: '' }))
  }

  // Reset all inputs and captured data.
  const resetAll = () => {
    setStaffId('')
    setFullName('')
    setActiveIdx(0)
    setTab('camera')
    setShots({ front: '', left: '', right: '', up: '', down: '' })
  }

  // Step navigation.
  const goPrev = () => setActiveIdx((i) => Math.max(0, i - 1))
  const goNext = () => setActiveIdx((i) => Math.min(FACE_DIRECTIONS.length - 1, i + 1))

  const isAllCaptured = progress.done === progress.total
  const canSubmit = staffId.trim().length > 0 && isAllCaptured

  // Stub submit (prints payload to console).
  const submit = () => {
    const payload = {
      staffId: staffId.trim(),
      fullName: fullName.trim(),
      capturedAt: new Date().toISOString(),
      faceImages: { ...shots }, // next: store embeddings only
    }
    console.log('Face registration payload:', payload)
    alert('Prepared payload. Check console.\nNext: connect to backend / store embeddings.')
  }

  // Resolve step status for the left-side list.
  const stepStatus = (idx) => {
    const key = FACE_DIRECTIONS[idx].key
    if (idx === activeIdx) return 'active'
    if (shots[key]) return 'done'
    return 'pending'
  }

  return (
    // Page shell.
    <div className="bg-[--color-background-light] text-[--color-text-main] font-[--font-display] min-h-screen flex flex-col overflow-x-hidden">
      {/* Header with back/reset actions. */}
      <AppHeader
        title="Face Registration"
        subtitle="Capture or upload 5 face directions for staff identification."
        icon="badge"
        showBack
        showReset
        onReset={resetAll}
      />

      {/* Progress bar for multi-step capture. */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
        <div className="w-full bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-6">
              <p className="text-slate-900 text-sm font-semibold leading-normal">Registration Progress</p>
              <p className="text-[color:var(--color-primary)] text-sm font-bold leading-normal">
                {progress.done} / {progress.total} Completed
              </p>
            </div>

            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <span
                className="block h-full rounded-full bg-[color:var(--color-primary)] transition-[width] duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-full grow flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Content layout: steps on the left, capture on the right. */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start h-full">
          {/* Left: step list and navigation. */}
          <div className="lg:col-span-3 lg:sticky lg:top-6">
            <nav className="flex flex-col gap-4 bg-white rounded-xl p-5 shadow-sm border border-slate-200">
              <div className="flex flex-col gap-1 pb-2 border-b border-slate-100">
                <h2 className="text-slate-900 text-base font-bold">Steps</h2>
                <p className="text-slate-500 text-xs">Complete all angles</p>
              </div>

              <div className="flex flex-col gap-2">
                {FACE_DIRECTIONS.map((d, idx) => {
                  const status = stepStatus(idx)
                  const done = status === 'done'
                  const activeStep = status === 'active'

                  if (activeStep) {
                    return (
                      <button
                        type="button"
                        key={d.key}
                        onClick={() => setActiveIdx(idx)}
                        className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-[color:rgba(19,109,236,0.10)] border border-[color:rgba(19,109,236,0.20)] text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="material-symbols-outlined text-[color:var(--color-primary)] animate-pulse"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            radio_button_checked
                          </span>
                          <span className="text-[color:var(--color-primary)] text-sm font-bold">{d.label}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[color:var(--color-primary)] text-white">
                          ACTIVE
                        </span>
                      </button>
                    )
                  }

                  if (done) {
                    return (
                      <button
                        type="button"
                        key={d.key}
                        onClick={() => setActiveIdx(idx)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 text-left"
                      >
                        <span
                          className="material-symbols-outlined text-green-500"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          check_circle
                        </span>
                        <span className="text-slate-700 text-sm font-medium line-through decoration-slate-400">
                          {d.label}
                        </span>
                      </button>
                    )
                  }

                  return (
                    <button
                      type="button"
                      key={d.key}
                      onClick={() => setActiveIdx(idx)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-slate-50 text-left"
                    >
                      <span className="material-symbols-outlined text-slate-400">radio_button_unchecked</span>
                      <span className="text-slate-500 text-sm font-medium">{d.label}</span>
                    </button>
                  )
                })}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={activeIdx === 0}
                  className="h-10 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={activeIdx === FACE_DIRECTIONS.length - 1}
                  className="h-10 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </nav>
          </div>

          {/* Right: staff info, capture UI, and submit panel. */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            {/* Staff Info form fields. */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[color:var(--color-primary)]">badge</span>
                Staff Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex flex-col gap-1.5">
                  <span className="text-slate-700 text-sm font-semibold">
                    Staff ID <span className="text-red-500">*</span>
                  </span>
                  <input
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 text-slate-900 h-11 text-sm px-3 outline-none focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:rgba(19,109,236,0.25)]"
                    placeholder="e.g. EMP-2024-001"
                    type="text"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-slate-700 text-sm font-semibold">
                    Full Name <span className="text-slate-400 font-normal">(Optional)</span>
                  </span>
                  <input
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 text-slate-900 h-11 text-sm px-3 outline-none focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:rgba(19,109,236,0.25)]"
                    placeholder="e.g. Jane Doe"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </label>
              </div>
            </div>

            {/* Capture card with camera/upload tabs and preview. */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              {/* Input mode tabs. */}
              <div className="flex border-b border-slate-200 px-6 pt-2">
                <button
                  type="button"
                  onClick={() => setTab('camera')}
                  className={`flex items-center gap-2 px-4 py-3 border-b-[3px] text-sm transition-colors ${
                    tab === 'camera'
                      ? 'border-[color:var(--color-primary)] text-[color:var(--color-primary)] font-bold'
                      : 'border-transparent text-slate-500 font-medium hover:text-slate-700'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: tab === 'camera' ? "'FILL' 1" : undefined }}
                  >
                    photo_camera
                  </span>
                  Camera Snapshot
                </button>

                <button
                  type="button"
                  onClick={() => setTab('upload')}
                  className={`flex items-center gap-2 px-4 py-3 border-b-[3px] text-sm transition-colors ${
                    tab === 'upload'
                      ? 'border-[color:var(--color-primary)] text-[color:var(--color-primary)] font-bold'
                      : 'border-transparent text-slate-500 font-medium hover:text-slate-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">upload_file</span>
                  Image Upload
                </button>
              </div>

              <div className="p-6 flex flex-col items-center gap-6">
                {/* Saved preview or live input. */}
                {shots[active.key] ? (
                  <div className="w-full flex flex-col items-center gap-4">
                    <div className="relative w-full max-w-2xl aspect-video rounded-lg overflow-hidden bg-slate-900 shadow-inner">
                      <img
                        src={shots[active.key]}
                        alt="Saved face preview"
                        className="absolute inset-0 w-full h-full object-cover"
                      />

                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-[35%] h-[70%] border-2 border-white/20 rounded-[50%] border-dashed" />
                      </div>

                      <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        Saved
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={clearActiveShot}
                      className="h-10 px-4 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center gap-4">
                    {tab === 'camera' ? (
                      // Key: keep CameraInput inside the frame (relative + aspect-video)
                      <div className="relative w-full max-w-2xl aspect-video bg-slate-900 rounded-lg overflow-hidden shadow-inner">
                        <CameraInput onCapture={setActiveShot} />
                      </div>
                    ) : (
                      <div className="w-full max-w-2xl">
                        <ImageUpload onSelect={setActiveShot} />
                      </div>
                    )}
                  </div>
                )}

                {/* Active step instructions. */}
                <div className="text-center max-w-md">
                  <h4 className="text-slate-900 font-semibold mb-1">{active.label}</h4>
                  <p className="text-slate-500 text-sm">{active.hint}</p>
                </div>

                {/* Actions for clearing or saving the current shot. */}
                <div className="flex items-center gap-4 w-full justify-center pt-2 flex-wrap">
                  <button
                    type="button"
                    onClick={clearActiveShot}
                    disabled={!shots[active.key]}
                    className="flex items-center justify-center gap-2 px-6 h-12 rounded-full bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors w-full sm:w-auto min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">delete</span>
                    Clear
                  </button>

                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!shots[active.key]}
                    className="flex items-center justify-center gap-2 px-8 h-12 rounded-full bg-[color:var(--color-primary)] text-white font-bold text-sm shadow-lg shadow-[color:rgba(19,109,236,0.30)] hover:bg-[color:rgba(19,109,236,0.85)] transition-colors w-full sm:w-auto min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">check</span>
                    Save & Next
                  </button>
                </div>
              </div>
            </div>

            {/* Submit area and privacy notice. */}
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100 text-blue-900">
                <span className="material-symbols-outlined text-[color:var(--color-primary)] mt-0.5">lock</span>
                <div className="text-sm">
                  <span className="font-bold">Privacy First:</span> Face images are processed locally on your device (Edge AI). Only numerical face embeddings are stored on our servers. No raw images are retained after processing.
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
                <div className="flex flex-col gap-1 text-center sm:text-left">
                  {!canSubmit ? (
                    <>
                      <span className="text-xs font-semibold text-amber-600 flex items-center gap-1 justify-center sm:justify-start">
                        <span className="material-symbols-outlined text-[16px]">warning</span>
                        Incomplete Registration
                      </span>
                      <span className="text-xs text-slate-500">
                        {!staffId.trim()
                          ? 'Staff ID is required.'
                          : `Please complete all 5 angles (${progress.done}/${progress.total}).`}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 justify-center sm:justify-start">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Ready to submit
                      </span>
                      <span className="text-xs text-slate-500">All required fields are completed.</span>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={submit}
                  disabled={!canSubmit}
                  className={
                    canSubmit
                      ? 'flex items-center justify-center w-full sm:w-auto min-w-[240px] h-14 rounded-xl bg-[color:var(--color-primary)] text-white font-bold text-base hover:bg-[color:rgba(19,109,236,0.85)] transition-colors'
                      : 'flex items-center justify-center w-full sm:w-auto min-w-[240px] h-14 rounded-xl bg-slate-200 text-slate-400 font-bold text-base cursor-not-allowed'
                  }
                >
                  Submit Registration
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
