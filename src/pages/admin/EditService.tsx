import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Alert, Spinner } from 'react-bootstrap'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { ReactCropperElement } from 'react-cropper'
import ServiceForm from './ServiceForm'
import { editService, fetchService } from './apiClient'
import type { Service } from './apiClient'

export default function EditService() {
  const { id } = useParams<{ id: string }>()
  const [initial, setInitial] = useState<Service | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
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
        const s = await fetchService(id)
        setInitial(s)
        setTitle(s.title)
        setDescription(s.description)
        if (s.image) setImagePreview(`/uploads/${s.image}`)
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

      if (cropperRef.current && imagePreview && rawFile) {
        const canvas = cropperRef.current.cropper.getCroppedCanvas()
        if (canvas) {
          const blob: Blob = await new Promise((resolve, reject) => {
            canvas.toBlob((b: Blob | null) => {
              if (b) resolve(b)
              else reject(new Error('Failed to crop image'))
            }, 'image/jpeg', 0.9)
          })
          form.append('image', blob, rawFile.name || 'service.jpg')
        }
      } else if (rawFile) {
        form.append('image', rawFile, rawFile.name)
      }

      await editService(form)
      navigate('/admin/services')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="admin-loading">
      <Spinner animation="border" />
      <span>Loading service…</span>
    </div>
  )
  if (!initial) return <Alert variant="danger">Service not found.</Alert>

  const displayPreview = imagePreview ?? (initial.image ? `/uploads/${initial.image}` : null)

  return (
    <div>
      <Link to="/admin/services" className="admin-back-link mb-3">
        <ArrowLeft size={18} aria-hidden />
        Back to Services
      </Link>
      <h2 className="admin-page__title mb-3">Edit Service</h2>
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      <div className="admin-form-card">
        <ServiceForm
          title={title}
          description={description}
          cropperRef={cropperRef}
          imagePreview={displayPreview}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onFileChange={handleFileChange}
          onSubmit={handleSubmit}
          submitLabel="Save changes"
          submitting={submitting}
        />
      </div>
    </div>
  )
}

