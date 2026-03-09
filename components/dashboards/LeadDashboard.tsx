'use client';

import { AppContext } from '@/components/AppShell';
import { C } from '@/styles/brand';
import StatCard from '@/components/atoms/StatCard';
import NotifBar from '@/components/shared/NotifBar';
import RevRow from '@/components/shared/RevRow';
import RevTable from '@/components/shared/RevTable';

const LEAD_COLOR = '#0891b2';

interface LeadDashboardProps {
  ctx: AppContext;
}

export default function LeadDashboard({ ctx }: LeadDashboardProps) {
  const { reviews, reminders, openReview, saveReminders } = ctx;

  const awaiting  = reviews.filter(r => r.status === 'self_done');
  const inProg    = reviews.filter(r => ['lead_done', 'hr_done', 'coo_done'].includes(r.status));
  const completed = reviews.filter(r => r.status === 'completed');

  function handleOpen(reviewId: string) {
    const rev = reviews.find(r => r.id === reviewId);
    if (rev) openReview(rev);
  }

  function handleDismiss(id: string) {
    saveReminders(reminders.map(r => r.id === id ? { ...r, read: true } : r));
  }

  const SectionLabel = ({ label }: { label: string }) => (
    <div style={{
      color:         C.textDim,
      fontSize:      10,
      fontWeight:    700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      marginBottom:  12,
      fontFamily:    'Montserrat, sans-serif',
    }}>
      {label}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{
        padding:      '20px 32px 16px',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <h1 style={{
          color:         C.textPrimary,
          fontSize:      20,
          fontWeight:    800,
          letterSpacing: '-0.01em',
          margin:        0,
          fontFamily:    'Montserrat, sans-serif',
        }}>
          <span style={{ color: LEAD_COLOR }}>Team Lead</span> Dashboard
        </h1>
        <p style={{ color: C.textMuted, fontSize: 12, fontWeight: 500, margin: '4px 0 0', fontFamily: 'Montserrat, sans-serif' }}>
          QVT Media Performance Hub · {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div style={{ padding: '24px 32px' }}>

        {/* NotifBar */}
        <NotifBar
          reminders={reminders}
          role="lead"
          onOpen={handleOpen}
          onDismiss={handleDismiss}
        />

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          <StatCard label="Total Reviews" value={reviews.length} />
          <StatCard
            label="Awaiting My Review"
            value={awaiting.length}
            color={awaiting.length > 0 ? LEAD_COLOR : C.textDim}
          />
          <StatCard
            label="In Progress"
            value={inProg.length}
            color={inProg.length > 0 ? C.blue : C.textDim}
          />
          <StatCard
            label="Completed"
            value={completed.length}
            color={completed.length > 0 ? C.success : C.textDim}
          />
        </div>

        {/* ⚡ Awaiting Your Review */}
        <div style={{ marginBottom: 28 }}>
          <SectionLabel label="⚡ Awaiting Your Review" />
          {awaiting.length === 0 ? (
            <div style={{
              padding:      '32px 24px',
              textAlign:    'center',
              color:        C.textDim,
              fontSize:     12,
              fontFamily:   'Montserrat, sans-serif',
              background:   C.cardBg,
              border:       `1px solid ${C.border}`,
              borderRadius: 10,
            }}>
              No reviews awaiting your assessment.
            </div>
          ) : (
            awaiting.map(rev => (
              <RevRow
                key={rev.id}
                review={rev}
                onOpen={() => openReview(rev)}
                ctaLabel="Start Review →"
              />
            ))
          )}
        </div>

        {/* 📋 In Progress */}
        {inProg.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <SectionLabel label="📋 In Progress" />
            {inProg.map(rev => (
              <RevRow
                key={rev.id}
                review={rev}
                onOpen={() => openReview(rev)}
                ctaLabel="View"
              />
            ))}
          </div>
        )}

        {/* ✅ Completed */}
        {completed.length > 0 && (
          <div>
            <SectionLabel label="✅ Completed" />
            <RevTable
              reviews={completed}
              onSelect={openReview}
              showScore
            />
          </div>
        )}

      </div>
    </div>
  );
}
