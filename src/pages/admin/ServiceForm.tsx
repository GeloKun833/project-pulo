import type { FormEvent } from 'react'
import { Button, Form } from 'react-bootstrap'
import { Cropper, type ReactCropperElement } from 'react-cropper'
import { FileText, ImageIcon } from 'lucide-react'
import 'cropperjs/dist/cropper.css'

type Props = {
  title: string
  description: string
  cropperRef: React.RefObject<ReactCropperElement | null>
  imagePreview: string | null
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onFileChange: (file: File | null) => void
  onSubmit: (e: FormEvent) => void
  submitLabel: string
  submitting: boolean
}

export default function ServiceForm({
  title,
  description,
  cropperRef,
  imagePreview,
  onTitleChange,
  onDescriptionChange,
  onFileChange,
  onSubmit,
  submitLabel,
  submitting,
}: Props) {
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileChange(e.target.files?.[0] ?? null)
  }

  return (
    <Form onSubmit={onSubmit} className="admin-form">
      <section className="admin-form-section">
        <h3 className="admin-form-section__title">
          <FileText size={18} className="admin-form-section__icon" aria-hidden />
          Details
        </h3>
        <Form.Group className="mb-3" controlId="service_title">
          <Form.Label>Title</Form.Label>
          <Form.Control type="text" value={title} onChange={(e) => onTitleChange(e.target.value)} required placeholder="Service title" />
        </Form.Group>
        <Form.Group className="mb-3" controlId="service_description">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            required
            placeholder="Describe the service…"
          />
        </Form.Group>
      </section>

      <section className="admin-form-section">
        <h3 className="admin-form-section__title">
          <ImageIcon size={18} className="admin-form-section__icon" aria-hidden />
          Image
        </h3>
        <Form.Group className="mb-3" controlId="service_image">
          <Form.Label>Upload image</Form.Label>
          <Form.Control type="file" accept="image/*" onChange={handleFileInput} />
          <Form.Text className="text-muted">Optional. Choose an image to preview and crop before saving.</Form.Text>
        </Form.Group>
        {imagePreview && (
          <div className="mb-3">
            <p className="admin-form-crop-label">Preview &amp; crop</p>
            <Cropper
              src={imagePreview}
              style={{ height: 240, width: '100%' }}
              aspectRatio={16 / 9}
              guides
              ref={cropperRef}
              viewMode={1}
              dragMode="move"
              scalable
              zoomable
              autoCropArea={1}
              background={false}
              responsive
              checkOrientation={false}
            />
          </div>
        )}
      </section>

      <div className="admin-form-actions">
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </Form>
  )
}

