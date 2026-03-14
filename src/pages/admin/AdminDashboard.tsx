import { useEffect, useState } from 'react'
import { Table, Image, Spinner, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { fetchAnnouncements } from './apiClient'
import type { Announcement } from './apiClient'

export default function AdminDashboard() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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
    void load()
  }, [])

  return (
    <div>
      <h2 className="mb-4">Dashboard</h2>
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
                  <Link to={`/admin/announcements/${a.id}/edit`} className="btn btn-sm btn-outline-primary me-2">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  )
}

