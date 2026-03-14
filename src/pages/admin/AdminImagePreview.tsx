import { useState, useEffect } from 'react'
import { Expand } from 'lucide-react'
import './AdminImagePreview.css'

type Props = {
  src: string
  alt?: string
  thumbClassName?: string
  thumbStyle?: React.CSSProperties
}

export default function AdminImagePreview({ src, alt = '', thumbClassName, thumbStyle }: Props) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [open])

  return (
    <>
      <div className="admin-image-preview">
        <img
          src={src}
          alt={alt}
          className={thumbClassName ?? 'admin-image-preview__thumb'}
          style={thumbStyle}
        />
        <button
          type="button"
          className="admin-image-preview__btn"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setOpen(true)
          }}
          aria-label="View full image"
        >
          <Expand size={18} aria-hidden />
        </button>
      </div>

      {open && (
        <div
          className="admin-image-preview__backdrop"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Full size image"
          tabIndex={-1}
        >
          <button
            type="button"
            className="admin-image-preview__close"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            Close
          </button>
          <img
            src={src}
            alt={alt}
            className="admin-image-preview__full"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
