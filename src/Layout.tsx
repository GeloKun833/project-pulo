import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Building2, Menu, Moon, Sun, X } from 'lucide-react'
import './App.css'

function useNavScrolled() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return scrolled
}

const DARK_STORAGE_KEY = 'barangay-pulo-dark'

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem(DARK_STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(DARK_STORAGE_KEY, dark ? '1' : '0')
    } catch {}
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [dark])
  return [dark, () => setDark((d) => !d)] as const
}

function isNavLinkActive(pathname: string, hash: string, href: string): boolean {
  if (href === '/') return pathname === '/' && !hash
  if (href === '/#services') return pathname === '/' && hash === '#services'
  if (href === '/#announcements') return pathname === '/' && hash === '#announcements'
  if (href === '/#issuances') return pathname === '/' && hash === '#issuances'
  if (href === '/#trends') return pathname === '/' && hash === '#trends'
  if (href === '/events') return pathname === '/events'
  if (href === '/contact') return pathname === '/contact'
  return false
}

export default function Layout() {
  const navScrolled = useNavScrolled()
  const { pathname, hash: locationHash } = useLocation()
  const [scrollHash, setScrollHash] = useState(() => (pathname === '/' ? window.location.hash : ''))
  const [menuOpen, setMenuOpen] = useState(false)
  const [dark, toggleDark] = useDarkMode()
  const isSubpage = pathname !== '/'

  /* Use scroll-spy hash on home; fall back to window.location.hash so click-to-hash updates indicator */
  const hash = pathname === '/' ? (scrollHash || (typeof window !== 'undefined' ? window.location.hash : '') || '') : locationHash

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  /* Sync scrollHash from scroll-spy when on home */
  useEffect(() => {
    if (pathname !== '/') return
    const onNavHashChange = (e: Event) => {
      setScrollHash((e as CustomEvent<{ hash: string }>).detail.hash || '')
    }
    setScrollHash(window.location.hash)
    window.addEventListener('nav-hash-change', onNavHashChange)
    return () => window.removeEventListener('nav-hash-change', onNavHashChange)
  }, [pathname])

  /* Sync hash from URL when it changes (e.g. user clicked a hash link or back/forward) so indicator updates */
  useEffect(() => {
    if (pathname !== '/') return
    const onHashChange = () => setScrollHash(window.location.hash)
    window.addEventListener('hashchange', onHashChange)
    onHashChange()
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [pathname])

  /* When user clicks a nav link, location updates; keep scrollHash in sync */
  useEffect(() => {
    setScrollHash(locationHash)
  }, [pathname, locationHash])

  /* Same-page section click: scroll to section, update URL, and tell scroll-spy to ignore so indicator stays correct */
  const handleSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionHash: string) => {
    if (pathname !== '/') return
    e.preventDefault()
    const id = sectionHash.replace(/^#/, '')
    const el = document.getElementById(id)
    if (el) {
      window.history.pushState(null, '', pathname + sectionHash)
      setScrollHash(sectionHash)
      window.dispatchEvent(new CustomEvent('hash-navigation-scroll', { detail: { hash: sectionHash } }))
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setMenuOpen(false)
  }

  /* When navigating to home with a hash (e.g. from Events/Contact), scroll to that section.
     Tell home scroll-spy to ignore updates briefly so it doesn’t overwrite the hash with announcements. */
  useEffect(() => {
    if (pathname !== '/') return
    const hash = locationHash || (typeof window !== 'undefined' ? window.location.hash : '')
    if (!hash || hash.length < 2) return
    const id = hash.replace(/^#/, '')
    const timeouts: number[] = []
    let followUp: number | undefined
    const scrollToSection = (doFollowUp = false) => {
      const el = document.getElementById(id)
      if (!el) return false
      window.dispatchEvent(new CustomEvent('hash-navigation-scroll', { detail: { hash } }))
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      if (doFollowUp) {
        followUp = window.setTimeout(() => {
          const again = document.getElementById(id)
          if (again) again.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 250)
      }
      return true
    }
    /* Wait for home to render (delays), then scroll. Later attempts do a follow-up scroll to correct layout shift. */
    const delays = [150, 400, 750, 1200]
    for (let i = 0; i < delays.length; i++) {
      timeouts.push(
        window.setTimeout(() => {
          if (scrollToSection(i >= 2)) {
            timeouts.forEach(clearTimeout)
          }
        }, delays[i])
      )
    }
    return () => {
      timeouts.forEach(clearTimeout)
      if (followUp !== undefined) clearTimeout(followUp)
    }
  }, [pathname, locationHash])

  useEffect(() => {
    if (!menuOpen) return
    const doc = document.documentElement
    const prev = doc.style.overflow
    doc.style.overflow = 'hidden'
    return () => {
      doc.style.overflow = prev
    }
  }, [menuOpen])

  return (
    <div className={`user-layout${isSubpage ? ' user-layout--subpage' : ''}${dark ? ' user-layout--dark' : ''}`}>
      <nav className={`nav ${navScrolled ? 'is-scrolled' : ''} ${menuOpen ? 'is-open' : ''}`} aria-label="Main">
        <div className="nav__container">
          <a className="nav__brand" href="/" aria-label="Barangay Pulo Home">
            <span className="nav__icon" aria-hidden="true">
              <Building2 size={28} strokeWidth={2} />
            </span>
            <span className="nav__brand-text">Barangay Pulo</span>
          </a>
          <button
            type="button"
            className="nav__toggle"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="nav-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={24} aria-hidden /> : <Menu size={24} aria-hidden />}
          </button>
          <div id="nav-menu" className="nav__links" role="navigation">
            <a className={`nav__link${isNavLinkActive(pathname, hash, '/') ? ' nav__link--active' : ''}`} href="/" onClick={() => setMenuOpen(false)} aria-current={isNavLinkActive(pathname, hash, '/') ? 'page' : undefined}>Home</a>
            <a className={`nav__link${isNavLinkActive(pathname, hash, '/#announcements') ? ' nav__link--active' : ''}`} href="/#announcements" onClick={(e) => pathname === '/' ? handleSectionClick(e, '#announcements') : setMenuOpen(false)} aria-current={isNavLinkActive(pathname, hash, '/#announcements') ? 'page' : undefined}>Announcements</a>
            <a className={`nav__link${isNavLinkActive(pathname, hash, '/#services') ? ' nav__link--active' : ''}`} href="/#services" onClick={(e) => pathname === '/' ? handleSectionClick(e, '#services') : setMenuOpen(false)} aria-current={isNavLinkActive(pathname, hash, '/#services') ? 'page' : undefined}>Services</a>
            <a className={`nav__link${isNavLinkActive(pathname, hash, '/#issuances') ? ' nav__link--active' : ''}`} href="/#issuances" onClick={(e) => pathname === '/' ? handleSectionClick(e, '#issuances') : setMenuOpen(false)} aria-current={isNavLinkActive(pathname, hash, '/#issuances') ? 'page' : undefined}>Issuances</a>
            <a className={`nav__link${isNavLinkActive(pathname, hash, '/#trends') ? ' nav__link--active' : ''}`} href="/#trends" onClick={(e) => pathname === '/' ? handleSectionClick(e, '#trends') : setMenuOpen(false)} aria-current={isNavLinkActive(pathname, hash, '/#trends') ? 'page' : undefined}>Community</a>
            <a className={`nav__link${isNavLinkActive(pathname, hash, '/events') ? ' nav__link--active' : ''}`} href="/events" onClick={() => setMenuOpen(false)} aria-current={isNavLinkActive(pathname, hash, '/events') ? 'page' : undefined}>Events</a>
            <a className={`nav__link${isNavLinkActive(pathname, hash, '/contact') ? ' nav__link--active' : ''}`} href="/contact" onClick={() => setMenuOpen(false)} aria-current={isNavLinkActive(pathname, hash, '/contact') ? 'page' : undefined}>Contact</a>
          </div>
          <button
            type="button"
            className="nav__theme-toggle"
            onClick={toggleDark}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={dark ? 'Light mode' : 'Night mode'}
          >
            {dark ? <Sun size={22} aria-hidden /> : <Moon size={22} aria-hidden />}
          </button>
        </div>
      </nav>
      <Outlet />
      <footer className="footer">
        <div className="footer__container">
          <div className="footer__col footer__col--links">
            <h3 className="footer__title">Quick links</h3>
            <ul className="footer__list">
              <li><a href="/">Home</a></li>
              <li><a href="/#announcements">Announcements</a></li>
              <li><a href="/#services">Services</a></li>
              <li><a href="/#issuances">Issuances</a></li>
              <li><a href="/events">Events</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer__col footer__col--office">
            <h3 className="footer__title">Barangay Office</h3>
            <p className="footer__office-text">Barangay Hall, Pulo · Mon–Fri, 8AM–5PM</p>
            <p className="footer__office-text"><a href="tel:+631234567890">+63 (2) 1234-5678</a></p>
          </div>
        </div>
        <p className="footer__copy">© 2025 Barangay Pulo</p>
      </footer>
    </div>
  )
}
