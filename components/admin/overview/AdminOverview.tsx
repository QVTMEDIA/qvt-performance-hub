'use client';

import { useEffect, useState } from 'react';
import { Review } from '@/types';
import { AdminProfile, AuditEntry, fetchAuditLog } from '@/lib/adminService';
import { STAGE_META } from '@/lib/constants';
import { useTheme } from '@/lib/ThemeContext';
import StatCard from '@/components/atoms/StatCard';

interface AdminOverviewProps {
  profiles: AdminProfile[];
  reviews: Review[];
}

export default function AdminOverview({ profiles, reviews }: AdminOverviewProps) {
  const { theme } = useTheme();
  const [recentActivity, setRecentActivity] = useState<AuditEntry[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(true);

  useEffect(() => {
    fetchAuditLog({ limit: 5 })
      .then(setRecentActivity)
      .catch(() => {})
      .finally(() => setLoadingAudit(false));
  }, []);

  const totalUsers    = profiles.length;
  const adminUsers    = profiles.filter(p => p.isAdmin).length;
  const totalReviews  = reviews.length;
  const completed     = reviews.filter(r => r.status === 'completed').length;
  const pending       = reviews.filter(r => r.status !== 'completed' && r.status !== 'draft').length;

  // Status breakdown
  const statusCounts = Object.entries(STAGE_META).map(([key, meta]) => ({
    key,
    label: meta.label,
    color: meta.color,
    count: reviews.filter(r => r.status === key).length,
  }));

  const labelStyle: React.CSSProperties = {
    color: theme.textDim,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    fontFamily: 'Montserrat, sans-serif',
    marginBottom: 12,
  };

  return (
    <div>
      <h1 style={{
        color: theme.textPrimary, fontSize: 20, fontWeight: 800,
        fontFamily: 'Montserrat, sans-serif', margin: '0 0 24px',
      }}>
        Overview
      </h1>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 28 }}>
        <StatCard label="Total Users"    value={totalUsers}   color="#6366f1" />
        <StatCard label="Total Reviews"  value={totalReviews} />
        <StatCard label="Completed"      value={completed}    color="#22c55e" />
        <StatCard label="In Pipeline"    value={pending}      color="#f97316" />
        <StatCard label="Admin Users"    value={adminUsers}   color="#6366f1" sub="with full access" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Status Breakdown */}
        <div style={{
          background: theme.card, border: `1px solid ${theme.border}`,
          borderRadius: 10, padding: '18px 20px',
        }}>
          <div style={labelStyle}>Review Status Breakdown</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {statusCounts.map(s => (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0,
                  }} />
                  <span style={{ color: theme.textSecondary, fontSize: 12, fontFamily: 'Montserrat, sans-serif' }}>
                    {s.label}
                  </span>
                </div>
                <span style={{
                  color: s.count > 0 ? s.color : theme.textDim,
                  fontSize: 13, fontWeight: 700,
                  fontFamily: 'Montserrat, sans-serif',
                }}>
                  {s.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          background: theme.card, border: `1px solid ${theme.border}`,
          borderRadius: 10, padding: '18px 20px',
        }}>
          <div style={labelStyle}>Recent Activity</div>
          {loadingAudit ? (
            <div style={{ color: theme.textMuted, fontSize: 12 }}>Loading...</div>
          ) : recentActivity.length === 0 ? (
            <div style={{ color: theme.textMuted, fontSize: 12 }}>No activity yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentActivity.map(entry => (
                <div key={entry.id} style={{ borderBottom: `1px solid ${theme.border}`, paddingBottom: 8 }}>
                  <div style={{ color: theme.textPrimary, fontSize: 12, fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}>
                    {entry.action}
                  </div>
                  <div style={{ color: theme.textMuted, fontSize: 11, marginTop: 2 }}>
                    {entry.adminEmail} · {new Date(entry.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
