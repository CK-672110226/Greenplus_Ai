import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--paper)] flex flex-col items-center justify-center px-6 text-center gap-4">
          <div className="font-brand text-[48px] text-[var(--orange)]">&#x26A0;</div>
          <h1 className="font-brand text-[28px] text-[var(--ink)]">Something went wrong</h1>
          <p className="font-body text-[15px] text-[var(--ink-2)] max-w-[320px]">
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 border-[1.5px] border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)] font-data text-[12px] uppercase tracking-widest cursor-pointer"
          >
            Reload page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
