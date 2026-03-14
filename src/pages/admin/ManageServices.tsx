import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Form, Spinner } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { Search, Wrench, Plus, Pencil, Trash2, ChevronDown, Calendar } from 'lucide-react'
import AdminImagePreview from './AdminImagePreview'
import { deleteService, fetchServices } from './apiClient'
import type { Service } from './apiClient'

function parseDateOnly(s: string): number | null {
  if (!s) return null
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d.getTime()
}

export default function ManageServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDate, setFilterDate] = useState('')

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
      setExpandedId((prev) => (prev === id ? null : prev))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setDeletingId(null)
    }
  }

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const filteredServices = useMemo(() => {
    let list = services ?? []
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.description || '').toLowerCase().includes(q)
      )
    }
    const dayStart = parseDateOnly(filterDate)
    if (dayStart != null) {
      const dayEnd = dayStart + 86400000
      list = list.filter((s) => {
        const created = s.created_at ? new Date(s.created_at).getTime() : null
        return created != null && created >= dayStart && created < dayEnd
      })
    }
    return list
  }, [services, searchQuery, filterDate])

  return (
    <div>
      <div className="admin-toolbar">
        <h2 className="admin-page__title">
          <Wrench size={28} className="me-2" style={{ verticalAlign: 'middle' }} aria-hidden />
          Services
        </h2>
        <Link to="/admin/services/add" className="btn btn-primary admin-toolbar__add-btn">
          <Plus size={18} className="me-1" aria-hidden />
          <span className="admin-toolbar__add-btn-text--full">Add service</span>
          <span className="admin-toolbar__add-btn-text--short">Add</span>
        </Link>
      </div>

      <div className="admin-filters">
        <div className="admin-filters__search">
          <Search size={18} className="admin-filters__icon" aria-hidden />
          <Form.Control
            type="search"
            placeholder="Search by title or description…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-filters__input"
          />
        </div>
        <div className="admin-filters__dates">
          <Calendar size={18} className="admin-filters__icon" aria-hidden />
          <Form.Control
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="admin-filters__date"
            aria-label="Filter by date added"
          />
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="admin-loading">
          <Spinner animation="border" />
          <span>Loading services…</span>
        </div>
      ) : (services ?? []).length === 0 ? (
        <div className="admin-list-card__empty">No services yet.</div>
      ) : filteredServices.length === 0 ? (
        <div className="admin-list-card__empty">No services match your search or date filter.</div>
      ) : (
        <div className="admin-list-cards">
          {filteredServices.map((s) => (
            <div
              key={s.id}
              className={`admin-list-card ${expandedId === s.id ? 'admin-list-card--open' : ''}`}
            >
              <button
                type="button"
                className="admin-list-card__header"
                onClick={() => toggleExpand(s.id)}
                aria-expanded={expandedId === s.id}
              >
                <div className="admin-list-card__icon admin-list-card__icon--navy">
                  <Wrench size={24} aria-hidden />
                </div>
                <div className="admin-list-card__main">
                  <h3 className="admin-list-card__title">{s.title}</h3>
                  <p className="admin-list-card__summary">
                    {s.description ? (s.description.length > 80 ? `${s.description.slice(0, 80)}…` : s.description) : 'No description'}
                  </p>
                </div>
                <ChevronDown size={22} className="admin-list-card__chevron" aria-hidden />
              </button>
              {expandedId === s.id && (
                <div className="admin-list-card__body">
                  <div className="admin-list-card__body-inner">
                    {s.created_at && (
                      <div className="admin-list-card__body-section">
                        <span className="admin-list-card__body-label">Date added</span>
                        <p className="admin-list-card__body-content" style={{ marginBottom: 0 }}>{new Date(s.created_at).toLocaleString()}</p>
                      </div>
                    )}
                    {s.image && (
                      <div className="admin-list-card__body-section admin-list-card__image-wrap">
                        <span className="admin-list-card__body-label">Image</span>
                        <AdminImagePreview
                          src={`/uploads/${s.image}`}
                          alt={s.title}
                          thumbStyle={{ maxHeight: 120, width: 'auto', height: 120, objectFit: 'cover', borderRadius: 10 }}
                        />
                      </div>
                    )}
                    <div className="admin-list-card__body-section">
                      <span className="admin-list-card__body-label">Description</span>
                      <p className="admin-list-card__body-content">{s.description || '—'}</p>
                    </div>
                    <div className="admin-list-card__actions">
                      <Link to={`/admin/services/${s.id}/edit`} className="btn btn-sm btn-outline-primary">
                        <Pencil size={16} className="me-1" aria-hidden />
                        Edit
                      </Link>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDelete(s.id)}
                        disabled={deletingId === s.id}
                      >
                        <Trash2 size={16} className="me-1" aria-hidden />
                        {deletingId === s.id ? 'Deleting…' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
