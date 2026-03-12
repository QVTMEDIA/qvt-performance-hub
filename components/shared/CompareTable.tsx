'use client';

import { Competency } from '@/lib/constants';
import { SC_COLORS } from '@/styles/brand';
import { useTheme } from '@/lib/ThemeContext';

interface CompareTableProps {
  title: string;
  comps: Competency[];
  selfScores: Record<string, number>;
  agreedScores: Record<string, number>;
}

function ScoreBadge({ val, textDim }: { val: number | undefined; textDim: string }) {
  if (!val) return <span style={{ color: textDim, fontSize: 11, fontFamily: 'Montserrat, sans-serif' }}>—</span>;
  const color = SC_COLORS[val];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 26,
        height: 26,
        borderRadius: 6,
        background: `${color}20`,
        border: `2px solid ${color}`,
        color,
        fontSize: 12,
        fontWeight: 800,
        fontFamily: 'Montserrat, sans-serif',
      }}
    >
      {val}
    </span>
  );
}

function GapBadge({ gap, textDim }: { gap: number; textDim: string }) {
  if (gap === 0) {
    return <span style={{ color: textDim, fontSize: 12, fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>0</span>;
  }
  const color = gap > 0 ? '#22c55e' : '#ef4444';
  return (
    <span style={{ color, fontSize: 12, fontWeight: 800, fontFamily: 'Montserrat, sans-serif' }}>
      {gap > 0 ? '+' : ''}{gap}
    </span>
  );
}

export default function CompareTable({ title, comps, selfScores, agreedScores }: CompareTableProps) {
  const { theme } = useTheme();

  const colHead: React.CSSProperties = {
    color: theme.textDim,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    textAlign: 'center',
    padding: '8px 12px',
    fontFamily: 'Montserrat, sans-serif',
  };

  return (
    <div style={{ marginBottom: 8 }}>
      {/* Header */}
      <div
        style={{
          padding: '10px 16px',
          background: `${theme.textDim}18`,
          borderRadius: '8px 8px 0 0',
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <span
          style={{
            color: theme.textPrimary,
            fontSize: 12,
            fontWeight: 800,
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          {title}
        </span>
      </div>

      {/* Table */}
      <div
        style={{
          border: `1px solid ${theme.border}`,
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          overflow: 'hidden',
        }}
      >
        {/* Column headers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 90px 90px 70px',
            background: `${theme.sidebar}80`,
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          <div style={{ ...colHead, textAlign: 'left' }}>Competency</div>
          <div style={colHead}>Self</div>
          <div style={colHead}>Agreed</div>
          <div style={colHead}>Gap</div>
        </div>

        {/* Rows */}
        {comps.map((comp, i) => {
          const self = selfScores[comp.key];
          const agreed = agreedScores[comp.key];
          const gap = (agreed ?? 0) - (self ?? 0);
          const isLast = i === comps.length - 1;

          return (
            <div
              key={comp.key}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 90px 90px 70px',
                alignItems: 'center',
                background: i % 2 === 0 ? theme.card : `${theme.sidebar}60`,
                borderBottom: isLast ? 'none' : `1px solid ${theme.border}`,
              }}
            >
              <div style={{ padding: '10px 16px' }}>
                <div
                  style={{
                    color: theme.textPrimary,
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: 'Montserrat, sans-serif',
                  }}
                >
                  {comp.label}
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '8px 12px' }}>
                <ScoreBadge val={self} textDim={theme.textDim} />
              </div>
              <div style={{ textAlign: 'center', padding: '8px 12px' }}>
                <ScoreBadge val={agreed} textDim={theme.textDim} />
              </div>
              <div style={{ textAlign: 'center', padding: '8px 12px' }}>
                {self !== undefined && agreed !== undefined ? (
                  <GapBadge gap={gap} textDim={theme.textDim} />
                ) : (
                  <span style={{ color: theme.textDim, fontSize: 11, fontFamily: 'Montserrat, sans-serif' }}>—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
