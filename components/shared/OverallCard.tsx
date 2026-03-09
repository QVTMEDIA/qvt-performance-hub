'use client';

import { Review } from '@/types';
import { calcSec, calcOverall, getBand } from '@/lib/scoring';
import { BAND_COLORS, C } from '@/styles/brand';
import Ring from '@/components/atoms/Ring';

interface OverallCardProps {
  review: Review;
}

export default function OverallCard({ review }: OverallCardProps) {
  const { selfReview, leadReview } = review;

  // Agreed scores take precedence
  const beh = leadReview?.behavioral ?? selfReview?.behavioral ?? {};
  const fun = leadReview?.functional ?? selfReview?.functional ?? {};

  const hasBeh = Object.keys(beh).length > 0;
  const hasFun = Object.keys(fun).length > 0;

  if (!hasBeh && !hasFun) return null;

  const behPct = hasBeh ? calcSec(beh) : 0;
  const funPct = hasFun ? calcSec(fun) : 0;
  const overall = calcOverall(beh, fun);
  const band = getBand(overall);
  const bandColor = BAND_COLORS[band];
  const recommendation = leadReview?.text?.recommendation;

  const PctDisplay = ({ label, pct }: { label: string; pct: number }) => {
    const b = getBand(pct);
    const c = BAND_COLORS[b];
    return (
      <div
        style={{
          background: C.appBg,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: '12px 16px',
          flex: 1,
        }}
      >
        <div
          style={{
            color: C.textDim,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 6,
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          {label}
        </div>
        <div
          style={{
            color: c,
            fontSize: 22,
            fontWeight: 800,
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1,
          }}
        >
          {Math.round(pct)}%
        </div>
        <div
          style={{
            color: C.textMuted,
            fontSize: 10,
            fontWeight: 600,
            fontFamily: 'Montserrat, sans-serif',
            marginTop: 4,
          }}
        >
          {b}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        background: C.cardBg,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        flexWrap: 'wrap',
      }}
    >
      {/* Ring */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <Ring pct={overall} size={96} />
        <span
          style={{
            color: bandColor,
            fontSize: 11,
            fontWeight: 700,
            fontFamily: 'Montserrat, sans-serif',
            letterSpacing: '0.04em',
          }}
        >
          {band}
        </span>
      </div>

      {/* Breakdowns */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 200 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {hasBeh && <PctDisplay label="Behavioral" pct={behPct} />}
          {hasFun && <PctDisplay label="Functional" pct={funPct} />}
        </div>

        {/* Source indicator */}
        <div
          style={{
            color: C.textDim,
            fontSize: 10,
            fontWeight: 600,
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          {leadReview ? 'Using Agreed Scores (Team Lead)' : 'Using Self-Assessment Scores'}
        </div>

        {/* Recommendation */}
        {recommendation && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                color: C.textDim,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              Recommendation:
            </span>
            <span
              style={{
                background: `${C.blue}20`,
                border: `1px solid ${C.blue}50`,
                color: C.blue,
                borderRadius: 20,
                padding: '2px 10px',
                fontSize: 11,
                fontWeight: 700,
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              {recommendation}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
