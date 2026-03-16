import { MapPin, Phone, Mail, Send } from 'lucide-react'
import '../App.css'

/** Pulo Barangay Hall — embed from Google Maps (Share → Embed). Free, no API key. */
const MAP_EMBED_SRC = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1367.2320048642707!2d121.12906507559352!3d14.246449704526459!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bd62636d757a71%3A0x65c40a500af75bd0!2sPulo%20Barangay%20Hall!5e0!3m2!1sen!2sph!4v1773540528877!5m2!1sen!2sph'

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
                <span className="contact__icon-wrap" aria-hidden="true"><MapPin size={20} strokeWidth={2} /></span>
                <h3 className="contact__card-title">Visit</h3>
                <p className="contact__card-text">Barangay Hall, Pulo</p>
                <p className="contact__card-meta">Mon–Fri, 8:00 AM – 5:00 PM</p>
              </div>
              <div className="contact__card">
                <span className="contact__icon-wrap" aria-hidden="true"><Phone size={20} strokeWidth={2} /></span>
                <h3 className="contact__card-title">Call</h3>
                <p className="contact__card-text">Barangay Office</p>
                <a href="tel:+631234567890" className="contact__card-link">+63 (2) 1234-5678</a>
              </div>
              <div className="contact__card">
                <span className="contact__icon-wrap" aria-hidden="true"><Mail size={20} strokeWidth={2} /></span>
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
                <button type="submit" className="contact__submit">
                <Send size={18} strokeWidth={2} aria-hidden />
                <span>Send message</span>
              </button>
              </form>
            </div>
          </div>
          <div id="contact-map" className="contact__map-wrap" aria-label="Barangay Pulo location map">
            <h2 className="contact__map-title">Find us</h2>
            <div className="contact__map">
              <iframe
                title="Barangay Pulo location"
                src={MAP_EMBED_SRC}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
