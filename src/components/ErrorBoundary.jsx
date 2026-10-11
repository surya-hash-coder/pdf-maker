import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error) { console.error('UI error:', error.message) } // never log document contents
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div role="alert" className="mx-auto mt-16 max-w-md card p-6 text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-ink-soft">The page hit an unexpected error. Your scans in this session may still be available after reloading the view.</p>
        <button className="btn btn-primary mt-4" onClick={() => this.setState({ error: null })}>Try again</button>
      </div>
    )
  }
}
