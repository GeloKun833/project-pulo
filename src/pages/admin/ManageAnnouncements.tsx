import { useEffect, useState } from 'react'
import { Alert, Button, Image, Spinner, Table } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { deleteAnnouncement, fetchAnnouncements } from './apiClient'
import type { Announcement } from './apiClient'

export default function ManageAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAnnouncements()
      setAnnouncements(Array.isArray(data) ? data : [])
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this announcement? This cannot be undone.')) return
    setDeletingId(id)
    setError(null)
    try {
      await deleteAnnouncement(id)
      await load()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Manage Announcements</h2>
        <Link to="/admin/announcements/add" className="btn btn-primary">
          Add Announcement
        </Link>
      </div>
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Title</th>
              <th>Image</th>
              <th>Date Posted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(announcements ?? []).map((a) => (
              <tr key={a.id}>
                <td>{a.title}</td>
                <td style={{ width: 120 }}>
                  {a.image ? (
                    <Image
                      src={`/uploads/${a.image}`}
                      alt={a.title}
                      thumbnail
                      style={{ maxHeight: 80, objectFit: 'cover' }}
                    />
                  ) : (
                    <span className="text-muted">No image</span>
                  )}
                </td>
                <td>{new Date(a.date_posted).toLocaleString()}</td>
                <td>
                  <Link
                    to={`/admin/announcements/${a.id}/edit`}
                    className="btn btn-sm btn-outline-primary me-2"
                  >
                    Edit
                  </Link>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    disabled={deletingId === a.id}
                    onClick={() => {
                      void handleDelete(a.id)
                    }}
                  >
                    {deletingId === a.id ? 'Deleting…' : 'Delete'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  )
}

