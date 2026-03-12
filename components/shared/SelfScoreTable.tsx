'use client';

import { Competency } from '@/lib/constants';
import { SC_COLORS, SC_LABELS } from '@/styles/brand';
import { useTheme } from '@/lib/ThemeContext';
import ScoreBtns from '@/components/atoms/ScoreBtns';

interface SelfScoreTableProps {
  title: string;
  comps: Competency[];
  scores: Record<string, number>;
  onChange?: (key: string, val: number) => void;
  readonly?: boolean;
  /** When provided (lead scoring mode), shows the employee's self score alongside the agreed score buttons */
  selfScores?: Record<string, number>;
}

export default function SelfScoreTable({
  title,
  comps,
  scores,
  onChange,
  readonly = false,
  selfScores,
}: SelfScoreTableProps) {
  const { theme } = useTheme();
  const scored = comps.filter((c) => scores[c.key] !== undefined).length;
  const showCompare = !!selfScores && !readonly;

  return (
    <div style={{ marginBottom: 8 }}>
      {/* Section header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
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
            letterSpacing: '0.02em',
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          {title}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {showCompare && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: theme.textDim, fontSize: 10, fontWeight: 700, fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.06em' }}>
                SELF
              </span>
              <span style={{ color: theme.textDim, fontSize: 10, fontWeight: 700, fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.06em' }}>
                AGREED
              </span>
            </div>
          )}
          {!readonly && (
            <span
              style={{
                color: scored === comps.length ? '#22c55e' : theme.textMuted,
                fontSize: 11,
                fontWeight: 700,
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              {scored} / {comps.length}
            </span>
          )}
        </div>
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
        {comps.map((comp, i) => {
          const val = scores[comp.key];
          const selfVal = selfScores?.[comp.key];
          const isLast = i === comps.length - 1;
          const color = val ? SC_COLORS[val] : undefined;
          const selfColor = selfVal ? SC_COLORS[selfVal] : undefined;

          return (
            <div
              key={comp.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 16px',
                background: i % 2 === 0 ? theme.card : `${theme.sidebar}60`,
                borderBottom: isLast ? 'none' : `1px solid ${theme.border}`,
              }}
            >
              {/* Row number */}
              <span
                style={{
                  color: theme.textDim,
                  fontSize: 10,
                  fontWeight: 700,
                  width: 18,
                  flexShrink: 0,
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                {i + 1}
              </span>

              {/* Competency info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    color: theme.textPrimary,
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: 'Montserrat, sans-serif',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {comp.label}
                </div>
                <div
                  style={{
                    color: theme.textDim,
                    fontSize: 10,
                    fontWeight: 500,
                    fontFamily: 'Montserrat, sans-serif',
                    marginTop: 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {comp.description}
                </div>
              </div>

              {/* Score input / display */}
              {readonly ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {val ? (
                    <>
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          background: `${color}20`,
                          border: `2px solid ${color}`,
                          color,
                          fontSize: 12,
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'Montserrat, sans-serif',
                        }}
                      >
                        {val}
                      </span>
                      <span
                        style={{
                          color: theme.textMuted,
                          fontSize: 10,
                          fontWeight: 600,
                          fontFamily: 'Montserrat, sans-serif',
                        }}
                      >
                        {SC_LABELS[val]}
                      </span>
                    </>
                  ) : (
                    <span style={{ color: theme.textDim, fontSize: 11, fontFamily: 'Montserrat, sans-serif' }}>—</span>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  {/* Self score badge (lead compare mode) */}
                  {showCompare && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 30,
                        height: 30,
                        borderRadius: 6,
                        background: selfVal ? `${selfColor}15` : 'transparent',
                        border: `1px dashed ${selfVal ? selfColor + '60' : theme.border}`,
                        color: selfVal ? selfColor : theme.textDim,
                        fontSize: 12,
                        fontWeight: 800,
                        fontFamily: 'Montserrat, sans-serif',
                        opacity: 0.75,
                        flexShrink: 0,
                      }}
                    >
                      {selfVal ?? '—'}
                    </div>
                  )}
                  {/* Agreed score buttons */}
                  <ScoreBtns
                    val={val}
                    onChange={(v) => onChange?.(comp.key, v)}
                    disabled={false}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
