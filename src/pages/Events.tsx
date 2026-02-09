import './Events.css'

const featuredEvent = {
  tag: 'Featured',
  title: 'Barangay Pulo Community Assembly 2026',
  subtitle: 'An exclusive gathering for residents — budget, projects, and your voice',
  dateRange: 'March 15–16, 2026',
  location: 'Barangay Hall, Pulo',
  when: 'Sunday, March 15, 2026 – Monday, March 16, 2026',
  where: 'Barangay Hall, Pulo',
  details: 'Join your barangay officials and fellow residents for the annual community assembly. Agenda includes budget presentation, upcoming projects, health and safety updates, and an open forum for your concerns and ideas. All residents are welcome.',
}

const pastEvents = [
  {
    id: '1',
    category: 'Community Assembly',
    title: 'Inside Barangay Pulo: What Officials Are Focused on Now',
    info: 'January 28, 2026 | Barangay Hall. Open to all residents.',
    imageClass: 'events-past__image--1',
  },
  {
    id: '2',
    category: 'Health & Wellness',
    title: 'From Awareness to Action: Health Programs for Families',
    info: 'December 10, 2025 | Health Center. Vaccination and check-ups available.',
    imageClass: 'events-past__image--2',
  },
  {
    id: '3',
    category: 'Community Event',
    title: 'Barangay Pulo Year-End Predictions and Plans for 2026',
    info: 'December 4, 2025 | Barangay Hall. Year in review and 2026 priorities.',
    imageClass: 'events-past__image--3',
  },
]

export default function Events() {
  return (
    <main className="events-page">
      <div className="events-container">
        {/* Featured Event */}
        <section className="events-featured" aria-labelledby="featured-title">
          <span className="events-featured__tag">Featured</span>
          <h1 id="featured-title" className="events-featured__title">
            {featuredEvent.title}
          </h1>
          <div className="events-featured__body">
            <div className="events-featured__media">
              <div className="events-featured__image" aria-hidden="true" />
              <div className="events-featured__overlay">
                <span className="events-featured__overlay-title">Barangay Pulo Community Assembly</span>
                <span className="events-featured__overlay-subtitle">{featuredEvent.subtitle}</span>
                <span className="events-featured__overlay-meta">
                  {featuredEvent.dateRange} / {featuredEvent.location}
                </span>
              </div>
            </div>
            <div className="events-featured__details">
              <dl className="events-featured__list">
                <div>
                  <dt>When</dt>
                  <dd>{featuredEvent.when}</dd>
                </div>
                <div>
                  <dt>Where</dt>
                  <dd>{featuredEvent.where}</dd>
                </div>
                <div>
                  <dt>Details</dt>
                  <dd>
                    {featuredEvent.details}
                    <a href="/contact" className="events-featured__read-more">Read more.</a>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* Past Events */}
        <section className="events-past" aria-labelledby="past-events-title">
          <h2 id="past-events-title" className="events-past__title">Past Events</h2>
          <div className="events-past__grid">
            {pastEvents.map((event) => (
              <article key={event.id} className="events-past__card">
                <div className={`events-past__image ${event.imageClass}`} aria-hidden="true" />
                <span className="events-past__category">{event.category}</span>
                <h3 className="events-past__card-title">{event.title}</h3>
                <p className="events-past__card-info">{event.info}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
