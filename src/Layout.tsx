import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
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

export default function Layout() {
  const navScrolled = useNavScrolled()

  return (
    <>
      <nav className={`nav ${navScrolled ? 'is-scrolled' : ''}`} aria-label="Main">
        <a className="nav__link" href="/#services">Services</a>
        <a className="nav__link" href="/#announcements">Announcements</a>
        <a className="nav__link" href="/#trends">Community</a>
        <a className="nav__link" href="/events">Events</a>
        <a className="nav__link" href="/contact">Contact</a>
      </nav>
      <Outlet />
    </>
  )
}
