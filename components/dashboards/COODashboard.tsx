'use client';

import { AppContext } from '@/components/AppShell';
import { C } from '@/styles/brand';

interface COODashboardProps {
  ctx: AppContext;
}

export default function COODashboard({ ctx: _ctx }: COODashboardProps) {
  return (
    <div>
      <div style={{
        padding:      '20px 32px 16px',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <h1 style={{
          color:         C.textPrimary,
          fontSize:      20,
          fontWeight:    800,
          letterSpacing: '-0.01em',
          margin:        0,
          fontFamily:    'Montserrat, sans-serif',
        }}>
          <span style={{ color: '#d97706' }}>COO</span> Dashboard
        </h1>
        <p style={{ color: C.textMuted, fontSize: 12, fontWeight: 500, margin: '4px 0 0', fontFamily: 'Montserrat, sans-serif' }}>
          QVT Media Performance Hub · {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      <div style={{
        padding:    '64px 32px',
        textAlign:  'center',
        color:      C.textDim,
        fontSize:   13,
        fontFamily: 'Montserrat, sans-serif',
      }}>
        COO Dashboard — coming in Phase 4B
      </div>
    </div>
  );
}
