'use client';

import { useState, useEffect } from 'react';
import { Reminder, Role } from '@/types';
import { C } from '@/styles/brand';
import { ROLE_META } from '@/lib/constants';

interface NotifBarProps {
  reminders:      Reminder[];
  role:           Role;
  onOpen:         (reviewId: string) => void;
  onDismiss:      (id: string) => void;
  onMarkAllRead?: () => void;
}

export default function NotifBar({
  reminders, role, onOpen, onDismiss, onMarkAllRead,
}: NotifBarProps) {
  const [showAll, setShowAll] = useState(false);
  const [mounted, setMounted] = useState(false);

  const unread = reminders.filter(r => r.toRole === role && !r.read);

  useEffect(() => {
    if (unread.length > 0) {
      const id = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(id);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (unread.length === 0) return null;

  const roleColor = ROLE_META[role].color;
  const displayed = showAll ? unread : unread.slice(0, 3);
  const hasMore   = unread.length > 3;

  return (
    <div
      style={{
        background:  `${roleColor}10`,
        border:      `1px solid ${roleColor}40`,
        borderRadius: 10,
        overflow:    'hidden',
        marginBottom: 20,
        opacity:     mounted ? 1 : 0,
        transform:   mounted ? 'translateY(0)' : 'translateY(-8px)',
        transition:  'opacity 0.25s ease, transform 0.25s ease',
      }}
    >
      {/* Header */}
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:          8,
        padding:      '10px 16px',
        borderBottom: `1px solid ${roleColor}30`,
        background:   `${roleColor}18`,
      }}>
        <span style={{ fontSize: 14 }}>🔔</span>
        <span style={{ color: C.textPrimary, fontSize: 12, fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>
          Notifications
        </span>
        <span style={{
          marginLeft: 4, background: roleColor, color: '#fff',
          borderRadius: 10, padding: '1px 7px', fontSize: 10, fontWeight: 800,
          fontFamily: 'Montserrat, sans-serif',
        }}>
          {unread.length}
        </span>
        {onMarkAllRead && unread.length >= 2 && (
          <button
            onClick={onMarkAllRead}
            style={{
              marginLeft:    'auto',
              background:    'transparent',
              border:        'none',
              color:         roleColor,
              fontSize:      10,
              fontWeight:    700,
              cursor:        'pointer',
              fontFamily:    'Montserrat, sans-serif',
              letterSpacing: '0.02em',
              padding:       '2px 0',
              opacity:       0.85,
            }}
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notification items */}
      {displayed.map((rem, i) => {
        const senderMeta = ROLE_META[rem.sentBy];
        const isLast     = i === displayed.length - 1 && (!hasMore || showAll);

        return (
          <div
            key={rem.id}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          12,
              padding:      '10px 16px',
              borderBottom: isLast ? 'none' : `1px solid ${roleColor}20`,
            }}
          >
            {/* Sender icon */}
            <span style={{ fontSize: 16, flexShrink: 0 }}>{senderMeta.icon}</span>

            {/* Message */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                color:      roleColor,
                fontSize:   12,
                fontWeight: 600,
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.4,
              }}>
                {rem.message}
              </div>
              <div style={{
                color:      C.textDim,
                fontSize:   10,
                fontWeight: 500,
                fontFamily: 'Montserrat, sans-serif',
                marginTop:  2,
              }}>
                From {senderMeta.label} · {rem.sentAt}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button
                onClick={() => { onDismiss(rem.id); onOpen(rem.reviewId); }}
                style={{
                  background:    roleColor,
                  border:        'none',
                  borderRadius:  5,
                  color:         '#fff',
                  fontSize:      10,
                  fontWeight:    700,
                  cursor:        'pointer',
                  padding:       '5px 10px',
                  fontFamily:    'Montserrat, sans-serif',
                  letterSpacing: '0.04em',
                }}
              >
                Open
              </button>
              <button
                onClick={() => onDismiss(rem.id)}
                style={{
                  background:   'transparent',
                  border:       `1px solid ${C.border}`,
                  borderRadius: 5,
                  color:        C.textDim,
                  fontSize:     12,
                  fontWeight:   700,
                  cursor:       'pointer',
                  padding:      '3px 8px',
                  fontFamily:   'Montserrat, sans-serif',
                  lineHeight:   1,
                }}
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}

      {/* View all / Show less toggle */}
      {hasMore && (
        <div style={{
          padding:      '8px 16px',
          borderTop:    `1px solid ${roleColor}20`,
          display:      'flex',
          justifyContent: 'center',
        }}>
          <button
            onClick={() => setShowAll(v => !v)}
            style={{
              background:    'transparent',
              border:        'none',
              color:         roleColor,
              fontSize:      11,
              fontWeight:    700,
              cursor:        'pointer',
              fontFamily:    'Montserrat, sans-serif',
              letterSpacing: '0.02em',
            }}
          >
            {showAll ? 'Show less ↑' : `View all ${unread.length} →`}
          </button>
        </div>
      )}
    </div>
  );
}
