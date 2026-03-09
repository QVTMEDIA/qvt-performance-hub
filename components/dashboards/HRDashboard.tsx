'use client';

import { AppContext } from '@/components/AppShell';
import { C } from '@/styles/brand';

interface HRDashboardProps {
  ctx: AppContext;
}

export default function HRDashboard({ ctx: _ctx }: HRDashboardProps) {
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
          <span style={{ color: '#8b5cf6' }}>People Lead (HR)</span> Dashboard
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
        HR Dashboard — coming in Phase 4B
      </div>
    </div>
  );
}
