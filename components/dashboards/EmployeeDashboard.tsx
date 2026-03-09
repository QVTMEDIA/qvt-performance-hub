'use client';

import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { Review, Reminder } from '@/types';
import { calcSec, calcOverall, getBand } from '@/lib/scoring';
import { BAND_COLORS, C, QVT_BLUE, SC_COLORS } from '@/styles/brand';
import { BEHAVIORAL, FUNCTIONAL, PERIODS } from '@/lib/constants';
import { uid, today } from '@/lib/utils';
import Inp from '@/components/atoms/Inp';
import Sel from '@/components/atoms/Sel';
import StatCard from '@/components/atoms/StatCard';
import StatusPill from '@/components/atoms/StatusPill';
import RevTable from '@/components/shared/RevTable';

// ─── Props ────────────────────────────────────────────────────────────────────
interface EmployeeDashboardProps {
  reviews:        Review[];
  reminders:      Reminder[];
  empName:        string;
  setEmpName:     (n: string) => void;
  openReview:     (rev: Review) => void;
  saveReviews:    (r: Review[]) => void;
  saveReminders:  (r: Reminder[]) => void;
  showToast:      (msg: string, type?: 'success' | 'error' | 'info') => void;
}

// ─── Module-level helpers ─────────────────────────────────────────────────────
function getScore(rev: Review): number {
  const beh = rev.leadReview?.behavioral ?? rev.selfReview?.behavioral ?? {};
  const fun = rev.leadReview?.functional ?? rev.selfReview?.functional ?? {};
  if (Object.keys(beh).length === 0 && Object.keys(fun).length === 0) return 0;
  return calcOverall(beh, fun);
}

interface NameData {
  jobTitle:    string;
  department:  string;
  hasDraft:    boolean;
  hasInReview: boolean;
  latestScore: number | null;
  hasUnread:   boolean;
}

function buildNameData(
  name: string,
  reviews: Review[],
  reminders: Reminder[],
): NameData {
  const nameRevs    = reviews.filter(r => r.employeeName === name);
  const latest      = nameRevs[nameRevs.length - 1];
  const hasDraft    = nameRevs.some(r => r.status === 'draft');
  const hasInReview = nameRevs.some(
    r => r.status !== 'draft' && r.status !== 'completed',
  );

  const completedRevs  = nameRevs.filter(r => r.status === 'completed');
  const latestComplete = completedRevs[completedRevs.length - 1] ?? null;
  const latestScore    = latestComplete ? getScore(latestComplete) : null;

  const reviewIds = new Set(nameRevs.map(r => r.id));
  const hasUnread = reminders.some(
    r => r.toRole === 'employee' && reviewIds.has(r.reviewId) && !r.read,
  );

  return {
    jobTitle:   latest?.jobTitle   ?? '',
    department: latest?.department ?? '',
    hasDraft,
    hasInReview,
    latestScore,
    hasUnread,
  };
}

// ─── Stateless sub-components ─────────────────────────────────────────────────
function EmptyNameState() {
  return (
    <div
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        padding:        '52px 24px',
        background:     C.cardBg,
        border:         `1px solid ${C.border}`,
        borderRadius:   12,
        textAlign:      'center',
        marginBottom:   20,
      }}
    >
      <div style={{ fontSize: 42, marginBottom: 14, opacity: 0.35 }}>👤</div>
      <div
        style={{
          color:        C.textSecondary,
          fontSize:     14,
          fontWeight:   700,
          marginBottom: 8,
          fontFamily:   'Montserrat, sans-serif',
        }}
      >
        No employees yet
      </div>
      <div
        style={{
          color:      C.textMuted,
          fontSize:   12,
          fontWeight: 500,
          maxWidth:   300,
          lineHeight: 1.7,
          fontFamily: 'Montserrat, sans-serif',
        }}
      >
        Once appraisals are created, employee names will appear here for quick
        access to self-reviews.
      </div>
    </div>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        background:    `${color}18`,
        border:        `1px solid ${color}50`,
        color,
        borderRadius:  20,
        padding:       '2px 9px',
        fontSize:      10,
        fontWeight:    700,
        fontFamily:    'Montserrat, sans-serif',
        whiteSpace:    'nowrap',
        letterSpacing: '0.02em',
      }}
    >
      {label}
    </span>
  );
}

// Period options for the Sel dropdown
const PERIOD_OPTIONS = PERIODS.map(p => ({ v: p, l: p }));

// ─── Trend chart tooltip ──────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: {
  active?:  boolean;
  payload?: Array<{ name: string; value: number }>;
  label?:   string;
}) {
  if (!active || !payload?.length) return null;
  const overall = payload.find(p => p.name === 'score');
  const beh     = payload.find(p => p.name === 'behavioral');
  const fun     = payload.find(p => p.name === 'functional');
  const score   = overall?.value ?? 0;
  const band    = score > 0 ? getBand(score) : null;

  return (
    <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', fontFamily: 'Montserrat, sans-serif', minWidth: 160 }}>
      <div style={{ color: C.textMuted, fontSize: 10, fontWeight: 600, marginBottom: 6 }}>{label}</div>
      {band && (
        <>
          <div style={{ color: BAND_COLORS[band], fontSize: 18, fontWeight: 800, lineHeight: 1 }}>
            {Math.round(score)}%
          </div>
          <div style={{ color: C.textDim, fontSize: 10, fontWeight: 600, marginTop: 2, marginBottom: 6 }}>
            {band}
          </div>
        </>
      )}
      {beh && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 4 }}>
          <span style={{ color: '#0891b2', fontSize: 10, fontWeight: 600 }}>Behavioural</span>
          <span style={{ color: '#0891b2', fontSize: 10, fontWeight: 800 }}>{Math.round(beh.value)}%</span>
        </div>
      )}
      {fun && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 2 }}>
          <span style={{ color: '#7c3aed', fontSize: 10, fontWeight: 600 }}>Functional</span>
          <span style={{ color: '#7c3aed', fontSize: 10, fontWeight: 800 }}>{Math.round(fun.value)}%</span>
        </div>
      )}
    </div>
  );
}

// ─── Competency breakdown card ────────────────────────────────────────────────
function CompBreakdown({ rev }: { rev: Review }) {
  const beh    = rev.leadReview?.behavioral ?? {};
  const fun    = rev.leadReview?.functional ?? {};
  const hasBeh = Object.keys(beh).length > 0;
  const hasFun = Object.keys(fun).length > 0;
  if (!hasBeh && !hasFun) return null;

  const behSec  = calcSec(beh);
  const funSec  = calcSec(fun);
  const behBand = getBand(behSec);
  const funBand = getBand(funSec);

  const behRows = BEHAVIORAL
    .map(c => ({ label: c.label, score: (beh[c.key] as number) ?? 0 }))
    .sort((a, b) => a.score - b.score);

  const funRows = FUNCTIONAL
    .map(c => ({ label: c.label, score: (fun[c.key] as number) ?? 0 }))
    .sort((a, b) => a.score - b.score);

  function CompRow({ label, score }: { label: string; score: number }) {
    const color = score > 0 ? SC_COLORS[score] : C.textDim;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ flex: 1, color: C.textMuted, fontSize: 11, fontWeight: 500, fontFamily: 'Montserrat, sans-serif', lineHeight: 1.3 }}>
          {label}
        </div>
        <div style={{ width: 80, height: 6, background: '#0c2035', borderRadius: 3, flexShrink: 0, position: 'relative' as const, overflow: 'hidden' }}>
          <div style={{ position: 'absolute' as const, left: 0, top: 0, height: '100%', width: `${(score / 5) * 100}%`, background: color, borderRadius: 3, transition: 'width 0.3s ease' }} />
        </div>
        <div style={{ width: 18, textAlign: 'right' as const, color, fontSize: 11, fontWeight: 800, fontFamily: 'Montserrat, sans-serif', flexShrink: 0 }}>
          {score > 0 ? score : '—'}
        </div>
      </div>
    );
  }

  function Section({ title, rows, secPct, band }: {
    title:  string;
    rows:   Array<{ label: string; score: number }>;
    secPct: number;
    band:   string;
  }) {
    return (
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ color: C.textDim, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 12, fontFamily: 'Montserrat, sans-serif' }}>
          {title}
        </div>
        {rows.map(r => <CompRow key={r.label} label={r.label} score={r.score} />)}
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
          <span style={{ color: BAND_COLORS[band as keyof typeof BAND_COLORS] ?? C.textMuted, fontSize: 12, fontWeight: 800, fontFamily: 'Montserrat, sans-serif' }}>
            {Math.round(secPct)}%
          </span>
          <span style={{ color: C.textDim, fontSize: 11, fontWeight: 600, fontFamily: 'Montserrat, sans-serif', marginLeft: 6 }}>
            — {band}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap' as const, gap: 8 }}>
          <div style={{ color: C.textPrimary, fontSize: 13, fontWeight: 800, fontFamily: 'Montserrat, sans-serif' }}>
            🎯 Latest Competency Breakdown
          </div>
          <div style={{ color: C.textDim, fontSize: 11, fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>
            {rev.period}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' as const }}>
          {hasBeh && <Section title="Part I — Behavioural" rows={behRows} secPct={behSec} band={behBand} />}
          {hasFun && <Section title="Part II — Functional"  rows={funRows} secPct={funSec} band={funBand} />}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function EmployeeDashboard({
  reviews,
  reminders,
  empName,
  setEmpName,
  openReview,
  saveReviews,
  saveReminders,
  showToast,
}: EmployeeDashboardProps) {

  // ── Name selector state ────────────────────────────────────────────────────
  const [hovered, setHovered] = useState<string | null>(null);

  // ── Self-start form state ──────────────────────────────────────────────────
  const [formName,       setFormName]       = useState('');
  const [formTitle,      setFormTitle]      = useState('');
  const [formDept,       setFormDept]       = useState('');
  const [formSupervisor, setFormSupervisor] = useState('');
  const [formResumption, setFormResumption] = useState('');
  const [formPeriod,     setFormPeriod]     = useState('Q1 2026');

  // ── Unique sorted names ────────────────────────────────────────────────────
  const uniqueNames = Array.from(
    new Set(reviews.map(r => r.employeeName).filter(Boolean) as string[]),
  ).sort();

  // ── markRead helper ────────────────────────────────────────────────────────
  function markRead(remId: string) {
    saveReminders(reminders.map(r => r.id === remId ? { ...r, read: true } : r));
  }

  function handleOpenFromRem(remId: string, reviewId: string) {
    markRead(remId);
    const rev = reviews.find(r => r.id === reviewId);
    if (rev) openReview(rev);
  }

  // ── Name selector handlers ─────────────────────────────────────────────────
  function handleNameSelect(name: string) {
    const nameRevs = reviews.filter(r => r.employeeName === name);
    const drafts   = nameRevs.filter(r => r.status === 'draft');
    if (drafts.length === 1) {
      openReview(drafts[0]);
    } else {
      setEmpName(name);
    }
  }

  // ── Self-start handler ─────────────────────────────────────────────────────
  function handleSelfStart() {
    const name = formName.trim();
    if (!name) {
      showToast('Please enter your full name', 'error');
      return;
    }

    const newRev: Review = {
      id:             uid(),
      createdAt:      today(),
      status:         'draft',
      employeeName:   name,
      jobTitle:       formTitle.trim(),
      department:     formDept.trim(),
      supervisorName: formSupervisor.trim(),
      resumptionDate: formResumption,
      period:         formPeriod,
      selfReview:     null,
      leadReview:     null,
      hrReview:       null,
      cooReview:      null,
      ceoReview:      null,
    };

    saveReviews([newRev, ...reviews]);
    setEmpName(name);
    openReview(newRev);
    showToast(`Appraisal started for ${name}. Complete your self-review below.`, 'success');

    setFormName('');
    setFormTitle('');
    setFormDept('');
    setFormSupervisor('');
    setFormResumption('');
    setFormPeriod('Q1 2026');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ── HISTORY VIEW (empName is set) ─────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  if (empName) {
    const nameRevs       = reviews.filter(r => r.employeeName === empName);
    const latest         = nameRevs[nameRevs.length - 1];
    const subtitle       = [latest?.jobTitle, latest?.department].filter(Boolean).join(' · ');
    const drafts         = nameRevs.filter(r => r.status === 'draft');
    const inProgressRevs = nameRevs.filter(r => r.status !== 'draft' && r.status !== 'completed');
    const completedRevs  = nameRevs.filter(r => r.status === 'completed');

    const reviewIds  = new Set(nameRevs.map(r => r.id));
    const unreadRems = reminders.filter(
      r => r.toRole === 'employee' && reviewIds.has(r.reviewId) && !r.read,
    );

    const lastCompleted = completedRevs[completedRevs.length - 1] ?? null;
    const latestScore   = lastCompleted ? getScore(lastCompleted) : null;

    // ── Trend data (sorted by period index) ──────────────────────────────────
    const sortedCompleted = [...completedRevs].sort(
      (a, b) => PERIODS.indexOf(a.period) - PERIODS.indexOf(b.period),
    );

    const trendData = sortedCompleted.map((rev, i, arr) => {
      const beh   = rev.leadReview?.behavioral ?? rev.selfReview?.behavioral ?? {};
      const fun   = rev.leadReview?.functional ?? rev.selfReview?.functional ?? {};
      const score = Math.round(calcOverall(beh, fun));
      const avg   = Math.round(
        arr.slice(0, i + 1).reduce((sum, r) => {
          const b = r.leadReview?.behavioral ?? r.selfReview?.behavioral ?? {};
          const f = r.leadReview?.functional ?? r.selfReview?.functional ?? {};
          return sum + calcOverall(b, f);
        }, 0) / (i + 1),
      );
      const behPct = Object.keys(beh).length > 0 ? Math.round(calcSec(beh)) : undefined;
      const funPct = Object.keys(fun).length > 0 ? Math.round(calcSec(fun)) : undefined;
      return { period: rev.period, score, avg, behavioral: behPct, functional: funPct };
    });

    // ── Performance summary stats (used when trendData.length >= 2) ──────────
    const summaryScores = trendData.map(d => d.score);
    const bestScore     = summaryScores.length > 0 ? Math.max(...summaryScores) : 0;
    const sumAvg        = summaryScores.length > 0
      ? Math.round(summaryScores.reduce((s, v) => s + v, 0) / summaryScores.length)
      : 0;
    const latestTrendScore = trendData[trendData.length - 1]?.score ?? 0;
    const prevTrendScore   = trendData[trendData.length - 2]?.score ?? 0;
    const trendDir =
      latestTrendScore > prevTrendScore ? 'up'
      : latestTrendScore < prevTrendScore ? 'down'
      : 'stable';
    const trendLabel = trendDir === 'up' ? '↑ Improving' : trendDir === 'down' ? '↓ Declining' : '→ Stable';
    const trendColor = trendDir === 'up' ? C.success : trendDir === 'down' ? C.error : C.blue;

    // ── Period range label ────────────────────────────────────────────────────
    const periodRange = trendData.length > 1
      ? `${trendData[0].period} — ${trendData[trendData.length - 1].period}`
      : trendData[0]?.period ?? '';

    return (
      <div>
        {/* ── History header ──────────────────────────────────────────────── */}
        <div
          style={{
            padding:      '20px 32px 16px',
            borderBottom: `1px solid ${C.border}`,
            display:      'flex',
            alignItems:   'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                {empName}
              </h1>
              {unreadRems.length > 0 && (
                <span
                  style={{
                    background:   QVT_BLUE,
                    color:        '#fff',
                    borderRadius: 10,
                    padding:      '2px 8px',
                    fontSize:     10,
                    fontWeight:   800,
                    fontFamily:   'Montserrat, sans-serif',
                  }}
                >
                  {unreadRems.length}
                </span>
              )}
            </div>
            {subtitle ? (
              <p
                style={{
                  color:      C.textMuted,
                  fontSize:   12,
                  fontWeight: 500,
                  margin:     '4px 0 0',
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                {subtitle}
              </p>
            ) : null}
          </div>
          <button
            onClick={() => setEmpName('')}
            style={{
              background:   'transparent',
              border:       `1px solid ${C.border}`,
              borderRadius: 6,
              color:        C.textMuted,
              fontSize:     11,
              fontWeight:   700,
              cursor:       'pointer',
              padding:      '7px 14px',
              fontFamily:   'Montserrat, sans-serif',
              letterSpacing: '0.02em',
            }}
          >
            ↩ Switch
          </button>
        </div>

        {/* ── Content ──────────────────────────────────────────────────────── */}
        <div style={{ padding: '24px 32px' }}>

          {/* ── Notification strip ──────────────────────────────────────────── */}
          {unreadRems.length > 0 && (
            <div
              style={{
                background:   `${QVT_BLUE}0e`,
                border:       `1px solid ${QVT_BLUE}35`,
                borderRadius: 10,
                overflow:     'hidden',
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  display:      'flex',
                  alignItems:   'center',
                  gap:          8,
                  padding:      '9px 16px',
                  borderBottom: `1px solid ${QVT_BLUE}25`,
                  background:   `${QVT_BLUE}15`,
                }}
              >
                <span style={{ fontSize: 13 }}>🔔</span>
                <span style={{ color: C.textPrimary, fontSize: 12, fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>
                  Notifications
                </span>
                <span
                  style={{
                    background:   QVT_BLUE,
                    color:        '#fff',
                    borderRadius: 10,
                    padding:      '1px 7px',
                    fontSize:     10,
                    fontWeight:   800,
                    fontFamily:   'Montserrat, sans-serif',
                    marginLeft:   4,
                  }}
                >
                  {unreadRems.length}
                </span>
              </div>
              {unreadRems.map((rem, i) => {
                const isLast = i === unreadRems.length - 1;
                return (
                  <div
                    key={rem.id}
                    style={{
                      display:      'flex',
                      alignItems:   'center',
                      gap:          12,
                      padding:      '10px 16px',
                      borderBottom: isLast ? 'none' : `1px solid ${QVT_BLUE}18`,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: C.textPrimary, fontSize: 12, fontWeight: 600, fontFamily: 'Montserrat, sans-serif', lineHeight: 1.4 }}>
                        {rem.message}
                      </div>
                      <div style={{ color: C.textDim, fontSize: 10, fontWeight: 500, fontFamily: 'Montserrat, sans-serif', marginTop: 2 }}>
                        {rem.sentAt}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => handleOpenFromRem(rem.id, rem.reviewId)}
                        style={{
                          background:    QVT_BLUE,
                          border:        'none',
                          borderRadius:  5,
                          color:         '#fff',
                          fontSize:      10,
                          fontWeight:    700,
                          cursor:        'pointer',
                          padding:       '5px 10px',
                          fontFamily:    'Montserrat, sans-serif',
                          letterSpacing: '0.04em',
                        }}
                      >
                        Open
                      </button>
                      <button
                        onClick={() => markRead(rem.id)}
                        style={{
                          background:   'transparent',
                          border:       `1px solid ${C.border}`,
                          borderRadius: 5,
                          color:        C.textDim,
                          fontSize:     10,
                          fontWeight:   700,
                          cursor:       'pointer',
                          padding:      '5px 10px',
                          fontFamily:   'Montserrat, sans-serif',
                        }}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Draft card (⚡ Self-Review Required) ───────────────────────── */}
          {drafts.length > 0 && (
            <div
              style={{
                background:   '#d9770610',
                border:       '1px solid #d9770635',
                borderRadius: 10,
                padding:      16,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  color:         '#d97706',
                  fontSize:      10,
                  fontWeight:    700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom:  12,
                  fontFamily:    'Montserrat, sans-serif',
                }}
              >
                ⚡ Self-Review Required
              </div>
              {drafts.map(rev => (
                <div
                  key={rev.id}
                  style={{
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'space-between',
                    gap:            12,
                    padding:        '10px 14px',
                    background:     '#d9770608',
                    border:         '1px solid #d9770625',
                    borderRadius:   8,
                    marginBottom:   8,
                  }}
                >
                  <div>
                    <div style={{ color: C.textPrimary, fontSize: 12, fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>
                      {rev.period}
                    </div>
                    {rev.jobTitle && (
                      <div style={{ color: C.textDim, fontSize: 10, fontWeight: 500, fontFamily: 'Montserrat, sans-serif', marginTop: 2 }}>
                        {rev.jobTitle}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => openReview(rev)}
                    style={{
                      background:    '#d97706',
                      border:        'none',
                      borderRadius:  6,
                      color:         '#fff',
                      fontSize:      11,
                      fontWeight:    700,
                      cursor:        'pointer',
                      padding:       '7px 14px',
                      fontFamily:    'Montserrat, sans-serif',
                      letterSpacing: '0.03em',
                      whiteSpace:    'nowrap',
                    }}
                  >
                    Start Self-Review →
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── In Progress card ────────────────────────────────────────────── */}
          {inProgressRevs.length > 0 && (
            <div
              style={{
                background:   `${QVT_BLUE}0c`,
                border:       `1px solid ${QVT_BLUE}30`,
                borderRadius: 10,
                padding:      16,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  color:         QVT_BLUE,
                  fontSize:      10,
                  fontWeight:    700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom:  12,
                  fontFamily:    'Montserrat, sans-serif',
                }}
              >
                📋 In Progress
              </div>
              {inProgressRevs.map(rev => (
                <div
                  key={rev.id}
                  style={{
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'space-between',
                    gap:            12,
                    padding:        '10px 14px',
                    background:     `${QVT_BLUE}06`,
                    border:         `1px solid ${QVT_BLUE}20`,
                    borderRadius:   8,
                    marginBottom:   8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <StatusPill status={rev.status} />
                    <div>
                      <div style={{ color: C.textPrimary, fontSize: 12, fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>
                        {rev.period}
                      </div>
                      {rev.jobTitle && (
                        <div style={{ color: C.textDim, fontSize: 10, fontWeight: 500, fontFamily: 'Montserrat, sans-serif', marginTop: 2 }}>
                          {rev.jobTitle}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => openReview(rev)}
                    style={{
                      background:   'transparent',
                      border:       `1px solid ${QVT_BLUE}`,
                      borderRadius: 6,
                      color:        QVT_BLUE,
                      fontSize:     11,
                      fontWeight:   700,
                      cursor:       'pointer',
                      padding:      '6px 14px',
                      fontFamily:   'Montserrat, sans-serif',
                      whiteSpace:   'nowrap',
                    }}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── Stat cards ──────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
            <StatCard label="Total Appraisals" value={nameRevs.length} />
            <StatCard
              label="Pending"
              value={drafts.length}
              color={drafts.length > 0 ? C.warning : C.textDim}
            />
            <StatCard
              label="In Progress"
              value={inProgressRevs.length}
              color={inProgressRevs.length > 0 ? C.blue : C.textDim}
            />
            <StatCard
              label="Latest Score"
              value={latestScore !== null ? `${Math.round(latestScore)}%` : '—'}
              color={latestScore !== null ? BAND_COLORS[getBand(latestScore)] : C.textDim}
              sub={latestScore !== null ? getBand(latestScore) : undefined}
            />
          </div>

          {/* ── Performance Summary (2+ completed) ──────────────────────── */}
          {trendData.length >= 2 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ background: '#071523', border: '1px solid #0c2035', borderRadius: 12, padding: 20 }}>
                <div style={{ color: C.textPrimary, fontSize: 13, fontWeight: 800, fontFamily: 'Montserrat, sans-serif', marginBottom: 16 }}>
                  📊 Performance Summary
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' as const }}>
                  <div style={{ flex: 1, minWidth: 100, background: C.appBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ color: C.textDim, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, fontFamily: 'Montserrat, sans-serif', marginBottom: 6 }}>Best Score</div>
                    <div style={{ color: BAND_COLORS[getBand(bestScore)], fontSize: 24, fontWeight: 800, fontFamily: 'Montserrat, sans-serif', lineHeight: 1 }}>{bestScore}%</div>
                    <div style={{ color: C.textDim, fontSize: 10, fontWeight: 600, fontFamily: 'Montserrat, sans-serif', marginTop: 4 }}>{getBand(bestScore)}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 100, background: C.appBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ color: C.textDim, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, fontFamily: 'Montserrat, sans-serif', marginBottom: 6 }}>Latest Score</div>
                    <div style={{ color: BAND_COLORS[getBand(latestTrendScore)], fontSize: 24, fontWeight: 800, fontFamily: 'Montserrat, sans-serif', lineHeight: 1 }}>{latestTrendScore}%</div>
                    <div style={{ color: C.textDim, fontSize: 10, fontWeight: 600, fontFamily: 'Montserrat, sans-serif', marginTop: 4 }}>{getBand(latestTrendScore)}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 100, background: C.appBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ color: C.textDim, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, fontFamily: 'Montserrat, sans-serif', marginBottom: 6 }}>Average Score</div>
                    <div style={{ color: BAND_COLORS[getBand(sumAvg)], fontSize: 24, fontWeight: 800, fontFamily: 'Montserrat, sans-serif', lineHeight: 1 }}>{sumAvg}%</div>
                    <div style={{ color: C.textDim, fontSize: 10, fontWeight: 600, fontFamily: 'Montserrat, sans-serif', marginTop: 4 }}>{getBand(sumAvg)}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 100, background: C.appBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ color: C.textDim, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, fontFamily: 'Montserrat, sans-serif', marginBottom: 6 }}>Trend</div>
                    <div style={{ color: trendColor, fontSize: 18, fontWeight: 800, fontFamily: 'Montserrat, sans-serif', lineHeight: 1 }}>{trendLabel}</div>
                    <div style={{ color: C.textDim, fontSize: 10, fontWeight: 600, fontFamily: 'Montserrat, sans-serif', marginTop: 4 }}>vs. previous period</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Trend Chart (1+ completed) ───────────────────────────────────── */}
          {trendData.length >= 1 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ background: '#071523', border: '1px solid #0c2035', borderRadius: 12, padding: 20 }}>
                {/* Title row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap' as const, gap: 8 }}>
                  <div style={{ color: C.textPrimary, fontSize: 13, fontWeight: 800, fontFamily: 'Montserrat, sans-serif' }}>
                    📈 Performance Trend
                  </div>
                  {periodRange && (
                    <div style={{ color: C.textDim, fontSize: 11, fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>
                      {periodRange}
                    </div>
                  )}
                </div>

                {/* Chart */}
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={trendData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#0f1e32" />
                    <XAxis
                      dataKey="period"
                      tick={{ fill: '#334155', fontSize: 10, fontFamily: 'Montserrat, sans-serif' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickFormatter={(v: number) => `${v}%`}
                      tick={{ fill: '#334155', fontSize: 10, fontFamily: 'Montserrat, sans-serif' }}
                      axisLine={false}
                      tickLine={false}
                      width={36}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <ReferenceLine y={90} stroke="#10b981" strokeDasharray="4 4" strokeOpacity={0.7}
                      label={{ value: 'Exceptional', fill: '#10b981', fontSize: 8, fontFamily: 'Montserrat, sans-serif', position: 'insideTopRight' }} />
                    <ReferenceLine y={80} stroke="#22c55e" strokeDasharray="4 4" strokeOpacity={0.7}
                      label={{ value: 'Very Good', fill: '#22c55e', fontSize: 8, fontFamily: 'Montserrat, sans-serif', position: 'insideTopRight' }} />
                    <ReferenceLine y={60} stroke="#3b82f6" strokeDasharray="4 4" strokeOpacity={0.7}
                      label={{ value: 'Good', fill: '#3b82f6', fontSize: 8, fontFamily: 'Montserrat, sans-serif', position: 'insideTopRight' }} />
                    <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.7}
                      label={{ value: 'Needs Improvement', fill: '#f59e0b', fontSize: 8, fontFamily: 'Montserrat, sans-serif', position: 'insideTopRight' }} />
                    {/* Behavioral dashed line */}
                    <Line
                      type="monotone"
                      dataKey="behavioral"
                      stroke="#0891b2"
                      strokeWidth={1.5}
                      strokeDasharray="5 3"
                      dot={false}
                      connectNulls
                    />
                    {/* Functional dashed line */}
                    <Line
                      type="monotone"
                      dataKey="functional"
                      stroke="#7c3aed"
                      strokeWidth={1.5}
                      strokeDasharray="5 3"
                      dot={false}
                      connectNulls
                    />
                    {/* Overall score line with band-colored dots */}
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke={QVT_BLUE}
                      strokeWidth={2.5}
                      dot={(props: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                        if (!props.cx || !props.cy) return <g key="empty" />;
                        const color = BAND_COLORS[getBand(Math.round(props.value ?? 0))];
                        return <circle key={`dot-${props.index}`} cx={props.cx} cy={props.cy} r={5} fill={color} stroke="#071523" strokeWidth={1.5} />;
                      }}
                      activeDot={{ r: 7, fill: QVT_BLUE, stroke: '#071523', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>

                {/* Custom legend */}
                <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' as const }}>
                  {[
                    { color: QVT_BLUE,   label: 'Overall',      dash: false },
                    { color: '#0891b2',  label: 'Behavioural',  dash: true  },
                    { color: '#7c3aed',  label: 'Functional',   dash: true  },
                  ].map(({ color, label, dash }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <svg width={24} height={2} style={{ flexShrink: 0 }}>
                        <line x1="0" y1="1" x2="24" y2="1" stroke={color} strokeWidth={dash ? 1.5 : 2.5} strokeDasharray={dash ? '5 3' : undefined} />
                      </svg>
                      <span style={{ color: C.textMuted, fontSize: 10, fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>{label}</span>
                    </div>
                  ))}
                </div>

                {/* Single-point hint */}
                {trendData.length === 1 && (
                  <div style={{ marginTop: 12, textAlign: 'center', color: C.textDim, fontSize: 11, fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                    Complete more review cycles to see your trend
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Competency Breakdown (1+ completed with scores) ──────────────── */}
          {lastCompleted && <CompBreakdown rev={lastCompleted} />}

          {/* ── Completed history table ──────────────────────────────────────── */}
          {completedRevs.length > 0 && (
            <div>
              <div
                style={{
                  color:         C.textDim,
                  fontSize:      10,
                  fontWeight:    700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom:  12,
                  fontFamily:    'Montserrat, sans-serif',
                }}
              >
                Completed Appraisals
              </div>
              <RevTable
                reviews={completedRevs}
                onSelect={openReview}
                showScore
              />
            </div>
          )}

          {/* ── Empty fallback ───────────────────────────────────────────────── */}
          {nameRevs.length === 0 && (
            <div
              style={{
                padding:    '40px 24px',
                textAlign:  'center',
                color:      C.textDim,
                fontSize:   12,
                fontFamily: 'Montserrat, sans-serif',
                background: C.cardBg,
                border:     `1px solid ${C.border}`,
                borderRadius: 10,
              }}
            >
              No appraisals found for {empName}.
            </div>
          )}

        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ── NAME SELECTOR VIEW (empName is empty) ────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div>
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div
        style={{
          padding:      '20px 32px 16px',
          borderBottom: `1px solid ${C.border}`,
        }}
      >
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
          My Appraisals
        </h1>
        <p
          style={{
            color:      C.textMuted,
            fontSize:   12,
            fontWeight: 500,
            margin:     '4px 0 0',
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          Select your name below to access your self-review, or start a new
          appraisal.
        </p>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div style={{ padding: '24px 32px' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>

          {/* ── Name selector section ────────────────────────────────────────── */}
          <div
            style={{
              color:         C.textDim,
              fontSize:      10,
              fontWeight:    700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom:  12,
              fontFamily:    'Montserrat, sans-serif',
            }}
          >
            {uniqueNames.length > 0
              ? `${uniqueNames.length} Employee${uniqueNames.length === 1 ? '' : 's'}`
              : 'Employees'}
          </div>

          {uniqueNames.length === 0 ? (
            <EmptyNameState />
          ) : (
            uniqueNames.map(name => {
              const d         = buildNameData(name, reviews, reminders);
              const isHov     = hovered === name;
              const borderCol = isHov ? QVT_BLUE : d.hasDraft ? '#d97706' : C.border;
              const bgCol     = d.hasDraft ? '#d9770610' : C.cardBg;
              const initial   = name.charAt(0).toUpperCase();
              const subtitle  = [d.jobTitle, d.department].filter(Boolean).join(' · ');

              return (
                <button
                  key={name}
                  onClick={() => handleNameSelect(name)}
                  onMouseEnter={() => setHovered(name)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    display:      'flex',
                    alignItems:   'center',
                    gap:          14,
                    width:        '100%',
                    padding:      '14px 16px',
                    background:   bgCol,
                    border:       `1px solid ${borderCol}`,
                    borderRadius: 10,
                    cursor:       'pointer',
                    marginBottom: 10,
                    textAlign:    'left',
                    transition:   'border-color 0.15s, background 0.15s',
                    fontFamily:   'Montserrat, sans-serif',
                    boxSizing:    'border-box',
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width:          40,
                      height:         40,
                      borderRadius:   '50%',
                      background:     QVT_BLUE,
                      color:          '#fff',
                      fontSize:       17,
                      fontWeight:     800,
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                      flexShrink:     0,
                      fontFamily:     'Montserrat, sans-serif',
                    }}
                  >
                    {initial}
                  </div>

                  {/* Name + badges + subtitle */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display:      'flex',
                        alignItems:   'center',
                        gap:          7,
                        flexWrap:     'wrap',
                        marginBottom: subtitle ? 4 : 0,
                      }}
                    >
                      <span
                        style={{
                          color:      C.textPrimary,
                          fontSize:   13,
                          fontWeight: 700,
                          fontFamily: 'Montserrat, sans-serif',
                        }}
                      >
                        {name}
                      </span>
                      {d.hasDraft    && <Badge label="✏️ Self-review pending" color="#d97706" />}
                      {d.hasInReview && <Badge label="⏳ In review"           color="#3b82f6" />}
                    </div>
                    {subtitle && (
                      <div
                        style={{
                          color:         C.textDim,
                          fontSize:      11,
                          fontWeight:    500,
                          fontFamily:    'Montserrat, sans-serif',
                          overflow:      'hidden',
                          textOverflow:  'ellipsis',
                          whiteSpace:    'nowrap',
                        }}
                      >
                        {subtitle}
                      </div>
                    )}
                  </div>

                  {/* Score + unread dot */}
                  <div
                    style={{
                      display:       'flex',
                      flexDirection: 'column',
                      alignItems:    'flex-end',
                      gap:           6,
                      flexShrink:    0,
                    }}
                  >
                    {d.latestScore !== null && (
                      <span
                        style={{
                          color:      BAND_COLORS[getBand(d.latestScore)],
                          fontSize:   15,
                          fontWeight: 800,
                          fontFamily: 'Montserrat, sans-serif',
                          lineHeight: 1,
                        }}
                      >
                        {Math.round(d.latestScore)}%
                      </span>
                    )}
                    {d.hasUnread && (
                      <div
                        style={{
                          width:        8,
                          height:       8,
                          borderRadius: '50%',
                          background:   QVT_BLUE,
                        }}
                      />
                    )}
                  </div>
                </button>
              );
            })
          )}

          {/* ── Self-start form card ─────────────────────────────────────────── */}
          <div style={{ marginTop: uniqueNames.length > 0 ? 28 : 0 }}>
            <div
              style={{
                background:   '#071523',
                border:       '1px solid #22c55e22',
                borderRadius: 12,
                padding:      20,
              }}
            >
              {/* Card heading */}
              <div
                style={{
                  color:         '#22c55e',
                  fontSize:      10,
                  fontWeight:    700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom:  4,
                  fontFamily:    'Montserrat, sans-serif',
                }}
              >
                ✦ Start a New Self-Review
              </div>

              {/* Subtitle */}
              <div
                style={{
                  color:        C.textMuted,
                  fontSize:     12,
                  fontWeight:   500,
                  marginBottom: 18,
                  fontFamily:   'Montserrat, sans-serif',
                  lineHeight:   1.5,
                }}
              >
                Enter your details below to begin your performance appraisal.
              </div>

              {/* Form fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Inp
                  label="Full Name *"
                  value={formName}
                  onChange={setFormName}
                  placeholder="e.g. Jane Okafor"
                />

                <div
                  style={{
                    display:             'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap:                 12,
                  }}
                >
                  <Inp
                    label="Job Title"
                    value={formTitle}
                    onChange={setFormTitle}
                    placeholder="e.g. Digital Marketing Analyst"
                  />
                  <Inp
                    label="Department"
                    value={formDept}
                    onChange={setFormDept}
                    placeholder="e.g. Performance"
                  />
                </div>

                <div
                  style={{
                    display:             'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap:                 12,
                  }}
                >
                  <Inp
                    label="Supervisor Name"
                    value={formSupervisor}
                    onChange={setFormSupervisor}
                    placeholder="e.g. Tunde Obi"
                  />
                  <Inp
                    label="Date of Resumption"
                    value={formResumption}
                    onChange={setFormResumption}
                    type="date"
                  />
                </div>

                <Sel
                  label="Review Period"
                  value={formPeriod}
                  onChange={setFormPeriod}
                  options={PERIOD_OPTIONS}
                />
              </div>

              {/* Submit button */}
              <button
                onClick={handleSelfStart}
                style={{
                  width:         '100%',
                  marginTop:     18,
                  background:    '#22c55e',
                  color:         '#fff',
                  border:        'none',
                  borderRadius:  8,
                  padding:       '12px 0',
                  fontSize:      13,
                  fontWeight:    800,
                  cursor:        'pointer',
                  fontFamily:    'Montserrat, sans-serif',
                  letterSpacing: '0.04em',
                  transition:    'opacity 0.15s',
                  boxSizing:     'border-box',
                }}
              >
                Begin My Self-Review →
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
