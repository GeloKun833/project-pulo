import { useRef, useState, type FormEvent } from 'react'
import { Alert } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { ReactCropperElement } from 'react-cropper'
import AnnouncementForm from './AnnouncementForm'
import { addAnnouncement } from './apiClient'

export default function AddAnnouncement() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [datePosted, setDatePosted] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [rawFile, setRawFile] = useState<File | null>(null)
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
      form.append('title', title)
      form.append('description', description)
      if (datePosted) {
        // convert local datetime-local value to server-friendly string
        form.append('date_posted', new Date(datePosted).toISOString().slice(0, 19).replace('T', ' '))
      }

      if (cropperRef.current && imagePreview) {
        const canvas = cropperRef.current.cropper.getCroppedCanvas()
        if (canvas) {
          const blob: Blob = await new Promise((resolve, reject) => {
            canvas.toBlob((b: Blob | null) => {
              if (b) resolve(b)
              else reject(new Error('Failed to crop image'))
            }, 'image/jpeg', 0.9)
          })
          form.append('image', blob, rawFile?.name || 'announcement.jpg')
        }
      } else if (rawFile) {
        form.append('image', rawFile)
      }

      await addAnnouncement(form)
      navigate('/admin/announcements')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Link to="/admin/announcements" className="admin-back-link mb-3">
        <ArrowLeft size={18} aria-hidden />
        Back to Announcements
      </Link>
      <h2 className="admin-page__title mb-3">Add Announcement</h2>
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      <div className="admin-form-card">
      <AnnouncementForm
        title={title}
        description={description}
        datePosted={datePosted}
        cropperRef={cropperRef}
        imagePreview={imagePreview}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onDatePostedChange={setDatePosted}
        onFileChange={handleFileChange}
        onSubmit={handleSubmit}
        submitLabel="Publish announcement"
        submitting={submitting}
      />
      </div>
    </div>
  )
}

