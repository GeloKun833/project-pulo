import { useState, type FormEvent } from 'react'
import { Button, Card, Container, Form, Alert } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import { login } from './apiClient'

const ADMIN_AUTH_KEY = 'barangay_admin_logged_in'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
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
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Card style={{ maxWidth: 420, width: '100%' }}>
        <Card.Body>
          <Card.Title className="mb-4 text-center">Barangay Pulo Staff Login</Card.Title>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
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
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </Form.Group>
            <div className="d-grid">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Signing in…' : 'Login'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  )
}

