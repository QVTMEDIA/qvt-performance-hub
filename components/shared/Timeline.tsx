'use client';

import { ReviewStatus } from '@/types';
import { STATUS_ORDER, STAGE_META } from '@/lib/constants';
import { QVT_BLUE } from '@/styles/brand';
import { useTheme } from '@/lib/ThemeContext';

interface TimelineProps {
  status: ReviewStatus;
}

export default function Timeline({ status }: TimelineProps) {
  const { theme } = useTheme();
  const currentIdx = STATUS_ORDER.indexOf(status);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, overflowX: 'auto', padding: '4px 0 8px' }}>
      {STATUS_ORDER.map((s, i) => {
        const isDone = i < currentIdx;
        const isActive = i === currentIdx;
        const isLast = i === STATUS_ORDER.length - 1;
        const meta = STAGE_META[s];

        const bubbleColor = isDone
          ? QVT_BLUE
          : isActive
          ? meta.color
          : theme.border;
        const bubbleBg = isDone
          ? QVT_BLUE
          : isActive
          ? `${meta.color}20`
          : 'transparent';
        const textColor = isDone ? QVT_BLUE : isActive ? meta.color : theme.textDim;
        const lineColor = isDone ? QVT_BLUE : theme.border;

        return (
          <div key={s} style={{ display: 'flex', alignItems: 'flex-start', flex: isLast ? undefined : 1, minWidth: 0 }}>
            {/* Step */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              {/* Bubble */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: bubbleBg,
                  border: `2px solid ${bubbleColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
              >
                {isDone ? (
                  <span style={{ color: '#fff', fontSize: 13, fontWeight: 800 }}>✓</span>
                ) : (
                  <span
                    style={{
                      color: isActive ? meta.color : theme.textDim,
                      fontSize: 12,
                      fontWeight: 800,
                      fontFamily: 'Montserrat, sans-serif',
                    }}
                  >
                    {i + 1}
                  </span>
                )}
              </div>
              {/* Label */}
              <div
                style={{
                  color: textColor,
                  fontSize: 10,
                  fontWeight: isActive ? 700 : 600,
                  fontFamily: 'Montserrat, sans-serif',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.03em',
                  maxWidth: 72,
                  lineHeight: 1.3,
                }}
              >
                {meta.label}
              </div>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: lineColor,
                  marginTop: 15,
                  transition: 'background 0.2s',
                  minWidth: 20,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
