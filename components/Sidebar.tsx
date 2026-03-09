'use client';

import { Role, Reminder } from '@/types';
import { ROLE_META } from '@/lib/constants';
import { C, QVT_BLUE } from '@/styles/brand';
import { ViewType, QVTLogo } from '@/components/AppShell';

const ROLES: Role[] = ['employee', 'lead', 'hr', 'coo', 'ceo'];

interface SidebarProps {
  role: Role;
  view: ViewType;
  reminders: Reminder[];
  onNav: (v: ViewType) => void;
  onRoleChange: (r: Role) => void;
}

export default function Sidebar({ role, view, reminders, onNav, onRoleChange }: SidebarProps) {
  const unread = reminders.filter(r => r.toRole === role && !r.read).length;
  const roleMeta = ROLE_META[role];

  const navItems: Array<{ id: ViewType; label: string; icon: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
    { id: 'new', label: 'New Appraisal', icon: '+' },
  ];

  return (
    <aside style={{
      width: 240,
      minWidth: 240,
      background: C.sidebarBg,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      borderRight: `1px solid ${C.border}`,
      position: 'sticky',
      top: 0,
    }}>
      {/* Logo area */}
      <div style={{ padding: '24px 20px 20px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <QVTLogo size={36} />
          <div>
            <div style={{ color: C.textPrimary, fontSize: 13, fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
              QVT Media
            </div>
            <div style={{ color: C.textMuted, fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Performance Hub
            </div>
          </div>
        </div>
      </div>

      {/* Current role badge */}
      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 10, color: C.textDim, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
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
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '10px 20px',
                background: active ? `${QVT_BLUE}20` : 'transparent',
                border: 'none',
                borderLeft: active ? `3px solid ${QVT_BLUE}` : '3px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s',
              }}
            >
              <span style={{ color: active ? QVT_BLUE : C.textDim, fontSize: 14, width: 18, textAlign: 'center' }}>
                {item.icon}
              </span>
              <span style={{
                color: active ? C.textPrimary : C.textDim,
                fontSize: 12,
                fontWeight: active ? 700 : 600,
                letterSpacing: '0.02em',
                fontFamily: 'Montserrat, sans-serif',
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Role switcher footer */}
      <div style={{ padding: '16px 20px', borderTop: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 10, color: C.textDim, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
          Demo — Switch Role
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {ROLES.map(r => {
            const m = ROLE_META[r];
            const active = role === r;
            return (
              <button
                key={r}
                onClick={() => onRoleChange(r)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: active ? `1px solid ${m.color}40` : '1px solid transparent',
                  background: active ? `${m.color}15` : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
              >
                <span style={{ fontSize: 12 }}>{m.icon}</span>
                <span style={{
                  color: active ? m.color : C.textDim,
                  fontSize: 11,
                  fontWeight: active ? 700 : 500,
                  fontFamily: 'Montserrat, sans-serif',
                }}>
                  {m.label}
                </span>
                {active && (
                  <span style={{ marginLeft: 'auto', color: m.color, fontSize: 10 }}>✓</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
