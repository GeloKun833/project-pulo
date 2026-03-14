import { useState, type FormEvent } from 'react'
import { Button, Card, Form, Alert } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { login } from './apiClient'
import './AdminLogin.css'

const ADMIN_AUTH_KEY = 'barangay_admin_logged_in'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(username, password)
      localStorage.setItem(ADMIN_AUTH_KEY, 'true')
      const from = (location.state as { from?: string } | null)?.from || '/admin'
      navigate(from, { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <Card className="admin-login-card border-0">
        <Card.Body className="p-0">
          <h1 className="admin-login-title">
            <Lock size={28} aria-hidden />
            Barangay Pulo Staff Login
          </h1>
          <p className="admin-login-subtitle">Sign in to manage services, events, and announcements</p>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-3">
              {error}
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <div className="admin-login-password-wrap">
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="admin-login-password-input"
                />
                <button
                  type="button"
                  className="admin-login-password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} aria-hidden /> : <Eye size={20} aria-hidden />}
                </button>
              </div>
            </Form.Group>
            <div className="d-grid">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Signing in…' : 'Login'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}

