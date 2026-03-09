'use client';

import { AppContext } from '@/components/AppShell';
import { calcOverall, getBand } from '@/lib/scoring';
import { BAND_COLORS, C } from '@/styles/brand';
import { STATUS_ORDER, STAGE_META } from '@/lib/constants';
import StatCard from '@/components/atoms/StatCard';
import NotifBar from '@/components/shared/NotifBar';
import RevRow   from '@/components/shared/RevRow';
import RevTable from '@/components/shared/RevTable';

const CEO_COLOR = '#dc2626';

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

export default function CEODashboard({ ctx }: CEODashboardProps) {
  const { reviews, reminders, openReview, saveReminders } = ctx;

  const awaiting  = reviews.filter(r => r.status === 'coo_done');
  const completed = reviews.filter(r => r.status === 'completed');

  // Org average across completed reviews that have lead scores
  const scoredCompleted = completed.filter(r => r.leadReview);
  const orgAvgPct = scoredCompleted.length > 0
    ? Math.round(
        scoredCompleted.reduce((s, r) =>
          s + calcOverall(r.leadReview!.behavioral, r.leadReview!.functional), 0
        ) / scoredCompleted.length
      )
    : 0;
  const orgBand = orgAvgPct > 0 ? getBand(orgAvgPct) : null;

  function handleDismiss(id: string) {
    saveReminders(reminders.map(r => r.id === id ? { ...r, read: true } : r));
  }

  function handleOpen(reviewId: string) {
    const rev = reviews.find(r => r.id === reviewId);
    if (rev) openReview(rev);
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
        <NotifBar reminders={reminders} role="ceo" onOpen={handleOpen} onDismiss={handleDismiss} />

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          <StatCard label="Total Appraisals"         value={reviews.length} />
          <StatCard
            label="Awaiting Final Approval"
            value={awaiting.length}
            color={awaiting.length > 0 ? CEO_COLOR : C.textDim}
          />
          <StatCard
            label="Completed This Period"
            value={completed.length}
            color={completed.length > 0 ? C.success : C.textDim}
          />
          <StatCard
            label="Org Average Score"
            value={orgAvgPct > 0 ? `${orgAvgPct}%` : '—'}
            color={orgBand ? BAND_COLORS[orgBand] : C.textDim}
            sub={orgBand ?? undefined}
          />
        </div>

        {/* ⚡ Awaiting Final Approval */}
        <div style={{ marginBottom: 28 }}>
          <SectionLabel label="⚡ Awaiting Final Approval" />
          {awaiting.length === 0 ? (
            <EmptySlot message="No appraisals awaiting CEO approval." />
          ) : (
            awaiting.map(rev => (
              <RevRow key={rev.id} review={rev} onOpen={() => openReview(rev)} ctaLabel="Review & Decide →" />
            ))
          )}
        </div>

        {/* 📊 Organisation Overview */}
        {reviews.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <SectionLabel label="📊 Organisation Overview" />
            <div style={{
              background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10,
              padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '12px 28px',
            }}>
              {STATUS_ORDER.map(status => {
                const count = reviews.filter(r => r.status === status).length;
                const meta  = STAGE_META[status];
                return (
                  <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ color: C.textMuted, fontSize: 11, fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>
                      {meta.label}
                    </span>
                    <span style={{ color: C.textPrimary, fontSize: 13, fontWeight: 800, fontFamily: 'Montserrat, sans-serif' }}>
                      {count}
                    </span>
                  </div>
                );
              })}
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
