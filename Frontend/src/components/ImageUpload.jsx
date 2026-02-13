import { useRef, useState, forwardRef, useImperativeHandle } from 'react'

// 1. const ImageUpload = 추가
const ImageUpload = forwardRef(function ImageUpload(
  { onSelect, className = '', variant = 'card' },
  ref
) {
  const inputRef = useRef(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [fileName, setFileName] = useState('')

  const openPicker = () => inputRef.current?.click()

  // 2. useImperativeHandle 함수명 추가
  useImperativeHandle(ref, () => ({
    openPicker,
    clear: () => {
      setFileName('')
      if (inputRef.current) inputRef.current.value = ''
    },
  }))

  // 3. const handleFile = 추가
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
      onSelect?.(dataUrl, { fileName: file.name, name: file.name })
    }
    reader.readAsDataURL(file)
  }

  const onChange = (e) => {
    const file = e.target.files?.[0]
    handleFile(file)
    e.target.value = ''
  }

  // 4. const onDrop = 추가
  const onDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    handleFile(file)
  }

  const isFrame = variant === 'frame'

  return (
    <div className={['w-full', isFrame ? 'h-full' : '', className].join(' ')}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onChange}
        className="hidden"
      />

      <div className={isFrame ? 'h-full flex items-center justify-center' : ''}>
        <div
          onClick={(e) => {
            e.stopPropagation()
            openPicker()
          }}
          onDragOver={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDragOver(true)
          }}
          onDragLeave={(e) => {
            e.stopPropagation()
            setIsDragOver(false)
          }}
          onDrop={onDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              e.stopPropagation()
              openPicker()
            }
          }}
          className={[
            'w-full rounded-xl border-2 border-dashed cursor-pointer transition-colors select-none',
            isFrame ? 'h-full p-6 sm:p-8 flex flex-col justify-center' : 'p-4 sm:p-5',
            'bg-slate-50',
            isDragOver
              ? 'border-[color:var(--color-primary)] bg-[color:rgba(19,109,236,0.06)]'
              : 'border-slate-300 hover:border-slate-400',
          ].join(' ')}
        >
          <div className={isFrame ? 'max-w-xl w-full mx-auto' : ''}>
            <div className="flex items-start gap-4">
              <div
                className={[
                  'shrink-0 rounded-xl flex items-center justify-center',
                  isFrame ? 'size-14' : 'size-12',
                  isDragOver
                    ? 'bg-[color:rgba(19,109,236,0.12)] text-[color:var(--color-primary)]'
                    : 'bg-slate-200 text-slate-700',
                ].join(' ')}
              >
                <span className={`material-symbols-outlined ${isFrame ? 'text-3xl' : 'text-2xl'}`}>
                  upload_file
                </span>
              </div>

              <div className="flex-1">
                <p className={`font-bold text-slate-900 ${isFrame ? 'text-base' : 'text-sm'}`}>
                  Upload Image
                </p>
                <p className={`text-slate-500 mt-1 ${isFrame ? 'text-sm' : 'text-xs'}`}>
                  Click to select, or drag & drop an image here.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
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
                    <span className="text-xs text-slate-400">No file selected</span>
                  )}
                </div>
              </div>

              <div className="shrink-0">
                <span className="inline-flex items-center justify-center h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50">
                  Browse
                </span>
              </div>
            </div>

            <p className={`text-slate-500 mt-4 ${isFrame ? 'text-sm' : 'text-xs'}`}>
              Tip: Upload stays local. No server streaming.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
})

export default ImageUpload