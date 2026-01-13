import { useMemo, useState } from 'react'
import CameraInput from '../components/CameraInput.jsx'
import ImageUpload from '../components/ImageUpload.jsx'
import AppHeader from '../components/AppHeader.jsx'

export default function AssessmentPage() {
  // Input mode and selection state.
  const [mode, setMode] = useState('camera') // 'upload' | 'camera'
  const [selectedImage, setSelectedImage] = useState('')
  const [selectedName, setSelectedName] = useState('')
  const [hasAnalyzed, setHasAnalyzed] = useState(false)
  const [inputResetKey, setInputResetKey] = useState(0)

  //  AI result (for right panel UI)
  const [aiResult, setAiResult] = useState(null)

  // Force remount of input components to clear internal state.
  const resetInputs = () => setInputResetKey((k) => k + 1)

  // Clear everything back to the initial state.
  const clearAll = () => {
    setSelectedImage('')
    setSelectedName('')
    setHasAnalyzed(false)
    setAiResult(null)
    resetInputs()
  }

  const onSelectImage = (dataUrl, meta) => {
    setSelectedImage(dataUrl)
    setHasAnalyzed(false)
    setAiResult(null)
    setSelectedName(meta?.fileName || meta?.name || '')
  }

  // Badge state for the preview.
  const readyBadge = useMemo(() => {
    if (!selectedImage) return { label: 'No Image', dot: 'bg-slate-400' }
    return { label: 'Image Ready', dot: 'bg-green-500' }
  }, [selectedImage])

  //  Extract issues (warn/error) for quick summary
  const issues = useMemo(() => {
    if (!aiResult?.postureLines) return []
    return aiResult.postureLines.filter((x) => x.level !== 'ok')
  }, [aiResult])

  //  Analysis action (UI demo stub - replace with real AI result later)
  const analyze = () => {
    if (!selectedImage) {
      alert('Please upload an image or capture a snapshot first.')
      return
    }

    setHasAnalyzed(true)

  }

  const selectMode = (nextMode) => {
    setMode(nextMode)
    setHasAnalyzed(false)
    setAiResult(null)
  }

  const passLabel = useMemo(() => {
    if (!aiResult) return { text: 'IDLE', cls: 'bg-slate-100 text-slate-500' }
    const s = Number(aiResult.stabilityScore ?? 0)
    if (s >= 80) return { text: 'PASS', cls: 'bg-green-100 text-green-700' }
    if (s >= 60) return { text: 'CHECK', cls: 'bg-amber-100 text-amber-700' }
    return { text: 'FAIL', cls: 'bg-red-100 text-red-700' }
  }, [aiResult])

  return (
    <div className="bg-[--color-background-light] text-[--color-text-main] font-[--font-display] antialiased min-h-screen flex flex-col">
      <AppHeader
        title="Grooming Assessment"
        subtitle="Upload an image or capture a snapshot for posture and grooming analysis."
        icon="accessibility_new"
        showBack
        showReset
        onReset={clearAll}
      />

      <main className="flex-grow w-full">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Mode cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => selectMode('camera')}
                  className={
                    mode === 'camera'
                      ? 'group relative cursor-pointer rounded-xl border-2 border-[--color-primary] bg-[color:rgba(19,109,236,0.05)] p-4 transition-all hover:shadow-md text-left'
                      : 'group relative cursor-pointer rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-[color:rgba(19,109,236,0.50)] hover:shadow-md text-left'
                  }
                >
                  {mode === 'camera' && (
                    <div className="absolute top-3 right-3">
                      <span className="material-symbols-outlined text-[--color-primary]">check_circle</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <div
                      className={
                        mode === 'camera'
                          ? 'flex h-12 w-12 items-center justify-center rounded-full bg-[color:rgba(19,109,236,0.10)] text-[--color-primary]'
                          : 'flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700 group-hover:bg-[color:rgba(19,109,236,0.10)] group-hover:text-[--color-primary] transition-colors'
                      }
                    >
                      <span className="material-symbols-outlined text-2xl">photo_camera</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">Camera Snapshot</h3>
                      <p className="text-xs text-[--color-text-muted]">Use webcam</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => selectMode('upload')}
                  className={
                    mode === 'upload'
                      ? 'group relative cursor-pointer rounded-xl border-2 border-[--color-primary] bg-[color:rgba(19,109,236,0.05)] p-4 transition-all hover:shadow-md text-left'
                      : 'group cursor-pointer rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-[color:rgba(19,109,236,0.50)] hover:shadow-md text-left'
                  }
                >
                  {mode === 'upload' && (
                    <div className="absolute top-3 right-3">
                      <span className="material-symbols-outlined text-[--color-primary]">check_circle</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <div
                      className={
                        mode === 'upload'
                          ? 'flex h-12 w-12 items-center justify-center rounded-full bg-[color:rgba(19,109,236,0.10)] text-[--color-primary]'
                          : 'flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700 group-hover:bg-[color:rgba(19,109,236,0.10)] group-hover:text-[--color-primary] transition-colors'
                      }
                    >
                      <span className="material-symbols-outlined text-2xl">upload_file</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">Image Upload</h3>
                      <p className="text-xs text-[--color-text-muted]">Select from device</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Preview card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                <div className="w-full max-w-2xl mx-auto">
                  {/* Full-body preview frame */}
                  <div className="relative w-full max-w-[720px] mx-auto aspect-[9/16] rounded-xl overflow-hidden bg-slate-100">
                    {mode === 'camera' && !selectedImage ? (
                      <CameraInput
                        key={`camera-${inputResetKey}`}
                        fullBody
                        onCapture={(dataUrl) => onSelectImage(dataUrl, { fileName: 'snapshot' })}
                      />
                    ) : selectedImage ? (
                      <img
                        src={selectedImage}
                        alt="Selected"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2 text-slate-500">
                          <span className="material-symbols-outlined text-5xl">image</span>
                          <p className="text-sm font-medium">No image selected</p>
                          <p className="text-xs">Choose upload or camera to start</p>
                        </div>
                      </div>
                    )}

                    <div className="absolute top-4 left-4 z-30">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                        <span className={`h-1.5 w-1.5 rounded-full ${readyBadge.dot}`} />
                        {readyBadge.label}
                      </span>
                    </div>
                  </div>

                  {/* Upload input area */}
                  <div className="p-4 border-t border-slate-200">
                    {mode === 'upload' ? (
                      <ImageUpload
                        key={`upload-${inputResetKey}`}
                        onSelect={(dataUrl, meta) => onSelectImage(dataUrl, meta)}
                      />
                    ) : (
                      <p className="text-xs text-slate-500">
                        Use the camera preview above to capture a snapshot.
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
                    <div className="text-sm text-[--color-text-muted]">
                      <span className="font-medium text-slate-900">File:</span>{' '}
                      {selectedImage ? (selectedName || 'snapshot') : '--'}
                    </div>

                    <div className="flex w-full sm:w-auto gap-3">
                      <button
                        type="button"
                        onClick={clearAll}
                        className="flex-1 sm:flex-none h-10 px-6 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-50 transition-colors"
                      >
                        Select Another
                      </button>

                      <button
                        type="button"
                        onClick={analyze}
                        className="flex-1 sm:flex-none h-10 px-6 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm font-semibold transition-all flex items-center justify-center gap-2 hover:bg-slate-50"
                      >
                        <span className="material-symbols-outlined text-[20px]">analytics</span>
                        Analyze Pose
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Analysis Results */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <span className="material-symbols-outlined text-[--color-text-muted]">bar_chart</span>
                <h2 className="text-lg font-bold">Analysis Results</h2>
              </div>

              <div className="flex flex-col gap-4">
                {/* Status/Info */}
                <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-[--color-primary] mt-0.5">info</span>
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        {aiResult ? 'Analysis Completed' : hasAnalyzed ? 'Analyzing...' : '--'}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        {aiResult
                          ? 'Results are shown below.'
                          : hasAnalyzed
                          ? 'Running Edge AI pipeline...'
                          : 'Click "Analyze Pose" after capturing or uploading an image.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Overall Score */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Overall Score
                      </p>
                      <p className="text-3xl font-black text-slate-900 mt-1">
                        {aiResult ? aiResult.stabilityScore : '--'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {aiResult ? 'Posture / stability summary' : 'Run analysis to calculate'}
                      </p>
                    </div>

                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${passLabel.cls}`}>
                      {passLabel.text}
                    </div>
                  </div>
                </div>

                {/* Issues Summary */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-bold text-slate-900">Detected Issues</p>

                  {!aiResult ? (
                    <div className="mt-2 text-sm text-slate-400">Run analysis to detect issues.</div>
                  ) : issues.length === 0 ? (
                    <div className="mt-2 text-sm font-semibold text-green-700">
                      No issues detected ✅
                    </div>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {issues.map((x, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span
                            className={
                              x.level === 'warn'
                                ? 'material-symbols-outlined text-amber-600'
                                : 'material-symbols-outlined text-red-600'
                            }
                          >
                            {x.level === 'warn' ? 'warning' : 'error'}
                          </span>
                          <span className="text-sm text-slate-700">{x.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Posture Checks */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">Posture Checks</p>
                    <span className="text-xs text-slate-400">
                      {aiResult ? `${aiResult.postureLines?.length || 0} items` : '--'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    {!aiResult ? (
                      <div className="text-sm text-slate-400">No results yet.</div>
                    ) : (
                      aiResult.postureLines?.map((x, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                        >
                          <span
                            className={
                              x.level === 'ok'
                                ? 'material-symbols-outlined text-green-600'
                                : x.level === 'warn'
                                ? 'material-symbols-outlined text-amber-600'
                                : 'material-symbols-outlined text-red-600'
                            }
                          >
                            {x.level === 'ok' ? 'check_circle' : x.level === 'warn' ? 'warning' : 'cancel'}
                          </span>
                          <div className="text-sm text-slate-700 leading-snug">{x.text}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Outfit */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-bold text-slate-900">Outfit</p>

                  {!aiResult?.outfit ? (
                    <div className="mt-3 text-sm text-slate-400">No outfit data.</div>
                  ) : (
                    <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Top</span>
                        <span className="font-semibold text-slate-900">{aiResult.outfit.top || '--'}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Bottom</span>
                        <span className="font-semibold text-slate-900">{aiResult.outfit.bottom || '--'}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Footwear</span>
                        <span className="font-semibold text-slate-900">{aiResult.outfit.footwear || '--'}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Headwear</span>
                        <span className="font-semibold text-slate-900">{aiResult.outfit.headwear || '--'}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Posture</span>
                    <span className="text-2xl font-black text-slate-900">
                      {aiResult ? Math.round(aiResult.stabilityScore) : hasAnalyzed ? '...' : '--'}
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Grooming</span>
                    <span className="text-2xl font-black text-slate-900">
                      {aiResult ? (aiResult.groomingScore ?? 'Pending') : hasAnalyzed ? '...' : '--'}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Footer notice */}
          <div className="mt-12 mb-6">
            <div className="mx-auto max-w-3xl rounded-lg bg-white border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                <span className="material-symbols-outlined">security</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">Privacy First Architecture</p>
                <p className="text-xs text-[--color-text-muted] mt-0.5">
                  No image is uploaded to the server. All processing is performed locally on the edge.
                  Only numeric measurements are transmitted for reporting.
                </p>
              </div>
              <div className="text-xs font-medium text-slate-400 whitespace-nowrap">Edge AI v2.4</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
