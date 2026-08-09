import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, background: '#04060c', color: '#ff6b6b', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2 style={{ color: '#ff6b6b' }}>⚠️ Application Error</h2>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.85rem', marginTop: 16 }}>
            {this.state.error?.toString()}
          </pre>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginTop: 20, color: '#94a3b8', fontSize: '0.75rem' }}>
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 24, padding: '10px 24px', background: '#00f5a0', color: '#04060c', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
