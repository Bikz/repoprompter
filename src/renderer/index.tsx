/**
 * File: index.tsx
 * Description: Renderer entry point. Renders the main App into #root with React.StrictMode and an ErrorBoundary.
 */

import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './tailwind.css'

if (typeof global === 'undefined') {
  (window as any).global = window
}

const container = document.getElementById('root')
if (!container) {
  throw new Error('Failed to find the root element')
}

const root = createRoot(container)

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-5 text-red-500">
          <h1 className="text-xl font-bold">Something went wrong.</h1>
          <pre>{this.state.error?.message}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)