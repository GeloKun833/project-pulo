import type { ReactNode } from 'react'
import { Component } from 'react'

type Props = {
  children: ReactNode
}

type State = {
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: unknown): State {
    return { error: error instanceof Error ? error : new Error(String(error)) }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 16, fontFamily: 'system-ui, Segoe UI, Arial, sans-serif' }}>
          <h2 style={{ marginTop: 0 }}>App error</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error.message}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

