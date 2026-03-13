'use client';

import { useState } from 'react';
import { Role } from '@/types';
import { AdminProfile, updateProfile, logAuditAction } from '@/lib/adminService';
import { useTheme } from '@/lib/ThemeContext';
import { ROLE_META } from '@/lib/constants';

const ADMIN_ACCENT = '#6366f1';
const ROLES: Role[] = ['employee', 'lead', 'hr', 'coo', 'ceo'];

interface UserModalProps {
  mode: 'add' | 'edit';
  profile?: AdminProfile;
  adminEmail: string;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export default function UserModal({ mode, profile, adminEmail, onClose, onSuccess }: UserModalProps) {
  const { theme } = useTheme();

  const [fullName,   setFullName]   = useState(profile?.fullName   ?? '');
  const [email,      setEmail]      = useState(profile?.email      ?? '');
  const [password,   setPassword]   = useState('');
  const [role,       setRole]       = useState<Role>(profile?.role ?? 'employee');
  const [jobTitle,   setJobTitle]   = useState(profile?.jobTitle   ?? '');
  const [department, setDepartment] = useState(profile?.department ?? '');
  const [isAdmin,    setIsAdmin]    = useState(profile?.isAdmin    ?? false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px',
    background: theme.input, border: `1px solid ${theme.inputBorder}`,
    borderRadius: 7, color: theme.textPrimary, fontSize: 12,
    fontFamily: 'Montserrat, sans-serif', outline: 'none', boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', color: theme.textSecondary,
    fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
    textTransform: 'uppercase', marginBottom: 5,
    fontFamily: 'Montserrat, sans-serif',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'add') {
        if (!email || !password) { setError('Email and password are required'); setLoading(false); return; }

        const res = await fetch('/api/admin/create-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, fullName, role, jobTitle, department, isAdmin }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? 'Failed to create user'); setLoading(false); return; }

        await logAuditAction('create_user', adminEmail, 'user', data.userId, { email, role });
        onSuccess(`User ${email} created`);
      } else {
        if (!profile) return;
        await updateProfile(profile.id, {
          full_name:  fullName,
          role,
          job_title:  jobTitle,
          department,
          is_admin:   isAdmin,
        });

        if (password) {
          const res = await fetch('/api/admin/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: profile.id, password }),
          });
          const data = await res.json();
          if (!res.ok) { setError(data.error ?? 'Password reset failed'); setLoading(false); return; }
        }

        await logAuditAction('update_user', adminEmail, 'user', profile.id, {
          role, isAdmin, passwordChanged: !!password,
        });
        onSuccess(`User ${profile.email} updated`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        width: '100%', maxWidth: 460,
        background: theme.card, border: `1px solid ${theme.border}`,
        borderRadius: 14, padding: '28px 28px 24px',
        fontFamily: 'Montserrat, sans-serif',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ color: theme.textPrimary, fontSize: 15, fontWeight: 800, margin: 0 }}>
            {mode === 'add' ? 'Add User' : 'Edit User'}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: theme.textMuted, fontSize: 18, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Full Name */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Full Name</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)} style={inputStyle} placeholder="Jane Doe" />
            </div>

            {/* Email */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={mode === 'edit'}
                style={{ ...inputStyle, opacity: mode === 'edit' ? 0.6 : 1 }}
                placeholder="jane@qvtmedia.com"
                required
              />
            </div>

            {/* Password */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>
                {mode === 'add' ? 'Password' : 'New Password'}
              </label>
              <input
                type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                style={inputStyle}
                placeholder={mode === 'add' ? '••••••••' : 'Leave blank to keep current'}
                required={mode === 'add'}
              />
              {mode === 'edit' && (
                <div style={{ color: theme.textMuted, fontSize: 10, marginTop: 4, fontFamily: 'Montserrat, sans-serif' }}>
                  Leave blank to keep the current password
                </div>
              )}
            </div>

            {/* Role */}
            <div>
              <label style={labelStyle}>Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as Role)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {ROLES.map(r => (
                  <option key={r} value={r}>{ROLE_META[r].label}</option>
                ))}
              </select>
            </div>

            {/* Job Title */}
            <div>
              <label style={labelStyle}>Job Title</label>
              <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} style={inputStyle} placeholder="Digital Manager" />
            </div>

            {/* Department */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Department</label>
              <input value={department} onChange={e => setDepartment(e.target.value)} style={inputStyle} placeholder="Digital Marketing" />
            </div>

            {/* Is Admin */}
            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="checkbox" id="isAdmin"
                checked={isAdmin}
                onChange={e => setIsAdmin(e.target.checked)}
                style={{ accentColor: ADMIN_ACCENT, width: 16, height: 16, cursor: 'pointer' }}
              />
              <label htmlFor="isAdmin" style={{
                color: theme.textSecondary, fontSize: 12, fontFamily: 'Montserrat, sans-serif',
                cursor: 'pointer',
              }}>
                Grant admin access
              </label>
            </div>
          </div>

          {error && (
            <div style={{
              marginTop: 14, background: '#2d0a0a', border: '1px solid #dc2626',
              borderRadius: 7, padding: '9px 12px',
              color: '#dc2626', fontSize: 12,
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
            <button
              type="button" onClick={onClose}
              style={{
                padding: '9px 18px', background: 'transparent',
                border: `1px solid ${theme.border}`, borderRadius: 7,
                color: theme.textSecondary, fontSize: 12, fontWeight: 600,
                fontFamily: 'Montserrat, sans-serif', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              style={{
                padding: '9px 20px',
                background: loading ? `${ADMIN_ACCENT}80` : ADMIN_ACCENT,
                border: 'none', borderRadius: 7,
                color: '#fff', fontSize: 12, fontWeight: 700,
                fontFamily: 'Montserrat, sans-serif',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Saving...' : mode === 'add' ? 'Create User' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
