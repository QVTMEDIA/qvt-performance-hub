'use client';

import { useState, useMemo } from 'react';
import { Review, ReviewStatus } from '@/types';
import { STAGE_META, STATUS_ORDER, PERIODS } from '@/lib/constants';
import { deleteReview, forceReviewStatus, logAuditAction } from '@/lib/adminService';
import { useTheme } from '@/lib/ThemeContext';
import { ToastType } from '@/components/AppShell';

interface ReviewManagementProps {
  reviews: Review[];
  adminEmail: string;
  onRefresh: () => Promise<void>;
  showToast: (msg: string, type?: ToastType) => void;
}

function StatusPill({ status }: { status: ReviewStatus }) {
  const meta = STAGE_META[status];
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px',
      background: `${meta.color}20`, color: meta.color,
      borderRadius: 4, fontSize: 11, fontWeight: 700,
      fontFamily: 'Montserrat, sans-serif',
    }}>
      {meta.label}
    </span>
  );
}

export default function ReviewManagement({ reviews, adminEmail, onRefresh, showToast }: ReviewManagementProps) {
  const { theme } = useTheme();

  const [statusFilter, setStatusFilter]   = useState<ReviewStatus | 'all'>('all');
  const [deptFilter,   setDeptFilter]     = useState('all');
  const [periodFilter, setPeriodFilter]   = useState('all');

  const [forceModal,   setForceModal]     = useState<Review | null>(null);
  const [newStatus,    setNewStatus]      = useState<ReviewStatus>('draft');
  const [forcing,      setForcing]        = useState(false);

  const [confirmDel,   setConfirmDel]     = useState<Review | null>(null);
  const [deleting,     setDeleting]       = useState(false);

  const [detailRev,    setDetailRev]      = useState<Review | null>(null);

  // Unique departments
  const departments = useMemo(() => {
    const set = new Set(reviews.map(r => r.department).filter(Boolean));
    return Array.from(set).sort();
  }, [reviews]);

  const filtered = useMemo(() => {
    return reviews.filter(r => {
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchDept   = deptFilter   === 'all' || r.department === deptFilter;
      const matchPeriod = periodFilter === 'all' || r.period === periodFilter;
      return matchStatus && matchDept && matchPeriod;
    });
  }, [reviews, statusFilter, deptFilter, periodFilter]);

  const handleForceStatus = async () => {
    if (!forceModal) return;
    setForcing(true);
    try {
      await forceReviewStatus(forceModal.id, newStatus);
      await logAuditAction('force_review_status', adminEmail, 'review', forceModal.id, {
        from: forceModal.status, to: newStatus,
      });
      showToast(`Status updated to "${STAGE_META[newStatus].label}"`, 'success');
      setForceModal(null);
      await onRefresh();
    } catch {
      showToast('Failed to update status', 'error');
    } finally {
      setForcing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    setDeleting(true);
    try {
      await deleteReview(confirmDel.id);
      await logAuditAction('delete_review', adminEmail, 'review', confirmDel.id, {
        employee: confirmDel.employeeName, period: confirmDel.period,
      });
      showToast(`Review deleted`, 'success');
      setConfirmDel(null);
      await onRefresh();
    } catch {
      showToast('Delete failed', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px', background: theme.input,
    border: `1px solid ${theme.inputBorder}`, borderRadius: 7,
    color: theme.textPrimary, fontSize: 12,
    fontFamily: 'Montserrat, sans-serif', outline: 'none', cursor: 'pointer',
  };

  const thStyle: React.CSSProperties = {
    padding: '9px 12px', color: theme.textDim,
    fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
    textTransform: 'uppercase', textAlign: 'left',
    fontFamily: 'Montserrat, sans-serif',
    background: theme.cardAlt, borderBottom: `1px solid ${theme.border}`,
    whiteSpace: 'nowrap',
  };

  const tdStyle: React.CSSProperties = {
    padding: '10px 12px', color: theme.textPrimary,
    fontSize: 12, fontFamily: 'Montserrat, sans-serif',
    borderBottom: `1px solid ${theme.border}`,
    verticalAlign: 'middle',
  };

  return (
    <div>
      <h1 style={{ color: theme.textPrimary, fontSize: 20, fontWeight: 800, fontFamily: 'Montserrat, sans-serif', margin: '0 0 20px' }}>
        Review Management
      </h1>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as ReviewStatus | 'all')} style={inputStyle}>
          <option value="all">All Statuses</option>
          {STATUS_ORDER.map(s => (
            <option key={s} value={s}>{STAGE_META[s].label}</option>
          ))}
        </select>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={inputStyle}>
          <option value="all">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={periodFilter} onChange={e => setPeriodFilter(e.target.value)} style={inputStyle}>
          <option value="all">All Periods</option>
          {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Employee</th>
                <th style={thStyle}>Period</th>
                <th style={thStyle}>Department</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: theme.textMuted, padding: '32px 12px' }}>
                    No reviews found
                  </td>
                </tr>
              ) : (
                filtered.map((rev, i) => (
                  <tr
                    key={rev.id}
                    style={{ background: i % 2 === 0 ? theme.card : theme.cardAlt, cursor: 'pointer' }}
                    onClick={() => setDetailRev(rev)}
                  >
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{rev.employeeName}</td>
                    <td style={{ ...tdStyle, color: theme.textSecondary }}>{rev.period}</td>
                    <td style={{ ...tdStyle, color: theme.textSecondary }}>{rev.department}</td>
                    <td style={tdStyle} onClick={e => e.stopPropagation()}>
                      <StatusPill status={rev.status} />
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => { setNewStatus(rev.status); setForceModal(rev); }}
                          style={{
                            padding: '5px 10px', background: '#d9770620',
                            border: 'none', borderRadius: 5,
                            color: '#d97706', fontSize: 11, fontWeight: 700,
                            fontFamily: 'Montserrat, sans-serif', cursor: 'pointer',
                          }}
                        >
                          Force Status
                        </button>
                        <button
                          onClick={() => setConfirmDel(rev)}
                          style={{
                            padding: '5px 10px', background: '#dc262620',
                            border: 'none', borderRadius: 5,
                            color: '#dc2626', fontSize: 11, fontWeight: 700,
                            fontFamily: 'Montserrat, sans-serif', cursor: 'pointer',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ color: theme.textMuted, fontSize: 11, marginTop: 10, fontFamily: 'Montserrat, sans-serif' }}>
        {filtered.length} of {reviews.length} reviews
      </div>

      {/* Force Status Modal */}
      {forceModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
          <div style={{
            background: theme.card, border: `1px solid ${theme.border}`,
            borderRadius: 12, padding: '24px 28px', maxWidth: 380, width: '100%',
            fontFamily: 'Montserrat, sans-serif',
          }}>
            <h3 style={{ color: theme.textPrimary, fontSize: 14, fontWeight: 800, margin: '0 0 6px' }}>
              Force Review Status
            </h3>
            <p style={{ color: theme.textSecondary, fontSize: 12, margin: '0 0 16px' }}>
              {forceModal.employeeName} · {forceModal.period}
            </p>
            <label style={{ display: 'block', color: theme.textDim, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6, fontFamily: 'Montserrat, sans-serif' }}>
              New Status
            </label>
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value as ReviewStatus)}
              style={{ ...inputStyle, width: '100%', marginBottom: 20, boxSizing: 'border-box' }}
            >
              {STATUS_ORDER.map(s => (
                <option key={s} value={s}>{STAGE_META[s].label}</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setForceModal(null)} style={{
                padding: '8px 16px', background: 'transparent',
                border: `1px solid ${theme.border}`, borderRadius: 6,
                color: theme.textSecondary, fontSize: 12, fontWeight: 600,
                fontFamily: 'Montserrat, sans-serif', cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={handleForceStatus} disabled={forcing} style={{
                padding: '8px 18px',
                background: forcing ? '#d9770680' : '#d97706',
                border: 'none', borderRadius: 6,
                color: '#fff', fontSize: 12, fontWeight: 700,
                fontFamily: 'Montserrat, sans-serif',
                cursor: forcing ? 'not-allowed' : 'pointer',
              }}>
                {forcing ? 'Updating...' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirmDel && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
          <div style={{
            background: theme.card, border: `1px solid ${theme.border}`,
            borderRadius: 12, padding: '24px 28px', maxWidth: 380, width: '100%',
            fontFamily: 'Montserrat, sans-serif',
          }}>
            <h3 style={{ color: theme.textPrimary, fontSize: 14, fontWeight: 800, margin: '0 0 10px' }}>
              Delete Review?
            </h3>
            <p style={{ color: theme.textSecondary, fontSize: 12, margin: '0 0 20px', lineHeight: 1.6 }}>
              Permanently delete the review for <strong>{confirmDel.employeeName}</strong> ({confirmDel.period})?
              This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDel(null)} style={{
                padding: '8px 16px', background: 'transparent',
                border: `1px solid ${theme.border}`, borderRadius: 6,
                color: theme.textSecondary, fontSize: 12, fontWeight: 600,
                fontFamily: 'Montserrat, sans-serif', cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={handleDelete} disabled={deleting} style={{
                padding: '8px 18px',
                background: deleting ? '#dc262680' : '#dc2626',
                border: 'none', borderRadius: 6,
                color: '#fff', fontSize: 12, fontWeight: 700,
                fontFamily: 'Montserrat, sans-serif',
                cursor: deleting ? 'not-allowed' : 'pointer',
              }}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Detail Modal */}
      {detailRev && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
          <div style={{
            background: theme.card, border: `1px solid ${theme.border}`,
            borderRadius: 14, padding: '24px 28px',
            maxWidth: 520, width: '100%',
            maxHeight: '80vh', overflowY: 'auto',
            fontFamily: 'Montserrat, sans-serif',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ color: theme.textPrimary, fontSize: 15, fontWeight: 800, margin: 0 }}>Review Detail</h3>
              <button onClick={() => setDetailRev(null)} style={{ background: 'transparent', border: 'none', color: theme.textMuted, fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>

            {/* Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', marginBottom: 16 }}>
              {[
                ['Employee', detailRev.employeeName],
                ['Job Title', detailRev.jobTitle],
                ['Department', detailRev.department],
                ['Period', detailRev.period],
                ['Supervisor', detailRev.supervisorName],
                ['Status', STAGE_META[detailRev.status].label],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ color: theme.textDim, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{k}</div>
                  <div style={{ color: theme.textPrimary, fontSize: 12, fontWeight: 600 }}>{v || '—'}</div>
                </div>
              ))}
            </div>

            {/* Stage summaries */}
            {detailRev.selfReview && (
              <StageSummary title="Self Review" text={detailRev.selfReview.text as Record<string, string>} theme={theme} color="#0b73a8" />
            )}
            {detailRev.leadReview && (
              <StageSummary title="Lead Review" text={detailRev.leadReview.text as Record<string, string>} theme={theme} color="#3b82f6" />
            )}
            {detailRev.hrReview && (
              <StageSummary title="HR Review" text={detailRev.hrReview.text as Record<string, string>} theme={theme} color="#8b5cf6" />
            )}
            {detailRev.cooReview && (
              <StageSummary title="COO Review" text={detailRev.cooReview.text as Record<string, string>} theme={theme} color="#d97706" />
            )}
            {detailRev.ceoReview && (
              <StageSummary title="CEO Review" text={detailRev.ceoReview.text as Record<string, string>} theme={theme} color="#dc2626" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StageSummary({ title, text, theme, color }: { title: string; text: Record<string, string>; theme: { textPrimary: string; textSecondary: string; textDim: string; cardAlt: string; border: string }; color: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        color, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase', marginBottom: 8,
        fontFamily: 'Montserrat, sans-serif',
      }}>
        {title}
      </div>
      {Object.entries(text).map(([k, v]) => v ? (
        <div key={k} style={{ marginBottom: 6 }}>
          <div style={{ color: theme.textDim, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k}</div>
          <div style={{ color: theme.textSecondary, fontSize: 12, lineHeight: 1.5 }}>{v}</div>
        </div>
      ) : null)}
    </div>
  );
}
