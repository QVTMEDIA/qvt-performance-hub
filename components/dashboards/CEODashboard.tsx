'use client';

import { useState } from 'react';
import { AppContext } from '@/components/AppShell';
import { calcOverall, getBand } from '@/lib/scoring';
import { C, BAND_COLORS } from '@/styles/brand';
import { STATUS_ORDER, STAGE_META, PERIODS } from '@/lib/constants';
import { CEOReview, Review } from '@/types';
import { today } from '@/lib/utils';
import StatCard   from '@/components/atoms/StatCard';
import StatusPill from '@/components/atoms/StatusPill';
import NotifBar   from '@/components/shared/NotifBar';
import RevRow     from '@/components/shared/RevRow';
import RevTable   from '@/components/shared/RevTable';
import OverallCard from '@/components/shared/OverallCard';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from 'recharts';

const CEO_COLOR  = '#dc2626';
const LEAD_COLOR = '#0891b2';
const HR_COLOR   = '#7c3aed';
const COO_COLOR  = '#d97706';

interface CEODashboardProps {
  ctx: AppContext;
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{
      color: C.textDim, fontSize: 10, fontWeight: 700,
      letterSpacing: '0.1em', textTransform: 'uppercase',
      marginBottom: 12, fontFamily: 'Montserrat, sans-serif',
    }}>
      {label}
    </div>
  );
}

function EmptySlot({ message }: { message: string }) {
  return (
    <div style={{
      padding: '32px 24px', textAlign: 'center', color: C.textDim,
      fontSize: 12, fontFamily: 'Montserrat, sans-serif',
      background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10,
    }}>
      {message}
    </div>
  );
}

function revScore(rev: Review): number {
  if (!rev.leadReview) return 0;
  return calcOverall(rev.leadReview.behavioral, rev.leadReview.functional);
}

function StageSummary({ icon, color, label, lines }: {
  icon: string; color: string; label: string; lines: Array<{ key: string; val: string }>;
}) {
  return (
    <div style={{
      background: C.appBg, border: `1px solid ${C.border}`, borderRadius: 8,
      padding: '12px 14px', flex: 1, minWidth: 180,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10,
        borderBottom: `1px solid ${C.border}`, paddingBottom: 8,
      }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{ color, fontSize: 11, fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>{label}</span>
      </div>
      {lines.map(({ key, val }) => val ? (
        <div key={key} style={{ marginBottom: 6 }}>
          <div style={{ color: C.textDim, fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif', marginBottom: 2 }}>{key}</div>
          <div style={{ color: C.textSecondary, fontSize: 11, fontFamily: 'Montserrat, sans-serif', lineHeight: 1.4 }}>{val}</div>
        </div>
      ) : null)}
    </div>
  );
}

export default function CEODashboard({ ctx }: CEODashboardProps) {
  const { reviews, reminders, openReview, saveReminders, patch, addRem, showToast } = ctx;
  const [inlineDecision, setInlineDecision] = useState<Record<string, string>>({});
  const [inlineNote,     setInlineNote]     = useState<Record<string, string>>({});

  const awaiting  = reviews.filter(r => r.status === 'coo_done');
  const completed = reviews.filter(r => r.status === 'completed');
  const returned  = reviews.filter(r => r.ceoReview?.decision === 'returned');

  // Scored subset (completed with lead scores)
  const scored = completed.filter(r => r.leadReview);
  const orgAvgPct = scored.length > 0
    ? Math.round(scored.reduce((s, r) => s + revScore(r), 0) / scored.length)
    : 0;
  const orgBand = orgAvgPct > 0 ? getBand(orgAvgPct) : null;
  const completionRate = reviews.length > 0
    ? Math.round((completed.length / reviews.length) * 100)
    : 0;

  // Org trend data — avg score per period across completed reviews
  const trendData = (() => {
    const grouped: Record<string, number[]> = {};
    for (const rev of scored) {
      if (!grouped[rev.period]) grouped[rev.period] = [];
      grouped[rev.period].push(Math.round(revScore(rev)));
    }
    return PERIODS
      .filter(p => grouped[p])
      .map(p => ({
        period: p,
        avg: Math.round(grouped[p].reduce((a, b) => a + b, 0) / grouped[p].length),
      }));
  })();

  // Top 5 performers
  const topPerformers = [...scored]
    .sort((a, b) => revScore(b) - revScore(a))
    .slice(0, 5);

  // Department breakdown (only when 2+ departments represented)
  const deptMap: Record<string, Review[]> = {};
  for (const rev of scored) {
    const dept = rev.department || 'Unassigned';
    if (!deptMap[dept]) deptMap[dept] = [];
    deptMap[dept].push(rev);
  }
  const deptRows = Object.entries(deptMap)
    .map(([dept, revs]) => {
      const avg = Math.round(revs.reduce((s, r) => s + revScore(r), 0) / revs.length);
      return { dept, count: revs.length, avg, band: getBand(avg) };
    })
    .sort((a, b) => b.avg - a.avg);

  const RANK_COLORS = ['#f59e0b', '#9ca3af', '#b45309'];

  function submitApprove(rev: Review) {
    const decision = (inlineDecision[rev.id] ?? '').trim();
    if (!decision) { showToast('Please enter the final decision notes.', 'error'); return; }
    const ceoReview: CEOReview = {
      text: { finalDecision: decision, ceoNotes: (inlineNote[rev.id] ?? '').trim() },
      submittedAt: today(),
      decision: 'approved',
    };
    patch({ ...rev, status: 'completed', ceoReview });
    addRem(rev.id, 'employee', `Your ${rev.period} appraisal has been fully approved by the CEO. View your results now.`);
    showToast('Appraisal approved. Process complete! 🎉');
  }

  function submitReturn(rev: Review) {
    const decision = (inlineDecision[rev.id] ?? '').trim();
    if (!decision) { showToast('Please enter the final decision notes.', 'error'); return; }
    const ceoReview: CEOReview = {
      text: { finalDecision: decision, ceoNotes: (inlineNote[rev.id] ?? '').trim(), disapprovalNote: decision },
      submittedAt: today(),
      decision: 'returned',
    };
    patch({ ...rev, status: 'hr_done', ceoReview });
    addRem(rev.id, 'coo', `CEO has returned ${rev.employeeName}'s appraisal to COO for revision. Please review the CEO's notes.`);
    showToast('Appraisal returned to COO for revision.', 'error');
  }

  function handleOpen(reviewId: string) {
    const rev = reviews.find(r => r.id === reviewId);
    if (rev) openReview(rev);
  }

  function handleDismiss(id: string) {
    saveReminders(reminders.map(r => r.id === id ? { ...r, read: true } : r));
  }

  function handleMarkAllRead() {
    saveReminders(reminders.map(r => r.toRole === 'ceo' ? { ...r, read: true } : r));
  }

  return (
    <div>
      {/* Header */}
      <div style={{ padding: '20px 32px 16px', borderBottom: `1px solid ${C.border}` }}>
        <h1 style={{
          color: C.textPrimary, fontSize: 20, fontWeight: 800,
          letterSpacing: '-0.01em', margin: 0, fontFamily: 'Montserrat, sans-serif',
        }}>
          <span style={{ color: CEO_COLOR }}>CEO</span> Dashboard
        </h1>
        <p style={{ color: C.textMuted, fontSize: 12, fontWeight: 500, margin: '4px 0 0', fontFamily: 'Montserrat, sans-serif' }}>
          QVT Media Performance Hub · {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div style={{ padding: '24px 32px' }}>

        {/* NotifBar */}
        <NotifBar reminders={reminders} role="ceo" onOpen={handleOpen} onDismiss={handleDismiss} onMarkAllRead={handleMarkAllRead} />

        {/* Stat Cards — Row 1 */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          <StatCard label="Total Appraisals"      value={reviews.length} />
          <StatCard label="Awaiting CEO Approval" value={awaiting.length}  color={awaiting.length  > 0 ? CEO_COLOR : C.textDim} />
          <StatCard label="Completed"             value={completed.length} color={completed.length > 0 ? C.success : C.textDim} />
          <StatCard label="Returned to COO"       value={returned.length}  color={returned.length  > 0 ? C.warning : C.textDim} />
        </div>

        {/* Stat Cards — Row 2 */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          <StatCard
            label="Org Average Score"
            value={orgAvgPct > 0 ? `${orgAvgPct}%` : '—'}
            color={orgBand ? BAND_COLORS[orgBand] : C.textDim}
            sub={orgBand ?? undefined}
          />
          <StatCard
            label="Completion Rate"
            value={reviews.length > 0 ? `${completionRate}%` : '—'}
            color={completionRate >= 80 ? C.success : completionRate >= 50 ? C.warning : C.textDim}
            sub={`${completed.length} of ${reviews.length}`}
          />
        </div>

        {/* ⚡ Awaiting Final Approval — inline cards */}
        <div style={{ marginBottom: 28 }}>
          <SectionLabel label="⚡ Awaiting Final Approval" />
          {awaiting.length === 0 ? (
            <EmptySlot message="No appraisals awaiting CEO approval." />
          ) : (
            awaiting.map(rev => (
              <div key={rev.id} style={{
                background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12,
                padding: '20px 24px', marginBottom: 16,
              }}>
                {/* Card header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  <div>
                    <div style={{ color: C.textPrimary, fontSize: 16, fontWeight: 800, fontFamily: 'Montserrat, sans-serif' }}>
                      {rev.employeeName}
                    </div>
                    <div style={{ color: C.textMuted, fontSize: 11, fontWeight: 500, fontFamily: 'Montserrat, sans-serif', marginTop: 2 }}>
                      {[rev.jobTitle, rev.department, rev.period].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusPill status={rev.status} />
                    <button
                      onClick={() => openReview(rev)}
                      style={{
                        background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 6,
                        color: C.textMuted, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                        padding: '5px 12px', fontFamily: 'Montserrat, sans-serif',
                      }}
                    >
                      Full View →
                    </button>
                  </div>
                </div>

                {/* Score card */}
                <div style={{ marginBottom: 16 }}>
                  <OverallCard review={rev} />
                </div>

                {/* Stage summaries — 3 cols */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                  {rev.leadReview && (
                    <StageSummary
                      icon="👥" color={LEAD_COLOR} label="Team Lead Review"
                      lines={[
                        { key: 'Strengths',      val: rev.leadReview.text.strengths },
                        { key: 'Improvements',   val: rev.leadReview.text.improvements },
                        { key: 'Recommendation', val: rev.leadReview.text.recommendation },
                      ]}
                    />
                  )}
                  {rev.hrReview && (
                    <StageSummary
                      icon="🤝" color={HR_COLOR} label="HR Review"
                      lines={[
                        { key: 'HR Comments', val: rev.hrReview.text.hrComments },
                        { key: 'HR Remarks',  val: rev.hrReview.text.hrRemarks },
                      ]}
                    />
                  )}
                  {rev.cooReview && (
                    <StageSummary
                      icon="🏢" color={COO_COLOR} label="COO Review"
                      lines={[
                        { key: 'Strategic Alignment', val: rev.cooReview.text.strategicAlignment },
                        { key: 'COO Comments',        val: rev.cooReview.text.cooComments },
                      ]}
                    />
                  )}
                </div>

                {/* Decision inputs */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ color: C.textDim, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif', marginBottom: 6 }}>
                    Final Decision Notes <span style={{ color: CEO_COLOR }}>*</span>
                  </div>
                  <textarea
                    rows={3}
                    value={inlineDecision[rev.id] ?? ''}
                    onChange={e => setInlineDecision(prev => ({ ...prev, [rev.id]: e.target.value }))}
                    placeholder="Summarise your final decision and rationale…"
                    style={{
                      width: '100%', background: C.appBg, border: `1px solid ${C.border}`,
                      borderRadius: 8, color: C.textPrimary, fontSize: 12,
                      fontFamily: 'Montserrat, sans-serif', padding: '10px 12px',
                      resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: C.textDim, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif', marginBottom: 6 }}>
                    CEO Notes (optional)
                  </div>
                  <textarea
                    rows={2}
                    value={inlineNote[rev.id] ?? ''}
                    onChange={e => setInlineNote(prev => ({ ...prev, [rev.id]: e.target.value }))}
                    placeholder="Any additional notes for the record…"
                    style={{
                      width: '100%', background: C.appBg, border: `1px solid ${C.border}`,
                      borderRadius: 8, color: C.textPrimary, fontSize: 12,
                      fontFamily: 'Montserrat, sans-serif', padding: '10px 12px',
                      resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Action row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ color: C.textDim, fontSize: 11, fontFamily: 'Montserrat, sans-serif' }}>
                    Final Decision field is required for both actions.
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => submitReturn(rev)}
                      style={{
                        background: 'transparent', border: `1px solid ${CEO_COLOR}`,
                        borderRadius: 7, color: CEO_COLOR, fontSize: 12, fontWeight: 700,
                        cursor: 'pointer', padding: '8px 16px', fontFamily: 'Montserrat, sans-serif',
                        transition: 'all 0.15s',
                      }}
                    >
                      ↩ Return to COO
                    </button>
                    <button
                      onClick={() => submitApprove(rev)}
                      style={{
                        background: C.success, border: `1px solid ${C.success}`,
                        borderRadius: 7, color: '#fff', fontSize: 12, fontWeight: 800,
                        cursor: 'pointer', padding: '8px 18px', fontFamily: 'Montserrat, sans-serif',
                        transition: 'all 0.15s',
                      }}
                    >
                      ✓ Approve & Complete Appraisal
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 📈 Organisation Trend — shown when 3+ completed with scores */}
        {trendData.length >= 3 && (
          <div style={{ marginBottom: 28 }}>
            <SectionLabel label="📈 Organisation Trend" />
            <div style={{
              background: C.cardBg, border: `1px solid ${C.border}`,
              borderRadius: 10, padding: '20px 16px',
            }}>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={trendData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis
                    dataKey="period"
                    tick={{ fill: C.textMuted, fontSize: 11, fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                    axisLine={{ stroke: C.border }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: C.textMuted, fontSize: 11, fontFamily: 'Montserrat, sans-serif' }}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                    tickFormatter={(v: number) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 8 }}
                    labelStyle={{ color: C.textPrimary, fontWeight: 700, fontFamily: 'Montserrat, sans-serif', fontSize: 12 }}
                    itemStyle={{ color: C.textMuted, fontFamily: 'Montserrat, sans-serif', fontSize: 11 }}
                    formatter={(v: number | undefined) => [`${v ?? 0}%`, 'Org Average']}
                  />
                  <ReferenceLine y={90} stroke={BAND_COLORS['Exceptional']}    strokeDasharray="4 4" strokeOpacity={0.5} />
                  <ReferenceLine y={80} stroke={BAND_COLORS['Very Good']}      strokeDasharray="4 4" strokeOpacity={0.5} />
                  <ReferenceLine y={60} stroke={BAND_COLORS['Good']}           strokeDasharray="4 4" strokeOpacity={0.5} />
                  <ReferenceLine y={40} stroke={BAND_COLORS['Improvement Needed']} strokeDasharray="4 4" strokeOpacity={0.5} />
                  <Line
                    type="monotone"
                    dataKey="avg"
                    stroke={CEO_COLOR}
                    strokeWidth={2.5}
                    dot={{ fill: CEO_COLOR, r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 🏆 Top Performers */}
        {topPerformers.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <SectionLabel label="🏆 Top Performers" />
            <div style={{
              background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden',
            }}>
              {topPerformers.map((rev, i) => {
                const score = Math.round(revScore(rev));
                const band  = getBand(score);
                const rankColor = i < 3 ? RANK_COLORS[i] : C.textDim;
                const isLast = i === topPerformers.length - 1;
                return (
                  <div
                    key={rev.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px',
                      borderBottom: isLast ? 'none' : `1px solid ${C.border}`,
                    }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: `${rankColor}20`, border: `1px solid ${rankColor}60`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: rankColor, fontSize: 12, fontWeight: 800,
                      fontFamily: 'Montserrat, sans-serif', flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: C.textPrimary, fontSize: 13, fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>
                        {rev.employeeName}
                      </div>
                      <div style={{ color: C.textMuted, fontSize: 11, fontFamily: 'Montserrat, sans-serif', marginTop: 2 }}>
                        {[rev.jobTitle, rev.department].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ color: BAND_COLORS[band], fontSize: 16, fontWeight: 800, fontFamily: 'Montserrat, sans-serif' }}>
                        {score}%
                      </div>
                      <div style={{ color: C.textDim, fontSize: 10, fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>
                        {band}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 📊 Department Breakdown — shown when 2+ departments */}
        {deptRows.length >= 2 && (
          <div style={{ marginBottom: 28 }}>
            <SectionLabel label="📊 Department Breakdown" />
            <div style={{
              background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden',
            }}>
              {/* Header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 80px 80px 120px',
                padding: '10px 20px', borderBottom: `1px solid ${C.border}`,
              }}>
                {['Department', 'Reviews', 'Avg Score', 'Band'].map(h => (
                  <div key={h} style={{ color: C.textDim, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}>
                    {h}
                  </div>
                ))}
              </div>
              {deptRows.map((row, i) => (
                <div
                  key={row.dept}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 80px 80px 120px',
                    padding: '11px 20px', alignItems: 'center',
                    borderBottom: i === deptRows.length - 1 ? 'none' : `1px solid ${C.border}`,
                  }}
                >
                  <div style={{ color: C.textPrimary, fontSize: 13, fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>{row.dept}</div>
                  <div style={{ color: C.textMuted, fontSize: 13, fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>{row.count}</div>
                  <div style={{ color: BAND_COLORS[row.band], fontSize: 14, fontWeight: 800, fontFamily: 'Montserrat, sans-serif' }}>{row.avg}%</div>
                  <div>
                    <span style={{
                      background: `${BAND_COLORS[row.band]}20`, border: `1px solid ${BAND_COLORS[row.band]}50`,
                      color: BAND_COLORS[row.band], borderRadius: 20, padding: '2px 10px',
                      fontSize: 11, fontWeight: 700, fontFamily: 'Montserrat, sans-serif',
                    }}>
                      {row.band}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ✅ All Completed Appraisals */}
        {completed.length > 0 && (
          <div>
            <SectionLabel label="✅ All Completed Appraisals" />
            <RevTable reviews={completed} onSelect={openReview} showScore />
          </div>
        )}

      </div>
    </div>
  );
}
