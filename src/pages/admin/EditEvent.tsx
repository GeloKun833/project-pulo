import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Alert, Spinner } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import type { ReactCropperElement } from 'react-cropper'
import EventForm from './EventForm'
import type { EventItem } from './apiClient'
import { editEvent, fetchEvent } from './apiClient'

function fromServerDatetime(serverValue: string | null): string {
  if (!serverValue) return ''
  return serverValue.replace(' ', 'T').slice(0, 16)
}

function toServerDatetime(localValue: string): string {
  if (!localValue) return ''
  return new Date(localValue).toISOString().slice(0, 19).replace('T', ' ')
}

export default function EditEvent() {
  const { id } = useParams<{ id: string }>()
  const [initial, setInitial] = useState<EventItem | null>(null)
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [details, setDetails] = useState('')
  const [location, setLocation] = useState('')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [rawFile, setRawFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const cropperRef = useRef<ReactCropperElement>(null)

  useEffect(() => {
    const load = async () => {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const e = await fetchEvent(id)
        setInitial(e)
        setCategory(e.category ?? '')
        setTitle(e.title)
        setSubtitle(e.subtitle ?? '')
        setDetails(e.details ?? '')
        setLocation(e.location ?? '')
        setStartAt(fromServerDatetime(e.start_at))
        setEndAt(fromServerDatetime(e.end_at))
        if (e.image) setImagePreview(`/uploads/${e.image}`)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [id])

  const handleFileChange = (file: File | null) => {
    setRawFile(file)
    setError(null)
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else if (initial?.image) {
      setImagePreview(`/uploads/${initial.image}`)
    } else {
      setImagePreview(null)
    }
  }

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault()
    if (!id) return
    setSubmitting(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('id', id)
      form.append('category', category)
      form.append('title', title)
      form.append('subtitle', subtitle)
      form.append('details', details)
      form.append('location', location)
      form.append('start_at', startAt ? toServerDatetime(startAt) : '')
      form.append('end_at', endAt ? toServerDatetime(endAt) : '')

      if (cropperRef.current && imagePreview && rawFile) {
        const canvas = cropperRef.current.cropper.getCroppedCanvas()
        if (canvas) {
          const blob: Blob = await new Promise((resolve, reject) => {
            canvas.toBlob((b: Blob | null) => {
              if (b) resolve(b)
              else reject(new Error('Failed to crop image'))
            }, 'image/jpeg', 0.9)
          })
          form.append('image', blob, rawFile.name || 'event.jpg')
        }
      } else if (rawFile) {
        form.append('image', rawFile, rawFile.name)
      }

      await editEvent(form)
      navigate('/admin/events')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner animation="border" />
  if (!initial) return <Alert variant="danger">Event not found.</Alert>

  const displayPreview = imagePreview ?? (initial.image ? `/uploads/${initial.image}` : null)

  return (
    <div>
      <h2 className="mb-3">Edit Event</h2>
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
        imagePreview={displayPreview}
        onCategoryChange={setCategory}
        onTitleChange={setTitle}
        onSubtitleChange={setSubtitle}
        onDetailsChange={setDetails}
        onLocationChange={setLocation}
        onStartAtChange={setStartAt}
        onEndAtChange={setEndAt}
        onFileChange={handleFileChange}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
        submitting={submitting}
      />
    </div>
  )
}

