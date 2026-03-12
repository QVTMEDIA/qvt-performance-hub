'use client';

import { Role, Reminder } from '@/types';
import { ROLE_META } from '@/lib/constants';
import { C, QVT_BLUE } from '@/styles/brand';
import { ViewType, QVTLogo } from '@/components/AppShell';
import { useTheme } from '@/lib/ThemeContext';

const ROLES: Role[] = ['employee', 'lead', 'hr', 'coo', 'ceo'];

interface SidebarProps {
  role: Role;
  view: ViewType;
  reminders: Reminder[];
  onNav: (v: ViewType) => void;
  onRoleChange: (r: Role) => void;
  onSignOut?: () => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  role, view, reminders, onNav, onRoleChange, onSignOut,
  isMobile = false, isOpen = false, onClose,
}: SidebarProps) {
  const { theme, isDark, toggleTheme } = useTheme();
  const unread = reminders.filter(r => r.toRole === role && !r.read).length;
  const roleMeta = ROLE_META[role];

  const navItems: Array<{ id: ViewType; label: string; icon: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
    { id: 'new', label: 'New Appraisal', icon: '+' },
  ];

  const sidebarStyle: React.CSSProperties = isMobile
    ? {
        width: 240,
        minWidth: 240,
        background: theme.sidebar,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        borderRight: `1px solid ${theme.border}`,
        position: 'fixed',
        top: 0,
        left: isOpen ? 0 : -240,
        transition: 'left 0.25s ease',
        zIndex: 200,
      }
    : {
        width: 240,
        minWidth: 240,
        background: theme.sidebar,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        borderRight: `1px solid ${theme.border}`,
        position: 'sticky',
        top: 0,
      };

  return (
    <aside style={sidebarStyle}>
      {/* Logo area */}
      <div style={{ padding: '24px 20px 20px', borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isMobile && onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: theme.textMuted,
                fontSize: 18,
                cursor: 'pointer',
                padding: '0 4px 0 0',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          )}
          <QVTLogo size={36} />
          <div>
            <div style={{ color: theme.textPrimary, fontSize: 13, fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
              QVT Media
            </div>
            <div style={{ color: theme.textMuted, fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Performance Hub
            </div>
          </div>
        </div>
      </div>

      {/* Current role badge */}
      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ fontSize: 10, color: theme.textDim, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
          Active Role
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>{roleMeta.icon}</span>
          <span style={{ color: roleMeta.color, fontSize: 12, fontWeight: 700, letterSpacing: '0.02em' }}>
            {roleMeta.label}
          </span>
          {unread > 0 && (
            <span style={{
              marginLeft: 'auto',
              background: C.error,
              color: '#fff',
              borderRadius: 10,
              padding: '1px 6px',
              fontSize: 10,
              fontWeight: 800,
            }}>
              {unread}
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 0' }}>
        {navItems.map(item => {
          const active     = view === item.id;
          const showBadge  = item.id === 'dashboard' && unread > 0;
          return (
            <button
              key={item.id}
              onClick={() => { onNav(item.id); onClose?.(); }}
              style={{
                display:    'flex',
                alignItems: 'center',
                gap:        10,
                width:      '100%',
                padding:    '10px 20px',
                background: active ? `${QVT_BLUE}20` : 'transparent',
                border:     'none',
                borderLeft: active ? `3px solid ${QVT_BLUE}` : '3px solid transparent',
                cursor:     'pointer',
                textAlign:  'left',
                transition: 'background 0.15s',
              }}
            >
              <span style={{ color: active ? QVT_BLUE : theme.textDim, fontSize: 14, width: 18, textAlign: 'center' }}>
                {item.icon}
              </span>
              <span style={{
                color:         active ? theme.textPrimary : theme.textDim,
                fontSize:      12,
                fontWeight:    active ? 700 : 600,
                letterSpacing: '0.02em',
                fontFamily:    'Montserrat, sans-serif',
              }}>
                {item.label}
              </span>
              {showBadge && (
                <span style={{
                  marginLeft:   'auto',
                  background:   C.error,
                  color:        '#fff',
                  borderRadius: 10,
                  padding:      '1px 6px',
                  fontSize:     10,
                  fontWeight:   800,
                  fontFamily:   'Montserrat, sans-serif',
                }}>
                  {unread}
                </span>
              )}
            </button>
          );
        })}

        {/* Theme toggle */}
        <div style={{ padding: '12px 20px' }}>
          <button
            onClick={toggleTheme}
            style={{
              display:      'flex',
              alignItems:   'center',
              width:        '100%',
              background:   `${theme.border}`,
              border:       `1px solid ${theme.border}`,
              borderRadius: 20,
              padding:      '4px',
              cursor:       'pointer',
              position:     'relative',
              transition:   'background 0.2s',
            }}
          >
            <span style={{
              position:     'absolute',
              left:         isDark ? 'calc(50% - 2px)' : 4,
              width:        'calc(50% - 2px)',
              height:       'calc(100% - 8px)',
              background:   QVT_BLUE,
              borderRadius: 16,
              transition:   'left 0.2s ease',
              top:          4,
            }} />
            <span style={{
              flex:       1,
              textAlign:  'center',
              fontSize:   10,
              fontWeight: 700,
              fontFamily: 'Montserrat, sans-serif',
              color:      !isDark ? '#fff' : theme.textDim,
              padding:    '3px 0',
              position:   'relative',
              zIndex:     1,
            }}>
              ☀️ Light
            </span>
            <span style={{
              flex:       1,
              textAlign:  'center',
              fontSize:   10,
              fontWeight: 700,
              fontFamily: 'Montserrat, sans-serif',
              color:      isDark ? '#fff' : theme.textDim,
              padding:    '3px 0',
              position:   'relative',
              zIndex:     1,
            }}>
              🌙 Dark
            </span>
          </button>
        </div>
      </nav>

      {/* Role switcher footer — dev only */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ padding: '16px 20px', borderTop: `1px solid ${theme.border}` }}>
          <div style={{ fontSize: 10, color: theme.textDim, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
            Demo — Switch Role
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {ROLES.map(r => {
              const m           = ROLE_META[r];
              const active      = role === r;
              const roleUnread  = reminders.filter(rem => rem.toRole === r && !rem.read).length;
              return (
                <button
                  key={r}
                  onClick={() => onRoleChange(r)}
                  style={{
                    display:    'flex',
                    alignItems: 'center',
                    gap:        8,
                    padding:    '6px 10px',
                    borderRadius: 6,
                    border:     active ? `1px solid ${m.color}40` : '1px solid transparent',
                    background: active ? `${m.color}15` : 'transparent',
                    cursor:     'pointer',
                    textAlign:  'left',
                    transition: 'background 0.15s',
                  }}
                >
                  <span style={{ fontSize: 12 }}>{m.icon}</span>
                  <span style={{
                    color:      active ? m.color : theme.textDim,
                    fontSize:   11,
                    fontWeight: active ? 700 : 500,
                    fontFamily: 'Montserrat, sans-serif',
                  }}>
                    {m.label}
                  </span>
                  {roleUnread > 0 ? (
                    <span style={{
                      marginLeft:   'auto',
                      background:   m.color,
                      color:        '#fff',
                      borderRadius: 10,
                      padding:      '1px 6px',
                      fontSize:     10,
                      fontWeight:   800,
                      fontFamily:   'Montserrat, sans-serif',
                    }}>
                      {roleUnread}
                    </span>
                  ) : active ? (
                    <span style={{ marginLeft: 'auto', color: m.color, fontSize: 10 }}>✓</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sign out */}
      {onSignOut && (
        <div style={{ padding: '12px 20px', borderTop: `1px solid ${theme.border}` }}>
          <button
            onClick={onSignOut}
            style={{
              display:    'flex',
              alignItems: 'center',
              gap:        8,
              width:      '100%',
              padding:    '8px 10px',
              background: 'transparent',
              border:     `1px solid ${theme.border}`,
              borderRadius: 6,
              cursor:     'pointer',
              transition: 'background 0.15s',
            }}
          >
            <span style={{ color: theme.textDim, fontSize: 13 }}>↩</span>
            <span style={{
              color:      theme.textDim,
              fontSize:   11,
              fontWeight: 600,
              fontFamily: 'Montserrat, sans-serif',
              letterSpacing: '0.04em',
            }}>
              Sign Out
            </span>
          </button>
        </div>
      )}
    </aside>
  );
}
