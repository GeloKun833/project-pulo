import { useEffect, useRef, useState } from 'react'
import './App.css'
import { fetchAnnouncements, fetchServices, fetchEvents } from './pages/admin/apiClient'
import type { Announcement, Service, EventItem } from './pages/admin/apiClient'

function useSectionVisibility(sectionCount: number) {
  const [visible, setVisible] = useState<Set<number>>(new Set())
  const refs = useRef<(HTMLElement | null)[]>([])

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

  const setRef = (index: number) => (el: HTMLElement | null) => {
    refs.current[index] = el
  }
  return { setRef, isVisible: (i: number) => visible.has(i) }
}

function App() {
  const SECTION_COUNT = 3
  const { setRef, isVisible } = useSectionVisibility(SECTION_COUNT)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false)
  const [announcementsError, setAnnouncementsError] = useState<string | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loadingServices, setLoadingServices] = useState(false)
  const [servicesError, setServicesError] = useState<string | null>(null)
  const [events, setEvents] = useState<EventItem[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [eventsError, setEventsError] = useState<string | null>(null)

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
        <div className="hero__bg" aria-hidden="true" />
        <div className="hero__parallax" aria-hidden="true">
          <div className="hero__parallax-layer" />
          <div className="hero__parallax-layer" />
          <div className="hero__parallax-layer" />
        </div>
        <div className="hero__silhouettes" aria-hidden="true" />

        <div className="hero__content">
          <div className="hero__heart-wrap" aria-hidden="true">
            <span className="hero__heart" role="img" aria-label="Heart">❤️</span>
          </div>
          <h1 className="hero__title">I ❤️ PULO</h1>
          <div className="hero__support">
            <span className="hero__line">Your barangay. Your community. Your home.</span>
            <span className="hero__line">Official information, announcements, and services.</span>
            <span className="hero__line">Together we build a better Pulo.</span>
          </div>
          <div className="hero__actions">
            <a href="#services" className="hero__btn hero__btn--primary">View services</a>
            <a href="#announcements" className="hero__btn hero__btn--secondary">Latest announcements</a>
            <a href="/events" className="hero__btn hero__btn--secondary">Upcoming events</a>
          </div>
        </div>
      </header>

      <section
        id="services"
        className={`section section--services ${isVisible(0) ? 'is-visible' : ''}`}
        ref={setRef(0)}
        data-section-index={0}
        aria-labelledby="services-heading"
      >
        <div className="section__inner">
          <h2 id="services-heading" className="section__title">Services</h2>
          <p className="section__lead">Official barangay services. Clear, reliable, easy to find.</p>
          <div className="news-layout">
            <div className="news-layout__tabs" role="tablist" aria-label="Filter services">
              <button type="button" className="news-layout__tab news-layout__tab--active" role="tab" aria-selected="true">Latest</button>
              <span className="news-layout__tab-divider" aria-hidden="true" />
              <button type="button" className="news-layout__tab" role="tab" aria-selected="false">Most popular</button>
            </div>
            <div className="news-layout__body">
              <div className="news-layout__main">
                {loadingServices && <p>Loading services…</p>}
                {servicesError && !loadingServices && (
                  <p className="text-error">Failed to load services: {servicesError}</p>
                )}
                {!loadingServices && !servicesError && (services ?? []).length === 0 && (
                  <p>No services yet.</p>
                )}
                {!loadingServices && !servicesError && (services ?? []).length > 0 && (
                  <>
                    <article className="news-featured">
                      <div className="news-featured__media">
                        {(services ?? [])[0].image ? (
                          <img
                            src={`/uploads/${(services ?? [])[0].image}`}
                            alt={(services ?? [])[0].title}
                            className="news-featured__image"
                          />
                        ) : (
                          <div className="news-featured__image news-featured__image--services" aria-hidden="true" />
                        )}
                      </div>
                      <span className="news-featured__label">Featured</span>
                      <h3 className="news-featured__title">{(services ?? [])[0].title}</h3>
                      <p className="news-featured__lead">{(services ?? [])[0].description}</p>
                      <p className="news-featured__meta">Barangay services</p>
                    </article>
                    <div className="news-secondaries">
                      {(services ?? []).slice(1, 3).map((s) => (
                        <article key={s.id} className="news-secondary">
                          <div className="news-secondary__media">
                            {s.image ? (
                              <img
                                src={`/uploads/${s.image}`}
                                alt={s.title}
                                className="news-secondary__image"
                              />
                            ) : (
                              <div className="news-secondary__image news-secondary__image--health" aria-hidden="true" />
                            )}
                          </div>
                          <span className="news-secondary__label">Service</span>
                          <h4 className="news-secondary__title">{s.title}</h4>
                          <p className="news-secondary__meta">{s.description.slice(0, 60)}{s.description.length > 60 ? '…' : ''}</p>
                        </article>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <aside className="news-layout__sidebar" aria-label="All services">
                <h3 className="news-sidebar__title">All services</h3>
                <ul className="news-sidebar__list">
                  {(services ?? []).slice(0, 6).map((s) => (
                    <li key={s.id}>
                      <a href="#services">
                        {s.title}
                        <span className="news-sidebar__by">Barangay</span>
                      </a>
                    </li>
                  ))}
                  {(services ?? []).length === 0 && !loadingServices && (
                    <li><span className="text-muted">No services yet.</span></li>
                  )}
                </ul>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section
        id="announcements"
        className={`section section--announcements ${isVisible(1) ? 'is-visible' : ''}`}
        ref={setRef(1)}
        data-section-index={1}
        aria-labelledby="announcements-heading"
      >
        <div className="section__inner">
          <h2 id="announcements-heading" className="section__title">Announcements</h2>
          <p className="section__lead">Latest updates and public notices from Barangay Pulo.</p>
          <div className="news-layout">
            <div className="news-layout__tabs" role="tablist" aria-label="Filter announcements">
              <button
                type="button"
                className="news-layout__tab news-layout__tab--active"
                role="tab"
                aria-selected="true"
              >
                Latest
              </button>
            </div>
            <div className="news-layout__body">
              <div className="news-layout__main">
                {loadingAnnouncements && <p>Loading announcements…</p>}
                {announcementsError && !loadingAnnouncements && (
                  <p className="text-error">Failed to load announcements: {announcementsError}</p>
                )}
                {!loadingAnnouncements && !announcementsError && (announcements ?? []).length === 0 && (
                  <p>No announcements yet.</p>
                )}
                {!loadingAnnouncements && !announcementsError && (announcements ?? []).length > 0 && (
                  <>
                    <article className="news-featured news-featured--urgent">
                      <div className="news-featured__media">
                        {(announcements ?? [])[0].image ? (
                          <img
                            src={`/uploads/${(announcements ?? [])[0].image}`}
                            alt={(announcements ?? [])[0].title}
                            className="news-featured__image"
                          />
                        ) : (
                          <div className="news-featured__image news-featured__image--assembly" aria-hidden="true" />
                        )}
                      </div>
                      <span className="news-featured__label">Latest</span>
                      <h3 className="news-featured__title">{(announcements ?? [])[0].title}</h3>
                      <p className="news-featured__lead">{(announcements ?? [])[0].description}</p>
                      <p className="news-featured__meta">
                        {new Date((announcements ?? [])[0].date_posted).toLocaleString()}
                      </p>
                    </article>
                    <div className="news-secondaries">
                      {(announcements ?? []).slice(1, 3).map((a) => (
                        <article key={a.id} className="news-secondary">
                          <div className="news-secondary__media">
                            {a.image ? (
                              <img
                                src={`/uploads/${a.image}`}
                                alt={a.title}
                                className="news-secondary__image"
                              />
                            ) : (
                              <div
                                className="news-secondary__image news-secondary__image--id"
                                aria-hidden="true"
                              />
                            )}
                          </div>
                          <span className="news-secondary__label">Announcement</span>
                          <h4 className="news-secondary__title">{a.title}</h4>
                          <p className="news-secondary__meta">
                            {new Date(a.date_posted).toLocaleDateString()}
                          </p>
                        </article>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <aside className="news-layout__sidebar" aria-label="All announcements">
                <h3 className="news-sidebar__title">All announcements</h3>
                <ul className="news-sidebar__list">
                  {(announcements ?? []).slice(0, 6).map((a) => (
                    <li key={a.id}>
                      <a href="#announcements">
                        {a.title}{' '}
                        <span className="news-sidebar__by">
                          {new Date(a.date_posted).toLocaleDateString()}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section
        id="trends"
        className={`section section--trends ${isVisible(2) ? 'is-visible' : ''}`}
        ref={setRef(2)}
        data-section-index={2}
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

      <footer className="footer">
        <p>Barangay Pulo — I ❤️ PULO</p>
        <p>For inquiries, visit the <a href="/contact">Contact</a> page or the barangay hall.</p>
      </footer>
    </div>
  )
}

export default App
