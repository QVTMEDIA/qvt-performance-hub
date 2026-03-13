'use client';

import { useTheme } from '@/lib/ThemeContext';
import { signOut } from '@/lib/auth';

const ADMIN_ACCENT = '#6366f1';

export type AdminSection = 'overview' | 'users' | 'reviews' | 'audit';

interface AdminSidebarProps {
  section: AdminSection;
  onNav: (s: AdminSection) => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const NAV_ITEMS: Array<{ id: AdminSection; label: string; icon: string }> = [
  { id: 'overview', label: 'Overview',  icon: '⊞' },
  { id: 'users',    label: 'Users',     icon: '👥' },
  { id: 'reviews',  label: 'Reviews',   icon: '📋' },
  { id: 'audit',    label: 'Audit Log', icon: '📜' },
];

export default function AdminSidebar({
  section, onNav, isMobile = false, isOpen = false, onClose,
}: AdminSidebarProps) {
  const { theme } = useTheme();

  const sidebarStyle: React.CSSProperties = isMobile
    ? {
        width: 240, minWidth: 240,
        background: theme.sidebar,
        display: 'flex', flexDirection: 'column',
        height: '100vh',
        borderRight: `1px solid ${theme.border}`,
        position: 'fixed', top: 0, left: isOpen ? 0 : -240,
        transition: 'left 0.25s ease', zIndex: 200,
      }
    : {
        width: 240, minWidth: 240,
        background: theme.sidebar,
        display: 'flex', flexDirection: 'column',
        height: '100vh',
        borderRight: `1px solid ${theme.border}`,
        position: 'sticky', top: 0,
      };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  return (
    <aside style={sidebarStyle}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.border}` }}>
        {isMobile && onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none',
              color: theme.textMuted, fontSize: 18,
              cursor: 'pointer', padding: '0 0 8px 0',
              lineHeight: 1, display: 'block',
            }}
          >
            ✕
          </button>
        )}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 4,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: ADMIN_ACCENT,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
          }}>
            🛡️
          </div>
          <div>
            <div style={{
              color: theme.textPrimary, fontSize: 12, fontWeight: 800,
              fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.04em',
            }}>
              Admin Panel
            </div>
            <div style={{
              color: ADMIN_ACCENT, fontSize: 9, fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              fontFamily: 'Montserrat, sans-serif',
            }}>
              QVT Performance Hub
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 12px 0' }}>
        {NAV_ITEMS.map(item => {
          const isActive = section === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { onNav(item.id); onClose?.(); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: 10, padding: '9px 12px',
                background: isActive ? `${ADMIN_ACCENT}20` : 'transparent',
                border: 'none',
                borderRadius: 8, cursor: 'pointer',
                marginBottom: 4,
                color: isActive ? ADMIN_ACCENT : theme.textSecondary,
                fontSize: 12, fontWeight: isActive ? 700 : 500,
                fontFamily: 'Montserrat, sans-serif',
                textAlign: 'left',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              {item.label}
              {isActive && (
                <div style={{
                  marginLeft: 'auto', width: 3, height: 14,
                  background: ADMIN_ACCENT, borderRadius: 2,
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px', borderTop: `1px solid ${theme.border}` }}>
        <button
          onClick={() => { window.location.href = '/'; }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            gap: 10, padding: '9px 12px',
            background: 'transparent', border: 'none',
            borderRadius: 8, cursor: 'pointer',
            color: theme.textMuted, fontSize: 12, fontWeight: 500,
            fontFamily: 'Montserrat, sans-serif', textAlign: 'left',
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 14 }}>←</span>
          Back to App
        </button>
        <button
          onClick={handleSignOut}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            gap: 10, padding: '9px 12px',
            background: 'transparent', border: 'none',
            borderRadius: 8, cursor: 'pointer',
            color: '#dc2626', fontSize: 12, fontWeight: 500,
            fontFamily: 'Montserrat, sans-serif', textAlign: 'left',
          }}
        >
          <span style={{ fontSize: 14 }}>⎋</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
