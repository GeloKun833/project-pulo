import { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { fetchEvents } from './admin/apiClient'
import type { EventItem } from './admin/apiClient'
import './Events.css'

const imageClasses = ['events-past__image--1', 'events-past__image--2', 'events-past__image--3']

function formatEventDate(startAt: string | null, endAt: string | null): string {
  if (!startAt) return ''
  const start = new Date(startAt)
  if (!endAt) return start.toLocaleDateString(undefined, { dateStyle: 'medium' })
  const end = new Date(endAt)
  return `${start.toLocaleDateString(undefined, { dateStyle: 'medium' })} – ${end.toLocaleDateString(undefined, { dateStyle: 'medium' })}`
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

  const featured = (events ?? [])[0]
  const rest = (events ?? []).slice(1)

  return (
    <main className="events-page">
      <div className="events-container">
        {loading && <p className="events-loading">Loading events…</p>}
        {error && !loading && <p className="events-error">Failed to load events: {error}</p>}
        {!loading && !error && (events ?? []).length === 0 && (
          <p className="events-empty">No events scheduled yet. Check back later.</p>
        )}

        {!loading && !error && featured && (
          <section className="events-featured" aria-labelledby="featured-title">
            <span className="events-featured__tag">Featured</span>
            <h1 id="featured-title" className="events-featured__title">
              {featured.title}
            </h1>
            <div className="events-featured__body">
              <div className="events-featured__media">
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
              </div>
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
                      <dd>
                        {featured.details}
                        <button
                          type="button"
                          className="events-featured__read-more events-featured__read-more--btn"
                          onClick={() => setDetailsModalEvent(featured)}
                        >
                          Read more.
                        </button>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </section>
        )}

        {!loading && !error && rest.length > 0 && (
          <section className="events-past" aria-labelledby="past-events-title">
            <h2 id="past-events-title" className="events-past__title">More events</h2>
            <div className="events-past__grid">
              {rest.map((event, i) => (
                <article key={event.id} className="events-past__card">
                  {event.image ? (
                    <img
                      src={`/uploads/${event.image}`}
                      alt={event.title}
                      className={`events-past__image ${imageClasses[i % imageClasses.length]}`}
                    />
                  ) : (
                    <div className={`events-past__image ${imageClasses[i % imageClasses.length]}`} aria-hidden="true" />
                  )}
                  <span className="events-past__category">{event.category ?? 'Event'}</span>
                  <h3 className="events-past__card-title">{event.title}</h3>
                  <p className="events-past__card-info">
                    {formatEventDate(event.start_at, event.end_at)}
                    {event.location ? ` | ${event.location}` : ''}
                  </p>
                  <button
                    type="button"
                    className="events-past__read-more"
                    onClick={() => setDetailsModalEvent(event)}
                  >
                    Read more
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      <Modal
        show={detailsModalEvent !== null}
        onHide={() => setDetailsModalEvent(null)}
        size="lg"
        centered
        aria-labelledby="event-details-modal-title"
      >
        {detailsModalEvent && (
          <>
            <Modal.Header closeButton>
              <Modal.Title id="event-details-modal-title">{detailsModalEvent.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {detailsModalEvent.image && (
                <div className="mb-3">
                  <img
                    src={`/uploads/${detailsModalEvent.image}`}
                    alt={detailsModalEvent.title}
                    style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 8 }}
                  />
                </div>
              )}
              {detailsModalEvent.subtitle && (
                <p className="text-muted mb-2">{detailsModalEvent.subtitle}</p>
              )}
              {detailsModalEvent.category && (
                <p className="mb-2">
                  <strong>Category:</strong> {detailsModalEvent.category}
                </p>
              )}
              {(detailsModalEvent.start_at || detailsModalEvent.end_at) && (
                <p className="mb-2">
                  <strong>When:</strong> {formatEventDate(detailsModalEvent.start_at, detailsModalEvent.end_at)}
                </p>
              )}
              {detailsModalEvent.location && (
                <p className="mb-2">
                  <strong>Where:</strong> {detailsModalEvent.location}
                </p>
              )}
              {detailsModalEvent.details && (
                <p className="mb-0">{detailsModalEvent.details}</p>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setDetailsModalEvent(null)}>
                Close
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </main>
  )
}
