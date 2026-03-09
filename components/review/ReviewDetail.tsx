'use client';

import { useState } from 'react';
import { Review, SelfReview, LeadReview } from '@/types';
import { AppContext, LeadTxt } from '@/components/AppShell';
import { BEHAVIORAL, FUNCTIONAL, STAGE_META, STATUS_ORDER, Competency } from '@/lib/constants';
import { calcSec, calcOverall, getBand } from '@/lib/scoring';
import { BAND_COLORS, BANDS, C, QVT_BLUE, SC_COLORS, SC_LABELS } from '@/styles/brand';
import { today } from '@/lib/utils';
import Ring from '@/components/atoms/Ring';
import StatusPill from '@/components/atoms/StatusPill';
import Txt from '@/components/atoms/Txt';
import Timeline from '@/components/shared/Timeline';
import SelfScoreTable from '@/components/shared/SelfScoreTable';
import CompareTable from '@/components/shared/CompareTable';
import OverallCard from '@/components/shared/OverallCard';

// ─── Lead-path constants ───────────────────────────────────────────────────────
const LEAD_COLOR = '#0891b2';

const REC_OPTIONS: Array<{ value: string; color: string }> = [
  { value: 'Promote', color: '#22c55e' },
  { value: 'Retain',  color: LEAD_COLOR },
  { value: 'PIP',     color: '#d97706' },
  { value: 'Review',  color: '#64748b' },
];

interface ReviewDetailProps {
  ctx: AppContext;
}

// ─── Score button row ──────────────────────────────────────────────────────────
interface ScoreBtnRowProps {
  score:   number | undefined;
  onScore: (val: number) => void;
}

function ScoreBtnRow({ score, onScore }: ScoreBtnRowProps) {
  const [hovBtn, setHovBtn] = useState<number | null>(null);
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1, 2, 3, 4, 5].map(n => {
        const isSel = score === n;
        const isHov = hovBtn === n;
        return (
          <button
            key={n}
            onClick={() => onScore(n)}
            onMouseEnter={() => setHovBtn(n)}
            onMouseLeave={() => setHovBtn(null)}
            style={{
              width:          36,
              height:         36,
              borderRadius:   8,
              background:     isSel ? `${SC_COLORS[n]}28` : isHov ? `${SC_COLORS[n]}12` : 'transparent',
              border:         `2px solid ${isSel || isHov ? SC_COLORS[n] : C.border}`,
              color:          isSel || isHov ? SC_COLORS[n] : C.textDim,
              fontSize:       13,
              fontWeight:     800,
              cursor:         'pointer',
              boxShadow:      isSel ? `0 0 10px ${SC_COLORS[n]}55` : 'none',
              transition:     'all 0.12s ease',
              fontFamily:     'Montserrat, sans-serif',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              flexShrink:     0,
            }}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

// ─── Single competency row ─────────────────────────────────────────────────────
interface CompRowProps {
  comp:    Competency;
  score:   number | undefined;
  onScore: (val: number) => void;
  isOdd:   boolean;
  isLast:  boolean;
}

function CompRow({ comp, score, onScore, isOdd, isLast }: CompRowProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:      'flex',
        alignItems:   'center',
        gap:          16,
        padding:      '12px 20px',
        background:   hovered ? `${QVT_BLUE}0a` : isOdd ? '#040e18' : C.cardBg,
        borderBottom: isLast ? 'none' : `1px solid ${C.border}`,
        transition:   'background 0.12s',
      }}
    >
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <div
          style={{
            width:          28,
            height:         28,
            borderRadius:   '50%',
            background:     score ? `${SC_COLORS[score]}20` : C.sidebarBg,
            border:         `2px solid ${score ? SC_COLORS[score] : C.border}`,
            color:          score ? SC_COLORS[score] : C.textDim,
            fontSize:       score ? 12 : 16,
            fontWeight:     800,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            flexShrink:     0,
            transition:     'all 0.15s',
            fontFamily:     'Montserrat, sans-serif',
          }}
        >
          {score ?? '·'}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: C.textPrimary, fontSize: 13, fontWeight: 700, fontFamily: 'Montserrat, sans-serif', lineHeight: 1.3 }}>
            {comp.label}
          </div>
          <div style={{ color: C.textMuted, fontSize: 11, fontWeight: 500, fontFamily: 'Montserrat, sans-serif', marginTop: 2, lineHeight: 1.4 }}>
            {comp.description}
          </div>
        </div>
      </div>
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
        <ScoreBtnRow score={score} onScore={onScore} />
        {score !== undefined && (
          <div style={{ color: SC_COLORS[score], fontSize: 10, fontWeight: 700, fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.04em' }}>
            {SC_LABELS[score]}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Assessment section (Part I or Part II) ────────────────────────────────────
interface AssessmentSectionProps {
  part:       'I' | 'II';
  title:      string;
  badgeColor: string;
  comps:      Competency[];
  scores:     Record<string, number>;
  onScore:    (key: string, val: number) => void;
}

function AssessmentSection({ part, title, badgeColor, comps, scores, onScore }: AssessmentSectionProps) {
  const scored = Object.keys(scores).length;
  const sum    = Object.values(scores).reduce((a, b) => a + b, 0);
  const pct    = calcSec(scores);

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
        {/* Header */}
        <div
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            padding:        '12px 20px',
            background:     '#040e18',
            borderBottom:   `1px solid ${C.border}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                background:    `${badgeColor}22`,
                border:        `1px solid ${badgeColor}`,
                color:         badgeColor,
                borderRadius:  20,
                padding:       '2px 10px',
                fontSize:      10,
                fontWeight:    800,
                fontFamily:    'Montserrat, sans-serif',
                letterSpacing: '0.06em',
                whiteSpace:    'nowrap',
              }}
            >
              PART {part}
            </span>
            <div>
              <div style={{ color: C.textPrimary, fontSize: 13, fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>
                {title}
              </div>
              <div style={{ color: C.textDim, fontSize: 10, fontWeight: 500, fontFamily: 'Montserrat, sans-serif', marginTop: 2 }}>
                10 competencies · 5 points each · 50% of overall score
              </div>
            </div>
          </div>
          {scored > 0 && (
            <div style={{ color: BAND_COLORS[getBand(pct)], fontSize: 18, fontWeight: 800, fontFamily: 'Montserrat, sans-serif' }}>
              {Math.round(pct)}%
            </div>
          )}
        </div>

        {/* Rows */}
        {comps.map((comp, idx) => (
          <CompRow
            key={comp.key}
            comp={comp}
            score={scores[comp.key]}
            onScore={val => onScore(comp.key, val)}
            isOdd={idx % 2 === 1}
            isLast={idx === comps.length - 1}
          />
        ))}

        {/* Subtotal */}
        <div
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'flex-end',
            gap:            8,
            padding:        '10px 20px',
            background:     '#040e18',
            borderTop:      `1px solid ${C.border}`,
          }}
        >
          <span style={{ color: C.textDim, fontSize: 11, fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>
            {title} subtotal:
          </span>
          <span style={{ color: C.textPrimary, fontSize: 13, fontWeight: 800, fontFamily: 'Montserrat, sans-serif' }}>
            {sum} / 50 pts
          </span>
          <span style={{ color: C.textDim, fontSize: 11, fontFamily: 'Montserrat, sans-serif' }}>=</span>
          <span
            style={{
              color:      scored > 0 ? BAND_COLORS[getBand(pct)] : C.textDim,
              fontSize:   13,
              fontWeight: 800,
              fontFamily: 'Montserrat, sans-serif',
            }}
          >
            {scored > 0 ? `${pct.toFixed(1)}%` : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Feedback field helper ─────────────────────────────────────────────────────
function FeedbackField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          color:         C.textDim,
          fontSize:      10,
          fontWeight:    700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontFamily:    'Montserrat, sans-serif',
          marginBottom:  4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          color:      C.textPrimary,
          fontSize:   12,
          fontWeight: 500,
          fontFamily: 'Montserrat, sans-serif',
          lineHeight: 1.6,
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ─── My Scores tab ────────────────────────────────────────────────────────────
function MyScoresTab({ review }: { review: Review }) {
  const [secTab, setSecTab] = useState<'beh' | 'fun'>('beh');

  const selfBeh   = review.selfReview?.behavioral ?? {};
  const selfFun   = review.selfReview?.functional ?? {};
  const agreedBeh = review.leadReview?.behavioral ?? {};
  const agreedFun = review.leadReview?.functional ?? {};
  const hasLead   = !!review.leadReview;

  const tabs: Array<{ id: 'beh' | 'fun'; label: string }> = [
    { id: 'beh', label: 'Part I: Behavioral (50%)' },
    { id: 'fun', label: 'Part II: Functional (50%)' },
  ];

  return (
    <div>
      {/* Overall score card */}
      <div style={{ marginBottom: 20 }}>
        <OverallCard review={review} />
      </div>

      {/* Context banner */}
      <div
        style={{
          padding:      '10px 14px',
          background:   `${QVT_BLUE}0a`,
          border:       `1px solid ${QVT_BLUE}25`,
          borderRadius: 8,
          marginBottom: 16,
          color:        C.textMuted,
          fontSize:     11,
          fontWeight:   500,
          fontFamily:   'Montserrat, sans-serif',
          lineHeight:   1.5,
        }}
      >
        {hasLead
          ? "Self Score = what you gave yourself · Agreed Score = supervisor's official mark · Gap: + means supervisor rated you higher"
          : 'Your self-scores are shown below. Agreed scores will appear once your Team Lead submits.'}
      </div>

      {/* Part selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {tabs.map(t => {
          const isSel = secTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSecTab(t.id)}
              style={{
                background:   isSel ? `${QVT_BLUE}20` : C.cardBg,
                border:       `1px solid ${isSel ? QVT_BLUE : C.border}`,
                borderRadius: 8,
                color:        isSel ? QVT_BLUE : C.textMuted,
                fontSize:     12,
                fontWeight:   700,
                cursor:       'pointer',
                padding:      '8px 14px',
                fontFamily:   'Montserrat, sans-serif',
                transition:   'all 0.15s',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Compare table */}
      {secTab === 'beh' ? (
        <CompareTable
          title="Part I: Behavioral Assessment"
          comps={BEHAVIORAL}
          selfScores={selfBeh}
          agreedScores={agreedBeh}
        />
      ) : (
        <CompareTable
          title="Part II: Functional Assessment"
          comps={FUNCTIONAL}
          selfScores={selfFun}
          agreedScores={agreedFun}
        />
      )}

      {/* Band guide */}
      <div
        style={{
          marginTop:    20,
          padding:      '12px 16px',
          background:   C.cardBg,
          border:       `1px solid ${C.border}`,
          borderRadius: 8,
        }}
      >
        <div
          style={{
            color:         C.textDim,
            fontSize:      10,
            fontWeight:    700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontFamily:    'Montserrat, sans-serif',
            marginBottom:  10,
          }}
        >
          Performance Bands
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
          {BANDS.map(b => (
            <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div
                style={{
                  width:        8,
                  height:       8,
                  borderRadius: '50%',
                  background:   b.color,
                  flexShrink:   0,
                }}
              />
              <span
                style={{
                  color:      C.textMuted,
                  fontSize:   11,
                  fontWeight: 600,
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                {b.minPct > 0 ? `${b.minPct}%+` : '0%'} · {b.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Feedback & Results tab ────────────────────────────────────────────────────
function FeedbackTab({ review }: { review: Review }) {
  const { leadReview, hrReview, ceoReview } = review;
  const hasAnything = !!(leadReview || hrReview || ceoReview?.text?.finalDecision);

  if (!hasAnything) {
    return (
      <div
        style={{
          padding:    '48px 24px',
          textAlign:  'center',
          color:      C.textMuted,
          fontSize:   13,
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 500,
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 14, opacity: 0.3 }}>💬</div>
        <div>Supervisor feedback and results will appear here as stages are completed.</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* CEO final decision */}
      {ceoReview?.text?.finalDecision && (
        <div
          style={{
            background:   `${C.success}10`,
            border:       `1px solid ${C.success}35`,
            borderRadius: 10,
            padding:      '16px 20px',
          }}
        >
          <div
            style={{
              color:         C.success,
              fontSize:      10,
              fontWeight:    700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontFamily:    'Montserrat, sans-serif',
              marginBottom:  12,
            }}
          >
            🎯 CEO Final Decision
          </div>
          <div
            style={{
              color:        C.textPrimary,
              fontSize:     13,
              fontWeight:   600,
              fontFamily:   'Montserrat, sans-serif',
              lineHeight:   1.5,
              marginBottom: ceoReview.text.ceoNotes ? 10 : 0,
            }}
          >
            {ceoReview.text.finalDecision}
          </div>
          {ceoReview.text.ceoNotes ? (
            <div style={{ color: C.textMuted, fontSize: 12, fontWeight: 500, fontFamily: 'Montserrat, sans-serif', lineHeight: 1.5 }}>
              {ceoReview.text.ceoNotes}
            </div>
          ) : null}
        </div>
      )}

      {/* Team Lead feedback */}
      {leadReview?.text && (
        <div
          style={{
            background:   `${QVT_BLUE}08`,
            border:       `1px solid ${QVT_BLUE}35`,
            borderRadius: 10,
            padding:      '16px 20px',
          }}
        >
          <div
            style={{
              color:         QVT_BLUE,
              fontSize:      10,
              fontWeight:    700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontFamily:    'Montserrat, sans-serif',
              marginBottom:  12,
            }}
          >
            👥 Team Lead Feedback
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {leadReview.text.strengths      ? <FeedbackField label="Strengths"                  value={leadReview.text.strengths}      /> : null}
            {leadReview.text.improvements   ? <FeedbackField label="Areas for Improvement"      value={leadReview.text.improvements}   /> : null}
            {leadReview.text.trainings      ? <FeedbackField label="Training Recommendations"   value={leadReview.text.trainings}      /> : null}
            {leadReview.text.recommendation ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    color:         C.textDim,
                    fontSize:      10,
                    fontWeight:    700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontFamily:    'Montserrat, sans-serif',
                  }}
                >
                  Recommendation:
                </span>
                <span
                  style={{
                    background:   `${QVT_BLUE}20`,
                    border:       `1px solid ${QVT_BLUE}50`,
                    color:        QVT_BLUE,
                    borderRadius: 20,
                    padding:      '2px 10px',
                    fontSize:     11,
                    fontWeight:   700,
                    fontFamily:   'Montserrat, sans-serif',
                  }}
                >
                  {leadReview.text.recommendation}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* HR development plan */}
      {hrReview?.text && (
        <div
          style={{
            background:   `${C.purple}08`,
            border:       `1px solid ${C.purple}35`,
            borderRadius: 10,
            padding:      '16px 20px',
          }}
        >
          <div
            style={{
              color:         C.purple,
              fontSize:      10,
              fontWeight:    700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontFamily:    'Montserrat, sans-serif',
              marginBottom:  12,
            }}
          >
            🏢 HR Development Plan
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {hrReview.text.hrComments ? <FeedbackField label="HR Comments"              value={hrReview.text.hrComments} /> : null}
            {hrReview.text.techDev    ? <FeedbackField label="Technical Development"    value={hrReview.text.techDev}    /> : null}
            {hrReview.text.behDev     ? <FeedbackField label="Behavioral Development"   value={hrReview.text.behDev}     /> : null}
            {hrReview.text.hrRemarks  ? <FeedbackField label="HR Remarks"               value={hrReview.text.hrRemarks}  /> : null}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── My Submission tab ────────────────────────────────────────────────────────
function SubmissionTab({ review }: { review: Review }) {
  const selfRev = review.selfReview!;

  return (
    <div>
      {/* Info banner */}
      <div
        style={{
          padding:      '10px 14px',
          background:   `${C.textDim}12`,
          border:       `1px solid ${C.border}`,
          borderRadius: 8,
          marginBottom: 20,
          color:        C.textMuted,
          fontSize:     11,
          fontWeight:   600,
          fontFamily:   'Montserrat, sans-serif',
        }}
      >
        ℹ️ Your submitted self-review — read only.
      </div>

      {/* Score tables */}
      <SelfScoreTable
        title="Part I: Behavioral Assessment"
        comps={BEHAVIORAL}
        scores={selfRev.behavioral}
        readonly
      />
      <div style={{ marginBottom: 8 }} />
      <SelfScoreTable
        title="Part II: Functional Assessment"
        comps={FUNCTIONAL}
        scores={selfRev.functional}
        readonly
      />

      {/* Comment fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 20 }}>
        <Txt
          label="Key Accomplishments This Period"
          value={selfRev.text.accomplishments}
          onChange={() => {}}
          readonly
          rows={3}
        />
        <Txt
          label="Challenges & How You Addressed Them"
          value={selfRev.text.challenges}
          onChange={() => {}}
          readonly
          rows={3}
        />
        <Txt
          label="Goals for Next Period"
          value={selfRev.text.goals}
          onChange={() => {}}
          readonly
          rows={3}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Txt
            label="Technical Development Needs"
            value={selfRev.text.techDev}
            onChange={() => {}}
            readonly
            rows={2}
          />
          <Txt
            label="Behavioral Development Needs"
            value={selfRev.text.behDev}
            onChange={() => {}}
            readonly
            rows={2}
          />
        </div>
      </div>

      {/* Submitted badge */}
      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
        <span
          style={{
            display:      'inline-flex',
            alignItems:   'center',
            gap:          6,
            background:   `${C.success}15`,
            border:       `1px solid ${C.success}40`,
            color:        C.success,
            borderRadius: 20,
            padding:      '5px 14px',
            fontSize:     11,
            fontWeight:   700,
            fontFamily:   'Montserrat, sans-serif',
          }}
        >
          ✓ Submitted {selfRev.submittedAt}
        </span>
      </div>
    </div>
  );
}

// ─── Lead: self-review read-only tab ──────────────────────────────────────────
interface LeadSelfTabProps {
  rev: Review;
  selfSubTab: 'beh' | 'fun' | 'comments';
  setSelfSubTab: (t: 'beh' | 'fun' | 'comments') => void;
}

function LeadSelfTab({ rev, selfSubTab, setSelfSubTab }: LeadSelfTabProps) {
  const selfRev = rev.selfReview;
  if (!selfRev) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center', color: C.textMuted, fontSize: 13, fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
        No self-review data found.
      </div>
    );
  }

  const subTabs = [
    { id: 'beh',      label: 'Part I: Behavioral' },
    { id: 'fun',      label: 'Part II: Functional' },
    { id: 'comments', label: 'Employee Comments' },
  ] as const;

  return (
    <div>
      {/* Info banner */}
      <div style={{ padding: '10px 14px', background: `${C.textDim}12`, border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 16, color: C.textMuted, fontSize: 11, fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>
        ℹ️ Employee self-assessment — read only.
      </div>

      {/* Sub-tab bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {subTabs.map(t => {
          const isSel = selfSubTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSelfSubTab(t.id)}
              style={{
                background:   isSel ? `${LEAD_COLOR}20` : C.cardBg,
                border:       `1px solid ${isSel ? LEAD_COLOR : C.border}`,
                borderRadius: 8,
                color:        isSel ? LEAD_COLOR : C.textMuted,
                fontSize:     12,
                fontWeight:   700,
                cursor:       'pointer',
                padding:      '8px 14px',
                fontFamily:   'Montserrat, sans-serif',
                transition:   'all 0.15s',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Sub-tab content */}
      {selfSubTab === 'beh' && (
        <SelfScoreTable
          title="Part I: Behavioral Assessment (50%)"
          comps={BEHAVIORAL}
          scores={selfRev.behavioral}
          readonly
        />
      )}
      {selfSubTab === 'fun' && (
        <SelfScoreTable
          title="Part II: Functional Assessment (50%)"
          comps={FUNCTIONAL}
          scores={selfRev.functional}
          readonly
        />
      )}
      {selfSubTab === 'comments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Txt label="Key Accomplishments This Period"      value={selfRev.text.accomplishments} onChange={() => {}} readonly rows={3} />
          <Txt label="Challenges & How You Addressed Them" value={selfRev.text.challenges}      onChange={() => {}} readonly rows={3} />
          <Txt label="Goals for Next Period"               value={selfRev.text.goals}            onChange={() => {}} readonly rows={3} />
          <Txt label="Technical Development Needs"         value={selfRev.text.techDev}          onChange={() => {}} readonly rows={2} />
          <Txt label="Behavioral Development Needs"        value={selfRev.text.behDev}           onChange={() => {}} readonly rows={2} />
        </div>
      )}

      {/* Submitted badge */}
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${C.success}15`, border: `1px solid ${C.success}40`, color: C.success, borderRadius: 20, padding: '5px 14px', fontSize: 11, fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>
          ✓ Submitted {selfRev.submittedAt}
        </span>
      </div>
    </div>
  );
}

// ─── Lead: team lead scoring tab ──────────────────────────────────────────────
interface LeadScoringTabProps {
  rev:          Review;
  canEdit:      boolean;
  leadBeh:      Record<string, number>;
  leadFun:      Record<string, number>;
  leadTxt:      LeadTxt;
  setLeadBeh:   (v: Record<string, number>) => void;
  setLeadFun:   (v: Record<string, number>) => void;
  setLeadTxt:   (v: LeadTxt) => void;
  previewRev:   Review;
  leadSubTab:   'beh' | 'fun' | 'feedback';
  setLeadSubTab:(t: 'beh' | 'fun' | 'feedback') => void;
  onSubmit:     () => void;
}

function LeadScoringTab({
  rev, canEdit, leadBeh, leadFun, leadTxt,
  setLeadBeh, setLeadFun, setLeadTxt,
  previewRev, leadSubTab, setLeadSubTab, onSubmit,
}: LeadScoringTabProps) {
  const selfBeh = rev.selfReview?.behavioral ?? {};
  const selfFun = rev.selfReview?.functional ?? {};

  const subTabs = [
    { id: 'beh',      label: 'Part I: Behavioral' },
    { id: 'fun',      label: 'Part II: Functional' },
    { id: 'feedback', label: 'Feedback & Recommendation' },
  ] as const;

  const bannerText = canEdit
    ? '✏️ Enter Agreed Scores for all 20 competencies. These become the official record.'
    : rev.leadReview
      ? '✓ Team Lead review submitted — read only.'
      : '⏳ Team Lead review not yet submitted.';

  return (
    <div>
      {/* Info banner */}
      <div style={{ padding: '10px 14px', background: canEdit ? `${LEAD_COLOR}0c` : `${C.textDim}12`, border: `1px solid ${canEdit ? LEAD_COLOR + '30' : C.border}`, borderRadius: 8, marginBottom: 16, color: canEdit ? '#7dd3fc' : C.textMuted, fontSize: 11, fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>
        {bannerText}
      </div>

      {/* OverallCard live preview */}
      <div style={{ marginBottom: 20 }}>
        <OverallCard review={previewRev} />
      </div>

      {/* Sub-tab bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {subTabs.map(t => {
          const isSel = leadSubTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setLeadSubTab(t.id)}
              style={{
                background:   isSel ? `${LEAD_COLOR}20` : C.cardBg,
                border:       `1px solid ${isSel ? LEAD_COLOR : C.border}`,
                borderRadius: 8,
                color:        isSel ? LEAD_COLOR : C.textMuted,
                fontSize:     12,
                fontWeight:   700,
                cursor:       'pointer',
                padding:      '8px 14px',
                fontFamily:   'Montserrat, sans-serif',
                transition:   'all 0.15s',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Part I: Behavioral */}
      {leadSubTab === 'beh' && (
        <SelfScoreTable
          title="Part I: Behavioral Assessment (50%)"
          comps={BEHAVIORAL}
          scores={leadBeh}
          selfScores={selfBeh}
          onChange={canEdit ? (k, v) => setLeadBeh({ ...leadBeh, [k]: v }) : undefined}
          readonly={!canEdit}
        />
      )}

      {/* Part II: Functional */}
      {leadSubTab === 'fun' && (
        <SelfScoreTable
          title="Part II: Functional Assessment (50%)"
          comps={FUNCTIONAL}
          scores={leadFun}
          selfScores={selfFun}
          onChange={canEdit ? (k, v) => setLeadFun({ ...leadFun, [k]: v }) : undefined}
          readonly={!canEdit}
        />
      )}

      {/* Feedback & Recommendation */}
      {leadSubTab === 'feedback' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Txt
            label="Major Strengths"
            value={leadTxt.strengths}
            onChange={v => canEdit && setLeadTxt({ ...leadTxt, strengths: v })}
            readonly={!canEdit}
            rows={3}
          />
          <Txt
            label="Areas for Improvement"
            value={leadTxt.improvements}
            onChange={v => canEdit && setLeadTxt({ ...leadTxt, improvements: v })}
            readonly={!canEdit}
            rows={3}
          />
          <Txt
            label="Recommended Trainings"
            value={leadTxt.trainings}
            onChange={v => canEdit && setLeadTxt({ ...leadTxt, trainings: v })}
            readonly={!canEdit}
            rows={2}
          />
          <Txt
            label="Employee Comments on Record"
            value={leadTxt.employeeComments}
            onChange={v => canEdit && setLeadTxt({ ...leadTxt, employeeComments: v })}
            readonly={!canEdit}
            rows={2}
          />

          {/* Recommendation selector */}
          <div>
            <div style={{ color: C.textDim, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontFamily: 'Montserrat, sans-serif', marginBottom: 10 }}>
              Recommendation
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
              {REC_OPTIONS.map(opt => {
                const isSel = leadTxt.recommendation === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => canEdit && setLeadTxt({ ...leadTxt, recommendation: opt.value })}
                    disabled={!canEdit}
                    style={{
                      background:  isSel ? `${opt.color}25` : 'transparent',
                      border:      `2px solid ${isSel ? opt.color : C.border}`,
                      borderRadius: 8,
                      color:       isSel ? opt.color : C.textMuted,
                      padding:     '8px 22px',
                      fontSize:    13,
                      fontWeight:  800,
                      cursor:      canEdit ? 'pointer' : 'default',
                      fontFamily:  'Montserrat, sans-serif',
                      transition:  'all 0.15s',
                      boxShadow:   isSel ? `0 0 12px ${opt.color}40` : 'none',
                    }}
                  >
                    {opt.value}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Submit row */}
      {canEdit && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28 }}>
          <button
            onClick={onSubmit}
            style={{
              background:    LEAD_COLOR,
              border:        'none',
              borderRadius:  8,
              color:         '#fff',
              padding:       '12px 28px',
              fontSize:      13,
              fontWeight:    800,
              cursor:        'pointer',
              fontFamily:    'Montserrat, sans-serif',
              letterSpacing: '0.02em',
              transition:    'opacity 0.15s',
            }}
          >
            Submit Team Lead Review →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Lead: placeholder for stages not yet reached ─────────────────────────────
function StageHolder({ stageName, stageData }: { stageName: string; stageData: unknown }) {
  if (!stageData) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center', background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12 }}>
        <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.2 }}>🔒</div>
        <div style={{ color: C.textMuted, fontSize: 13, fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>
          This stage has not been reached yet.
        </div>
        <div style={{ color: C.textDim, fontSize: 11, fontWeight: 500, fontFamily: 'Montserrat, sans-serif', marginTop: 6 }}>
          {stageName} review will unlock once the previous stage is complete.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 24px', background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12 }}>
      <div style={{ color: C.success, fontSize: 11, fontWeight: 700, fontFamily: 'Montserrat, sans-serif', marginBottom: 10 }}>
        ✓ {stageName} review submitted.
      </div>
      <div style={{ color: C.textDim, fontSize: 11, fontWeight: 500, fontFamily: 'Montserrat, sans-serif' }}>
        Full review details will be shown in a future phase.
      </div>
    </div>
  );
}

// ─── Lead review detail (full layout) ─────────────────────────────────────────
interface LeadDetailProps {
  ctx:      AppContext;
  rev:      Review;
  subtitle: string;
  goBack:   () => void;
}

function LeadReviewDetail({ ctx, rev, subtitle, goBack }: LeadDetailProps) {
  const [stageTab,    setStageTab]    = useState<'self' | 'lead' | 'hr' | 'coo' | 'ceo'>('lead');
  const [leadSubTab,  setLeadSubTab]  = useState<'beh' | 'fun' | 'feedback'>('beh');
  const [selfSubTab,  setSelfSubTab]  = useState<'beh' | 'fun' | 'comments'>('beh');

  const { canEdit, leadBeh, leadFun, leadTxt, setLeadBeh, setLeadFun, setLeadTxt } = ctx;

  const statusIdx = STATUS_ORDER.indexOf(rev.status);

  function isLocked(tab: 'self' | 'lead' | 'hr' | 'coo' | 'ceo'): boolean {
    const minIdx: Record<string, number> = { self: 1, lead: 1, hr: 2, coo: 3, ceo: 4 };
    return statusIdx < minIdx[tab];
  }

  function isDone(tab: 'self' | 'lead' | 'hr' | 'coo' | 'ceo'): boolean {
    switch (tab) {
      case 'self': return !!rev.selfReview;
      case 'lead': return !!rev.leadReview;
      case 'hr':   return !!rev.hrReview;
      case 'coo':  return !!rev.cooReview;
      case 'ceo':  return !!rev.ceoReview;
    }
  }

  // Build a preview review that reflects the live edit buffers for OverallCard
  const hasAnyLeadScore = Object.keys(leadBeh).length > 0 || Object.keys(leadFun).length > 0;
  const previewRev: Review = hasAnyLeadScore
    ? {
        ...rev,
        leadReview: {
          behavioral: leadBeh as LeadReview['behavioral'],
          functional: leadFun as LeadReview['functional'],
          text:        leadTxt,
          submittedAt: '',
        },
      }
    : rev;

  const dispBeh     = previewRev.leadReview?.behavioral ?? previewRev.selfReview?.behavioral ?? {};
  const dispFun     = previewRev.leadReview?.functional ?? previewRev.selfReview?.functional ?? {};
  const overallPct  = calcOverall(dispBeh, dispFun);
  const hasOverall  = Object.keys(dispBeh).length > 0 || Object.keys(dispFun).length > 0;

  function submitLead() {
    const missingBeh = BEHAVIORAL.filter(c => !(leadBeh[c.key] >= 1));
    const missingFun = FUNCTIONAL.filter(c => !(leadFun[c.key] >= 1));

    if (missingBeh.length > 0) {
      ctx.showToast(`Score all 10 Behavioral competencies — ${missingBeh.length} still missing.`, 'error');
      return;
    }
    if (missingFun.length > 0) {
      ctx.showToast(`Score all 10 Functional competencies — ${missingFun.length} still missing.`, 'error');
      return;
    }
    if (!leadTxt.recommendation) {
      ctx.showToast('Please select a Recommendation before submitting.', 'error');
      return;
    }

    const leadReview: LeadReview = {
      behavioral:  leadBeh as LeadReview['behavioral'],
      functional:  leadFun as LeadReview['functional'],
      text:        leadTxt,
      submittedAt: today(),
    };

    ctx.patch({ ...rev, status: 'lead_done', leadReview });
    ctx.addRem(rev.id, 'hr', `Team Lead review complete for ${rev.employeeName}. HR assessment required.`);
    ctx.showToast('Team Lead review submitted! People Lead (HR) notified.', 'success');
  }

  const stageTabs = [
    { id: 'self' as const, icon: '👤', label: 'Self-Review' },
    { id: 'lead' as const, icon: '👥', label: 'Team Lead' },
    { id: 'hr'   as const, icon: '🤝', label: 'People Lead (HR)' },
    { id: 'coo'  as const, icon: '🏢', label: 'COO' },
    { id: 'ceo'  as const, icon: '🎯', label: 'CEO' },
  ];

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ padding: '20px 32px 16px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <button
            onClick={goBack}
            style={{ background: 'transparent', border: 'none', color: LEAD_COLOR, fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0, fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
          >
            ← Back
          </button>
          {hasOverall && <Ring pct={overallPct} size={72} />}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
          <h1 style={{ color: C.textPrimary, fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em', margin: 0, fontFamily: 'Montserrat, sans-serif' }}>
            {rev.employeeName}
          </h1>
          <StatusPill status={rev.status} />
        </div>
        {subtitle && (
          <p style={{ color: C.textMuted, fontSize: 12, fontWeight: 500, margin: '0 0 14px', fontFamily: 'Montserrat, sans-serif', lineHeight: 1.5 }}>
            {subtitle}
          </p>
        )}
        <Timeline status={rev.status} />
      </div>

      {/* ── 5-stage tab bar ────────────────────────────────────────────────── */}
      <div style={{ padding: '0 32px', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 0, overflowX: 'auto' as const }}>
        {stageTabs.map(tab => {
          const locked   = isLocked(tab.id);
          const done     = isDone(tab.id);
          const isActive = stageTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => !locked && setStageTab(tab.id)}
              title={locked ? 'This stage has not been reached yet' : undefined}
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          6,
                background:   'transparent',
                border:       'none',
                borderBottom: `2px solid ${isActive && !locked ? LEAD_COLOR : 'transparent'}`,
                color:        locked ? C.textDim : isActive ? C.textPrimary : C.textMuted,
                padding:      '12px 16px',
                fontSize:     12,
                fontWeight:   700,
                cursor:       locked ? 'not-allowed' : 'pointer',
                fontFamily:   'Montserrat, sans-serif',
                opacity:      locked ? 0.4 : 1,
                transition:   'color 0.15s, border-color 0.15s',
                marginBottom: -1,
                whiteSpace:   'nowrap' as const,
                flexShrink:   0,
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {locked && <span style={{ fontSize: 10 }}>🔒</span>}
              {!locked && done && !isActive && (
                <span style={{ color: C.success, fontSize: 11, fontWeight: 800 }}>✓</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab content ────────────────────────────────────────────────────── */}
      <div style={{ padding: '24px 32px' }}>
        {stageTab === 'self' && (
          <LeadSelfTab rev={rev} selfSubTab={selfSubTab} setSelfSubTab={setSelfSubTab} />
        )}

        {stageTab === 'lead' && (
          <LeadScoringTab
            rev={rev}
            canEdit={canEdit.lead}
            leadBeh={leadBeh}
            leadFun={leadFun}
            leadTxt={leadTxt}
            setLeadBeh={setLeadBeh}
            setLeadFun={setLeadFun}
            setLeadTxt={setLeadTxt}
            previewRev={previewRev}
            leadSubTab={leadSubTab}
            setLeadSubTab={setLeadSubTab}
            onSubmit={submitLead}
          />
        )}

        {stageTab === 'hr'  && <StageHolder stageName="People Lead (HR)" stageData={rev.hrReview}  />}
        {stageTab === 'coo' && <StageHolder stageName="COO"               stageData={rev.cooReview} />}
        {stageTab === 'ceo' && <StageHolder stageName="CEO"               stageData={rev.ceoReview} />}
      </div>
    </div>
  );
}

// ─── ReviewDetail ──────────────────────────────────────────────────────────────
export default function ReviewDetail({ ctx }: ReviewDetailProps) {
  const [activeTab, setActiveTab] = useState<'scores' | 'feedback' | 'submission'>('scores');

  const {
    role, activeRev,
    selfBeh, selfFun, selfTxt,
    setSelfBeh, setSelfFun, setSelfTxt,
  } = ctx;

  if (!activeRev) return null;
  const rev = activeRev;

  const subtitle = [
    rev.jobTitle,
    rev.department,
    rev.period,
    rev.supervisorName ? `Supervisor: ${rev.supervisorName}` : '',
  ]
    .filter(Boolean)
    .join(' · ');

  function goBack() {
    ctx.setView('dashboard');
    ctx.setActiveRev(null);
  }

  // ── Lead reviewer path ─────────────────────────────────────────────────────
  if (role === 'lead') {
    return <LeadReviewDetail ctx={ctx} rev={rev} subtitle={subtitle} goBack={goBack} />;
  }

  // ── Other reviewer stub (HR, COO, CEO) ─────────────────────────────────────
  if (role !== 'employee') {
    return (
      <div>
        <div style={{ padding: '20px 32px 16px', borderBottom: `1px solid ${C.border}` }}>
          <button
            onClick={goBack}
            style={{ background: 'transparent', border: 'none', color: QVT_BLUE, fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0, fontFamily: 'Montserrat, sans-serif', marginBottom: 12, display: 'block' }}
          >
            ← Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h1 style={{ color: C.textPrimary, fontSize: 20, fontWeight: 800, margin: 0, fontFamily: 'Montserrat, sans-serif' }}>
              {rev.employeeName}
            </h1>
            <StatusPill status={rev.status} />
          </div>
          {subtitle && (
            <p style={{ color: C.textMuted, fontSize: 12, fontWeight: 500, margin: '0 0 14px', fontFamily: 'Montserrat, sans-serif' }}>
              {subtitle}
            </p>
          )}
          <Timeline status={rev.status} />
        </div>
        <div style={{ padding: '32px', color: C.textMuted, fontSize: 12, fontFamily: 'Montserrat, sans-serif' }}>
          HR / COO / CEO review forms coming in Phase 4C & 4D.
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ── SUBMITTED VIEW (employee, status !== 'draft') ──────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  if (rev.status !== 'draft') {
    const displayBeh  = rev.leadReview?.behavioral ?? rev.selfReview?.behavioral ?? {};
    const displayFun  = rev.leadReview?.functional ?? rev.selfReview?.functional ?? {};
    const dispOverall = calcOverall(displayBeh, displayFun);
    const hasDispScore = Object.keys(displayBeh).length > 0 || Object.keys(displayFun).length > 0;

    const tabDefs: Array<{ id: typeof activeTab; label: string }> = [
      { id: 'scores',     label: '📊 My Scores' },
      { id: 'feedback',   label: '💬 Feedback & Results' },
      { id: 'submission', label: '📝 My Submission' },
    ];

    return (
      <div>
        {/* Header */}
        <div style={{ padding: '20px 32px 16px', borderBottom: `1px solid ${C.border}` }}>
          <div
            style={{
              display:        'flex',
              alignItems:     'flex-start',
              justifyContent: 'space-between',
              marginBottom:   12,
            }}
          >
            <button
              onClick={goBack}
              style={{
                background:    'transparent',
                border:        'none',
                color:         QVT_BLUE,
                fontSize:      12,
                fontWeight:    700,
                cursor:        'pointer',
                padding:       0,
                fontFamily:    'Montserrat, sans-serif',
                letterSpacing: '0.02em',
              }}
            >
              ← Back
            </button>
            {hasDispScore && <Ring pct={dispOverall} size={72} />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <h1
              style={{
                color:         C.textPrimary,
                fontSize:      20,
                fontWeight:    800,
                letterSpacing: '-0.01em',
                margin:        0,
                fontFamily:    'Montserrat, sans-serif',
              }}
            >
              {rev.employeeName}
            </h1>
            <StatusPill status={rev.status} />
          </div>
          {subtitle ? (
            <p style={{ color: C.textMuted, fontSize: 12, fontWeight: 500, margin: '0 0 14px', fontFamily: 'Montserrat, sans-serif', lineHeight: 1.5 }}>
              {subtitle}
            </p>
          ) : null}
          <Timeline status={rev.status} />
        </div>

        {/* Content */}
        <div style={{ padding: '24px 32px' }}>
          {/* Status banner */}
          {rev.status === 'completed' ? (
            <div
              style={{
                background:   `${C.success}12`,
                border:       `1px solid ${C.success}30`,
                borderRadius: 8,
                padding:      '12px 16px',
                marginBottom: 20,
              }}
            >
              <span style={{ color: C.success, fontSize: 12, fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>
                ✅ Appraisal fully approved on {rev.ceoReview?.submittedAt}
              </span>
            </div>
          ) : (
            <div
              style={{
                background:   `${QVT_BLUE}0c`,
                border:       `1px solid ${QVT_BLUE}30`,
                borderRadius: 8,
                padding:      '12px 16px',
                marginBottom: 20,
              }}
            >
              <span style={{ color: C.textMuted, fontSize: 12, fontWeight: 500, fontFamily: 'Montserrat, sans-serif' }}>
                ⏳ Self-review submitted on {rev.selfReview?.submittedAt}. Currently with{' '}
                {STAGE_META[rev.status].label}. Agreed scores and feedback will appear here as each
                stage completes.
              </span>
            </div>
          )}

          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, marginBottom: 20 }}>
            {tabDefs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background:   'transparent',
                  border:       'none',
                  borderBottom: `2px solid ${activeTab === tab.id ? QVT_BLUE : 'transparent'}`,
                  color:        activeTab === tab.id ? C.textPrimary : C.textMuted,
                  padding:      '10px 20px',
                  fontSize:     12,
                  fontWeight:   700,
                  cursor:       'pointer',
                  fontFamily:   'Montserrat, sans-serif',
                  transition:   'color 0.15s, border-color 0.15s',
                  marginBottom: -1,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'scores'     && <MyScoresTab  review={rev} />}
          {activeTab === 'feedback'   && <FeedbackTab  review={rev} />}
          {activeTab === 'submission' && <SubmissionTab review={rev} />}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ── DRAFT FORM (employee, status === 'draft') ─────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  const behScored = Object.keys(selfBeh).length;
  const funScored = Object.keys(selfFun).length;
  const overall   = calcOverall(selfBeh, selfFun);
  const hasScore  = behScored > 0 || funScored > 0;
  const allDone   = behScored === 10 && funScored === 10;

  function setBeh(key: string, val: number) {
    setSelfBeh({ ...selfBeh, [key]: val });
  }
  function setFun(key: string, val: number) {
    setSelfFun({ ...selfFun, [key]: val });
  }

  function submitSelf() {
    const allBeh = BEHAVIORAL.every(c => (selfBeh[c.key] ?? 0) >= 1);
    const allFun = FUNCTIONAL.every(c => (selfFun[c.key] ?? 0) >= 1);

    if (!allBeh || !allFun) {
      ctx.showToast('Please score all 20 competencies before submitting', 'error');
      return;
    }

    const selfReview: SelfReview = {
      behavioral: selfBeh as SelfReview['behavioral'],
      functional: selfFun as SelfReview['functional'],
      text:        selfTxt,
      submittedAt: today(),
    };

    ctx.patch({ ...rev, status: 'self_done', selfReview });
    ctx.addRem(
      rev.id,
      'lead',
      `Self-review submitted by ${rev.employeeName}. Your Team Lead assessment is now due.`,
    );
    ctx.showToast('Self-review submitted! Team Lead has been notified.', 'success');
  }

  return (
    <div>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ padding: '20px 32px 16px', borderBottom: `1px solid ${C.border}` }}>
        <div
          style={{
            display:        'flex',
            alignItems:     'flex-start',
            justifyContent: 'space-between',
            marginBottom:   12,
          }}
        >
          <button
            onClick={goBack}
            style={{
              background:    'transparent',
              border:        'none',
              color:         QVT_BLUE,
              fontSize:      12,
              fontWeight:    700,
              cursor:        'pointer',
              padding:       0,
              fontFamily:    'Montserrat, sans-serif',
              letterSpacing: '0.02em',
            }}
          >
            ← Back
          </button>
          {hasScore && <Ring pct={overall} size={72} />}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
          <h1
            style={{
              color:         C.textPrimary,
              fontSize:      20,
              fontWeight:    800,
              letterSpacing: '-0.01em',
              margin:        0,
              fontFamily:    'Montserrat, sans-serif',
            }}
          >
            {rev.employeeName}
          </h1>
          <StatusPill status={rev.status} />
        </div>
        {subtitle ? (
          <p
            style={{
              color:      C.textMuted,
              fontSize:   12,
              fontWeight: 500,
              margin:     '0 0 14px',
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </p>
        ) : null}
        <Timeline status={rev.status} />
      </div>

      {/* ── Main form content ──────────────────────────────────────────────── */}
      <div style={{ padding: '24px 32px', paddingBottom: 88 }}>

        {/* Hero instruction card */}
        <div
          style={{
            background:   '#d9770618',
            border:       '1px solid #d9770635',
            borderRadius: 12,
            padding:      '18px 20px',
            marginBottom: 24,
          }}
        >
          <div
            style={{
              color:        '#d97706',
              fontSize:     13,
              fontWeight:   800,
              fontFamily:   'Montserrat, sans-serif',
              marginBottom: 8,
            }}
          >
            📝 Your Performance Self-Review — {rev.period}
          </div>
          <p
            style={{
              color:      C.textMuted,
              fontSize:   12,
              fontWeight: 500,
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.6,
              margin:     '0 0 14px',
            }}
          >
            Rate yourself on each competency using the 1–5 scale. Be honest — your supervisor will
            review your scores and enter their own Agreed Score separately before results are
            finalised.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div
                  style={{
                    width:          22,
                    height:         22,
                    borderRadius:   5,
                    background:     SC_COLORS[n],
                    color:          '#fff',
                    fontSize:       12,
                    fontWeight:     800,
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    fontFamily:     'Montserrat, sans-serif',
                    flexShrink:     0,
                  }}
                >
                  {n}
                </div>
                <span style={{ color: C.textMuted, fontSize: 11, fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>
                  {SC_LABELS[n]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live progress tracker */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Part I: Behavioral', scored: behScored },
            { label: 'Part II: Functional', scored: funScored },
          ].map(({ label, scored }) => (
            <div
              key={label}
              style={{
                flex:         1,
                background:   C.cardBg,
                border:       `1px solid ${C.border}`,
                borderRadius: 10,
                padding:      '14px 16px',
              }}
            >
              <div
                style={{
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'space-between',
                  marginBottom:   10,
                }}
              >
                <div style={{ color: C.textPrimary, fontSize: 12, fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>
                  {label}
                </div>
                <div
                  style={{
                    color:      scored === 10 ? C.success : C.textMuted,
                    fontSize:   12,
                    fontWeight: 800,
                    fontFamily: 'Montserrat, sans-serif',
                  }}
                >
                  {scored}<span style={{ color: C.textDim }}>/10</span>
                </div>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: C.border, overflow: 'hidden' }}>
                <div
                  style={{
                    height:       '100%',
                    borderRadius: 3,
                    width:        `${(scored / 10) * 100}%`,
                    background:   scored === 10 ? C.success : C.warning,
                    transition:   'width 0.4s ease, background 0.3s',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Part I */}
        <AssessmentSection
          part="I"
          title="Behavioral Assessment"
          badgeColor={QVT_BLUE}
          comps={BEHAVIORAL}
          scores={selfBeh}
          onScore={setBeh}
        />

        {/* Part II */}
        <AssessmentSection
          part="II"
          title="Functional Assessment"
          badgeColor={C.purple}
          comps={FUNCTIONAL}
          scores={selfFun}
          onScore={setFun}
        />

        {/* Live score preview Ring */}
        {hasScore && (
          <div
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          24,
              padding:      '20px 24px',
              background:   `${BAND_COLORS[getBand(overall)]}0d`,
              border:       `1px solid ${BAND_COLORS[getBand(overall)]}30`,
              borderRadius: 12,
              marginBottom: 24,
            }}
          >
            <Ring pct={overall} size={96} />
            <div>
              <div
                style={{
                  color:         BAND_COLORS[getBand(overall)],
                  fontSize:      10,
                  fontWeight:    700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontFamily:    'Montserrat, sans-serif',
                  marginBottom:  4,
                }}
              >
                Live Preview — Overall Score
              </div>
              <div
                style={{
                  color:        BAND_COLORS[getBand(overall)],
                  fontSize:     24,
                  fontWeight:   800,
                  fontFamily:   'Montserrat, sans-serif',
                  lineHeight:   1.1,
                  marginBottom: 6,
                }}
              >
                {getBand(overall)}
              </div>
              <div
                style={{
                  color:      C.textMuted,
                  fontSize:   11,
                  fontWeight: 500,
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.5,
                  maxWidth:   320,
                }}
              >
                This score updates live as you rate each competency. Your supervisor will review
                and enter Agreed Scores before results are finalised.
              </div>
            </div>
          </div>
        )}

        {/* Part III: Comments & Goals */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
            {/* Section header */}
            <div
              style={{
                display:    'flex',
                alignItems: 'center',
                gap:        10,
                padding:    '12px 20px',
                background: '#040e18',
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <span
                style={{
                  background:    `${C.success}22`,
                  border:        `1px solid ${C.success}`,
                  color:         C.success,
                  borderRadius:  20,
                  padding:       '2px 10px',
                  fontSize:      10,
                  fontWeight:    800,
                  fontFamily:    'Montserrat, sans-serif',
                  letterSpacing: '0.06em',
                  whiteSpace:    'nowrap',
                }}
              >
                PART III
              </span>
              <div>
                <div style={{ color: C.textPrimary, fontSize: 13, fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>
                  Comments &amp; Goals
                </div>
                <div style={{ color: C.textDim, fontSize: 10, fontWeight: 500, fontFamily: 'Montserrat, sans-serif', marginTop: 2 }}>
                  Optional but recommended — gives context to your scores
                </div>
              </div>
            </div>

            {/* Text area fields */}
            <div
              style={{
                padding:       20,
                background:    C.cardBg,
                display:       'flex',
                flexDirection: 'column',
                gap:           16,
              }}
            >
              <Txt
                label="Key Accomplishments This Period"
                value={selfTxt.accomplishments}
                onChange={v => setSelfTxt({ ...selfTxt, accomplishments: v })}
                rows={3}
                placeholder="Your major wins, completed projects, measurable results…"
              />
              <Txt
                label="Challenges & How You Addressed Them"
                value={selfTxt.challenges}
                onChange={v => setSelfTxt({ ...selfTxt, challenges: v })}
                rows={3}
                placeholder="Obstacles faced and how you navigated them…"
              />
              <Txt
                label="Goals for Next Period"
                value={selfTxt.goals}
                onChange={v => setSelfTxt({ ...selfTxt, goals: v })}
                rows={3}
                placeholder="Skills to develop, targets to hit, areas to improve…"
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Txt
                  label="Technical Development Needs"
                  value={selfTxt.techDev}
                  onChange={v => setSelfTxt({ ...selfTxt, techDev: v })}
                  rows={2}
                  placeholder="Any technical skills to build on…"
                />
                <Txt
                  label="Behavioral Development Needs"
                  value={selfTxt.behDev}
                  onChange={v => setSelfTxt({ ...selfTxt, behDev: v })}
                  rows={2}
                  placeholder="Any soft skills to develop…"
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Sticky submit bar ──────────────────────────────────────────────── */}
      <div
        style={{
          position:       'fixed',
          bottom:         0,
          left:           240,
          right:          0,
          background:     '#020c17',
          borderTop:      '1px solid #0c2035',
          padding:        '14px 30px',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          zIndex:         50,
          fontFamily:     'Montserrat, sans-serif',
        }}
      >
        {/* Left: counters + status message */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ color: C.textMuted, fontSize: 12, fontWeight: 600 }}>
            {'Behavioral '}
            <span style={{ color: behScored === 10 ? C.success : C.textPrimary, fontWeight: 800 }}>
              {behScored}/10
            </span>
            {'  ·  Functional '}
            <span style={{ color: funScored === 10 ? C.success : C.textPrimary, fontWeight: 800 }}>
              {funScored}/10
            </span>
          </span>
          <span style={{ color: allDone ? C.success : C.textDim, fontSize: 12, fontWeight: 700 }}>
            {allDone
              ? '✓ All 20 competencies scored — ready to submit'
              : 'Score all 20 to submit'}
          </span>
        </div>

        {/* Right: submit button */}
        <button
          onClick={() => {
            if (!allDone) {
              ctx.showToast('Please score all 20 competencies first', 'error');
            } else {
              submitSelf();
            }
          }}
          style={{
            background:    allDone ? C.success : C.textDim,
            color:         '#fff',
            border:        'none',
            borderRadius:  8,
            padding:       '10px 24px',
            fontSize:      13,
            fontWeight:    800,
            cursor:        allDone ? 'pointer' : 'not-allowed',
            fontFamily:    'Montserrat, sans-serif',
            letterSpacing: '0.03em',
            opacity:       allDone ? 1 : 0.5,
            transition:    'all 0.15s',
            whiteSpace:    'nowrap',
          }}
        >
          Submit Self-Review →
        </button>
      </div>
    </div>
  );
}
