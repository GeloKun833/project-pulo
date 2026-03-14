import { useEffect, useState } from 'react'
import { Alert, Button, Image, Spinner, Table } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { deleteService, fetchServices } from './apiClient'
import type { Service } from './apiClient'

export default function ManageServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchServices()
      setServices(Array.isArray(data) ? data : [])
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
    const ok = window.confirm('Delete this service?')
    if (!ok) return
    setDeletingId(id)
    setError(null)
    try {
      await deleteService(id)
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
        <h2 className="mb-0">Services</h2>
        <Link to="/admin/services/add" className="btn btn-primary">
          Add service
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
              <th>Title</th>
              <th style={{ width: 120 }}>Image</th>
              <th>Description</th>
              <th style={{ width: 220 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(services ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-muted">
                  No services yet.
                </td>
              </tr>
            ) : (
              (services ?? []).map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.title}</td>
                  <td>
                    {s.image ? (
                      <Image
                        src={`/uploads/${s.image}`}
                        alt={s.title}
                        thumbnail
                        style={{ maxHeight: 80, objectFit: 'cover' }}
                      />
                    ) : (
                      <span className="text-muted">No image</span>
                    )}
                  </td>
                  <td style={{ maxWidth: 520 }}>{s.description}</td>
                  <td>
                    <Link to={`/admin/services/${s.id}/edit`} className="btn btn-sm btn-outline-primary me-2">
                      Edit
                    </Link>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleDelete(s.id)}
                      disabled={deletingId === s.id}
                    >
                      {deletingId === s.id ? 'Deleting…' : 'Delete'}
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

