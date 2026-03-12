'use client';

import { useState } from 'react';
import { SC_COLORS, SC_LABELS } from '@/styles/brand';
import { useTheme } from '@/lib/ThemeContext';

interface ScoreBtnsProps {
  val: number | undefined;
  onChange: (v: number) => void;
  disabled?: boolean;
}

export default function ScoreBtns({ val, onChange, disabled = false }: ScoreBtnsProps) {
  const { theme } = useTheme();
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const isActive = val === n;
        const isHov = hovered === n && !disabled;
        const color = SC_COLORS[n];

        return (
          <button
            key={n}
            title={SC_LABELS[n]}
            disabled={disabled}
            onClick={() => !disabled && onChange(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(null)}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: isActive
                ? `2px solid ${color}`
                : isHov
                ? `2px solid ${color}80`
                : `2px solid transparent`,
              background: isActive
                ? color
                : isHov
                ? `${color}20`
                : 'transparent',
              color: isActive ? '#fff' : isHov ? color : theme.textDim,
              fontSize: 11,
              fontWeight: 800,
              cursor: disabled ? 'default' : 'pointer',
              transition: 'all 0.12s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Montserrat, sans-serif',
              opacity: disabled && !isActive ? 0.45 : 1,
            }}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
