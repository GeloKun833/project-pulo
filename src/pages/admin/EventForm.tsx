import type { FormEvent } from 'react'
import { Button, Form } from 'react-bootstrap'
import { Cropper, type ReactCropperElement } from 'react-cropper'
import { Info, Calendar, FileText, ImageIcon } from 'lucide-react'
import 'cropperjs/dist/cropper.css'

type Props = {
  category: string
  title: string
  subtitle: string
  details: string
  location: string
  startAt: string
  endAt: string
  cropperRef: React.RefObject<ReactCropperElement | null>
  imagePreview: string | null
  onCategoryChange: (v: string) => void
  onTitleChange: (v: string) => void
  onSubtitleChange: (v: string) => void
  onDetailsChange: (v: string) => void
  onLocationChange: (v: string) => void
  onStartAtChange: (v: string) => void
  onEndAtChange: (v: string) => void
  onFileChange: (file: File | null) => void
  onSubmit: (e: FormEvent) => void
  submitLabel: string
  submitting: boolean
}

export default function EventForm({
  category,
  title,
  subtitle,
  details,
  location,
  startAt,
  endAt,
  cropperRef,
  imagePreview,
  onCategoryChange,
  onTitleChange,
  onSubtitleChange,
  onDetailsChange,
  onLocationChange,
  onStartAtChange,
  onEndAtChange,
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
          <Info size={18} className="admin-form-section__icon" aria-hidden />
          Basic info
        </h3>
        <div className="admin-form-row admin-form-row--2">
          <Form.Group className="mb-3" controlId="event_category">
            <Form.Label>Category</Form.Label>
            <Form.Control type="text" value={category} onChange={(e) => onCategoryChange(e.target.value)} placeholder="e.g. Community" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="event_location">
            <Form.Label>Location</Form.Label>
            <Form.Control type="text" value={location} onChange={(e) => onLocationChange(e.target.value)} placeholder="Venue or address" />
          </Form.Group>
        </div>
        <Form.Group className="mb-3" controlId="event_title">
          <Form.Label>Title</Form.Label>
          <Form.Control type="text" value={title} onChange={(e) => onTitleChange(e.target.value)} required placeholder="Event title" />
        </Form.Group>
        <Form.Group className="mb-3" controlId="event_subtitle">
          <Form.Label>Subtitle</Form.Label>
          <Form.Control type="text" value={subtitle} onChange={(e) => onSubtitleChange(e.target.value)} placeholder="Short tagline (optional)" />
        </Form.Group>
      </section>

      <section className="admin-form-section">
        <h3 className="admin-form-section__title">
          <Calendar size={18} className="admin-form-section__icon" aria-hidden />
          Date &amp; time
        </h3>
        <div className="admin-form-row admin-form-row--2">
          <Form.Group className="mb-3" controlId="event_start">
            <Form.Label>Start</Form.Label>
            <Form.Control type="datetime-local" value={startAt} onChange={(e) => onStartAtChange(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3" controlId="event_end">
            <Form.Label>End</Form.Label>
            <Form.Control type="datetime-local" value={endAt} onChange={(e) => onEndAtChange(e.target.value)} />
          </Form.Group>
        </div>
      </section>

      <section className="admin-form-section">
        <h3 className="admin-form-section__title">
          <FileText size={18} className="admin-form-section__icon" aria-hidden />
          Details
        </h3>
        <Form.Group className="mb-3" controlId="event_details">
          <Form.Label>Description</Form.Label>
          <Form.Control as="textarea" rows={5} value={details} onChange={(e) => onDetailsChange(e.target.value)} placeholder="Full event description…" />
        </Form.Group>
      </section>

      <section className="admin-form-section">
        <h3 className="admin-form-section__title">
          <ImageIcon size={18} className="admin-form-section__icon" aria-hidden />
          Image
        </h3>
        <Form.Group className="mb-3" controlId="event_image">
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

