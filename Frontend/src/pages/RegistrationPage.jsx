import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CameraInput from '../components/CameraInput.jsx'
import ImageUpload from '../components/ImageUpload.jsx'
import AppHeader from '../components/AppHeader.jsx'

const FACE_DIRECTIONS = [
  { key: 'front', label: 'Front View', hint: 'Look straight. Face centered, neutral expression.' },
  { key: 'left', label: 'Left Profile', hint: 'Turn your head ~45° to the left. Keep eyes visible.' },
  { key: 'right', label: 'Right Profile', hint: 'Turn your head ~45° to the right. Keep eyes visible.' },
  { key: 'up', label: 'Upward Tilt', hint: 'Tilt your chin slightly up. Avoid strong shadows.' },
  { key: 'down', label: 'Downward Tilt', hint: 'Tilt your chin slightly down. Keep face inside guide.' },
]

// 1. 컴포넌트 선언부 추가 (RegistrationPage)
export default function RegistrationPage() {
  const navigate = useNavigate()

  const [activeIdx, setActiveIdx] = useState(0)
  const [tab, setTab] = useState('camera') 

  const [userInfo, setUserInfo] = useState({
    name: '',
    department: '',
    position: ''
  })

  const [shots, setShots] = useState({
    front: '', left: '', right: '', up: '', down: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) {
        alert("Authentication required. Please login again.")
        navigate('/login')
    }
  }, [navigate])

  const handleUserInfoChange = (e) => {
    const { name, value } = e.target
    setUserInfo(prev => ({ ...prev, [name]: value }))
  }

  const active = FACE_DIRECTIONS[activeIdx]

  const progress = useMemo(() => {
    const total = FACE_DIRECTIONS.length
    const done = FACE_DIRECTIONS.filter((d) => !!shots[d.key]).length
    return { total, done }
  }, [shots])

  const progressPct = useMemo(() => Math.round((progress.done / progress.total) * 100), [progress])

  const isAllCaptured = progress.done === progress.total
  const isFormValid = userInfo.name && userInfo.department && userInfo.position

  const setActiveShot = (dataUrl) => setShots((prev) => ({ ...prev, [active.key]: dataUrl }))
  const clearActiveShot = () => setShots((prev) => ({ ...prev, [active.key]: '' }))

  const resetAll = () => {
    setActiveIdx(0)
    setShots({ front: '', left: '', right: '', up: '', down: '' })
    setUserInfo({ name: '', department: '', position: '' }) 
  }

  const goPrev = () => setActiveIdx((i) => Math.max(0, i - 1))
  const goNext = () => setActiveIdx((i) => Math.min(FACE_DIRECTIONS.length - 1, i + 1))

  // 2. 함수명 선언 추가 (const dataURLtoFile =)
  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) { u8arr[n] = bstr.charCodeAt(n) }
    return new File([u8arr], filename, { type: mime })
  }

  // Step status helper
  const stepStatus = (idx) => {
    const key = FACE_DIRECTIONS[idx].key
    if (shots[key]) return 'done' 
    if (idx === activeIdx) return 'active'
    return 'pending'
  }

  // 3. 함수명 선언 추가 (const syncFaceDatabase =)
  // Sync face database after registration
  const syncFaceDatabase = async (token) => {
    try {
      const response = await fetch('/api/face/database/save', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.ok;
    } catch (error) {
      console.error("Database sync error:", error);
      return false;
    }
  }

  // 4. 함수명 선언 추가 (const submit =)
  const submit = async () => {
    if (!isFormValid) return alert("Please fill in Name, Department and Position.")
    
    const token = localStorage.getItem('authToken')
    if (!token) return navigate('/login')

    setIsSubmitting(true)

    try {
      const queryParams = new URLSearchParams({
        name: userInfo.name,
        department: userInfo.department,
        position: userInfo.position,
        model: 'magface',
      }).toString()

      const formData = new FormData()
      
      for (const direction of FACE_DIRECTIONS) {
        const dataUrl = shots[direction.key]
        if (!dataUrl) throw new Error(`${direction.label} is missing.`)
        
        const fileName = `${userInfo.name.replace(/\s+/g, '_')}_${direction.key}.jpg`
        const originalFile = dataURLtoFile(dataUrl, fileName)
        formData.append(direction.key, originalFile)
      }

      const response = await fetch(`/api/employees?${queryParams}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })

      if (response.ok) {
        await syncFaceDatabase(token); // Sync after success
        alert(`✅ Registration and Sync Successful!`);
      } else {
        const errorText = await response.text()
        alert(`❌ Error: ${errorText}`)
      }
    } catch (error) {
      alert(`Error: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Primary button text/style
  const primaryOnClick = () => {
    if (isSubmitting) return
    if (isAllCaptured) submit()
    else goNext()
  }

  const primaryLabel = isSubmitting ? 'Syncing DB...' : (isAllCaptured ? 'Submit Registration' : 'Save & Next')
  const primaryIcon = isSubmitting ? 'hourglass_empty' : (isAllCaptured ? 'send' : 'check')

  const primaryClass = (isAllCaptured && isFormValid)
    ? `flex items-center justify-center gap-2 px-8 h-12 rounded-full bg-blue-600 text-white font-bold text-sm shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all duration-300 w-full sm:w-auto min-w-[220px] ring-4 ring-blue-100 scale-[1.02] ${isSubmitting ? 'opacity-80 cursor-wait' : ''}`
    : `flex items-center justify-center gap-2 px-8 h-12 rounded-full bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors w-full sm:w-auto min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed`

  return (
    <div className="bg-slate-50 text-slate-900 font-[--font-display] min-h-screen flex flex-col overflow-x-hidden">
      <AppHeader title="Face Registration" subtitle="Register a new staff member." icon="badge" showBack showReset onReset={resetAll} />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
        <div className="w-full bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold">Registration Progress</p>
            <p className="text-blue-600 text-sm font-bold">{progress.done} / {progress.total} Completed</p>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      <div className="flex h-full grow flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <span className="material-symbols-outlined text-blue-600">person_add</span>
            <h2 className="text-lg font-bold">New Employee Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Employee Name *</label>
              <input type="text" name="name" value={userInfo.name} onChange={handleUserInfoChange} placeholder="Enter name" className="w-full h-11 px-3 mt-1 rounded-lg border border-slate-200 bg-white text-slate-900 font-bold outline-none focus:ring-2 focus:ring-blue-100" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Department *</label>
              <input type="text" name="department" value={userInfo.department} onChange={handleUserInfoChange} placeholder="Ex: IT" className="w-full h-11 px-3 mt-1 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-100 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Position *</label>
              <input type="text" name="position" value={userInfo.position} onChange={handleUserInfoChange} placeholder="Ex: Dev" className="w-full h-11 px-3 mt-1 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-100 outline-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start h-full">
          <div className="lg:col-span-3 lg:sticky lg:top-6 bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col gap-4">
            <h2 className="text-base font-bold text-slate-900">Face Capture</h2>
            <div className="flex flex-col gap-2">
                {FACE_DIRECTIONS.map((d, idx) => {
                  const status = stepStatus(idx)
                  return (
                    <button key={d.key} onClick={() => setActiveIdx(idx)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${status === 'active' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'}`}>
                        <span className={`material-symbols-outlined ${status === 'done' ? 'text-green-500' : status === 'active' ? 'text-blue-600 animate-pulse' : 'text-slate-400'}`}>
                            {status === 'done' ? 'check_circle' : 'radio_button_checked'}
                        </span>
                        <span className={`text-sm ${status === 'active' ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>{d.label}</span>
                    </button>
                  )
                })}
            </div>
          </div>

          <div className="lg:col-span-9 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="flex border-b px-6 pt-2">
              <button onClick={() => setTab('camera')} className={`px-4 py-3 border-b-4 ${tab === 'camera' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500'}`}>Camera</button>
              <button onClick={() => setTab('upload')} className={`px-4 py-3 border-b-4 ${tab === 'upload' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500'}`}>Upload</button>
            </div>
            <div className="p-6 flex flex-col items-center gap-6">
                <div className="relative w-full max-w-2xl aspect-video bg-slate-900 rounded-lg overflow-hidden border border-slate-200">
                    {!shots[active.key] ? (
                        tab === 'camera' ? <CameraInput onCapture={setActiveShot} /> : <div className="h-full bg-white"><ImageUpload variant="frame" onSelect={setActiveShot} /></div>
                    ) : (
                        <div className="relative h-full"><img src={shots[active.key]} className="w-full h-full object-cover" /><div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span>Saved</div></div>
                    )}
                </div>
                <div className="text-center">
                    <h4 className="font-bold">{active.label}</h4>
                    <p className="text-sm text-slate-500 mt-1">{active.hint}</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={clearActiveShot} disabled={!shots[active.key]} className="px-6 h-12 rounded-full border border-slate-200 font-bold disabled:opacity-50">Reset</button>
                  <button onClick={primaryOnClick} disabled={isSubmitting || (!isAllCaptured && !shots[active.key])} className={primaryClass}>
                      <span className="material-symbols-outlined">{primaryIcon}</span> {primaryLabel}
                  </button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}