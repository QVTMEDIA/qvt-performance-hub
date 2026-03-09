'use client';

import { C } from '@/styles/brand';

interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
  sub?: string;
}

export default function StatCard({ label, value, color = C.textPrimary, sub }: StatCardProps) {
  return (
    <div
      style={{
        background: C.cardBg,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        minWidth: 120,
      }}
    >
      <div
        style={{
          color: C.textDim,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontFamily: 'Montserrat, sans-serif',
        }}
      >
        {label}
      </div>
      <div
        style={{
          color,
          fontSize: 28,
          fontWeight: 800,
          lineHeight: 1,
          fontFamily: 'Montserrat, sans-serif',
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            color: C.textMuted,
            fontSize: 11,
            fontWeight: 500,
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}
