import { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import AppHeader from '../components/AppHeader.jsx'
// [수정됨] resetAIEngine 추가 import
import { initAIEngine, runAIAnalysis, resetAIEngine } from '../lib/aiEngine.js'

// ==============================================================================
// 0. INTERNAL COMPONENTS (Camera & Upload Implementation)
// ==============================================================================

function InternalCamera({ onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isActive, setIsActive] = useState(false);

  // 1. Request camera permission and get stream
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, 
        audio: false 
      });
      
      streamRef.current = stream; 
      setIsActive(true);          
    } catch (err) {
      console.error("Camera Error:", err);
      alert("Please allow camera access.");
    }
  };

  // 2. Sync display timing
  useEffect(() => {
    if (isActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(e => console.error("Video Play Error:", e));
    }
  }, [isActive]);

  // 3. Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const handleCapture = () => {
    if (!videoRef.current || !isActive) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    // Capture with horizontal flip
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(videoRef.current, 0, 0);
    
    const dataUrl = canvas.toDataURL('image/jpeg');
    onCapture(dataUrl);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden">
      {isActive ? (
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted
          className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" 
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
          <span className="material-symbols-outlined text-6xl mb-2">videocam_off</span>
          <p className="text-sm font-bold uppercase tracking-widest">Camera Disabled</p>
        </div>
      )}

      <div className="absolute bottom-6 z-20 flex items-center gap-6">
        <button
          onClick={isActive ? stopCamera : startCamera}
          className={`px-6 py-3 rounded-full font-bold text-sm shadow-lg transition-all flex items-center gap-2 ${
            isActive 
              ? "bg-slate-800/80 text-white hover:bg-slate-700 backdrop-blur-md border border-slate-600" 
              : "bg-blue-600 text-white hover:bg-blue-700 border border-blue-500"
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {isActive ? 'videocam_off' : 'videocam'}
          </span>
          {isActive ? 'Turn Off' : 'Enable Camera'}
        </button>

        {isActive && (
          <button 
            onClick={handleCapture}
            className="w-16 h-16 rounded-full bg-white border-4 border-slate-200 shadow-xl active:scale-95 transition-transform flex items-center justify-center ring-4 ring-black/20"
          >
            <div className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 transition-colors"></div>
          </button>
        )}
      </div>
    </div>
  );
}

// Internal: upload component
function InternalUpload({ onSelect }) {
  const fileInputRef = useRef(null);

  const handleTrigger = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      onSelect(event.target.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer" onClick={handleTrigger}>
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        className="hidden" 
        onChange={handleFileChange} 
      />
      <div className="text-center p-6">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-3xl">cloud_upload</span>
        </div>
        <p className="text-slate-900 font-bold text-lg">Click to Upload Image</p>
        <p className="text-slate-500 text-sm mt-1">Supports JPG, PNG</p>
      </div>
    </div>
  );
}

// ==============================================================================
// 1. CONSTANTS & STATUS
// ==============================================================================

const AnalysisStatus = Object.freeze({
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  IDENTIFYING: 'identifying', 
})

// ==============================================================================
// 2. HELPER FUNCTIONS & TRANSFORMER
// ==============================================================================

function clearCanvas(canvas) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  ctx?.clearRect(0, 0, canvas.width, canvas.height)
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('IMAGE_LOAD_FAILED'))
    img.src = src
  })
}

function cleanForUI(text) {
  if (!text || typeof text !== 'string') return text;
  return text.replace(/\s?\((true|false)\)/gi, '').trim();
}

// AI 결과를 백엔드 전송 포맷으로 변환합니다.
function transformToBackend(aiResult, employeeId) {
  const rawAngles = aiResult.angles || {};
  const rawClothing = aiResult.clothing || {};
  
  const angles = {
    head_deviation: rawAngles.head_deviation ?? 0,
    shoulder_tilt: rawAngles.shoulder_tilt ?? 0,
    forward_head_z: rawAngles.forward_head_z ?? 0,
    back_deviation: rawAngles.back_deviation ?? 0,
    maxArmAngle: rawAngles.maxArmAngle ?? 0,
    maxLegAngle: rawAngles.maxLegAngle ?? 0
  };

  const cleanValue = (val, allowedPrefixes) => {
      if (!val) return "unknown";
      if (allowedPrefixes) {
        for (const prefix of allowedPrefixes) {
            if (val.toLowerCase().includes(prefix.toLowerCase())) return prefix;
        }
      }
      return val.trim(); 
  };

  const clothing = {
    top: cleanValue(rawClothing.top, ["formal shirt", "t-shirt", "casual shirt", "shirt"]), 
    bottom: cleanValue(rawClothing.bottom, ["trousers", "jeans", "shorts"]),
    foot: cleanValue(rawClothing.foot, ["leather shoes", "sneakers", "sandals", "shoes"]),
    head: cleanValue(rawClothing.head),
    accessory: cleanValue(rawClothing.accessory),
    
    top_color: rawClothing.top_color || "N/A",
    bottom_color: rawClothing.bottom_color || "N/A",

    topState: rawClothing.topState || "Unknown (false)",
    bottomState: rawClothing.bottomState || "Unknown (false)",
    topCondition: rawClothing.topCondition || "Unknown (false)",
    headState: rawClothing.headState || "Unknown (false)",
    footCheck: rawClothing.footCheck || "Pass (true)",
    sleeveCheck: rawClothing.sleeveCheck || "Pass (true)"
  };

  const is_full_body = (aiResult.is_full_body === 'Yes' || aiResult.is_full_body === true);

  return {
    employeeId: String(employeeId), 
    is_full_body: is_full_body, 
    angles: angles,   
    clothing: clothing,
    score: 0, 
    pass: false // 🆕 [수정됨] 백엔드 규격(pass)에 맞춰 기본값 설정
  };
}

// ==============================================================================
// 3. UI COMPONENTS
// ==============================================================================

function GuidanceCard({ result }) {
  if (!result) {
    return (
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm min-h-[80px] flex items-center justify-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ready to Analyze</p>
      </div>
    )
  }

  if (!result.angles || !result.clothing) {
    return (
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm min-h-[80px] flex items-center justify-center">
        <p className="text-[10px] font-bold text-slate-400 animate-pulse uppercase tracking-widest">Processing Data...</p>
      </div>
    )
  }

  const issues = [];
  const { angles, clothing } = result;

  // Posture Checks
  if (angles.head_deviation > 20) issues.push({ type: 'error', msg: 'Severe Head Tilt (>20°)' });
  else if (angles.head_deviation > 10) issues.push({ type: 'warn', msg: 'Slight Head Tilt (10-20°)' });

  if (angles.forward_head_z > 2.3) issues.push({ type: 'error', msg: 'Severe Forward Head' });
  else if (angles.forward_head_z > 2.2) issues.push({ type: 'warn', msg: 'Slight Forward Head' });

  if (angles.shoulder_tilt > 10) issues.push({ type: 'error', msg: 'Shoulder Slump (>10°)' });
  else if (angles.shoulder_tilt > 3) issues.push({ type: 'warn', msg: 'Uneven Shoulders' });

  if (angles.back_deviation > 40) issues.push({ type: 'error', msg: 'Hunchback Detected' });
  else if (angles.back_deviation > 20) issues.push({ type: 'warn', msg: 'Slight Slouch' });

  if (angles.maxArmAngle > 30) issues.push({ type: 'error', msg: 'Arms Crossed/Bent' });
  else if (angles.maxArmAngle > 10) issues.push({ type: 'warn', msg: 'Arms Not Straight' });

  if (angles.maxLegAngle > 80) issues.push({ type: 'error', msg: 'Leg Raised / Sitting' });
  else if (angles.maxLegAngle > 60) issues.push({ type: 'warn', msg: 'Knees Bent' });

  // Clothing Checks
  if (clothing.topState?.includes('(false)')) issues.push({ type: 'warn', msg: cleanForUI(clothing.topState) });
  if (clothing.bottomState?.includes('(false)')) issues.push({ type: 'error', msg: cleanForUI(clothing.bottomState) });
  if (clothing.topCondition?.includes('(false)')) issues.push({ type: 'warn', msg: cleanForUI(clothing.topCondition) });
  
  if (clothing.footCheck?.includes('(false)')) issues.push({ type: 'error', msg: 'Footwear Mismatch' });
  if (clothing.sleeveCheck?.includes('(false)')) issues.push({ type: 'warn', msg: 'Uneven Sleeves' });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-3">
      <div className="p-3 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Analysis Report</h3>
      </div>
      {/* Internal Scroll for Layout Stability */}
      <div className="p-3 max-h-24 overflow-y-auto custom-scrollbar">
        {issues.length === 0 ? (
          <div className="flex items-center gap-2 text-green-600 bg-green-50/50 p-3 rounded-xl border border-green-100">
              <span className="material-symbols-outlined font-variation-fill text-lg">check_circle</span>
              <span className="font-bold text-[10px]">Compliance Checks Passed</span>
          </div>
        ) : (
          <div className="space-y-2">
            {issues.map((issue, idx) => (
              <div key={idx} className={`flex items-center gap-2 p-2 rounded-lg border ${issue.type === 'error' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                <span className="material-symbols-outlined font-variation-fill text-base">{issue.type === 'error' ? 'error' : 'warning'}</span>
                <span className="font-bold text-[10px]">{issue.msg}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function OutfitDetailCard({ clothing }) {
  if (!clothing) return null;

  const topColor = clothing.top_color;
  const bottomColor = clothing.bottom_color;

  const ColorCircle = ({ color }) => {
    if (!color || color === 'N/A' || color === 'unknown') return null;
    return <span className="w-4 h-4 rounded-full border border-slate-200 shadow-sm shrink-0" style={{ backgroundColor: color.toLowerCase() }} title={color}></span>;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Detected Outfit</h3>
      </div>
      
      <div className="p-3 space-y-3">
        {/* Head & Accessory */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
              <p className="text-[23px] text-slate-500 font-bold uppercase mb-0.5">Head</p>
              <p className="text-[18px] font-bold text-slate-900 capitalize truncate">{cleanForUI(clothing.head) || 'None'}</p>
              <p className="text-[18px] text-slate-600 truncate mt-0.5">{cleanForUI(clothing.headState)}</p>
          </div>
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
              <p className="text-[23px] text-slate-500 font-bold uppercase mb-0.5">Accessory</p>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-lg text-blue-500">
                  {clothing.accessory?.includes('id') ? 'badge' : clothing.accessory?.includes('tie') ? 'checkroom' : 'remove'}
                </span>
                <p className="text-[18px] font-bold text-slate-900 capitalize truncate">{cleanForUI(clothing.accessory) || 'None'}</p>
              </div>
          </div>
        </div>

        {/* Top */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <p className="text-[23px] text-slate-500 font-bold uppercase mb-0.5">Top</p>
                    <p className="text-[18px] font-bold text-slate-900 capitalize">{cleanForUI(clothing.top) || 'Unknown'}</p>
                </div>
                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200">
                    <p className="text-[18px] font-bold text-slate-700 capitalize leading-none">{topColor || '-'}</p>
                    <ColorCircle color={topColor} />
                </div>
            </div>
            <div className="space-y-1">
               <div className="flex items-center gap-1.5">
                 <span className={`w-1.5 h-1.5 rounded-full ${clothing.topState?.includes('(false)') ? 'bg-amber-400' : 'bg-green-400'}`}></span>
                 <p className="text-[18px] text-slate-700 font-medium">{cleanForUI(clothing.topState) || '-'}</p>
               </div>
               <div className="flex items-center gap-1.5">
                 <span className={`w-1.5 h-1.5 rounded-full ${clothing.topCondition?.includes('(false)') ? 'bg-red-400' : 'bg-green-400'}`}></span>
                 <p className="text-[18px] text-slate-700 font-medium truncate" title={clothing.topCondition}>{cleanForUI(clothing.topCondition) || '-'}</p>
               </div>
            </div>
        </div>

        {/* Bottom */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <p className="text-[23px] text-slate-500 font-bold uppercase mb-0.5">Bottom</p>
                    <p className="text-[18px] font-bold text-slate-900 capitalize">{cleanForUI(clothing.bottom) || 'Unknown'}</p>
                </div>
                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200">
                    <p className="text-[18px] font-bold text-slate-700 capitalize leading-none">{bottomColor || '-'}</p>
                    <ColorCircle color={bottomColor} />
                </div>
            </div>
             <div className="flex items-center gap-1.5">
                 <span className={`w-1.5 h-1.5 rounded-full ${clothing.bottomState?.includes('(false)') ? 'bg-red-400' : 'bg-green-400'}`}></span>
                 <p className="text-[18px] text-slate-700 font-medium">{cleanForUI(clothing.bottomState) || '-'}</p>
             </div>
        </div>

        {/* Footwear */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
            <div>
               <p className="text-[23px] text-slate-500 font-bold uppercase mb-0.5">Footwear</p>
               <p className="text-[18px] font-bold text-slate-900 capitalize">{cleanForUI(clothing.foot) || 'None'}</p>
            </div>
            {clothing.footCheck?.includes('(false)') && (
               <div className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-[9px] font-bold uppercase">
                  Mismatch
               </div>
            )}
        </div>

      </div>
    </div>
  )
}

function ScoreCard({ result, status }) {
    if (status === AnalysisStatus.LOADING) {
        return (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center min-h-[80px]">
                <div className="flex flex-col items-center gap-2">
                   <div className="w-5 h-5 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Calculating...</p>
                </div>
            </div>
        )
    }

    if (status !== AnalysisStatus.SUCCESS) {
         return (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center min-h-[80px]">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ready to Analyze</p>
            </div>
        )
    }

    if (status === AnalysisStatus.SUCCESS && (!result || result.score === undefined)) {
         return (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center min-h-[80px]">
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Score Error</p>
            </div>
        )
    }

    const score = result.score;
    // 🛠️ [수정됨] 점수 비교 로직 제거 -> 백엔드의 'pass' 값만 신뢰
    const isPass = result.pass === true; 

    let badgeClass = isPass ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";
    let statusText = isPass ? "PASS" : "FAIL";

    return (
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col transition-all animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center w-full">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Score</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{Math.round(score)}</p>
            </div>
            <div className={`px-3 py-1 rounded-full font-black text-[10px] ${badgeClass}`}>
              {statusText}
            </div>
        </div>
      </div>
    )
}

function FullBodyOverlay({ isFullBody }) {
  if (isFullBody !== false) return null; 
  
  return (
    <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-300">
      <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4 animate-bounce shadow-lg shadow-red-500/30">
        <span className="material-symbols-outlined text-3xl text-white">accessibility_new</span>
      </div>
      <h2 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Full Body Not Detected</h2>
      <p className="text-slate-300 text-xs max-w-xs font-medium mx-auto leading-relaxed">
        Please step back until your <span className="text-white font-bold underline decoration-red-500">Head</span> and <span className="text-white font-bold underline decoration-red-500">Feet</span> are fully visible.
      </p>
    </div>
  )
}

function ModeButton({ mode, currentMode, icon, label, disabled, onClick }) {
    const isActive = mode === currentMode
    return (
      <button type="button" onClick={() => onClick(mode)} disabled={disabled} className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border transition-all ${isActive ? 'bg-white border-blue-600 text-blue-600 ring-2 ring-blue-100 font-bold' : 'bg-slate-50 border-transparent text-slate-500 hover:bg-white hover:border-slate-200'} ${disabled ? 'opacity-50' : ''}`}>
        <span className="material-symbols-outlined text-2xl font-variation-fill">{icon}</span>
        <span className="text-[10px]">{label}</span>
      </button>
    )
}

function ProfileCard({ user, isIdentifying }) {
    return (
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm transition-all duration-300">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Profile</p>
        {user ? (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 ring-4 ring-blue-50 font-variation-fill">
                <span className="material-symbols-outlined text-xl">person</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 leading-tight">{user.name}</h3>
              <p className="text-[15px] text-blue-600 font-bold uppercase mt-0.5">{user.department} / {user.position}</p>
              <p className="text-[15px] text-slate-400 font-mono mt-0.5">ID: {user.employeeId || user.id}</p>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center border-2 border-dashed border-slate-100 rounded-xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                {isIdentifying ? 'Searching DB...' : 'Identity Required'}
            </p>
          </div>
        )}
      </div>
    )
}

function LeftPanelLoader() {
    return (
      <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl border border-slate-200 m-1">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
        <p className="text-[10px] font-black text-slate-600 animate-pulse tracking-widest uppercase">AI Initializing</p>
      </div>
    )
}

// ==============================================================================
// 4. CUSTOM HOOKS
// ==============================================================================

function useAIEngine() {
    const [isAiReady, setIsAiReady] = useState(false)
    useEffect(() => { initAIEngine().then(success => success && setIsAiReady(true)) }, [])
    return { isAiReady }
}
  
function useImageSelection() {
    const [selectedImage, setSelectedImage] = useState('')
    const selectImage = useCallback((url) => setSelectedImage(url), [])
    const clearImage = useCallback(() => setSelectedImage(''), [])
    return { selectedImage, selectImage, clearImage }
}
  
function useAnalysisState() {
    const [status, setStatus] = useState(AnalysisStatus.IDLE)
    const [result, setResult] = useState(null) 
    const [serverResult, setServerResult] = useState(null) 
    const [identifiedUser, setIdentifiedUser] = useState(null) 
  
    const reset = useCallback(() => {
      setStatus(AnalysisStatus.IDLE); setResult(null); setServerResult(null); setIdentifiedUser(null);
    }, [])
  
    return { status, setStatus, result, setResult, serverResult, setServerResult, identifiedUser, setIdentifiedUser, reset }
}

// ==============================================================================
// 5. MAIN COMPONENT
// ==============================================================================

// 평가 화면: 사용자 식별, AI 분석, 결과 표시를 통합합니다.
// 4. 컴포넌트 선언 추가 (EvaluationPage)
export default function EvaluationPage() {
  const { isAiReady } = useAIEngine()
  const { selectedImage, selectImage, clearImage } = useImageSelection()
  const analysis = useAnalysisState()

  const [mode, setMode] = useState('camera')
  const previewCanvasRef = useRef(null)

  // 선택된 이미지로 얼굴 인식을 수행해 사용자를 식별합니다.
  const handleIdentify = async () => {
    if (!selectedImage) return
    analysis.setStatus(AnalysisStatus.IDENTIFYING)
    
    const token = localStorage.getItem('authToken')
    
    try {
      const resBlob = await fetch(selectedImage)
      const blob = await resBlob.blob()
      const imageFile = new File([blob], "front.jpg", { type: "image/jpeg" })

      const formData = new FormData()
      formData.append('file', imageFile) 

      const recRes = await fetch('/api/face/recognize?model=magface&threshold=0.30', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })

      if (recRes.ok) {
        const recData = await recRes.json()
        const score = recData.details?.similarity ?? recData.confidence ?? 0
        const recognizedName = recData.recognizedName || recData.details?.name 

        if (!recognizedName || recognizedName === "Unknown" || score < 0.30) {
          alert(`❌ Recognition Failed (Score: ${score.toFixed(2)})`)
          analysis.setStatus(AnalysisStatus.IDLE)
          return
        }

        console.log(`🤖 AI Recognized Raw: "${recognizedName}"`);

        let foundEmployee = null;

        try {
            const idRes = await fetch(`/api/employees/${recognizedName}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (idRes.ok) {
                const data = await idRes.json();
                const result = Array.isArray(data) ? data[0] : data;
                if (result) foundEmployee = result;
            }
        } catch (err) { console.log("ID fetch failed, trying name search..."); }

        if (!foundEmployee) {
            const cleanName = recognizedName.replace(/[0-9]/g, '').trim(); 
            const searchRes = await fetch(`/api/employees/search?name=${cleanName}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (searchRes.ok) {
                const searchData = await searchRes.json();
                if (Array.isArray(searchData) && searchData.length > 0) {
                    foundEmployee = searchData[0];
                }
            }
        }

        if (foundEmployee) {
            analysis.setIdentifiedUser(foundEmployee)
            analysis.setStatus(AnalysisStatus.IDLE)
            alert(`✅ Verified: ${foundEmployee.name}`)
        } else {
            console.error(`❌ Mismatch! AI said "${recognizedName}" but no user found in DB.`);
            alert(`❌ User Not Found (AI: ${recognizedName})`)
            analysis.setStatus(AnalysisStatus.IDLE)
        }

      } else {
        alert("❌ Recognition Engine Error")
        analysis.setStatus(AnalysisStatus.IDLE)
      }
    } catch (e) {
      console.error(e); 
      analysis.setStatus(AnalysisStatus.ERROR)
    }
  }

  // AI 분석을 실행하고 결과를 서버로 전송합니다.
  const handleAnalyze = async () => {
    if (!analysis.identifiedUser || !selectedImage) return
    analysis.setStatus(AnalysisStatus.LOADING)
    
    const canvas = previewCanvasRef.current
    const token = localStorage.getItem('authToken')

    try {
      const img = await loadImage(selectedImage)
      canvas.width = img.width
      canvas.height = img.height
      const aiRaw = await runAIAnalysis(img, canvas)
      
      if (!aiRaw.ok) throw new Error(aiRaw.error)
      
      const empId = analysis.identifiedUser.employeeId || analysis.identifiedUser.id;
      
      const uiPayload = transformToBackend(aiRaw, empId)
      
      analysis.setResult(uiPayload) 

      console.log("🚀 [Frontend] Sending to Backend:", uiPayload);

      const serverPayload = JSON.parse(JSON.stringify(uiPayload));
      if (!serverPayload.clothing.head || serverPayload.clothing.head === 'unknown' || serverPayload.clothing.head === 'no hat') {
          // Placeholder for spoofing if needed
      }

      console.log("🚀 [Frontend] Sending to Backend (Spoofed):", serverPayload);

      const res = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(serverPayload)
      })

      if (res.ok) {
        const data = await res.json()
        console.log("✅ [Backend] Received Score:", data);
        analysis.setServerResult(data) 
        analysis.setStatus(AnalysisStatus.SUCCESS)
      } else {
        const err = await res.text()
        console.error("Server Error Details:", err);
        alert(`❌ Submission Failed: ${err}`)
        analysis.setStatus(AnalysisStatus.IDLE)
      }
    } catch (e) { console.error(e); analysis.setStatus(AnalysisStatus.ERROR) }
  }

  // [수정됨] Reset 시 AI Engine도 함께 리셋
  const clearAll = useCallback(() => {
    clearImage(); 
    analysis.reset(); 
    clearCanvas(previewCanvasRef.current);
    
    // AI 메모리(트래킹) 삭제
    resetAIEngine(); 
    
  }, [clearImage, analysis])

  return (
    <div className="bg-slate-50 text-slate-900 font-[--font-display] h-screen overflow-hidden flex flex-col antialiased">
      <AppHeader title="Grooming Assessment" subtitle="Automated Posture & Attire Analysis" icon="accessibility_new" showBack showReset onReset={clearAll} />

      <main className="flex-1 overflow-hidden p-4">
        <div className="max-w-[1920px] mx-auto h-full grid grid-cols-12 gap-4">
          
          {/* LEFT: Controls */}
          <div className="col-span-3 h-full relative">
            {!isAiReady && <LeftPanelLoader />}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-6 shadow-sm h-full overflow-y-auto">
              <h2 className="text-lg font-bold flex items-center gap-2"><span className="material-symbols-outlined text-blue-600 font-variation-fill">tune</span> System Controls</h2>
              
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Input Selection</label>
                <div className="grid grid-cols-2 gap-2">
                  <ModeButton mode="camera" currentMode={mode} icon="photo_camera" label="Camera" disabled={!isAiReady} onClick={(m) => { clearAll(); setMode(m); }} />
                  <ModeButton mode="upload" currentMode={mode} icon="upload_file" label="Upload" disabled={!isAiReady} onClick={(m) => { clearAll(); setMode(m); }} />
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-auto pt-6 border-t border-slate-100">
                {!analysis.identifiedUser ? (
                  <button onClick={handleIdentify} disabled={!selectedImage || analysis.status === AnalysisStatus.IDENTIFYING} className="w-full h-14 rounded-2xl bg-indigo-600 text-white font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3 active:scale-95">
                    <span className="material-symbols-outlined font-variation-fill">face</span>
                    {analysis.status === AnalysisStatus.IDENTIFYING ? 'Identifying...' : 'Identify Staff'}
                  </button>
                ) : (
                  <button onClick={handleAnalyze} disabled={!selectedImage || analysis.status === AnalysisStatus.LOADING || analysis.status === AnalysisStatus.SUCCESS} className="w-full h-14 rounded-2xl bg-blue-600 text-white font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3 active:scale-95">
                    <span className="material-symbols-outlined font-variation-fill">analytics</span>
                    {analysis.status === AnalysisStatus.LOADING ? 'Analyzing...' : 'Run Analysis'}
                  </button>
                )}
                <button onClick={clearAll} className="w-full h-11 rounded-xl border border-slate-200 text-slate-500 font-bold text-xs uppercase hover:bg-slate-50 transition-all tracking-tight">Clear Capture</button>
              </div>
            </div>
          </div>

          {/* CENTER: Viewport */}
          <div className="col-span-5 relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 shadow-inner group">
            {mode === 'camera' && !selectedImage ? (
              <InternalCamera onCapture={selectImage} />
            ) : selectedImage ? (
              <div className="relative w-full h-full flex items-center justify-center p-2">
                <img src={selectedImage} className="w-full h-full object-contain rounded-lg shadow-2xl" alt="Subject" />
                <canvas ref={previewCanvasRef} className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
              </div>
            ) : (
              <InternalUpload onSelect={selectImage} />
            )}
            
            {(analysis.status === AnalysisStatus.LOADING || analysis.status === AnalysisStatus.IDENTIFYING) && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-50 transition-all">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" />
                <p className="text-white text-xs font-black tracking-[0.3em] uppercase animate-pulse">Processing</p>
              </div>
            )}
            <FullBodyOverlay isFullBody={analysis.result?.is_full_body} />
          </div>

          {/* RIGHT: Results */}
          <div className="col-span-4 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex items-center gap-2 mb-1">
                 <span className="material-symbols-outlined text-blue-600 font-variation-fill text-2xl">bar_chart</span>
                 <h2 className="text-xl font-bold text-slate-900">Results</h2>
            </div>
            <ProfileCard user={analysis.identifiedUser} isIdentifying={analysis.status === AnalysisStatus.IDENTIFYING} />
            <ScoreCard result={analysis.serverResult || analysis.result} status={analysis.status} />
            {/* GuidanceCard 내부 스크롤 적용 */}
            <GuidanceCard result={analysis.result} />
            <OutfitDetailCard clothing={analysis.result?.clothing} />
          </div>
        </div>
      </main>
    </div>
  )
}