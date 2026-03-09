'use client';

import { useEffect, useState } from 'react';
import { getBand } from '@/lib/scoring';
import { BAND_COLORS, C } from '@/styles/brand';

interface RingProps {
  pct: number;
  size?: number;
}

export default function Ring({ pct, size = 80 }: RingProps) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDisplayed(pct), 50);
    return () => clearTimeout(t);
  }, [pct]);

  const r = 36;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - displayed / 100);
  const band = getBand(pct);
  const color = pct > 0 ? BAND_COLORS[band] : C.textDim;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* Track */}
      <circle
        cx="50" cy="50" r={r}
        fill="none"
        stroke={C.border}
        strokeWidth="8"
      />
      {/* Value arc */}
      <circle
        cx="50" cy="50" r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 50 50)"
        style={{ transition: 'stroke-dashoffset 0.65s cubic-bezier(0.4,0,0.2,1)' }}
      />
      {/* Center number */}
      <text
        x="50" y="46"
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontSize="18"
        fontWeight="800"
        fontFamily="monospace"
      >
        {Math.round(pct)}
      </text>
      {/* % label */}
      <text
        x="50" y="63"
        textAnchor="middle"
        dominantBaseline="central"
        fill={C.textMuted}
        fontSize="10"
        fontFamily="Montserrat, sans-serif"
        fontWeight="600"
      >
        %
      </text>
    </svg>
  );
}
