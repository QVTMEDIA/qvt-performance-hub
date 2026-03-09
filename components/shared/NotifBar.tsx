'use client';

import { Reminder, Role } from '@/types';
import { C, QVT_BLUE } from '@/styles/brand';
import { ROLE_META } from '@/lib/constants';

interface NotifBarProps {
  reminders: Reminder[];
  role: Role;
  onOpen: (reviewId: string) => void;
  onDismiss: (id: string) => void;
}

export default function NotifBar({ reminders, role, onOpen, onDismiss }: NotifBarProps) {
  const unread = reminders.filter((r) => r.toRole === role && !r.read);

  if (unread.length === 0) return null;

  return (
    <div
      style={{
        background: `${QVT_BLUE}12`,
        border: `1px solid ${QVT_BLUE}40`,
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 20,
      }}
    >
      {/* Bar header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
          borderBottom: `1px solid ${QVT_BLUE}30`,
          background: `${QVT_BLUE}18`,
        }}
      >
        <span style={{ fontSize: 14 }}>🔔</span>
        <span
          style={{
            color: C.textPrimary,
            fontSize: 12,
            fontWeight: 700,
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          Notifications
        </span>
        <span
          style={{
            marginLeft: 4,
            background: QVT_BLUE,
            color: '#fff',
            borderRadius: 10,
            padding: '1px 7px',
            fontSize: 10,
            fontWeight: 800,
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          {unread.length}
        </span>
      </div>

      {/* Notification items */}
      {unread.map((rem, i) => {
        const senderMeta = ROLE_META[rem.sentBy];
        const isLast = i === unread.length - 1;

        return (
          <div
            key={rem.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 16px',
              borderBottom: isLast ? 'none' : `1px solid ${QVT_BLUE}20`,
            }}
          >
            {/* Sender icon */}
            <span style={{ fontSize: 16, flexShrink: 0 }}>{senderMeta.icon}</span>

            {/* Message */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  color: C.textPrimary,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.4,
                }}
              >
                {rem.message}
              </div>
              <div
                style={{
                  color: C.textDim,
                  fontSize: 10,
                  fontWeight: 500,
                  fontFamily: 'Montserrat, sans-serif',
                  marginTop: 2,
                }}
              >
                From {senderMeta.label} · {rem.sentAt}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button
                onClick={() => onOpen(rem.reviewId)}
                style={{
                  background: QVT_BLUE,
                  border: 'none',
                  borderRadius: 5,
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '5px 10px',
                  fontFamily: 'Montserrat, sans-serif',
                  letterSpacing: '0.04em',
                }}
              >
                Open
              </button>
              <button
                onClick={() => onDismiss(rem.id)}
                style={{
                  background: 'transparent',
                  border: `1px solid ${C.border}`,
                  borderRadius: 5,
                  color: C.textDim,
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '5px 10px',
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
