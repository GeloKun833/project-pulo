import { useEffect, useState } from 'react'
import { Spinner, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { Megaphone, Wrench, Calendar, Pencil, ArrowRight, MapPin, Clock } from 'lucide-react'
import AdminImagePreview from './AdminImagePreview'
import { fetchAnnouncements, fetchServices, fetchEvents } from './apiClient'
import type { Announcement, Service, EventItem } from './apiClient'

const RECENT_ANNOUNCEMENTS = 2
const RECENT_SERVICES = 8
const RECENT_EVENTS = 5

export default function AdminDashboard() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [ann, svc, evt] = await Promise.all([
          fetchAnnouncements(),
          fetchServices(),
          fetchEvents(),
        ])
        setAnnouncements(Array.isArray(ann) ? ann : [])
        setServices(Array.isArray(svc) ? svc : [])
        setEvents(Array.isArray(evt) ? evt : [])
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const recentAnnouncements = (announcements ?? []).slice(0, RECENT_ANNOUNCEMENTS)
  const recentServices = (services ?? []).slice(0, RECENT_SERVICES)
  const recentEvents = (events ?? []).slice(0, RECENT_EVENTS)

  const formatDate = (s: string | null) => (s ? new Date(s).toLocaleString() : '—')
  const formatDateShort = (s: string | null) => (s ? new Date(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—')
  const formatTime = (s: string | null) => (s ? new Date(s).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '—')

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard__hero">
        <h1 className="admin-dashboard__title">Dashboard</h1>
        <p className="admin-dashboard__subtitle">
          Overview of your content and recent activity.
        </p>
      </header>

      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="admin-loading">
          <Spinner animation="border" />
          <span>Loading…</span>
        </div>
      ) : (
        <>
          <section className="admin-dashboard__metrics" aria-label="Content counts">
            <div className="admin-metric-cards">
              <div className="admin-metric-card">
                <div className="admin-metric-card__row">
                  <div className="admin-metric-card__icon admin-metric-card__icon--coral">
                    <Megaphone size={22} aria-hidden />
                  </div>
                  <div className="admin-metric-card__value">{announcements.length}</div>
                </div>
                <div className="admin-metric-card__label">Announcements</div>
              </div>
              <div className="admin-metric-card">
                <div className="admin-metric-card__row">
                  <div className="admin-metric-card__icon admin-metric-card__icon--navy">
                    <Wrench size={22} aria-hidden />
                  </div>
                  <div className="admin-metric-card__value">{services.length}</div>
                </div>
                <div className="admin-metric-card__label">Services</div>
              </div>
              <div className="admin-metric-card">
                <div className="admin-metric-card__row">
                  <div className="admin-metric-card__icon admin-metric-card__icon--plum">
                    <Calendar size={22} aria-hidden />
                  </div>
                  <div className="admin-metric-card__value">{events.length}</div>
                </div>
                <div className="admin-metric-card__label">Events</div>
              </div>
            </div>
          </section>

          <section className="admin-dashboard__recent">
            <div className="admin-dashboard__section">
              <div className="admin-dashboard__section-header">
                <div className="admin-dashboard__section-heading">
                  <div className="admin-dashboard__section-icon admin-dashboard__section-icon--coral">
                    <Megaphone size={20} aria-hidden />
                  </div>
                  <h2 className="admin-dashboard__section-title">Recent announcements</h2>
                </div>
                <Link to="/admin/announcements" className="admin-dashboard__view-all">
                  View all
                  <ArrowRight size={16} aria-hidden />
                </Link>
              </div>
              <div className="admin-dashboard-posts">
                {recentAnnouncements.length === 0 ? (
                  <div className="admin-dashboard__empty">No announcements yet.</div>
                ) : (
                  recentAnnouncements.map((a) => (
                    <article key={a.id} className="admin-post">
                      <div className="admin-post__media">
                        {a.image ? (
                          <AdminImagePreview
                            src={`/uploads/${a.image}`}
                            alt={a.title}
                            thumbStyle={{ width: '100%', height: '100%', minHeight: 140, objectFit: 'cover', borderRadius: '12px 0 0 12px' }}
                          />
                        ) : (
                          <div className="admin-post__media-placeholder" aria-hidden>
                            <Megaphone size={32} />
                          </div>
                        )}
                      </div>
                      <div className="admin-post__body">
                        <h3 className="admin-post__title">{a.title}</h3>
                        <div className="admin-post__content">
                          {a.description || 'No description.'}
                        </div>
                        <time className="admin-post__date" dateTime={a.date_posted}>
                          Posted {formatDateShort(a.date_posted)}
                        </time>
                        <Link to={`/admin/announcements/${a.id}/edit`} className="admin-post__action">
                          <Pencil size={16} aria-hidden />
                          Edit post
                        </Link>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>

            <div className="admin-dashboard__section">
              <div className="admin-dashboard__section-header">
                <div className="admin-dashboard__section-heading">
                  <div className="admin-dashboard__section-icon admin-dashboard__section-icon--navy">
                    <Wrench size={20} aria-hidden />
                  </div>
                  <h2 className="admin-dashboard__section-title">Recent services</h2>
                </div>
                <Link to="/admin/services" className="admin-dashboard__view-all">
                  View all
                  <ArrowRight size={16} aria-hidden />
                </Link>
              </div>
              <div className="admin-dashboard-services">
                {recentServices.length === 0 ? (
                  <div className="admin-dashboard__empty">No services yet.</div>
                ) : (
                  <div className="admin-service-carousel" role="list">
                    {recentServices.map((s) => (
                      <div key={s.id} className="admin-service-card" role="listitem">
                        <div className="admin-service-card__thumb">
                          {s.image ? (
                            <AdminImagePreview
                              src={`/uploads/${s.image}`}
                              alt={s.title}
                              thumbStyle={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: '12px 12px 0 0' }}
                            />
                          ) : (
                            <div className="admin-service-card__thumb-placeholder">
                              <Wrench size={36} aria-hidden />
                            </div>
                          )}
                        </div>
                        <div className="admin-service-card__main">
                          <h3 className="admin-service-card__title">{s.title}</h3>
                          <p className="admin-service-card__desc">
                            {s.description?.slice(0, 100)}{s.description && s.description.length > 100 ? '…' : ''}
                            {!s.description && 'No description'}
                          </p>
                          <Link to={`/admin/services/${s.id}/edit`} className="admin-service-card__action">
                            <Pencil size={14} aria-hidden />
                            Edit
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="admin-dashboard__section">
              <div className="admin-dashboard__section-header">
                <div className="admin-dashboard__section-heading">
                  <div className="admin-dashboard__section-icon admin-dashboard__section-icon--plum">
                    <Calendar size={20} aria-hidden />
                  </div>
                  <h2 className="admin-dashboard__section-title">Recent events</h2>
                </div>
                <Link to="/admin/events" className="admin-dashboard__view-all">
                  View all
                  <ArrowRight size={16} aria-hidden />
                </Link>
              </div>
              <div className="admin-dashboard-events">
                {recentEvents.length === 0 ? (
                  <div className="admin-dashboard__empty">No events yet.</div>
                ) : (
                  recentEvents.map((e) => (
                    <div key={e.id} className="admin-event-card">
                      <div className="admin-event-card__date-strip">
                        <span className="admin-event-card__date-day">
                          {e.start_at ? new Date(e.start_at).getDate() : '—'}
                        </span>
                        <span className="admin-event-card__date-month">
                          {e.start_at ? new Date(e.start_at).toLocaleDateString(undefined, { month: 'short' }) : '—'}
                        </span>
                      </div>
                      <div className="admin-event-card__main">
                        {e.image && (
                          <div className="admin-event-card__thumb">
                            <AdminImagePreview
                              src={`/uploads/${e.image}`}
                              alt={e.title}
                              thumbStyle={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 10 }}
                            />
                          </div>
                        )}
                        <div className="admin-event-card__content">
                          <h3 className="admin-event-card__title">{e.title}</h3>
                          {e.subtitle && <p className="admin-event-card__subtitle">{e.subtitle}</p>}
                          {(e.location || e.category) && (
                            <p className="admin-event-card__meta">
                              <MapPin size={14} aria-hidden />
                              {[e.location, e.category].filter(Boolean).join(' · ') || '—'}
                            </p>
                          )}
                          <p className="admin-event-card__time">
                            <Clock size={14} aria-hidden />
                            {formatTime(e.start_at)} – {formatTime(e.end_at)}
                          </p>
                          <Link to={`/admin/events/${e.id}/edit`} className="admin-event-card__action">
                            <Pencil size={14} aria-hidden />
                            Edit event
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
