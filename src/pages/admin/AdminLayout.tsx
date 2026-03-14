import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate, NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  PlusCircle,
  List,
  Calendar,
  Megaphone,
  LogOut,
  Building2,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  UserCircle,
} from 'lucide-react'
import { logout } from './apiClient'
import './AdminLayout.css'

const ADMIN_AUTH_KEY = 'barangay_admin_logged_in'
const SIDEBAR_COLLAPSED_KEY = 'barangay_admin_sidebar_collapsed'

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    const loggedIn = localStorage.getItem(ADMIN_AUTH_KEY) === 'true'
    if (!loggedIn) navigate('/admin/login', { replace: true, state: { from: location.pathname } })
  }, [location.pathname, navigate])

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // ignore errors on logout
    }
    localStorage.removeItem(ADMIN_AUTH_KEY)
    navigate('/admin/login', { replace: true })
  }

  const toggleCollapsed = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next))
      } catch {}
      return next
    })
  }

  const link = (to: string, end: boolean, icon: React.ReactNode, label: string) => (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`}
      title={label}
    >
      <span className="admin-sidebar__link-icon">{icon}</span>
      <span className="admin-sidebar__link-text">{label}</span>
    </NavLink>
  )

  return (
    <div className={`admin-layout ${sidebarOpen ? 'admin-layout--sidebar-open' : ''}`}>
      <div
        className="admin-sidebar-overlay"
        aria-hidden={!sidebarOpen}
        onClick={() => setSidebarOpen(false)}
      />
      <aside className={`admin-sidebar ${sidebarCollapsed ? 'admin-sidebar--collapsed' : ''}`}>
        <div className="admin-sidebar__header">
          <h1 className="admin-sidebar__title">
            <UserCircle size={22} className="admin-sidebar__title-icon" aria-hidden />
            <span className="admin-sidebar__title-text">Brgy. Pulo Admin</span>
          </h1>
          <button
            type="button"
            className="admin-sidebar__collapse-btn"
            onClick={toggleCollapsed}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen size={20} aria-hidden />
            ) : (
              <PanelLeftClose size={20} aria-hidden />
            )}
          </button>
        </div>
        <nav className="admin-sidebar__nav">
          {link('/admin', true, <LayoutDashboard size={20} aria-hidden />, 'Dashboard')}
          <span className="admin-sidebar__group-label">Services</span>
          {link('/admin/services', true, <List size={20} aria-hidden />, 'Manage Services')}
          {link('/admin/services/add', false, <PlusCircle size={20} aria-hidden />, 'Add Service')}
          <span className="admin-sidebar__group-label">Events</span>
          {link('/admin/events', true, <Calendar size={20} aria-hidden />, 'Manage Events')}
          {link('/admin/events/add', false, <PlusCircle size={20} aria-hidden />, 'Add Event')}
          <span className="admin-sidebar__group-label">Announcements</span>
          {link('/admin/announcements/add', false, <Megaphone size={20} aria-hidden />, 'Add Announcement')}
          {link('/admin/announcements', true, <List size={20} aria-hidden />, 'Manage Announcements')}
        </nav>
        <div className="admin-sidebar__footer">
          <button
            type="button"
            className="admin-sidebar__logout"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={16} aria-hidden />
            <span className="admin-sidebar__logout-text">Logout</span>
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-page-header">
          <span className="admin-page-header__left">
            <button
              type="button"
              className="admin-header__menu-btn"
              onClick={() => setSidebarOpen((o) => !o)}
              aria-expanded={sidebarOpen}
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            >
              {sidebarOpen ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
            </button>
            <span className="admin-page-header__title-text">Admin</span>
          </span>
          <div className="admin-page-header__chips">
            <span className="admin-page-header__chip">
              <Building2 size={14} aria-hidden />
              Barangay Pulo
            </span>
          </div>
        </header>
        <div className="admin-main__content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

