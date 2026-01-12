import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CameraInput from '../components/CameraInput.jsx'
import ImageUpload from '../components/ImageUpload.jsx'
import AppHeader from '../components/AppHeader.jsx'

export default function AssessmentPage() {
  const navigate = useNavigate()

  const [mode, setMode] = useState('camera') // 'upload' | 'camera'
  const [selectedImage, setSelectedImage] = useState('')
  const [selectedName, setSelectedName] = useState('')
  const [hasAnalyzed, setHasAnalyzed] = useState(false)
  const [inputResetKey, setInputResetKey] = useState(0)

  const resetInputs = () => setInputResetKey((k) => k + 1)

  const clearAll = () => {
    setSelectedImage('')
    setSelectedName('')
    setHasAnalyzed(false)
    resetInputs()
  }

  const onSelectImage = (dataUrl, meta) => {
    setSelectedImage(dataUrl)
    setHasAnalyzed(false)
    setSelectedName(meta?.fileName || meta?.name || '')
  }

  const readyBadge = useMemo(() => {
    if (!selectedImage) return { label: 'No Image', dot: 'bg-slate-400' }
    return { label: 'Image Ready', dot: 'bg-green-500' }
  }, [selectedImage])

  const analyze = () => {
    if (!selectedImage) {
      alert('Please upload an image or capture a snapshot first.')
      return
    }
    setHasAnalyzed(true)
    alert('Next: MediaPipe Pose + Skeleton Overlay + Score Cards (Edge AI)')
  }

  const selectMode = (nextMode) => {
    setMode(nextMode)
    setHasAnalyzed(false)
  }

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

              {/* Preview Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                <div className="w-full max-w-2xl mx-auto">
                  {/* Preview frame */}
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100">
                    {/* ??移대찓??紐⑤뱶 + ?꾩쭅 ?대?吏 ?놁쑝硫? ?꾨젅???덉뿉??諛붾줈 移대찓??*/}
                    {mode === 'camera' && !selectedImage ? (
                      <CameraInput
                        key={`camera-${inputResetKey}`}
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

                  {/* Input area (upload only) */}
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

            {/* Right */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <span className="material-symbols-outlined text-[--color-text-muted]">bar_chart</span>
                <h2 className="text-lg font-bold">Analysis Results</h2>
              </div>

              <div className="flex flex-col gap-4">
                <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-[--color-primary] mt-0.5">info</span>
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        {hasAnalyzed ? 'Pending' : '--'}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        {hasAnalyzed
                          ? 'Next: render skeleton overlay and score cards from Edge AI output.'
                          : 'Click the "Analyze Pose" button to generate skeleton visualization and score cards.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 flex flex-col items-center justify-center text-center gap-2 min-h-[200px]">
                  <div className="rounded-full bg-slate-200 p-3">
                    <span className="material-symbols-outlined text-slate-400 text-3xl">body_system</span>
                  </div>
                  <p className="text-sm font-medium text-slate-500">Skeleton Overlay</p>
                  <p className="text-xs text-slate-400">Visualization will appear here</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 flex flex-col items-center gap-2">
                    <span className="text-xs font-semibold text-[--color-text-muted] uppercase tracking-wide">
                      Posture
                    </span>
                    <span className="text-2xl font-bold text-slate-300">
                      {hasAnalyzed ? 'Pending' : '--'}
                    </span>
                  </div>

                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 flex flex-col items-center gap-2">
                    <span className="text-xs font-semibold text-[--color-text-muted] uppercase tracking-wide">
                      Grooming
                    </span>
                    <span className="text-2xl font-bold text-slate-300">
                      {hasAnalyzed ? 'Pending' : '--'}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 flex items-center gap-3 opacity-60">
                  <span className="material-symbols-outlined text-amber-500/50">warning</span>
                  <div className="h-2 w-24 bg-slate-200 rounded" />
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
              <div className="text-xs font-medium text-slate-400 whitespace-nowrap">
                Edge AI v2.4
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

