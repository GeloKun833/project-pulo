import type { FormEvent } from 'react'
import { Button, Form, Row, Col } from 'react-bootstrap'
import { Cropper, type ReactCropperElement } from 'react-cropper'
import 'cropperjs/dist/cropper.css'

interface Props {
  title: string
  description: string
  datePosted: string
  cropperRef: React.RefObject<ReactCropperElement | null>
  imagePreview: string | null
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onDatePostedChange: (value: string) => void
  onFileChange: (file: File | null) => void
  onSubmit: (e: FormEvent) => void
  submitLabel: string
  submitting: boolean
}

export default function AnnouncementForm({
  title,
  description,
  datePosted,
  cropperRef,
  imagePreview,
  onTitleChange,
  onDescriptionChange,
  onDatePostedChange,
  onFileChange,
  onSubmit,
  submitLabel,
  submitting,
}: Props) {
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    onFileChange(file ?? null)
  }

  return (
    <Form onSubmit={onSubmit}>
      <Row className="mb-3">
        <Col md={7}>
          <Form.Group className="mb-3" controlId="title">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="description">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="date_posted">
            <Form.Label>Date posted</Form.Label>
            <Form.Control
              type="datetime-local"
              value={datePosted}
              onChange={(e) => onDatePostedChange(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={5}>
          <Form.Group className="mb-3" controlId="image">
            <Form.Label>Announcement image</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handleFileInput} />
            <Form.Text>Choose an image to preview and crop before posting.</Form.Text>
          </Form.Group>
          {imagePreview && (
            <div>
              <p className="mb-1">Image preview &amp; crop</p>
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
        </Col>
      </Row>
      <div className="d-grid d-md-flex justify-content-md-end">
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </Form>
  )
}

