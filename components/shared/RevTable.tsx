'use client';

import { useState } from 'react';
import { Review } from '@/types';
import { calcOverall } from '@/lib/scoring';
import { QVT_BLUE, BAND_COLORS } from '@/styles/brand';
import { getBand } from '@/lib/scoring';
import { useTheme } from '@/lib/ThemeContext';
import StatusPill from '@/components/atoms/StatusPill';

interface RevTableProps {
  reviews: Review[];
  onSelect: (rev: Review) => void;
  showScore?: boolean;
}

type SortField = 'name' | 'period' | 'status' | 'score';
type SortDir = 'asc' | 'desc';

function getScore(rev: Review): number {
  const beh = rev.leadReview?.behavioral ?? rev.selfReview?.behavioral ?? {};
  const fun = rev.leadReview?.functional ?? rev.selfReview?.functional ?? {};
  if (Object.keys(beh).length === 0 && Object.keys(fun).length === 0) return -1;
  return calcOverall(beh, fun);
}

export default function RevTable({ reviews, onSelect, showScore = false }: RevTableProps) {
  const { theme } = useTheme();
  const [sortField, setSortField] = useState<SortField>('status');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [hovered, setHovered] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sorted = [...reviews].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'name') cmp = a.employeeName.localeCompare(b.employeeName);
    else if (sortField === 'period') cmp = a.period.localeCompare(b.period);
    else if (sortField === 'status') cmp = a.status.localeCompare(b.status);
    else if (sortField === 'score') cmp = getScore(a) - getScore(b);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const thStyle: React.CSSProperties = {
    padding: '9px 16px',
    color: theme.textDim,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontFamily: 'Montserrat, sans-serif',
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    textAlign: 'left',
    background: 'transparent',
    border: 'none',
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span style={{ color: theme.border, marginLeft: 4 }}>↕</span>;
    return <span style={{ color: QVT_BLUE, marginLeft: 4 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  if (reviews.length === 0) {
    return (
      <div
        style={{
          padding: '40px 24px',
          textAlign: 'center',
          color: theme.textDim,
          fontSize: 12,
          fontFamily: 'Montserrat, sans-serif',
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: 10,
        }}
      >
        No appraisals to display.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <div
        style={{
          border: `1px solid ${theme.border}`,
          borderRadius: 10,
          overflow: 'hidden',
          background: theme.card,
          minWidth: 480,
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: showScore
              ? '1fr 110px 90px 80px 80px 80px'
              : '1fr 110px 90px 80px 80px',
            background: `${theme.sidebar}80`,
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          <button style={thStyle} onClick={() => handleSort('name')}>
            Employee <SortIcon field="name" />
          </button>
          <button style={thStyle} onClick={() => handleSort('status')}>
            Status <SortIcon field="status" />
          </button>
          <button style={thStyle} onClick={() => handleSort('period')}>
            Period <SortIcon field="period" />
          </button>
          <button style={{ ...thStyle, textAlign: 'left' }}>Department</button>
          {showScore && (
            <button style={thStyle} onClick={() => handleSort('score')}>
              Score <SortIcon field="score" />
            </button>
          )}
          <button style={{ ...thStyle, cursor: 'default' }}>Created</button>
        </div>

        {/* Data rows */}
        {sorted.map((rev, i) => {
          const score = getScore(rev);
          const isHov = hovered === rev.id;
          const isLast = i === sorted.length - 1;

          return (
            <div
              key={rev.id}
              onClick={() => onSelect(rev)}
              onMouseEnter={() => setHovered(rev.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: 'grid',
                gridTemplateColumns: showScore
                  ? '1fr 110px 90px 80px 80px 80px'
                  : '1fr 110px 90px 80px 80px',
                alignItems: 'center',
                background: isHov ? `${QVT_BLUE}10` : i % 2 === 0 ? theme.card : `${theme.sidebar}40`,
                borderBottom: isLast ? 'none' : `1px solid ${theme.border}`,
                cursor: 'pointer',
                transition: 'background 0.12s',
              }}
            >
              {/* Name + title */}
              <div style={{ padding: '11px 16px' }}>
                <div
                  style={{
                    color: isHov ? theme.textPrimary : theme.textSecondary,
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: 'Montserrat, sans-serif',
                  }}
                >
                  {rev.employeeName || '—'}
                </div>
                {rev.jobTitle && (
                  <div
                    style={{
                      color: theme.textDim,
                      fontSize: 10,
                      fontWeight: 500,
                      fontFamily: 'Montserrat, sans-serif',
                      marginTop: 1,
                    }}
                  >
                    {rev.jobTitle}
                  </div>
                )}
              </div>

              {/* Status */}
              <div style={{ padding: '8px 16px' }}>
                <StatusPill status={rev.status} />
              </div>

              {/* Period */}
              <div
                style={{
                  padding: '8px 16px',
                  color: theme.textMuted,
                  fontSize: 11,
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 500,
                }}
              >
                {rev.period}
              </div>

              {/* Department */}
              <div
                style={{
                  padding: '8px 16px',
                  color: theme.textDim,
                  fontSize: 11,
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {rev.department || '—'}
              </div>

              {/* Score (optional) */}
              {showScore && (
                <div style={{ padding: '8px 16px' }}>
                  {score >= 0 ? (
                    <span
                      style={{
                        color: BAND_COLORS[getBand(score)],
                        fontSize: 13,
                        fontWeight: 800,
                        fontFamily: 'Montserrat, sans-serif',
                      }}
                    >
                      {Math.round(score)}%
                    </span>
                  ) : (
                    <span style={{ color: theme.textDim, fontSize: 11, fontFamily: 'Montserrat, sans-serif' }}>—</span>
                  )}
                </div>
              )}

              {/* Created date */}
              <div
                style={{
                  padding: '8px 16px',
                  color: theme.textDim,
                  fontSize: 11,
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}
              >
                {rev.createdAt}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
