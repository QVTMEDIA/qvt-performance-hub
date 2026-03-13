'use client';

import { useState, useEffect, useCallback } from 'react';
import { Profile } from '@/lib/auth';
import { Review } from '@/types';
import { AdminProfile, fetchProfiles } from '@/lib/adminService';
import { fetchReviews } from '@/lib/dataService';
import { useTheme } from '@/lib/ThemeContext';
import { useWindowSize } from '@/lib/useWindowSize';
import AdminSidebar, { AdminSection } from '@/components/admin/AdminSidebar';
import AdminOverview from '@/components/admin/overview/AdminOverview';
import UserManagement from '@/components/admin/users/UserManagement';
import ReviewManagement from '@/components/admin/reviews/ReviewManagement';
import AuditLogViewer from '@/components/admin/audit/AuditLogViewer';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ToastType } from '@/components/AppShell';

// ─── Toast ────────────────────────────────────────────────────────────────────
interface ToastState { msg: string; type: ToastType }

function AdminToast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  const TYPE_BG: Record<ToastType, string> = {
    success: '#052b16', error: '#2d0a0a', info: '#051a2a',
  };
  const TYPE_BORDER: Record<ToastType, string> = {
    success: '#22c55e', error: '#dc2626', info: '#0b73a8',
  };
  const TYPE_ICON: Record<ToastType, string> = {
    success: '✓', error: '✕', info: 'ℹ',
  };

  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px',
        background: TYPE_BG[toast.type],
        border: `1px solid ${TYPE_BORDER[toast.type]}`,
        borderRadius: 8,
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        cursor: 'pointer', maxWidth: 360,
        fontFamily: 'Montserrat, sans-serif',
      }}
    >
      <span style={{
        width: 20, height: 20, borderRadius: '50%',
        background: TYPE_BORDER[toast.type], color: '#fff',
        fontSize: 11, fontWeight: 800,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {TYPE_ICON[toast.type]}
      </span>
      <span style={{ color: '#f0f6fb', fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>
        {toast.msg}
      </span>
    </div>
  );
}

// ─── AdminShell ───────────────────────────────────────────────────────────────

interface AdminShellProps {
  profile: Profile;
}

export default function AdminShell({ profile }: AdminShellProps) {
  const { theme } = useTheme();
  const { width } = useWindowSize();
  const isMobile = width < 768;

  const [section,     setSection]     = useState<AdminSection>('overview');
  const [profiles,    setProfiles]    = useState<AdminProfile[]>([]);
  const [reviews,     setReviews]     = useState<Review[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast,       setToast]       = useState<ToastState | null>(null);

  const showToast = useCallback((msg: string, type: ToastType = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const refreshProfiles = useCallback(async () => {
    try {
      const data = await fetchProfiles();
      setProfiles(data);
    } catch (e) {
      showToast('Failed to load users', 'error');
    }
  }, [showToast]);

  const refreshReviews = useCallback(async () => {
    try {
      const data = await fetchReviews();
      setReviews(data);
    } catch (e) {
      showToast('Failed to load reviews', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    refreshProfiles();
    refreshReviews();
  }, [refreshProfiles, refreshReviews]);

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: theme.bg,
      fontFamily: 'Montserrat, sans-serif',
    }}>
      {/* Sidebar */}
      {!isMobile && (
        <AdminSidebar section={section} onNav={setSection} />
      )}
      {isMobile && (
        <>
          <AdminSidebar
            section={section}
            onNav={setSection}
            isMobile
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          {sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                zIndex: 199,
              }}
            />
          )}
        </>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile top bar */}
        {isMobile && (
          <div style={{
            height: 52,
            background: theme.sidebar,
            borderBottom: `1px solid ${theme.border}`,
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '0 16px',
            flexShrink: 0,
          }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: 'transparent', border: 'none',
                color: theme.textSecondary, fontSize: 20, cursor: 'pointer', padding: 4,
              }}
            >
              ☰
            </button>
            <span style={{
              color: theme.textPrimary, fontSize: 13, fontWeight: 700,
              fontFamily: 'Montserrat, sans-serif',
            }}>
              Admin Panel
            </span>
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '24px 32px' }}>
          <ErrorBoundary>
            {section === 'overview' && (
              <AdminOverview profiles={profiles} reviews={reviews} />
            )}
            {section === 'users' && (
              <UserManagement
                profiles={profiles}
                adminEmail={profile.email}
                onRefresh={refreshProfiles}
                showToast={showToast}
              />
            )}
            {section === 'reviews' && (
              <ReviewManagement
                reviews={reviews}
                adminEmail={profile.email}
                onRefresh={refreshReviews}
                showToast={showToast}
              />
            )}
            {section === 'audit' && (
              <AuditLogViewer />
            )}
          </ErrorBoundary>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <AdminToast toast={toast} onDismiss={() => setToast(null)} />
      )}
    </div>
  );
}
