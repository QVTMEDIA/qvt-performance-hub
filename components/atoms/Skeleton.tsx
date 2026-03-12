'use client';

import { useTheme } from '@/lib/ThemeContext';

// Inject shimmer keyframe once
const SHIMMER_STYLE = `
@keyframes qvt-shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
`;

function shimmerStyle(base: string, highlight: string): React.CSSProperties {
  return {
    background: `linear-gradient(90deg, ${base} 25%, ${highlight} 50%, ${base} 75%)`,
    backgroundSize: '800px 100%',
    animation: 'qvt-shimmer 1.4s infinite linear',
    borderRadius: 4,
  };
}

// ─── SkeletonLine ─────────────────────────────────────────────────────────────
interface SkeletonLineProps {
  width?: string | number;
  height?: number;
}

export function SkeletonLine({ width = '100%', height = 16 }: SkeletonLineProps) {
  const { isDark } = useTheme();
  const base      = isDark ? '#0c2035' : '#e2e8f0';
  const highlight = isDark ? '#0f2a42' : '#f1f5f9';

  return (
    <>
      <style>{SHIMMER_STYLE}</style>
      <div style={{ width, height, ...shimmerStyle(base, highlight) }} />
    </>
  );
}

// ─── SkeletonCard ─────────────────────────────────────────────────────────────
interface SkeletonCardProps {
  rows?: number;
}

export function SkeletonCard({ rows = 4 }: SkeletonCardProps) {
  const { theme, isDark } = useTheme();
  const base      = isDark ? '#0c2035' : '#e2e8f0';
  const highlight = isDark ? '#0f2a42' : '#f1f5f9';

  return (
    <>
      <style>{SHIMMER_STYLE}</style>
      <div style={{
        background: theme.card,
        border: `1px solid ${theme.border}`,
        borderRadius: 10,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 16,
              width: i === 0 ? '60%' : i % 3 === 0 ? '40%' : '100%',
              ...shimmerStyle(base, highlight),
            }}
          />
        ))}
      </div>
    </>
  );
}

// ─── SkeletonTable ────────────────────────────────────────────────────────────
interface SkeletonTableProps {
  rows?: number;
  cols?: number;
}

export function SkeletonTable({ rows = 5, cols = 3 }: SkeletonTableProps) {
  const { theme, isDark } = useTheme();
  const base      = isDark ? '#0c2035' : '#e2e8f0';
  const highlight = isDark ? '#0f2a42' : '#f1f5f9';

  return (
    <>
      <style>{SHIMMER_STYLE}</style>
      <div style={{
        border: `1px solid ${theme.border}`,
        borderRadius: 10,
        overflow: 'hidden',
      }}>
        {/* Header row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 12,
          padding: '10px 16px',
          background: theme.cardAlt,
          borderBottom: `1px solid ${theme.border}`,
        }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} style={{ height: 12, ...shimmerStyle(base, highlight) }} />
          ))}
        </div>
        {/* Data rows */}
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gap: 12,
              padding: '12px 16px',
              background: r % 2 === 0 ? theme.card : theme.cardAlt,
              borderBottom: r === rows - 1 ? 'none' : `1px solid ${theme.border}`,
            }}
          >
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} style={{ height: 14, ...shimmerStyle(base, highlight) }} />
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
