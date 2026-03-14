import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate, NavLink } from 'react-router-dom'
import { logout } from './apiClient'
import './AdminLayout.css'

const ADMIN_AUTH_KEY = 'barangay_admin_logged_in'

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const loggedIn = localStorage.getItem(ADMIN_AUTH_KEY) === 'true'
    if (!loggedIn) navigate('/admin/login', { replace: true, state: { from: location.pathname } })
  }, [location.pathname, navigate])

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // ignore errors on logout
    }
    localStorage.removeItem(ADMIN_AUTH_KEY)
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__header">
          <h1 className="admin-sidebar__title">Barangay Pulo Admin</h1>
          <button type="button" className="admin-sidebar__logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
        <nav className="admin-sidebar__nav">
          <NavLink to="/admin" end className={({ isActive }) => `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`}>
            Dashboard
          </NavLink>
          <span className="admin-sidebar__group-label">Services</span>
          <NavLink to="/admin/services" end className={({ isActive }) => `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`}>
            Manage Services
          </NavLink>
          <NavLink to="/admin/services/add" className={({ isActive }) => `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`}>
            Add Service
          </NavLink>
          <span className="admin-sidebar__group-label">Events</span>
          <NavLink to="/admin/events" end className={({ isActive }) => `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`}>
            Manage Events
          </NavLink>
          <NavLink to="/admin/events/add" className={({ isActive }) => `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`}>
            Add Event
          </NavLink>
          <span className="admin-sidebar__group-label">Announcements</span>
          <NavLink to="/admin/announcements/add" className={({ isActive }) => `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`}>
            Add Announcement
          </NavLink>
          <NavLink to="/admin/announcements" end className={({ isActive }) => `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`}>
            Manage Announcements
          </NavLink>
        </nav>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}

