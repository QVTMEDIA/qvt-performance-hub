'use client';

import { ReviewStatus } from '@/types';
import { STAGE_META } from '@/lib/constants';

interface StatusPillProps {
  status: ReviewStatus;
}

export default function StatusPill({ status }: StatusPillProps) {
  const meta = STAGE_META[status];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: 20,
        background: `${meta.color}18`,
        border: `1px solid ${meta.color}45`,
        color: meta.color,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        fontFamily: 'Montserrat, sans-serif',
      }}
    >
      {meta.label}
    </span>
  );
}
