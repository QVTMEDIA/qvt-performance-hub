'use client';

import { useTheme } from '@/lib/ThemeContext';

interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
  sub?: string;
}

export default function StatCard({ label, value, color, sub }: StatCardProps) {
  const { theme } = useTheme();
  const valueColor = color ?? theme.textPrimary;

  return (
    <div
      style={{
        background: theme.card,
        border: `1px solid ${theme.border}`,
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
          color: theme.textDim,
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
          color: valueColor,
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
            color: theme.textMuted,
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
