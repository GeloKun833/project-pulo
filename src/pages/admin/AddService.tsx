import { useRef, useState, type FormEvent } from 'react'
import { Alert } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { ReactCropperElement } from 'react-cropper'
import ServiceForm from './ServiceForm'
import { addService } from './apiClient'

export default function AddService() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
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
      form.append('title', title)
      form.append('description', description)

      if (cropperRef.current && imagePreview) {
        const canvas = cropperRef.current.cropper.getCroppedCanvas()
        if (canvas) {
          const blob: Blob = await new Promise((resolve, reject) => {
            canvas.toBlob((b: Blob | null) => {
              if (b) resolve(b)
              else reject(new Error('Failed to crop image'))
            }, 'image/jpeg', 0.9)
          })
          form.append('image', blob, rawFile?.name || 'service.jpg')
        }
      } else if (rawFile) {
        form.append('image', rawFile, rawFile.name)
      }

      await addService(form)
      navigate('/admin/services')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Link to="/admin/services" className="admin-back-link mb-3">
        <ArrowLeft size={18} aria-hidden />
        Back to Services
      </Link>
      <h2 className="admin-page__title mb-3">Add Service</h2>
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
        imagePreview={imagePreview}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onFileChange={handleFileChange}
        onSubmit={handleSubmit}
        submitLabel="Create service"
        submitting={submitting}
      />
      </div>
    </div>
  )
}

