'use client';

import { useState } from 'react';
import { Review } from '@/types';
import { calcOverall } from '@/lib/scoring';
import { QVT_BLUE } from '@/styles/brand';
import { useTheme } from '@/lib/ThemeContext';
import Ring from '@/components/atoms/Ring';
import StatusPill from '@/components/atoms/StatusPill';
import MiniProgress from '@/components/atoms/MiniProgress';

interface RevRowProps {
  review: Review;
  onOpen: () => void;
  ctaLabel?: string;
}

function getScore(rev: Review): number {
  const beh = rev.leadReview?.behavioral ?? rev.selfReview?.behavioral ?? {};
  const fun = rev.leadReview?.functional ?? rev.selfReview?.functional ?? {};
  if (Object.keys(beh).length === 0 && Object.keys(fun).length === 0) return 0;
  return calcOverall(beh, fun);
}

export default function RevRow({ review, onOpen, ctaLabel = 'Open Review' }: RevRowProps) {
  const { theme } = useTheme();
  const [hovered, setHovered] = useState(false);
  const score = getScore(review);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '14px 20px',
        background: hovered ? `${QVT_BLUE}0d` : theme.card,
        border: `1px solid ${hovered ? QVT_BLUE : theme.border}`,
        borderRadius: 10,
        transition: 'all 0.15s ease',
        marginBottom: 8,
      }}
    >
      {/* Ring score */}
      <Ring pct={score} size={60} />

      {/* Employee info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            color: theme.textPrimary,
            fontSize: 14,
            fontWeight: 700,
            fontFamily: 'Montserrat, sans-serif',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {review.employeeName || '—'}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginTop: 4 }}>
          {review.jobTitle && (
            <span
              style={{
                color: theme.textMuted,
                fontSize: 11,
                fontWeight: 600,
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              {review.jobTitle}
            </span>
          )}
          {review.department && (
            <span
              style={{
                color: theme.textDim,
                fontSize: 11,
                fontWeight: 500,
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              · {review.department}
            </span>
          )}
          <span
            style={{
              color: theme.textDim,
              fontSize: 11,
              fontWeight: 500,
              fontFamily: 'Montserrat, sans-serif',
            }}
          >
            · {review.period}
          </span>
        </div>

        {/* Mini progress */}
        <div style={{ marginTop: 8 }}>
          <MiniProgress status={review.status} />
        </div>
      </div>

      {/* Status + CTA */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
        <StatusPill status={review.status} />
        <button
          onClick={onOpen}
          style={{
            background: hovered ? QVT_BLUE : 'transparent',
            border: `1px solid ${hovered ? QVT_BLUE : theme.border}`,
            borderRadius: 6,
            color: hovered ? '#fff' : theme.textMuted,
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            padding: '6px 14px',
            fontFamily: 'Montserrat, sans-serif',
            letterSpacing: '0.03em',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}
