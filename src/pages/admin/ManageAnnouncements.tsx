import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Form, Spinner } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { Megaphone, Plus, Pencil, Trash2, ChevronDown, Search, Calendar } from 'lucide-react'
import AdminImagePreview from './AdminImagePreview'
import { deleteAnnouncement, fetchAnnouncements } from './apiClient'
import type { Announcement } from './apiClient'

function parseDateOnly(s: string): number | null {
  if (!s) return null
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d.getTime()
}

export default function ManageAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
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

  const filteredAnnouncements = useMemo(() => {
    let list = announcements ?? []
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.description || '').toLowerCase().includes(q)
      )
    }
    const dayStart = parseDateOnly(filterDate)
    if (dayStart != null) {
      const dayEnd = dayStart + 86400000
      list = list.filter((a) => {
        const posted = new Date(a.date_posted).getTime()
        return posted >= dayStart && posted < dayEnd
      })
    }
    return list
  }, [announcements, searchQuery, filterDate])

  return (
    <div>
      <div className="admin-toolbar">
        <h2 className="admin-page__title">
          <Megaphone size={28} className="me-2" style={{ verticalAlign: 'middle' }} aria-hidden />
          Manage Announcements
        </h2>
        <Link to="/admin/announcements/add" className="btn btn-primary admin-toolbar__add-btn">
          <Plus size={18} className="me-1" aria-hidden />
          <span className="admin-toolbar__add-btn-text--full">Add Announcement</span>
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
            aria-label="Filter by date posted"
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
          <span>Loading announcements…</span>
        </div>
      ) : (announcements ?? []).length === 0 ? (
        <div className="admin-list-card__empty">No announcements yet.</div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="admin-list-card__empty">No announcements match your search or date filter.</div>
      ) : (
        <div className="admin-list-cards">
          {filteredAnnouncements.map((a) => (
            <div
              key={a.id}
              className={`admin-list-card ${expandedId === a.id ? 'admin-list-card--open' : ''}`}
            >
              <button
                type="button"
                className="admin-list-card__header"
                onClick={() => toggleExpand(a.id)}
                aria-expanded={expandedId === a.id}
              >
                <div className="admin-list-card__icon admin-list-card__icon--coral">
                  <Megaphone size={24} aria-hidden />
                </div>
                <div className="admin-list-card__main">
                  <h3 className="admin-list-card__title">{a.title}</h3>
                  <p className="admin-list-card__date-added">Date added: {new Date(a.date_posted).toLocaleString()}</p>
                  <p className="admin-list-card__summary">
                    {a.description ? (a.description.length > 60 ? `${a.description.slice(0, 60)}…` : a.description) : 'No description'}
                  </p>
                </div>
                <ChevronDown size={22} className="admin-list-card__chevron" aria-hidden />
              </button>
              {expandedId === a.id && (
                <div className="admin-list-card__body">
                  <div className="admin-list-card__body-inner">
                    <div className="admin-list-card__body-section">
                      <span className="admin-list-card__body-label">Date added</span>
                      <p className="admin-list-card__body-content" style={{ marginBottom: 0 }}>{new Date(a.date_posted).toLocaleString()}</p>
                    </div>
                    {a.image && (
                      <div className="admin-list-card__body-section admin-list-card__image-wrap">
                        <span className="admin-list-card__body-label">Image</span>
                        <AdminImagePreview
                          src={`/uploads/${a.image}`}
                          alt={a.title}
                          thumbStyle={{ maxHeight: 120, width: 'auto', height: 120, objectFit: 'cover', borderRadius: 10 }}
                        />
                      </div>
                    )}
                    <div className="admin-list-card__body-section">
                      <span className="admin-list-card__body-label">Description</span>
                      <p className="admin-list-card__body-content">{a.description || '—'}</p>
                    </div>
                    <div className="admin-list-card__actions">
                      <Link to={`/admin/announcements/${a.id}/edit`} className="btn btn-sm btn-outline-primary">
                        <Pencil size={16} className="me-1" aria-hidden />
                        Edit
                      </Link>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline-danger"
                        disabled={deletingId === a.id}
                        onClick={() => void handleDelete(a.id)}
                      >
                        <Trash2 size={16} className="me-1" aria-hidden />
                        {deletingId === a.id ? 'Deleting…' : 'Delete'}
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
