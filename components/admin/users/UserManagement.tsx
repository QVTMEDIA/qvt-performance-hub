'use client';

import { useState, useMemo } from 'react';
import { Role } from '@/types';
import { AdminProfile, logAuditAction } from '@/lib/adminService';
import { ROLE_META } from '@/lib/constants';
import { useTheme } from '@/lib/ThemeContext';
import { ToastType } from '@/components/AppShell';
import UserModal from './UserModal';

const ADMIN_ACCENT = '#6366f1';

interface UserManagementProps {
  profiles: AdminProfile[];
  adminEmail: string;
  onRefresh: () => Promise<void>;
  showToast: (msg: string, type?: ToastType) => void;
}

export default function UserManagement({ profiles, adminEmail, onRefresh, showToast }: UserManagementProps) {
  const { theme } = useTheme();

  const [search,      setSearch]      = useState('');
  const [roleFilter,  setRoleFilter]  = useState<Role | 'all'>('all');
  const [modal,       setModal]       = useState<{ mode: 'add' | 'edit'; profile?: AdminProfile } | null>(null);
  const [confirmDel,  setConfirmDel]  = useState<AdminProfile | null>(null);
  const [deleting,    setDeleting]    = useState(false);

  const filtered = useMemo(() => {
    return profiles.filter(p => {
      const matchSearch = !search ||
        p.fullName.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'all' || p.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [profiles, search, roleFilter]);

  const handleDelete = async () => {
    if (!confirmDel) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: confirmDel.id }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? 'Delete failed', 'error'); return; }
      await logAuditAction('delete_user', adminEmail, 'user', confirmDel.id, { email: confirmDel.email });
      showToast(`User ${confirmDel.email} deleted`, 'success');
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
    fontFamily: 'Montserrat, sans-serif', outline: 'none',
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ color: theme.textPrimary, fontSize: 20, fontWeight: 800, fontFamily: 'Montserrat, sans-serif', margin: 0 }}>
          User Management
        </h1>
        <button
          onClick={() => setModal({ mode: 'add' })}
          style={{
            padding: '9px 18px', background: ADMIN_ACCENT,
            border: 'none', borderRadius: 7,
            color: '#fff', fontSize: 12, fontWeight: 700,
            fontFamily: 'Montserrat, sans-serif', cursor: 'pointer',
          }}
        >
          + Add User
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search name or email..."
          style={{ ...inputStyle, minWidth: 200 }}
        />
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value as Role | 'all')}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          <option value="all">All Roles</option>
          {(Object.keys(ROLE_META) as Role[]).map(r => (
            <option key={r} value={r}>{ROLE_META[r].label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={{ border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Department</th>
                <th style={thStyle}>Job Title</th>
                <th style={thStyle}>Admin</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ ...tdStyle, textAlign: 'center', color: theme.textMuted, padding: '32px 12px' }}>
                    No users found
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
                  <tr key={p.id} style={{ background: i % 2 === 0 ? theme.card : theme.cardAlt }}>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 600 }}>{p.fullName || '—'}</span>
                    </td>
                    <td style={{ ...tdStyle, color: theme.textSecondary }}>{p.email}</td>
                    <td style={tdStyle}>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px',
                        background: `${ROLE_META[p.role]?.color ?? '#6366f1'}20`,
                        color: ROLE_META[p.role]?.color ?? '#6366f1',
                        borderRadius: 4, fontSize: 11, fontWeight: 700,
                        fontFamily: 'Montserrat, sans-serif',
                      }}>
                        {ROLE_META[p.role]?.label ?? p.role}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: theme.textSecondary }}>{p.department || '—'}</td>
                    <td style={{ ...tdStyle, color: theme.textSecondary }}>{p.jobTitle || '—'}</td>
                    <td style={tdStyle}>
                      {p.isAdmin ? (
                        <span style={{ color: ADMIN_ACCENT, fontSize: 13 }}>🛡️</span>
                      ) : (
                        <span style={{ color: theme.textDim, fontSize: 11 }}>—</span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setModal({ mode: 'edit', profile: p })}
                          style={{
                            padding: '5px 12px', background: `${ADMIN_ACCENT}20`,
                            border: 'none', borderRadius: 5,
                            color: ADMIN_ACCENT, fontSize: 11, fontWeight: 700,
                            fontFamily: 'Montserrat, sans-serif', cursor: 'pointer',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmDel(p)}
                          style={{
                            padding: '5px 12px', background: '#dc262620',
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
        {filtered.length} of {profiles.length} users
      </div>

      {/* User Modal */}
      {modal && (
        <UserModal
          mode={modal.mode}
          profile={modal.profile}
          adminEmail={adminEmail}
          onClose={() => setModal(null)}
          onSuccess={async (msg) => {
            setModal(null);
            showToast(msg, 'success');
            await onRefresh();
          }}
        />
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
              Delete User?
            </h3>
            <p style={{ color: theme.textSecondary, fontSize: 12, margin: '0 0 20px', lineHeight: 1.6 }}>
              This will permanently delete <strong>{confirmDel.email}</strong> from the system. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmDel(null)}
                style={{
                  padding: '8px 16px', background: 'transparent',
                  border: `1px solid ${theme.border}`, borderRadius: 6,
                  color: theme.textSecondary, fontSize: 12, fontWeight: 600,
                  fontFamily: 'Montserrat, sans-serif', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete} disabled={deleting}
                style={{
                  padding: '8px 18px',
                  background: deleting ? '#dc262680' : '#dc2626',
                  border: 'none', borderRadius: 6,
                  color: '#fff', fontSize: 12, fontWeight: 700,
                  fontFamily: 'Montserrat, sans-serif',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
