import { useEffect, useRef, useState } from 'react'

export default function CameraInput({ onCapture }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const [enabled, setEnabled] = useState(false)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  const stop = () => {
    const stream = streamRef.current
    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    setEnabled(false)
    setStarting(false)
    setReady(false)
  }

  const start = async () => {
    setError('')
    setStarting(true)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })

      streamRef.current = stream
      setEnabled(true) // video ?Œë” ?¸ë¦¬ê±?
    } catch (e) {
      console.error(e)
      setError('Camera permission denied or not available.')
      setEnabled(false)
    } finally {
      setStarting(false)
    }
  }

  // enabled ????stream ë¶™ì´ê³?play
  useEffect(() => {
    const video = videoRef.current
    const stream = streamRef.current
    if (!enabled || !video || !stream) return

    video.srcObject = stream

    const tryPlay = async () => {
      try {
        await video.play()
      } catch (e) {
        console.warn('video.play() blocked:', e)
      }
    }

    tryPlay()
  }, [enabled])

  const capture = () => {
    const video = videoRef.current
    if (!video || !enabled || !ready) return

    const w = video.videoWidth || 1280
    const h = video.videoHeight || 720

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, w, h)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    onCapture?.(dataUrl)
  }

  useEffect(() => {
    return () => stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="absolute inset-0">
      {/* video */}
      {enabled && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          onLoadedMetadata={(e) => {
            // metadata ?¤ì–´?¤ë©´ ready ì²˜ë¦¬ + play ?œë²ˆ ??
            setReady(true)
            try {
              e.currentTarget.play()
            } catch {}
          }}
          onCanPlay={() => setReady(true)}
        />
      )}

      {/* guide overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[35%] h-[70%] border-2 border-white/30 rounded-[50%] border-dashed" />
      </div>

      {/* placeholder */}
      {!enabled && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/85 bg-slate-900/40 backdrop-blur-[1px]">
          <span className="material-symbols-outlined text-5xl">
            {starting ? 'hourglass_top' : 'videocam_off'}
          </span>
          <p className="text-sm font-semibold">
            {starting ? 'Starting camera...' : 'Camera is off'}
          </p>
          <p className="text-xs text-white/70">Click Enable to start the camera.</p>
        </div>
      )}

      {/* status badge */}
      <div className="absolute top-3 right-3 z-20 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            enabled && ready ? 'bg-red-500 animate-pulse' : 'bg-slate-400'
          }`}
        />
        {enabled ? (ready ? 'Live' : 'Starting...') : 'Idle'}
      </div>

      {/* error */}
      {error && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 px-3 py-2 rounded-lg bg-red-600/90 text-white text-xs font-semibold">
          {error}
        </div>
      )}

      {/* controls (inside frame) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {!enabled ? (
          <button
            type="button"
            onClick={start}
            disabled={starting}
            className="
              h-11 px-6 rounded-full text-sm font-bold text-white
              bg-[color:var(--color-primary)]
              hover:bg-[color:rgba(19,109,236,0.85)]
              active:bg-[color:rgba(19,109,236,0.95)]
              shadow-lg shadow-[color:rgba(19,109,236,0.30)]
              transition-colors
              disabled:opacity-50
              focus:outline-none focus:ring-4 focus:ring-[color:rgba(19,109,236,0.30)]
              flex items-center gap-2
            "
          >
            <span className="material-symbols-outlined text-[20px]">videocam</span>
            {starting ? 'Enabling...' : 'Enable'}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={stop}
              className="
                h-11 px-5 rounded-full text-sm font-bold
                bg-white/90 text-slate-900
                hover:bg-white
                transition-colors
                backdrop-blur-sm
                focus:outline-none focus:ring-4 focus:ring-white/30
                flex items-center gap-2
              "
            >
              <span className="material-symbols-outlined text-[20px]">stop_circle</span>
              Stop
            </button>

            <button
              type="button"
              onClick={capture}
              disabled={!ready}
              className="
                h-11 px-6 rounded-full text-sm font-bold text-white
                bg-[color:var(--color-primary)]
                hover:bg-[color:rgba(19,109,236,0.85)]
                active:bg-[color:rgba(19,109,236,0.95)]
                shadow-lg shadow-[color:rgba(19,109,236,0.30)]
                transition-colors
                disabled:opacity-50
                focus:outline-none focus:ring-4 focus:ring-[color:rgba(19,109,236,0.30)]
                flex items-center gap-2
              "
            >
              <span className="material-symbols-outlined text-[20px]">photo_camera</span>
              Snapshot
            </button>
          </>
        )}
      </div>
    </div>
  )
}

