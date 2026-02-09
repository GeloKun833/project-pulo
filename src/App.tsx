import { useEffect, useRef, useState } from 'react'
import './App.css'

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
                <article className="news-featured">
                  <div className="news-featured__media">
                    <div className="news-featured__image news-featured__image--services" aria-hidden="true" />
                  </div>
                  <span className="news-featured__label">Featured</span>
                  <h3 className="news-featured__title">Certificates &amp; Documents</h3>
                  <p className="news-featured__lead">Request barangay clearance, residency, indigency, and other certifications. Office hours Mon–Fri, 8:00 AM – 5:00 PM. Bring valid ID and proof of residency.</p>
                  <p className="news-featured__meta">Barangay Office · Mon–Fri 8AM–5PM</p>
                </article>
                <div className="news-secondaries">
                  <article className="news-secondary">
                    <div className="news-secondary__media">
                      <div className="news-secondary__image news-secondary__image--health" aria-hidden="true" />
                    </div>
                    <span className="news-secondary__label">Health</span>
                    <h4 className="news-secondary__title">Health &amp; Social Services</h4>
                    <p className="news-secondary__meta">Barangay Health Center · Schedules</p>
                  </article>
                  <article className="news-secondary">
                    <div className="news-secondary__media">
                      <div className="news-secondary__image news-secondary__image--safety" aria-hidden="true" />
                    </div>
                    <span className="news-secondary__label">Safety</span>
                    <h4 className="news-secondary__title">Safety &amp; Security</h4>
                    <p className="news-secondary__meta">Tanod &amp; LGU · Report concerns</p>
                  </article>
                </div>
              </div>
              <aside className="news-layout__sidebar" aria-label="Recommended services">
                <h3 className="news-sidebar__title">Recommended</h3>
                <ul className="news-sidebar__list">
                  <li><a href="/contact">Barangay clearance and certifications <span className="news-sidebar__by">Office</span></a></li>
                  <li><a href="/contact">Senior &amp; PWD ID processing <span className="news-sidebar__by">Tues &amp; Thu</span></a></li>
                  <li><a href="/contact">Health center schedule and vaccination <span className="news-sidebar__by">Health</span></a></li>
                  <li><a href="/contact">Contact officials and tanod <span className="news-sidebar__by">Contact</span></a></li>
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
              <button type="button" className="news-layout__tab news-layout__tab--active" role="tab" aria-selected="true">Latest</button>
              <span className="news-layout__tab-divider" aria-hidden="true" />
              <button type="button" className="news-layout__tab" role="tab" aria-selected="false">Most popular</button>
            </div>
            <div className="news-layout__body">
              <div className="news-layout__main">
                <article className="news-featured news-featured--urgent">
                  <div className="news-featured__media">
                    <div className="news-featured__image news-featured__image--assembly" aria-hidden="true" />
                  </div>
                  <span className="news-featured__label">Urgent</span>
                  <h3 className="news-featured__title">Community Assembly This Saturday — All Residents Welcome</h3>
                  <p className="news-featured__lead">Barangay assembly at the hall. Agenda: budget, projects, and your concerns. Your voice matters. Feb 15, 9:00 AM at the barangay hall.</p>
                  <p className="news-featured__meta">Feb 15, 2025 · 9:00 AM</p>
                </article>
                <div className="news-secondaries">
                  <article className="news-secondary">
                    <div className="news-secondary__media">
                      <div className="news-secondary__image news-secondary__image--id" aria-hidden="true" />
                    </div>
                    <span className="news-secondary__label">Schedule</span>
                    <h4 className="news-secondary__title">New ID Registration Schedule</h4>
                    <p className="news-secondary__meta">Tues &amp; Thu 9AM–12 NN · Senior &amp; PWD</p>
                  </article>
                  <article className="news-secondary">
                    <div className="news-secondary__media">
                      <div className="news-secondary__image news-secondary__image--cleanup" aria-hidden="true" />
                    </div>
                    <span className="news-secondary__label">Community</span>
                    <h4 className="news-secondary__title">Monthly Clean-Up Drive</h4>
                    <p className="news-secondary__meta">Last Sunday of month · Plaza 7AM</p>
                  </article>
                </div>
              </div>
              <aside className="news-layout__sidebar" aria-label="Recommended announcements">
                <h3 className="news-sidebar__title">Recommended</h3>
                <ul className="news-sidebar__list">
                  <li><a href="#announcements">Community assembly this Saturday <span className="news-sidebar__by">Urgent</span></a></li>
                  <li><a href="#announcements">ID registration schedule updated <span className="news-sidebar__by">Feb 8</span></a></li>
                  <li><a href="#announcements">Health center hours and vaccination <span className="news-sidebar__by">Feb 1</span></a></li>
                  <li><a href="#announcements">Senior citizen ID processing <span className="news-sidebar__by">Jan 28</span></a></li>
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
