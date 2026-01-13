import { useRef, useState } from 'react'

export default function ImageUpload({ onSelect }) {
  // Hidden file input and UI state.
  const inputRef = useRef(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [fileName, setFileName] = useState('')

  // Open the native file picker.
  const openPicker = () => inputRef.current?.click()

  // Read a selected image and pass it to the parent.
  const handleFile = (file) => {
    if (!file) return
    if (!file.type?.startsWith('image/')) {
      alert('Please select an image file.')
      return
    }

    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      onSelect?.(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  // Handle normal file selection.
  const onChange = (e) => {
    const file = e.target.files?.[0]
    handleFile(file)
    // Allow selecting the same file again
    e.target.value = ''
  }

  // Handle drag-and-drop selection.
  const onDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    handleFile(file)
  }

  return (
    // Upload surface with click and drag-and-drop support.
    <div className="w-full">
      {/* Hidden file input that is triggered by the upload surface. */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onChange}
        className="hidden"
      />

      {/* Click/drag target area for selecting an image. */}
      <div
        onClick={openPicker}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        className={[
          'w-full rounded-xl border-2 border-dashed p-4 sm:p-5 cursor-pointer transition-colors select-none',
          'bg-slate-50',
          isDragOver
            ? 'border-[color:var(--color-primary)] bg-[color:rgba(19,109,236,0.06)]'
            : 'border-slate-300 hover:border-slate-400',
        ].join(' ')}
      >
        {/* Left icon, main copy, and filename display. */}
        <div className="flex items-start gap-4">
          <div
            className={[
              'shrink-0 size-12 rounded-xl flex items-center justify-center',
              isDragOver
                ? 'bg-[color:rgba(19,109,236,0.12)] text-[color:var(--color-primary)]'
                : 'bg-slate-200 text-slate-700',
            ].join(' ')}
          >
            <span className="material-symbols-outlined text-2xl">upload_file</span>
          </div>

          <div className="flex-1">
            <p className="text-sm font-bold text-slate-900">
              Upload Image
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Click to select, or drag & drop an image here.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 px-3 py-1 text-xs text-slate-600">
                <span className="material-symbols-outlined text-[16px]">image</span>
                JPG / PNG / WEBP
              </span>

              {fileName ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[color:rgba(19,109,236,0.10)] border border-[color:rgba(19,109,236,0.25)] px-3 py-1 text-xs text-[color:var(--color-primary)]">
                  <span className="material-symbols-outlined text-[16px]">description</span>
                  {fileName}
                </span>
              ) : (
                <span className="text-xs text-slate-400">
                  No file selected
                </span>
              )}
            </div>
          </div>

          {/* Right-side "Browse" pill button (visual only). */}
          <div className="shrink-0">
            <span className="inline-flex items-center justify-center h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50">
              Browse
            </span>
          </div>
        </div>
      </div>

      {/* Footer hint about local-only uploads. */}
      <p className="text-xs text-slate-500 mt-2">
        Tip: Upload stays local. No server streaming.
      </p>
    </div>
  )
}
