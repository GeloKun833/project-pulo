import { useEffect, useState } from 'react'
import { Alert, Button, Image, Spinner, Table } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import type { EventItem } from './apiClient'
import { deleteEvent, fetchEvents } from './apiClient'

export default function ManageEvents() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchEvents()
      setEvents(Array.isArray(data) ? data : [])
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
    const ok = window.confirm('Delete this event?')
    if (!ok) return
    setDeletingId(id)
    setError(null)
    try {
      await deleteEvent(id)
      await load()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="mb-0">Events</h2>
        <Link to="/admin/events/add" className="btn btn-primary">
          Add event
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
              <th style={{ width: 80 }}>ID</th>
              <th style={{ width: 120 }}>Image</th>
              <th style={{ width: 180 }}>Category</th>
              <th>Title</th>
              <th style={{ width: 200 }}>Start</th>
              <th style={{ width: 200 }}>End</th>
              <th style={{ width: 220 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(events ?? []).length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-muted">
                  No events yet.
                </td>
              </tr>
            ) : (
              (events ?? []).map((e) => (
                <tr key={e.id}>
                  <td>{e.id}</td>
                  <td>
                    {e.image ? (
                      <Image
                        src={`/uploads/${e.image}`}
                        alt={e.title}
                        thumbnail
                        style={{ maxHeight: 80, objectFit: 'cover' }}
                      />
                    ) : (
                      <span className="text-muted">No image</span>
                    )}
                  </td>
                  <td>{e.category ?? <span className="text-muted">—</span>}</td>
                  <td>{e.title}</td>
                  <td>{e.start_at ? new Date(e.start_at).toLocaleString() : <span className="text-muted">—</span>}</td>
                  <td>{e.end_at ? new Date(e.end_at).toLocaleString() : <span className="text-muted">—</span>}</td>
                  <td>
                    <Link to={`/admin/events/${e.id}/edit`} className="btn btn-sm btn-outline-primary me-2">
                      Edit
                    </Link>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleDelete(e.id)}
                      disabled={deletingId === e.id}
                    >
                      {deletingId === e.id ? 'Deleting…' : 'Delete'}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}
    </div>
  )
}

