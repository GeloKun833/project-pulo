import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { fetchEvents } from './admin/apiClient'
import type { EventItem } from './admin/apiClient'
import '../App.css'
import './Events.css'


function formatEventDate(startAt: string | null, endAt: string | null): string {
  if (!startAt) return ''
  const start = new Date(startAt)
  if (!endAt) return start.toLocaleDateString(undefined, { dateStyle: 'medium' })
  const end = new Date(endAt)
  return `${start.toLocaleDateString(undefined, { dateStyle: 'medium' })} – ${end.toLocaleDateString(undefined, { dateStyle: 'medium' })}`
}

function EventDetailModal({
  event,
  onClose,
  formatEventDate,
}: {
  event: EventItem
  onClose: () => void
  formatEventDate: (startAt: string | null, endAt: string | null) => string
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [])

  const whenStr = formatEventDate(event.start_at, event.end_at)

  return (
    <div
      className="detail-modal__backdrop"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="event-detail-modal-title"
    >
      <div className="detail-modal__dialog" onClick={(e) => e.stopPropagation()}>
        <div className="detail-modal__header">
          <span className="detail-modal__label">Event</span>
          <h2 id="event-detail-modal-title" className="detail-modal__title">
            {event.title}
          </h2>
          <button
            type="button"
            className="detail-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={24} aria-hidden />
          </button>
        </div>
        <div className="detail-modal__body">
          {event.image && (
            <div className="detail-modal__media">
              <img
                src={`/uploads/${event.image}`}
                alt=""
                className="detail-modal__image"
              />
            </div>
          )}
          {event.subtitle && (
            <p className="detail-modal__date" style={{ marginBottom: 'var(--space-sm)' }}>
              {event.subtitle}
            </p>
          )}
          {whenStr && (
            <p className="detail-modal__date">
              <strong>When:</strong> {whenStr}
            </p>
          )}
          {event.location && (
            <p className="detail-modal__date">
              <strong>Where:</strong> {event.location}
            </p>
          )}
          {event.category && (
            <p className="detail-modal__date">
              <strong>Category:</strong> {event.category}
            </p>
          )}
          {event.details && (
            <p className="detail-modal__date" style={{ marginTop: 'var(--space-md)' }}>
              <strong>Event details:</strong> {event.details}
            </p>
          )}
        </div>
        <div className="detail-modal__footer">
          <button type="button" className="detail-modal__btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Events() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detailsModalEvent, setDetailsModalEvent] = useState<EventItem | null>(null)

  useEffect(() => {
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
    void load()
  }, [])

  /** Scroll only the horizontal cards strip to show the card; no page scroll. Optionally highlight the card briefly. */
  function scrollEventCardIntoView(id: string, highlight = false) {
    const el = document.getElementById(id)
    if (!el) return
    const container = el.closest('.cards-scroll-wrap')
    if (!container) return
    const scrollLeft = Math.max(
      0,
      Math.min(
        el.offsetLeft - container.clientWidth / 2 + el.offsetWidth / 2,
        container.scrollWidth - container.clientWidth
      )
    )
    container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
    if (highlight) {
      el.classList.add('content-card--highlight')
      setTimeout(() => el.classList.remove('content-card--highlight'), 2000)
    }
  }

  function handleSidebarEventClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault()
    scrollEventCardIntoView(id, true)
    window.history.replaceState(null, '', window.location.pathname + '#' + id)
  }

  useEffect(() => {
    const scrollToCard = () => {
      const hash = window.location.hash
      if (!hash || !hash.startsWith('#event-')) return
      scrollEventCardIntoView(hash.slice(1))
    }
    scrollToCard()
    window.addEventListener('hashchange', scrollToCard)
    return () => window.removeEventListener('hashchange', scrollToCard)
  }, [events])

  return (
    <main className="events-page">
      <div className="events-container">
        <h1 className="events-page__title">Events</h1>
        <p className="events-page__lead">Upcoming and past events from Barangay Pulo.</p>

        {loading && <p className="events-loading">Loading events…</p>}
        {error && !loading && <p className="events-error">Failed to load events: {error}</p>}
        {!loading && !error && (events ?? []).length === 0 && (
          <p className="events-empty">No events scheduled yet. Check back later.</p>
        )}

        {!loading && !error && (events ?? []).length > 0 && (() => {
          const featured = (events ?? [])[0]
          const rest = (events ?? []).slice(1)
          return (
            <>
              {/* Big featured (most recent) event */}
              <section className="events-featured" id={`event-${featured.id}`} aria-labelledby="featured-event-title">
                <span className="events-featured__tag">Featured</span>
                <h2 id="featured-event-title" className="events-featured__title">
                  <button
                    type="button"
                    className="events-featured__title-btn"
                    onClick={() => setDetailsModalEvent(featured)}
                  >
                    {featured.title}
                  </button>
                </h2>
                <div className="events-featured__body">
                  <button
                    type="button"
                    className="events-featured__media events-featured__media--clickable"
                    onClick={() => setDetailsModalEvent(featured)}
                    aria-label={`View details: ${featured.title}`}
                  >
                    {featured.image ? (
                      <img
                        src={`/uploads/${featured.image}`}
                        alt={featured.title}
                        className="events-featured__image"
                      />
                    ) : (
                      <div className="events-featured__image" aria-hidden="true" />
                    )}
                    <div className="events-featured__overlay">
                      <span className="events-featured__overlay-title">{featured.title}</span>
                      <span className="events-featured__overlay-subtitle">{featured.subtitle ?? ''}</span>
                      <span className="events-featured__overlay-meta">
                        {formatEventDate(featured.start_at, featured.end_at)}
                        {featured.location ? ` / ${featured.location}` : ''}
                      </span>
                    </div>
                  </button>
                  <div className="events-featured__details">
                    <dl className="events-featured__list">
                      {(featured.start_at || featured.end_at) && (
                        <div>
                          <dt>When</dt>
                          <dd>{formatEventDate(featured.start_at, featured.end_at)}</dd>
                        </div>
                      )}
                      {featured.location && (
                        <div>
                          <dt>Where</dt>
                          <dd>{featured.location}</dd>
                        </div>
                      )}
                      {featured.details && (
                        <div>
                          <dt>Details</dt>
                          <dd>{featured.details}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>
              </section>

              {/* More events: horizontal scroll + All events sidebar */}
              <div className="events-more">
                <h3 className="events-more__title">More events</h3>
                <div className="news-layout news-layout--cards-scroll">
                  <div className="news-layout__body">
                    <div className="cards-scroll-wrap" role="list">
                      {rest.map((event) => (
                        <article
                          key={event.id}
                          id={`event-${event.id}`}
                          className="content-card content-card--event"
                          role="listitem"
                        >
                          <button
                            type="button"
                            className="content-card__media content-card__media--clickable"
                            onClick={() => setDetailsModalEvent(event)}
                            aria-label={`View details: ${event.title}`}
                          >
                            {event.image ? (
                              <img
                                src={`/uploads/${event.image}`}
                                alt=""
                                className="content-card__image"
                              />
                            ) : (
                              <div className="content-card__image content-card__image--event" aria-hidden="true" />
                            )}
                          </button>
                          <span className="content-card__label">Event</span>
                          <h3 className="content-card__title">
                            <button
                              type="button"
                              className="content-card__title-btn"
                              onClick={() => setDetailsModalEvent(event)}
                            >
                              {event.title}
                            </button>
                          </h3>
                          <p className="content-card__meta">
                            {formatEventDate(event.start_at, event.end_at)}
                          </p>
                        </article>
                      ))}
                    </div>
                    <aside className="news-layout__sidebar" aria-label="All events">
                      <h3 className="news-sidebar__title">All events</h3>
                      <ul className="news-sidebar__list">
                        {(events ?? []).map((event) => (
                          <li key={event.id}>
                            <a href={`#event-${event.id}`} onClick={(e) => handleSidebarEventClick(e, `event-${event.id}`)}>
                              {event.title}
                              <span className="news-sidebar__by">
                                {formatEventDate(event.start_at, event.end_at)}
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </aside>
                  </div>
                </div>
              </div>
            </>
          )
        })()}
      </div>

      {detailsModalEvent && (
        <EventDetailModal
          event={detailsModalEvent}
          onClose={() => setDetailsModalEvent(null)}
          formatEventDate={formatEventDate}
        />
      )}
    </main>
  )
}
