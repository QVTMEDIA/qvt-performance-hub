'use client';

import { AppContext } from '@/components/AppShell';
import { calcOverall, getBand } from '@/lib/scoring';
import { C, BAND_COLORS, BANDS } from '@/styles/brand';
import { STATUS_ORDER } from '@/lib/constants';
import { Review } from '@/types';
import StatCard   from '@/components/atoms/StatCard';
import StatusPill from '@/components/atoms/StatusPill';
import NotifBar   from '@/components/shared/NotifBar';
import RevRow     from '@/components/shared/RevRow';
import RevTable   from '@/components/shared/RevTable';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const COO_COLOR = '#d97706';

const REC_COLORS: Record<string, string> = {
  Promote: '#10b981',
  Retain:  '#3b82f6',
  PIP:     '#ef4444',
  Review:  '#f59e0b',
};

interface COODashboardProps {
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

export default function COODashboard({ ctx }: COODashboardProps) {
  const { reviews, reminders, openReview, saveReminders } = ctx;

  const awaiting  = reviews.filter(r => r.status === 'hr_done');
  const pipeline  = reviews.filter(r => !['draft', 'hr_done', 'completed'].includes(r.status));
  const completed = reviews.filter(r => r.status === 'completed');

  // Scored subset (completed with lead scores)
  const scored = completed.filter(r => r.leadReview);
  const orgAvgPct = scored.length > 0
    ? Math.round(scored.reduce((s, r) => s + revScore(r), 0) / scored.length)
    : 0;
  const orgBand = orgAvgPct > 0 ? getBand(orgAvgPct) : null;

  // Top performer
  const topRev  = scored.length > 0 ? scored.reduce((b, r) => revScore(r) > revScore(b) ? r : b) : null;
  const topScore = topRev ? Math.round(revScore(topRev)) : 0;

  // Performance distribution
  const distData = BANDS.map(band => ({
    band:  band.label,
    count: scored.filter(r => getBand(revScore(r)) === band.label).length,
    color: band.color,
  }));

  // Pipeline statuses (active, non-draft, non-awaiting-COO, non-completed)
  const pipelineStatuses = STATUS_ORDER.filter(
    s => !['draft', 'hr_done', 'completed'].includes(s) && pipeline.some(r => r.status === s),
  );

  function handleOpen(reviewId: string) {
    const rev = reviews.find(r => r.id === reviewId);
    if (rev) openReview(rev);
  }

  function handleDismiss(id: string) {
    saveReminders(reminders.map(r => r.id === id ? { ...r, read: true } : r));
  }

  function handleMarkAllRead() {
    saveReminders(reminders.map(r => r.toRole === 'coo' ? { ...r, read: true } : r));
  }

  return (
    <div>
      {/* Header */}
      <div style={{ padding: '20px 32px 16px', borderBottom: `1px solid ${C.border}` }}>
        <h1 style={{
          color: C.textPrimary, fontSize: 20, fontWeight: 800,
          letterSpacing: '-0.01em', margin: 0, fontFamily: 'Montserrat, sans-serif',
        }}>
          <span style={{ color: COO_COLOR }}>COO</span> Dashboard
        </h1>
        <p style={{ color: C.textMuted, fontSize: 12, fontWeight: 500, margin: '4px 0 0', fontFamily: 'Montserrat, sans-serif' }}>
          QVT Media Performance Hub · {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div style={{ padding: '24px 32px' }}>

        {/* NotifBar */}
        <NotifBar reminders={reminders} role="coo" onOpen={handleOpen} onDismiss={handleDismiss} onMarkAllRead={handleMarkAllRead} />

        {/* Stat Cards — Row 1 */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          <StatCard label="Total Appraisals"      value={reviews.length} />
          <StatCard label="Awaiting COO Review"   value={awaiting.length}  color={awaiting.length  > 0 ? COO_COLOR : C.textDim} />
          <StatCard label="Pending in Pipeline"   value={pipeline.length}  color={pipeline.length  > 0 ? C.blue    : C.textDim} />
          <StatCard label="Completed This Period" value={completed.length} color={completed.length > 0 ? C.success : C.textDim} />
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
            label="Top Performer"
            value={topRev ? topRev.employeeName : '—'}
            color={topScore > 0 ? BAND_COLORS[getBand(topScore)] : C.textDim}
            sub={topScore > 0 ? `${topScore}%` : undefined}
          />
        </div>

        {/* ⚡ Awaiting COO Review */}
        <div style={{ marginBottom: 28 }}>
          <SectionLabel label="⚡ Awaiting COO Review" />
          {awaiting.length === 0 ? (
            <EmptySlot message="No reviews awaiting COO assessment." />
          ) : (
            awaiting.map(rev => {
              const rec = rev.leadReview?.text?.recommendation;
              return (
                <div key={rev.id} style={{ marginBottom: 8 }}>
                  <RevRow review={rev} onOpen={() => openReview(rev)} ctaLabel="Review →" />
                  {rec && (
                    <div style={{ marginTop: -2, paddingLeft: 12, paddingBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: C.textDim, fontSize: 10, fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>
                        Lead Recommendation:
                      </span>
                      <span style={{
                        background: `${REC_COLORS[rec] ?? C.blue}20`,
                        border:     `1px solid ${REC_COLORS[rec] ?? C.blue}50`,
                        color:       REC_COLORS[rec] ?? C.blue,
                        borderRadius: 20, padding: '2px 10px',
                        fontSize: 11, fontWeight: 700, fontFamily: 'Montserrat, sans-serif',
                      }}>
                        {rec}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 📋 Active Pipeline — grouped by status */}
        {pipeline.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <SectionLabel label="📋 Active Pipeline" />
            {pipelineStatuses.map(status => (
              <div key={status} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <StatusPill status={status} />
                </div>
                {pipeline.filter(r => r.status === status).map(rev => (
                  <RevRow key={rev.id} review={rev} onOpen={() => openReview(rev)} ctaLabel="View" />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* 📊 Performance Distribution — shown when 3+ scored completed */}
        {scored.length >= 3 && (
          <div style={{ marginBottom: 28 }}>
            <SectionLabel label="📊 Performance Distribution" />
            <div style={{
              background: C.cardBg, border: `1px solid ${C.border}`,
              borderRadius: 10, padding: '20px 16px',
            }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={distData} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                  <XAxis
                    dataKey="band"
                    tick={{ fill: C.textMuted, fontSize: 11, fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                    axisLine={{ stroke: C.border }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: C.textMuted, fontSize: 11, fontFamily: 'Montserrat, sans-serif' }}
                    axisLine={false}
                    tickLine={false}
                    width={24}
                  />
                  <Tooltip
                    contentStyle={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 8 }}
                    labelStyle={{ color: C.textPrimary, fontWeight: 700, fontFamily: 'Montserrat, sans-serif', fontSize: 12 }}
                    itemStyle={{ color: C.textMuted, fontFamily: 'Montserrat, sans-serif', fontSize: 11 }}
                    formatter={(v: number | undefined) => [`${v ?? 0} employee${v !== 1 ? 's' : ''}`, 'Count']}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {distData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ✅ Completed Appraisals */}
        {completed.length > 0 && (
          <div>
            <SectionLabel label="✅ Completed Appraisals" />
            <RevTable reviews={completed} onSelect={openReview} showScore />
          </div>
        )}

      </div>
    </div>
  );
}
