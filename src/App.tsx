import { useEffect, useRef, useState } from 'react'
import { BadgeCheck, Briefcase, Building2, FileText, HandHeart, Heart, HeartPulse, Home, MapPin, Shield, X } from 'lucide-react'
import './App.css'
import { fetchAnnouncements, fetchServices, fetchEvents } from './pages/admin/apiClient'
import type { Announcement, Service, EventItem } from './pages/admin/apiClient'

type DetailModalItem =
  | { type: 'service'; item: Service }
  | { type: 'announcement'; item: Announcement }

function DetailModal({
  data,
  onClose,
}: {
  data: DetailModalItem
  onClose: () => void
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

  const title = data.item.title
  const description = data.type === 'service' ? data.item.description : data.item.description
  const image = data.item.image
  const date = data.type === 'announcement' ? data.item.date_posted : null
  const label = data.type === 'service' ? 'Service' : 'Announcement'

  return (
    <div className="detail-modal__backdrop" onClick={onClose} aria-modal="true" role="dialog" aria-labelledby="detail-modal-title">
      <div className="detail-modal__dialog" onClick={(e) => e.stopPropagation()}>
        <div className="detail-modal__header">
          <span className="detail-modal__label">{label}</span>
          <h2 id="detail-modal-title" className="detail-modal__title">{title}</h2>
          <button
            type="button"
            className="detail-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>
        <div className="detail-modal__body">
          {image && (
            <div className="detail-modal__media">
              <img src={`/uploads/${image}`} alt="" className="detail-modal__image" />
            </div>
          )}
          {date && (
            <p className="detail-modal__date">
              Posted {new Date(date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          )}
          <div className="detail-modal__description">{description}</div>
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

const SECTION_HASHES = ['announcements', 'services', 'issuances', 'trends'] as const

const BARANGAY_ISSUANCES = [
  { id: 'residency', label: 'Residency', icon: Home },
  { id: 'solo-parent', label: 'Solo Parent', icon: Heart },
  { id: 'first-time-job-seeker', label: 'First Time Job Seeker', icon: Briefcase },
  { id: 'closure', label: 'Closure', icon: FileText },
  { id: 'live-in-certification', label: 'Live-in Certification', icon: MapPin },
  { id: 'guardianship', label: 'Guardianship', icon: Shield },
  { id: 'indigency-medical-burial', label: 'Indigency (Medical/Burial Assistance)', icon: HeartPulse },
  { id: 'indigency', label: 'Indigency', icon: HandHeart },
  { id: 'brgy-clearance', label: 'Barangay Clearance', icon: BadgeCheck },
] as const

function useSectionVisibility(sectionCount: number) {
  const [visible, setVisible] = useState<Set<number>>(new Set())
  const refs = useRef<(HTMLElement | null)[]>([])
  const ignoreScrollSpyUntil = useRef(0)

  useEffect(() => {
    const observers = refs.current
      .filter(Boolean)
      .map((el) => {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              const index = Number((entry.target as HTMLElement).dataset.sectionIndex)
              if (entry.isIntersecting) setVisible((prev) => new Set(prev).add(index))
            })
          },
          { rootMargin: '0px 0px -12% 0px', threshold: 0 }
        )
        if (el) observer.observe(el)
        return observer
      })
    return () => observers.forEach((o) => o.disconnect())
  }, [sectionCount])

  /* When navigating from another page to a hash, don’t let scroll-spy overwrite it until scroll completes */
  useEffect(() => {
    const handler = () => {
      ignoreScrollSpyUntil.current = Date.now() + 2000
    }
    window.addEventListener('hash-navigation-scroll', handler)
    return () => window.removeEventListener('hash-navigation-scroll', handler)
  }, [])

  /* Scroll-spy: update hash so nav reflects current section when scrolling */
  useEffect(() => {
    const viewportY = 120
    let tick: number | null = null
    const update = () => {
      tick = null
      if (Date.now() < ignoreScrollSpyUntil.current) return
      const refsList = refs.current
      let currentIndex = -1
      for (let i = 0; i < refsList.length; i++) {
        const el = refsList[i]
        if (!el) continue
        const rect = el.getBoundingClientRect()
        if (rect.top <= viewportY && rect.bottom >= viewportY) currentIndex = i
      }
      if (currentIndex === -1) {
        const firstBelow = refsList.findIndex((el) => el && el.getBoundingClientRect().top > viewportY)
        if (firstBelow === -1) currentIndex = refsList.length - 1
        else if (firstBelow > 0) currentIndex = firstBelow - 1
      }
      const hash = currentIndex >= 0 && currentIndex < SECTION_HASHES.length ? `#${SECTION_HASHES[currentIndex]}` : ''
      const path = window.location.pathname + hash
      if (window.location.pathname + window.location.hash !== path) {
        window.history.replaceState(null, '', path)
        window.dispatchEvent(new CustomEvent('nav-hash-change', { detail: { hash } }))
      }
    }
    const onScroll = () => {
      if (tick === null) tick = window.requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (tick !== null) cancelAnimationFrame(tick)
    }
  }, [sectionCount])

  const setRef = (index: number) => (el: HTMLElement | null) => {
    refs.current[index] = el
  }
  return { setRef, isVisible: (i: number) => visible.has(i) }
}

const HERO_IMAGES = [
  '/hero/hero-1.jpg',
  '/hero/hero-2.jpg',
  '/hero/hero-3.jpg',
]

const HERO_CAROUSEL_INTERVAL_MS = 5000

function App() {
  const SECTION_COUNT = 4
  const { setRef, isVisible } = useSectionVisibility(SECTION_COUNT)
  const [heroIndex, setHeroIndex] = useState(0)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false)
  const [announcementsError, setAnnouncementsError] = useState<string | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loadingServices, setLoadingServices] = useState(false)
  const [servicesError, setServicesError] = useState<string | null>(null)
  const [events, setEvents] = useState<EventItem[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [eventsError, setEventsError] = useState<string | null>(null)
  const [detailModal, setDetailModal] = useState<DetailModalItem | null>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion || HERO_IMAGES.length <= 1) return
    const id = setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_IMAGES.length)
    }, HERO_CAROUSEL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  /** Scroll only the horizontal cards strip to show the card; no page scroll. Optionally highlight the card briefly. */
  function scrollCardIntoView(id: string, highlight = false) {
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

  function handleSidebarCardClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault()
    scrollCardIntoView(id, true)
    window.history.replaceState(null, '', window.location.pathname + window.location.search + '#' + id)
  }

  useEffect(() => {
    const scrollToCard = () => {
      const hash = window.location.hash
      if (!hash || hash.length < 2) return
      const id = hash.slice(1)
      if (id.startsWith('service-') || id.startsWith('announcement-')) scrollCardIntoView(id)
    }
    scrollToCard()
    window.addEventListener('hashchange', scrollToCard)
    return () => window.removeEventListener('hashchange', scrollToCard)
  }, [services, announcements])

  useEffect(() => {
    const load = async () => {
      setLoadingAnnouncements(true)
      setAnnouncementsError(null)
      try {
        const data = await fetchAnnouncements()
        setAnnouncements(Array.isArray(data) ? data : [])
      } catch (err) {
        setAnnouncementsError((err as Error).message)
      } finally {
        setLoadingAnnouncements(false)
      }
    }
    void load()
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoadingServices(true)
      setServicesError(null)
      try {
        const data = await fetchServices()
        setServices(Array.isArray(data) ? data : [])
      } catch (err) {
        setServicesError((err as Error).message)
      } finally {
        setLoadingServices(false)
      }
    }
    void load()
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoadingEvents(true)
      setEventsError(null)
      try {
        const data = await fetchEvents()
        setEvents(Array.isArray(data) ? data : [])
      } catch (err) {
        setEventsError((err as Error).message)
      } finally {
        setLoadingEvents(false)
      }
    }
    void load()
  }, [])

  return (
    <div className="app">
      <header className="hero">
        <div className="hero__bg" aria-hidden="true">
          {HERO_IMAGES.map((src, i) => (
            <div
              key={src}
              className={`hero__bg-slide${i === heroIndex ? ' hero__bg-slide--active' : ''}`}
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
          <div className="hero__bg-overlay" aria-hidden="true" />
        </div>
        <div className="hero__content">
          <div className="hero__brand" aria-hidden="true">
            <Building2 size={48} strokeWidth={2} />
          </div>
          <h1 className="hero__title">Barangay Pulo</h1>
          <p className="hero__tagline">Official information, announcements, and services.</p>
          <div className="hero__actions">
            <a href="#announcements" className="hero__btn hero__btn--primary">Announcements</a>
            <a href="#services" className="hero__btn hero__btn--secondary">Services</a>
            <a href="/events" className="hero__btn hero__btn--secondary">Events</a>
            <a href="/contact" className="hero__btn hero__btn--secondary">Contact</a>
          </div>
        </div>
      </header>

      <section
        id="announcements"
        className={`section section--announcements ${isVisible(0) ? 'is-visible' : ''}`}
        ref={setRef(0)}
        data-section-index={0}
        aria-labelledby="announcements-heading"
      >
        <div className="section__inner">
          <h2 id="announcements-heading" className="section__title">Latest Announcements</h2>
          <p className="section__lead">Most recent updates and public notices from Barangay Pulo.</p>
          {loadingAnnouncements && <p className="cards-scroll__loading">Loading announcements…</p>}
          {announcementsError && !loadingAnnouncements && (
            <p className="text-error">Failed to load announcements: {announcementsError}</p>
          )}
          {!loadingAnnouncements && !announcementsError && (announcements ?? []).length === 0 && (
            <p className="cards-scroll__empty">No announcements yet.</p>
          )}
          {!loadingAnnouncements && !announcementsError && (announcements ?? []).length > 0 && (() => {
            const sorted = [...(announcements ?? [])].sort((a, b) => new Date(b.date_posted).getTime() - new Date(a.date_posted).getTime())
            const featured = sorted[0]
            const rest = sorted.slice(1)
            return (
              <>
                <section className="section-featured" id={`announcement-${featured.id}`} aria-labelledby="announcements-featured-title">
                  <span className="section-featured__tag">Most recent</span>
                  <h3 id="announcements-featured-title" className="section-featured__title">
                    <button
                      type="button"
                      className="section-featured__title-btn"
                      onClick={() => setDetailModal({ type: 'announcement', item: featured })}
                    >
                      {featured.title}
                    </button>
                  </h3>
                  <div className="section-featured__body">
                    <button
                      type="button"
                      className="section-featured__media section-featured__media--clickable"
                      onClick={() => setDetailModal({ type: 'announcement', item: featured })}
                      aria-label={`View details: ${featured.title}`}
                    >
                      {featured.image ? (
                        <img src={`/uploads/${featured.image}`} alt="" className="section-featured__image" />
                      ) : (
                        <div className="section-featured__image" style={{ background: 'linear-gradient(135deg, var(--color-rose) 0%, var(--color-rose-soft) 100%)' }} aria-hidden="true" />
                      )}
                      <div className="section-featured__overlay">
                        <span className="section-featured__overlay-title">{featured.title}</span>
                        <span className="section-featured__overlay-meta">
                          Posted {new Date(featured.date_posted).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </span>
                      </div>
                    </button>
                    <div className="section-featured__details">
                      <dl className="section-featured__list">
                        <div>
                          <dt>Posted</dt>
                          <dd>{new Date(featured.date_posted).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</dd>
                        </div>
                        <div>
                          <dt>Summary</dt>
                          <dd>{featured.description.slice(0, 200)}{featured.description.length > 200 ? '…' : ''}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </section>
                <div className="section-more">
                  <h4 className="section-more__title">More announcements</h4>
                  <div className="news-layout news-layout--cards-scroll">
                    <div className="news-layout__body">
                      <div className="cards-scroll-wrap" role="list">
                        {rest.map((a) => (
                          <article
                            key={a.id}
                            id={`announcement-${a.id}`}
                            className="content-card content-card--announcement"
                            role="listitem"
                          >
                            <button
                              type="button"
                              className="content-card__media content-card__media--clickable"
                              onClick={() => setDetailModal({ type: 'announcement', item: a })}
                              aria-label={`View details: ${a.title}`}
                            >
                              {a.image ? (
                                <img src={`/uploads/${a.image}`} alt="" className="content-card__image" />
                              ) : (
                                <div className="content-card__image content-card__image--announcement" aria-hidden="true" />
                              )}
                            </button>
                            <span className="content-card__label">Announcement</span>
                            <h3 className="content-card__title">
                              <button type="button" className="content-card__title-btn" onClick={() => setDetailModal({ type: 'announcement', item: a })}>
                                {a.title}
                              </button>
                            </h3>
                            <p className="content-card__meta">{new Date(a.date_posted).toLocaleDateString()}</p>
                          </article>
                        ))}
                      </div>
                      <aside className="news-layout__sidebar" aria-label="All announcements">
                        <h3 className="news-sidebar__title">All announcements</h3>
                        <ul className="news-sidebar__list">
                          {sorted.map((a) => (
                            <li key={a.id}>
                              <a href={`#announcement-${a.id}`} onClick={(e) => handleSidebarCardClick(e, `announcement-${a.id}`)}>
                                {a.title}
                                <span className="news-sidebar__by">{new Date(a.date_posted).toLocaleDateString()}</span>
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
      </section>

      <section
        id="services"
        className={`section section--services ${isVisible(1) ? 'is-visible' : ''}`}
        ref={setRef(1)}
        data-section-index={1}
        aria-labelledby="services-heading"
      >
        <div className="section__inner">
          <h2 id="services-heading" className="section__title">Services</h2>
          <p className="section__lead">Official barangay services. Clear, reliable, easy to find.</p>
          {loadingServices && <p className="cards-scroll__loading">Loading services…</p>}
          {servicesError && !loadingServices && (
            <p className="text-error">Failed to load services: {servicesError}</p>
          )}
          {!loadingServices && !servicesError && (services ?? []).length === 0 && (
            <p className="cards-scroll__empty">No services yet.</p>
          )}
          {!loadingServices && !servicesError && (services ?? []).length > 0 && (() => {
            const sorted = [...(services ?? [])].sort((a, b) => {
              const ta = a.created_at ? new Date(a.created_at).getTime() : 0
              const tb = b.created_at ? new Date(b.created_at).getTime() : 0
              return tb - ta
            })
            const featured = sorted[0]
            const rest = sorted.slice(1)
            return (
              <>
                <section className="section-featured" id={`service-${featured.id}`} aria-labelledby="services-featured-title">
                  <span className="section-featured__tag">Featured</span>
                  <h3 id="services-featured-title" className="section-featured__title">
                    <button
                      type="button"
                      className="section-featured__title-btn"
                      onClick={() => setDetailModal({ type: 'service', item: featured })}
                    >
                      {featured.title}
                    </button>
                  </h3>
                  <div className="section-featured__body">
                    <button
                      type="button"
                      className="section-featured__media section-featured__media--clickable"
                      onClick={() => setDetailModal({ type: 'service', item: featured })}
                      aria-label={`View details: ${featured.title}`}
                    >
                      {featured.image ? (
                        <img src={`/uploads/${featured.image}`} alt="" className="section-featured__image" />
                      ) : (
                        <div className="section-featured__image" style={{ background: 'linear-gradient(135deg, var(--color-plum) 0%, var(--color-navy) 100%)' }} aria-hidden="true" />
                      )}
                      <div className="section-featured__overlay">
                        <span className="section-featured__overlay-title">{featured.title}</span>
                        <span className="section-featured__overlay-meta">
                          {featured.created_at ? new Date(featured.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Barangay service'}
                        </span>
                      </div>
                    </button>
                    <div className="section-featured__details">
                      <dl className="section-featured__list">
                        {featured.created_at && (
                          <div>
                            <dt>Added</dt>
                            <dd>{new Date(featured.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</dd>
                          </div>
                        )}
                        <div>
                          <dt>Summary</dt>
                          <dd>{featured.description.slice(0, 200)}{featured.description.length > 200 ? '…' : ''}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </section>
                <div className="section-more">
                  <h4 className="section-more__title">More services</h4>
                  <div className="news-layout news-layout--cards-scroll">
                    <div className="news-layout__body">
                      <div className="cards-scroll-wrap" role="list">
                        {rest.map((s) => (
                          <article
                            key={s.id}
                            id={`service-${s.id}`}
                            className="content-card content-card--service"
                            role="listitem"
                          >
                            <button
                              type="button"
                              className="content-card__media content-card__media--clickable"
                              onClick={() => setDetailModal({ type: 'service', item: s })}
                              aria-label={`View details: ${s.title}`}
                            >
                              {s.image ? (
                                <img src={`/uploads/${s.image}`} alt="" className="content-card__image" />
                              ) : (
                                <div className="content-card__image content-card__image--service" aria-hidden="true" />
                              )}
                            </button>
                            <span className="content-card__label">Service</span>
                            <h3 className="content-card__title">
                              <button type="button" className="content-card__title-btn" onClick={() => setDetailModal({ type: 'service', item: s })}>
                                {s.title}
                              </button>
                            </h3>
                            <p className="content-card__meta">{s.created_at ? new Date(s.created_at).toLocaleDateString() : ''}</p>
                          </article>
                        ))}
                      </div>
                      <aside className="news-layout__sidebar" aria-label="All services">
                        <h3 className="news-sidebar__title">All services</h3>
                        <ul className="news-sidebar__list">
                          {sorted.map((s) => (
                            <li key={s.id}>
                              <a href={`#service-${s.id}`} onClick={(e) => handleSidebarCardClick(e, `service-${s.id}`)}>
                                {s.title}
                                <span className="news-sidebar__by">Barangay</span>
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
      </section>

      <section
        id="issuances"
        className={`section section--issuances ${isVisible(2) ? 'is-visible' : ''}`}
        ref={setRef(2)}
        data-section-index={2}
        aria-labelledby="issuances-heading"
      >
        <div className="section__inner">
          <h2 id="issuances-heading" className="section__title">Barangay Issuances</h2>
          <p className="section__lead">Certificates and clearances you can request from the barangay.</p>
          <div className="issuances-grid" role="list">
            {BARANGAY_ISSUANCES.map(({ id, label, icon: Icon }) => (
              <article key={id} className="issuance-card" role="listitem">
                <span className="issuance-card__icon" aria-hidden="true">
                  <Icon size={28} strokeWidth={2} />
                </span>
                <h3 className="issuance-card__title">{label}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="trends"
        className={`section section--trends ${isVisible(3) ? 'is-visible' : ''}`}
        ref={setRef(3)}
        data-section-index={3}
        aria-labelledby="trends-heading"
      >
        <div className="section__inner">
          <h2 id="trends-heading" className="section__title">Community at a glance</h2>
          <p className="section__lead">Our barangay in numbers. Active, growing, trusted.</p>
          <div className="trends">
            <div className="trends__stats">
              <div className="stat">
                <span className="stat__value">1,240</span>
                <span className="stat__label">Registered residents</span>
              </div>
              <div className="stat">
                <span className="stat__value">12</span>
                <span className="stat__label">Events this month</span>
              </div>
              <div className="stat">
                <span className="stat__value">98%</span>
                <span className="stat__label">Service satisfaction</span>
              </div>
            </div>
            <p className="trends__updated">
              <span className="trends__updated-label">Last updated</span>
              <time className="trends__updated-time" dateTime="2025-02-10">Feb 10, 2025</time>
            </p>
          </div>
        </div>
      </section>

      {detailModal && (
        <DetailModal data={detailModal} onClose={() => setDetailModal(null)} />
      )}
    </div>
  )
}

export default App
