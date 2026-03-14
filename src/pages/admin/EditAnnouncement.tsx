import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Alert, Spinner } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import type { ReactCropperElement } from 'react-cropper'
import AnnouncementForm from './AnnouncementForm'
import { editAnnouncement, fetchAnnouncement } from './apiClient'
import type { Announcement } from './apiClient'

export default function EditAnnouncement() {
  const { id } = useParams<{ id: string }>()
  const [initial, setInitial] = useState<Announcement | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [datePosted, setDatePosted] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [rawFile, setRawFile] = useState<File | null>(null)
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
        const data = await fetchAnnouncement(id)
        setInitial(data)
        setTitle(data.title)
        setDescription(data.description)
        setDatePosted(data.date_posted.replace(' ', 'T').slice(0, 16))
        if (data.image) {
          setImagePreview(`/uploads/${data.image}`)
        }
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!id) return
    setSubmitting(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('id', id)
      form.append('title', title)
      form.append('description', description)
      if (datePosted) {
        form.append('date_posted', new Date(datePosted).toISOString().slice(0, 19).replace('T', ' '))
      }

      if (cropperRef.current && imagePreview && rawFile) {
        const canvas = cropperRef.current.cropper.getCroppedCanvas()
        if (canvas) {
          const blob: Blob = await new Promise((resolve, reject) => {
            canvas.toBlob((b: Blob | null) => {
              if (b) resolve(b)
              else reject(new Error('Failed to crop image'))
            }, 'image/jpeg', 0.9)
          })
          form.append('image', blob, rawFile.name || 'announcement.jpg')
        }
      } else if (rawFile) {
        form.append('image', rawFile)
      }

      await editAnnouncement(form)
      navigate('/admin/announcements')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <Spinner animation="border" />
  }

  if (!initial) {
    return <Alert variant="danger">Announcement not found.</Alert>
  }

  return (
    <div>
      <h2 className="mb-3">Edit Announcement</h2>
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
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
        submitLabel="Save changes"
        submitting={submitting}
      />
    </div>
  )
}

