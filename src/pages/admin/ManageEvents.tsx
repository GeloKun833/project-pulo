import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Form, Spinner } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { Calendar, Plus, Pencil, Trash2, ChevronDown, Search } from 'lucide-react'
import AdminImagePreview from './AdminImagePreview'
import type { EventItem } from './apiClient'
import { deleteEvent, fetchEvents } from './apiClient'

function parseDateOnly(s: string): number | null {
  if (!s) return null
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d.getTime()
}

export default function ManageEvents() {
  const [events, setEvents] = useState<EventItem[]>([])
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

  const formatDate = (s: string | null) => (s ? new Date(s).toLocaleString() : '—')

  const filteredEvents = useMemo(() => {
    let list = events ?? []
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.subtitle || '').toLowerCase().includes(q) ||
          (e.category || '').toLowerCase().includes(q) ||
          (e.details || '').toLowerCase().includes(q) ||
          (e.location || '').toLowerCase().includes(q)
      )
    }
    const dayStart = parseDateOnly(filterDate)
    if (dayStart != null) {
      const dayEnd = dayStart + 86400000
      list = list.filter((e) => {
        const eventDate = e.start_at ? new Date(e.start_at).getTime() : (e.created_at ? new Date(e.created_at).getTime() : null)
        return eventDate != null && eventDate >= dayStart && eventDate < dayEnd
      })
    }
    return list
  }, [events, searchQuery, filterDate])

  return (
    <div>
      <div className="admin-toolbar">
        <h2 className="admin-page__title">
          <Calendar size={28} className="me-2" style={{ verticalAlign: 'middle' }} aria-hidden />
          Events
        </h2>
        <Link to="/admin/events/add" className="btn btn-primary admin-toolbar__add-btn">
          <Plus size={18} className="me-1" aria-hidden />
          <span className="admin-toolbar__add-btn-text--full">Add event</span>
          <span className="admin-toolbar__add-btn-text--short">Add</span>
        </Link>
      </div>

      <div className="admin-filters">
        <div className="admin-filters__search">
          <Search size={18} className="admin-filters__icon" aria-hidden />
          <Form.Control
            type="search"
            placeholder="Search by title, category, location…"
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
            aria-label="Filter by event date"
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
          <span>Loading events…</span>
        </div>
      ) : (events ?? []).length === 0 ? (
        <div className="admin-list-card__empty">No events yet.</div>
      ) : filteredEvents.length === 0 ? (
        <div className="admin-list-card__empty">No events match your search or date filter.</div>
      ) : (
        <div className="admin-list-cards">
          {filteredEvents.map((e) => (
            <div
              key={e.id}
              className={`admin-list-card ${expandedId === e.id ? 'admin-list-card--open' : ''}`}
            >
              <button
                type="button"
                className="admin-list-card__header"
                onClick={() => toggleExpand(e.id)}
                aria-expanded={expandedId === e.id}
              >
                <div className="admin-list-card__icon admin-list-card__icon--plum">
                  <Calendar size={24} aria-hidden />
                </div>
                <div className="admin-list-card__main">
                  <h3 className="admin-list-card__title">{e.title}</h3>
                  <p className="admin-list-card__summary">
                    {[e.category, e.start_at ? formatDate(e.start_at) : null].filter(Boolean).join(' · ') || 'No date or category'}
                  </p>
                </div>
                <ChevronDown size={22} className="admin-list-card__chevron" aria-hidden />
              </button>
              {expandedId === e.id && (
                <div className="admin-list-card__body">
                  <div className="admin-list-card__body-inner">
                    {e.created_at && (
                      <div className="admin-list-card__body-section">
                        <span className="admin-list-card__body-label">Date added</span>
                        <p className="admin-list-card__body-content" style={{ marginBottom: 0 }}>{formatDate(e.created_at)}</p>
                      </div>
                    )}
                    {e.image && (
                      <div className="admin-list-card__body-section admin-list-card__image-wrap">
                        <span className="admin-list-card__body-label">Image</span>
                        <AdminImagePreview
                          src={`/uploads/${e.image}`}
                          alt={e.title}
                          thumbStyle={{ maxHeight: 120, width: 'auto', height: 120, objectFit: 'cover', borderRadius: 10 }}
                        />
                      </div>
                    )}
                    {e.subtitle && (
                      <div className="admin-list-card__body-section">
                        <span className="admin-list-card__body-label">Subtitle</span>
                        <p className="admin-list-card__body-content">{e.subtitle}</p>
                      </div>
                    )}
                    {(e.location || e.category) && (
                      <div className="admin-list-card__body-section">
                        <span className="admin-list-card__body-label">Location &amp; category</span>
                        <p className="admin-list-card__body-content">{[e.location, e.category].filter(Boolean).join(' · ') || '—'}</p>
                      </div>
                    )}
                    <div className="admin-list-card__body-section">
                      <span className="admin-list-card__body-label">Start – End</span>
                      <p className="admin-list-card__body-content">{formatDate(e.start_at)} – {formatDate(e.end_at)}</p>
                    </div>
                    {e.details && (
                      <div className="admin-list-card__body-section">
                        <span className="admin-list-card__body-label">Details</span>
                        <p className="admin-list-card__body-content">{e.details}</p>
                      </div>
                    )}
                    <div className="admin-list-card__actions">
                      <Link to={`/admin/events/${e.id}/edit`} className="btn btn-sm btn-outline-primary">
                        <Pencil size={16} className="me-1" aria-hidden />
                        Edit
                      </Link>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDelete(e.id)}
                        disabled={deletingId === e.id}
                      >
                        <Trash2 size={16} className="me-1" aria-hidden />
                        {deletingId === e.id ? 'Deleting…' : 'Delete'}
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
