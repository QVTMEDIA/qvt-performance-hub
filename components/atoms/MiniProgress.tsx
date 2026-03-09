'use client';

import { ReviewStatus } from '@/types';
import { STATUS_ORDER, STAGE_META } from '@/lib/constants';
import { C, QVT_BLUE } from '@/styles/brand';

interface MiniProgressProps {
  status: ReviewStatus;
}

export default function MiniProgress({ status }: MiniProgressProps) {
  const currentIdx = STATUS_ORDER.indexOf(status);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      {STATUS_ORDER.map((s, i) => {
        const isDone = i < currentIdx;
        const isActive = i === currentIdx;
        const isPending = i > currentIdx;
        const meta = STAGE_META[s];
        const dotColor = isDone ? QVT_BLUE : isActive ? meta.color : C.border;
        const isLast = i === STATUS_ORDER.length - 1;

        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
            {/* Dot */}
            <div
              title={meta.label}
              style={{
                width: isActive ? 10 : 8,
                height: isActive ? 10 : 8,
                borderRadius: '50%',
                background: isDone || isActive ? dotColor : 'transparent',
                border: `2px solid ${isPending ? C.border : dotColor}`,
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            />
            {/* Connector line */}
            {!isLast && (
              <div
                style={{
                  width: 14,
                  height: 2,
                  background: isDone ? QVT_BLUE : C.border,
                  transition: 'background 0.2s',
                }}
              />
            )}
          </div>
        );
      })}
      {/* Stage label */}
      <span
        style={{
          marginLeft: 8,
          color: STAGE_META[status].color,
          fontSize: 10,
          fontWeight: 700,
          fontFamily: 'Montserrat, sans-serif',
          letterSpacing: '0.04em',
        }}
      >
        {STAGE_META[status].label}
      </span>
    </div>
  );
}
