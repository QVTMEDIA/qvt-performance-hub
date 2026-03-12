'use client';

import { ToastType } from '@/components/AppShell';
import { C } from '@/styles/brand';
import { useTheme } from '@/lib/ThemeContext';

interface ToastProps {
  msg: string;
  type: ToastType;
  onDismiss: () => void;
}

const TYPE_STYLES: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg: '#052b16', border: C.success, icon: '✓' },
  error: { bg: '#2d0a0a', border: C.error, icon: '✕' },
  info: { bg: '#051a2a', border: C.blue, icon: 'ℹ' },
};

export default function Toast({ msg, type, onDismiss }: ToastProps) {
  const { theme } = useTheme();
  const s = TYPE_STYLES[type];

  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 16px',
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: 8,
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        cursor: 'pointer',
        maxWidth: 360,
        animation: 'slideIn 0.2s ease',
        fontFamily: 'Montserrat, sans-serif',
      }}
    >
      <span style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: s.border,
        color: '#fff',
        fontSize: 11,
        fontWeight: 800,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {s.icon}
      </span>
      <span style={{ color: theme.textPrimary, fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>
        {msg}
      </span>
      <style>{`
        @keyframes slideIn {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
