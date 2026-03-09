'use client';

import { AppContext } from '@/components/AppShell';
import { C, QVT_BLUE } from '@/styles/brand';
import { ROLE_META, STAGE_META } from '@/lib/constants';
import EmployeeDashboard from '@/components/dashboards/EmployeeDashboard';
import LeadDashboard from '@/components/dashboards/LeadDashboard';
import HRDashboard from '@/components/dashboards/HRDashboard';
import COODashboard from '@/components/dashboards/COODashboard';
import CEODashboard from '@/components/dashboards/CEODashboard';
import ReviewDetail from '@/components/review/ReviewDetail';
import NewReview from '@/components/review/NewReview';

interface DashboardProps {
  ctx: AppContext;
}

export default function Dashboard({ ctx }: DashboardProps) {
  const { role, reviews, view, setView } = ctx;
  const roleMeta = ROLE_META[role];

  // ── Employee dashboard ────────────────────────────────────────────────────────
  if (role === 'employee' && view === 'dashboard') {
    return (
      <EmployeeDashboard
        reviews={ctx.reviews}
        reminders={ctx.reminders}
        empName={ctx.empName}
        setEmpName={ctx.setEmpName}
        openReview={ctx.openReview}
        saveReviews={ctx.saveReviews}
        saveReminders={ctx.saveReminders}
        showToast={ctx.showToast}
      />
    );
  }

  // ── Reviewer dashboards ───────────────────────────────────────────────────────
  if (role === 'lead' && view === 'dashboard') return <LeadDashboard ctx={ctx} />;
  if (role === 'hr'   && view === 'dashboard') return <HRDashboard  ctx={ctx} />;
  if (role === 'coo'  && view === 'dashboard') return <COODashboard ctx={ctx} />;
  if (role === 'ceo'  && view === 'dashboard') return <CEODashboard ctx={ctx} />;

  // ── New Appraisal — reviewer roles ──────────────────────────────────────────
  if (role !== 'employee' && view === 'new') return <NewReview ctx={ctx} />;

  // Header
  const Header = () => (
    <div style={{
      padding: '20px 32px 16px',
      borderBottom: `1px solid ${C.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div>
        <h1 style={{ color: C.textPrimary, fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em', margin: 0 }}>
          {view === 'dashboard' ? `${roleMeta.label} Dashboard` : 'New Appraisal'}
        </h1>
        <p style={{ color: C.textMuted, fontSize: 12, fontWeight: 500, margin: '4px 0 0' }}>
          QVT Media Performance Hub · {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => setView('new')}
          style={{
            background: QVT_BLUE,
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 16px',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '0.04em',
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          + New Appraisal
        </button>
      </div>
    </div>
  );

  // Empty state
  const EmptyState = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 64,
      color: C.textMuted,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>📋</div>
      <h3 style={{ color: C.textSecondary, fontSize: 15, fontWeight: 700, margin: '0 0 8px' }}>
        No appraisals yet
      </h3>
      <p style={{ fontSize: 12, fontWeight: 500, maxWidth: 280, lineHeight: 1.6 }}>
        {role === 'employee'
          ? 'Start your self-review by clicking "New Appraisal" above.'
          : 'No reviews are currently assigned to you.'}
      </p>
    </div>
  );

  // Summary stat cards
  const total = reviews.length;
  const completed = reviews.filter(r => r.status === 'completed').length;
  const inProgress = reviews.filter(r => r.status !== 'completed' && r.status !== 'draft').length;
  const draft = reviews.filter(r => r.status === 'draft').length;

  const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div style={{
      background: C.cardBg,
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      padding: '16px 20px',
      flex: 1,
      minWidth: 120,
    }}>
      <div style={{ color: C.textDim, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ color, fontSize: 28, fontWeight: 800 }}>{value}</div>
    </div>
  );

  // Review list row
  const ReviewRow = ({ rev }: { rev: typeof reviews[0] }) => {
    const stage = STAGE_META[rev.status];
    return (
      <div
        onClick={() => ctx.openReview(rev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '12px 20px',
          background: C.cardBg,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          cursor: 'pointer',
          marginBottom: 8,
          transition: 'border-color 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = QVT_BLUE)}
        onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
      >
        <div style={{ flex: 1 }}>
          <div style={{ color: C.textPrimary, fontSize: 13, fontWeight: 700 }}>{rev.employeeName || '—'}</div>
          <div style={{ color: C.textMuted, fontSize: 11, fontWeight: 500, marginTop: 2 }}>
            {rev.jobTitle || 'No title'} · {rev.period}
          </div>
        </div>
        <div style={{
          background: `${stage.color}20`,
          color: stage.color,
          border: `1px solid ${stage.color}40`,
          borderRadius: 20,
          padding: '3px 10px',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>
          {stage.label}
        </div>
        <div style={{ color: C.textDim, fontSize: 11 }}>{rev.createdAt}</div>
      </div>
    );
  };

  // employee 'new' falls through to the generic review list below
  // (employees create appraisals from their own dashboard self-start form)

  if (view === 'review' && ctx.activeRev) {
    return <ReviewDetail ctx={ctx} />;
  }

  return (
    <div>
      <Header />
      <div style={{ padding: '24px 32px' }}>
        {/* Stat cards */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <StatCard label="Total Appraisals" value={total} color={C.textPrimary} />
          <StatCard label="In Progress" value={inProgress} color={C.blue} />
          <StatCard label="Draft" value={draft} color={C.textMuted} />
          <StatCard label="Completed" value={completed} color={C.success} />
        </div>

        {/* Reviews list */}
        <div style={{ color: C.textDim, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
          All Appraisals
        </div>

        {reviews.length === 0 ? (
          <EmptyState />
        ) : (
          <div>
            {reviews.map(rev => <ReviewRow key={rev.id} rev={rev} />)}
          </div>
        )}
      </div>
    </div>
  );
}
