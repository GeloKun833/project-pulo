import { useRef, useState, type FormEvent } from 'react'
import { Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import type { ReactCropperElement } from 'react-cropper'
import EventForm from './EventForm'
import { addEvent } from './apiClient'

function toServerDatetime(localValue: string): string {
  if (!localValue) return ''
  return new Date(localValue).toISOString().slice(0, 19).replace('T', ' ')
}

export default function AddEvent() {
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [details, setDetails] = useState('')
  const [location, setLocation] = useState('')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [rawFile, setRawFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const cropperRef = useRef<ReactCropperElement>(null)

  const handleFileChange = (file: File | null) => {
    setRawFile(file)
    setError(null)
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('category', category)
      form.append('title', title)
      form.append('subtitle', subtitle)
      form.append('details', details)
      form.append('location', location)
      form.append('start_at', startAt ? toServerDatetime(startAt) : '')
      form.append('end_at', endAt ? toServerDatetime(endAt) : '')

      if (cropperRef.current && imagePreview) {
        const canvas = cropperRef.current.cropper.getCroppedCanvas()
        if (canvas) {
          const blob: Blob = await new Promise((resolve, reject) => {
            canvas.toBlob((b: Blob | null) => {
              if (b) resolve(b)
              else reject(new Error('Failed to crop image'))
            }, 'image/jpeg', 0.9)
          })
          form.append('image', blob, rawFile?.name || 'event.jpg')
        }
      } else if (rawFile) {
        form.append('image', rawFile, rawFile.name)
      }

      await addEvent(form)
      navigate('/admin/events')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h2 className="mb-3">Add Event</h2>
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      <EventForm
        category={category}
        title={title}
        subtitle={subtitle}
        details={details}
        location={location}
        startAt={startAt}
        endAt={endAt}
        cropperRef={cropperRef}
        imagePreview={imagePreview}
        onCategoryChange={setCategory}
        onTitleChange={setTitle}
        onSubtitleChange={setSubtitle}
        onDetailsChange={setDetails}
        onLocationChange={setLocation}
        onStartAtChange={setStartAt}
        onEndAtChange={setEndAt}
        onFileChange={handleFileChange}
        onSubmit={handleSubmit}
        submitLabel="Create event"
        submitting={submitting}
      />
    </div>
  )
}

