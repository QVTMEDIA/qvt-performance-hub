'use client';

import { Review } from '@/types';
import { AppContext } from '@/components/AppShell';
import { STATUS_ORDER } from '@/lib/constants';
import { C } from '@/styles/brand';
import StatCard  from '@/components/atoms/StatCard';
import StatusPill from '@/components/atoms/StatusPill';
import NotifBar  from '@/components/shared/NotifBar';
import RevRow    from '@/components/shared/RevRow';
import RevTable  from '@/components/shared/RevTable';

const HR_COLOR = '#7c3aed';

interface HRDashboardProps {
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

export default function HRDashboard({ ctx }: HRDashboardProps) {
  const { reviews, reminders, openReview, saveReminders, addRem, showToast } = ctx;

  // Reviews awaiting HR (Team Lead has submitted)
  const awaiting  = reviews.filter(r => r.status === 'lead_done');
  // Reviews in the pipeline (any active stage that isn't HR's queue or done)
  const pipeline  = reviews.filter(r =>
    r.status !== 'draft' && r.status !== 'lead_done' && r.status !== 'completed',
  );
  const completed = reviews.filter(r => r.status === 'completed');
  const drafts    = reviews.filter(r => r.status === 'draft');

  function handleOpen(reviewId: string) {
    const rev = reviews.find(r => r.id === reviewId);
    if (rev) openReview(rev);
  }

  function handleDismiss(id: string) {
    saveReminders(reminders.map(r => r.id === id ? { ...r, read: true } : r));
  }

  function sendReminder(rev: Review) {
    addRem(
      rev.id,
      'employee',
      `Reminder: Your self-review for ${rev.period} is still pending. Please complete it at your earliest convenience.`,
    );
    showToast(`Reminder sent to ${rev.employeeName}.`, 'success');
  }

  // Group pipeline reviews by status for display
  const pipelineStatuses = STATUS_ORDER.filter(s =>
    s !== 'draft' && s !== 'lead_done' && s !== 'completed' && pipeline.some(r => r.status === s),
  );

  return (
    <div>
      {/* Header */}
      <div style={{ padding: '20px 32px 16px', borderBottom: `1px solid ${C.border}` }}>
        <h1 style={{ color: C.textPrimary, fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em', margin: 0, fontFamily: 'Montserrat, sans-serif' }}>
          <span style={{ color: HR_COLOR }}>People Lead (HR)</span> Dashboard
        </h1>
        <p style={{ color: C.textMuted, fontSize: 12, fontWeight: 500, margin: '4px 0 0', fontFamily: 'Montserrat, sans-serif' }}>
          QVT Media Performance Hub · {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div style={{ padding: '24px 32px' }}>

        {/* NotifBar */}
        <NotifBar reminders={reminders} role="hr" onOpen={handleOpen} onDismiss={handleDismiss} />

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          <StatCard label="Total Reviews"  value={reviews.length} />
          <StatCard label="Awaiting HR"    value={awaiting.length}  color={awaiting.length  > 0 ? HR_COLOR  : C.textDim} />
          <StatCard label="In Progress"    value={pipeline.length}  color={pipeline.length  > 0 ? C.blue    : C.textDim} />
          <StatCard label="Completed"      value={completed.length} color={completed.length > 0 ? C.success : C.textDim} />
        </div>

        {/* ⚡ Awaiting HR Review */}
        <div style={{ marginBottom: 28 }}>
          <SectionLabel label="⚡ Awaiting HR Review" />
          {awaiting.length === 0 ? (
            <EmptySlot message="No reviews awaiting HR assessment." />
          ) : (
            awaiting.map(rev => (
              <RevRow key={rev.id} review={rev} onOpen={() => openReview(rev)} ctaLabel="Start HR Review →" />
            ))
          )}
        </div>

        {/* 📋 Pipeline — grouped by status */}
        {pipeline.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <SectionLabel label="📋 Pipeline" />
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

        {/* ✅ Completed */}
        {completed.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <SectionLabel label="✅ Completed" />
            <RevTable reviews={completed} onSelect={openReview} showScore />
          </div>
        )}

        {/* 📨 HR Reminder Panel — draft reviews */}
        {drafts.length > 0 && (
          <div>
            <SectionLabel label="📨 Pending Self-Reviews — Send Reminder" />
            <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
              {drafts.map((rev, i) => {
                const isLast = i === drafts.length - 1;
                return (
                  <div
                    key={rev.id}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      gap: 16, padding: '12px 20px',
                      borderBottom: isLast ? 'none' : `1px solid ${C.border}`,
                    }}
                  >
                    <div>
                      <div style={{ color: C.textPrimary, fontSize: 13, fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>
                        {rev.employeeName}
                      </div>
                      <div style={{ color: C.textDim, fontSize: 11, fontWeight: 500, fontFamily: 'Montserrat, sans-serif', marginTop: 2 }}>
                        {rev.period}{rev.department ? ` · ${rev.department}` : ''}
                      </div>
                    </div>
                    <button
                      onClick={() => sendReminder(rev)}
                      style={{
                        background: 'transparent', border: `1px solid ${HR_COLOR}`, borderRadius: 6,
                        color: HR_COLOR, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                        padding: '6px 14px', fontFamily: 'Montserrat, sans-serif',
                        letterSpacing: '0.02em', whiteSpace: 'nowrap', transition: 'all 0.15s',
                      }}
                    >
                      Send Reminder
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
