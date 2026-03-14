import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import ErrorBoundary from './ErrorBoundary'
import Layout from './Layout'
import App from './App'
import Events from './pages/Events'
import Contact from './pages/Contact'
import AdminLayout from './pages/admin/AdminLayout'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AddAnnouncement from './pages/admin/AddAnnouncement'
import EditAnnouncement from './pages/admin/EditAnnouncement'
import ManageAnnouncements from './pages/admin/ManageAnnouncements'
import ManageServices from './pages/admin/ManageServices'
import AddService from './pages/admin/AddService'
import EditService from './pages/admin/EditService'
import ManageEvents from './pages/admin/ManageEvents'
import AddEvent from './pages/admin/AddEvent'
import EditEvent from './pages/admin/EditEvent'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<App />} />
            <Route path="events" element={<Events />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="announcements" element={<ManageAnnouncements />} />
            <Route path="announcements/add" element={<AddAnnouncement />} />
            <Route path="announcements/:id/edit" element={<EditAnnouncement />} />
            <Route path="services" element={<ManageServices />} />
            <Route path="services/add" element={<AddService />} />
            <Route path="services/:id/edit" element={<EditService />} />
            <Route path="events" element={<ManageEvents />} />
            <Route path="events/add" element={<AddEvent />} />
            <Route path="events/:id/edit" element={<EditEvent />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
