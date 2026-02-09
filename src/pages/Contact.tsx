import '../App.css'

export default function Contact() {
  return (
    <main className="contact-page">
      <section id="contact" className="contact" aria-labelledby="contact-heading">
        <div className="contact__bg" aria-hidden="true" />
        <div className="contact__container">
          <h1 id="contact-heading" className="contact__heading">Get in touch</h1>
          <p className="contact__sub">Reach the barangay. Fast, clear, connected.</p>
          <div className="contact__grid">
            <div className="contact__info">
              <div className="contact__card">
                <span className="contact__icon" aria-hidden="true">📍</span>
                <h3 className="contact__card-title">Visit</h3>
                <p className="contact__card-text">Barangay Hall, Pulo</p>
                <p className="contact__card-meta">Mon–Fri, 8:00 AM – 5:00 PM</p>
              </div>
              <div className="contact__card">
                <span className="contact__icon" aria-hidden="true">📞</span>
                <h3 className="contact__card-title">Call</h3>
                <p className="contact__card-text">Barangay Office</p>
                <a href="tel:+631234567890" className="contact__card-link">+63 (2) 1234-5678</a>
              </div>
              <div className="contact__card">
                <span className="contact__icon" aria-hidden="true">✉️</span>
                <h3 className="contact__card-title">Email</h3>
                <p className="contact__card-text">General inquiries</p>
                <a href="mailto:barangay.pulo@example.ph" className="contact__card-link">barangay.pulo@example.ph</a>
              </div>
            </div>
            <div className="contact__form-wrap">
              <form className="contact__form" onSubmit={(e) => e.preventDefault()} aria-label="Send a message">
                <label className="contact__label" htmlFor="contact-name">Name</label>
                <input id="contact-name" className="contact__input" type="text" placeholder="Your name" required autoComplete="name" />
                <label className="contact__label" htmlFor="contact-email">Email</label>
                <input id="contact-email" className="contact__input" type="email" placeholder="you@example.com" required autoComplete="email" />
                <label className="contact__label" htmlFor="contact-subject">Subject</label>
                <input id="contact-subject" className="contact__input" type="text" placeholder="What is this about?" />
                <label className="contact__label" htmlFor="contact-message">Message</label>
                <textarea id="contact-message" className="contact__textarea" placeholder="Your message..." rows={4} required />
                <button type="submit" className="contact__submit">Send message</button>
              </form>
            </div>
          </div>
        </div>
      </section>
      <footer className="footer">
        <p>Barangay Pulo — I ❤️ PULO</p>
      </footer>
    </main>
  )
}
