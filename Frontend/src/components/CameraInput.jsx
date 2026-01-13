import { useEffect, useRef, useState } from 'react'

export default function CameraInput({ onCapture, fullBody = false }) {
  // Keep refs to the video element and active media stream.
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  // UI/stream state.
  const [enabled, setEnabled] = useState(false)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  // Stop the camera and release the hardware.
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
      // Request webcam access.
      const stream = await navigator.mediaDevices.getUserMedia({
        video: fullBody
          ? {
              // Full-body friendly (portrait preference)
              width: { ideal: 720 },
              height: { ideal: 1280 },
              aspectRatio: { ideal: 9 / 16 },
              facingMode: 'user',
            }
          : {
              // Original behavior
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
        audio: false,
      })

      streamRef.current = stream
      setEnabled(true)
    } catch (e) {
      console.error(e)
      setError('Camera permission denied or not available.')
      setEnabled(false)
    } finally {
      setStarting(false)
    }
  }

  // Attach stream to the video element once enabled.
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

  // Capture current frame (fullBody => crop to 9:16).
  const capture = () => {
    const video = videoRef.current
    if (!video || !enabled || !ready) return

    const vw = video.videoWidth || (fullBody ? 720 : 1280)
    const vh = video.videoHeight || (fullBody ? 1280 : 720)

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (fullBody) {
      // Crop to portrait 9:16 from the center (no stretching)
      const targetRatio = 9 / 16

      // Use the full height; compute width by ratio and center-crop horizontally.
      const cropH = vh
      const cropW = cropH * targetRatio

      // If camera gives narrower than desired, fallback to using full width and crop vertically.
      if (cropW <= vw) {
        const sx = (vw - cropW) / 2
        canvas.width = Math.round(cropW)
        canvas.height = Math.round(cropH)
        ctx.drawImage(video, sx, 0, cropW, cropH, 0, 0, cropW, cropH)
      } else {
        // fallback: use full width, crop height to match ratio
        const cropW2 = vw
        const cropH2 = cropW2 / targetRatio
        const sy = Math.max(0, (vh - cropH2) / 2)
        canvas.width = Math.round(cropW2)
        canvas.height = Math.round(cropH2)
        ctx.drawImage(video, 0, sy, cropW2, cropH2, 0, 0, cropW2, cropH2)
      }
    } else {
      // Original: capture full frame
      canvas.width = vw
      canvas.height = vh
      ctx.drawImage(video, 0, 0, vw, vh)
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    onCapture?.(dataUrl)
  }

  useEffect(() => {
    // Cleanup on unmount.
    return () => stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    // Full-screen container for the camera UI inside the parent frame.
    <div className="absolute inset-0">
      {/* Live video surface */}
      {enabled && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          onLoadedMetadata={(e) => {
            setReady(true)
            try {
              e.currentTarget.play()
            } catch {}
          }}
          onCanPlay={() => setReady(true)}
        />
      )}

      {/* Guide overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {fullBody ? (
          // Full-body guide (head-to-feet)
          <div className="absolute inset-6 border-2 border-white/30 rounded-xl border-dashed">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-white/70">
              Head
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-white/70">
              Feet
            </div>
          </div>
        ) : (
          // Original ellipse guide
          <div className="w-[35%] h-[70%] border-2 border-white/30 rounded-[50%] border-dashed" />
        )}
      </div>

      {/* Placeholder while camera is off */}
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

      {/* Status badge */}
      <div className="absolute top-3 right-3 z-20 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            enabled && ready ? 'bg-red-500 animate-pulse' : 'bg-slate-400'
          }`}
        />
        {enabled ? (ready ? 'Live' : 'Starting...') : 'Idle'}
      </div>

      {/* Error banner */}
      {error && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 px-3 py-2 rounded-lg bg-red-600/90 text-white text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Controls (inside frame) */}
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
