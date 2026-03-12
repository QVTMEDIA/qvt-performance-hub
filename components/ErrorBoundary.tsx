'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { QVT_BLUE } from '@/styles/brand';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 320,
          padding: 48,
          textAlign: 'center',
          fontFamily: 'Montserrat, sans-serif',
        }}>
          {/* QVT Logo */}
          <svg width={48} height={48} viewBox="0 0 40 40" fill="none" style={{ marginBottom: 16 }}>
            <rect width="40" height="40" rx="8" fill={QVT_BLUE} />
            <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle"
              fill="#fff" fontSize="16" fontWeight="800" fontFamily="Montserrat, sans-serif">
              Q
            </text>
          </svg>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#94a3b8', margin: '0 0 8px' }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: 12, color: '#4a7a99', marginBottom: 20, maxWidth: 320, lineHeight: 1.6 }}>
            An unexpected error occurred. Your data is safe.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: QVT_BLUE,
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 20px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.04em',
              fontFamily: 'Montserrat, sans-serif',
            }}
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
