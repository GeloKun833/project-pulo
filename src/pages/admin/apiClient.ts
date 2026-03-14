// Use relative URL so Vite dev server can proxy to PHP backend (session cookies then work)
export const API_BASE = '/api'


export interface AdminUser {
  id: number
  username: string
}

export interface Announcement {
  id: number
  title: string
  description: string
  image: string | null
  date_posted: string
}

export interface Service {
  id: number
  title: string
  description: string
  image: string | null
  created_at?: string
  updated_at?: string | null
}

export interface EventItem {
  id: number
  category: string | null
  title: string
  subtitle: string | null
  details: string | null
  location: string | null
  start_at: string | null
  end_at: string | null
  image: string | null
  created_at?: string
  updated_at?: string | null
}

async function handleJsonResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = (data && (data.error as string)) || `Request failed with status ${res.status}`
    throw new Error(message)
  }
  return data as T
}

export async function login(username: string, password: string): Promise<AdminUser> {
  const res = await fetch(`${API_BASE}/login.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  })
  const data = await handleJsonResponse<{ user: AdminUser }>(res)
  return data.user
}

export async function logout(): Promise<void> {
  const res = await fetch(`${API_BASE}/logout.php`, {
    method: 'POST',
    credentials: 'include',
  })
  await handleJsonResponse(res)
}

export async function fetchAnnouncements(): Promise<Announcement[]> {
  const res = await fetch(`${API_BASE}/announcements.php`, {
    credentials: 'include',
    cache: 'no-store',
  })
  const data = await handleJsonResponse<{ announcements?: Announcement[] }>(res)
  return Array.isArray(data.announcements) ? data.announcements : []
}

export async function fetchAnnouncement(id: string | number): Promise<Announcement> {
  const res = await fetch(`${API_BASE}/announcements.php?id=${id}`, {
    credentials: 'include',
  })
  const data = await handleJsonResponse<{ announcement: Announcement }>(res)
  return data.announcement
}

export async function addAnnouncement(form: FormData): Promise<Announcement> {
  const res = await fetch(`${API_BASE}/add_announcement.php`, {
    method: 'POST',
    body: form,
    credentials: 'include',
  })
  const data = await handleJsonResponse<{ announcement: Announcement }>(res)
  return data.announcement
}

export async function editAnnouncement(form: FormData): Promise<Announcement> {
  // PHP endpoint accepts POST with _method=PUT
  form.append('_method', 'PUT')
  const res = await fetch(`${API_BASE}/edit_announcement.php`, {
    method: 'POST',
    body: form,
    credentials: 'include',
  })
  const data = await handleJsonResponse<{ announcement: Announcement }>(res)
  return data.announcement
}

export async function deleteAnnouncement(id: number): Promise<void> {
  const form = new FormData()
  form.append('id', String(id))
  form.append('_method', 'DELETE')
  const res = await fetch(`${API_BASE}/delete_announcement.php`, {
    method: 'POST',
    body: form,
    credentials: 'include',
  })
  await handleJsonResponse(res)
}

export async function fetchServices(): Promise<Service[]> {
  const res = await fetch(`${API_BASE}/services.php`, { credentials: 'include', cache: 'no-store' })
  const data = await handleJsonResponse<{ services?: Service[] }>(res)
  return Array.isArray(data.services) ? data.services : []
}

export async function fetchService(id: string | number): Promise<Service> {
  const res = await fetch(`${API_BASE}/services.php?id=${id}`, { credentials: 'include' })
  const data = await handleJsonResponse<{ service: Service }>(res)
  return data.service
}

export async function addService(form: FormData): Promise<Service> {
  const res = await fetch(`${API_BASE}/add_service.php`, { method: 'POST', body: form, credentials: 'include' })
  const data = await handleJsonResponse<{ service: Service }>(res)
  return data.service
}

export async function editService(form: FormData): Promise<Service> {
  form.append('_method', 'PUT')
  const res = await fetch(`${API_BASE}/edit_service.php`, { method: 'POST', body: form, credentials: 'include' })
  const data = await handleJsonResponse<{ service: Service }>(res)
  return data.service
}

export async function deleteService(id: number): Promise<void> {
  const form = new FormData()
  form.append('id', String(id))
  form.append('_method', 'DELETE')
  const res = await fetch(`${API_BASE}/delete_service.php`, { method: 'POST', body: form, credentials: 'include' })
  await handleJsonResponse(res)
}

export async function fetchEvents(): Promise<EventItem[]> {
  const res = await fetch(`${API_BASE}/events.php`, { credentials: 'include', cache: 'no-store' })
  const data = await handleJsonResponse<{ events?: EventItem[] }>(res)
  return Array.isArray(data.events) ? data.events : []
}

export async function fetchEvent(id: string | number): Promise<EventItem> {
  const res = await fetch(`${API_BASE}/events.php?id=${id}`, { credentials: 'include' })
  const data = await handleJsonResponse<{ event: EventItem }>(res)
  return data.event
}

export async function addEvent(form: FormData): Promise<EventItem> {
  const res = await fetch(`${API_BASE}/add_event.php`, { method: 'POST', body: form, credentials: 'include' })
  const data = await handleJsonResponse<{ event: EventItem }>(res)
  return data.event
}

export async function editEvent(form: FormData): Promise<EventItem> {
  form.append('_method', 'PUT')
  const res = await fetch(`${API_BASE}/edit_event.php`, { method: 'POST', body: form, credentials: 'include' })
  const data = await handleJsonResponse<{ event: EventItem }>(res)
  return data.event
}

export async function deleteEvent(id: number): Promise<void> {
  const form = new FormData()
  form.append('id', String(id))
  form.append('_method', 'DELETE')
  const res = await fetch(`${API_BASE}/delete_event.php`, { method: 'POST', body: form, credentials: 'include' })
  await handleJsonResponse(res)
}

