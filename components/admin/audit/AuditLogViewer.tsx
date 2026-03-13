'use client';

import { useState, useEffect, useCallback } from 'react';
import { AuditEntry, fetchAuditLog } from '@/lib/adminService';
import { useTheme } from '@/lib/ThemeContext';
import { SkeletonTable } from '@/components/atoms/Skeleton';

const TARGET_TYPES = ['user', 'review'];

export default function AuditLogViewer() {
  const { theme } = useTheme();

  const [entries,      setEntries]      = useState<AuditEntry[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [fromDate,     setFromDate]     = useState('');
  const [toDate,       setToDate]       = useState('');
  const [targetType,   setTargetType]   = useState('');
  const [expanded,     setExpanded]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAuditLog({
        limit: 100,
        targetType: targetType || undefined,
        from: fromDate ? `${fromDate}T00:00:00Z` : undefined,
        to:   toDate   ? `${toDate}T23:59:59Z`   : undefined,
      });
      setEntries(data);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, targetType]);

  useEffect(() => { load(); }, [load]);

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
    verticalAlign: 'top',
  };

  return (
    <div>
      <h1 style={{ color: theme.textPrimary, fontSize: 20, fontWeight: 800, fontFamily: 'Montserrat, sans-serif', margin: '0 0 20px' }}>
        Audit Log
      </h1>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', color: theme.textDim, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4, fontFamily: 'Montserrat, sans-serif' }}>
            From
          </label>
          <input
            type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
            style={{ ...inputStyle, colorScheme: 'dark' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', color: theme.textDim, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4, fontFamily: 'Montserrat, sans-serif' }}>
            To
          </label>
          <input
            type="date" value={toDate} onChange={e => setToDate(e.target.value)}
            style={{ ...inputStyle, colorScheme: 'dark' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', color: theme.textDim, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4, fontFamily: 'Montserrat, sans-serif' }}>
            Type
          </label>
          <select value={targetType} onChange={e => setTargetType(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="">All Types</option>
            {TARGET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button
          onClick={() => { setFromDate(''); setToDate(''); setTargetType(''); }}
          style={{
            padding: '8px 14px', background: 'transparent',
            border: `1px solid ${theme.border}`, borderRadius: 7,
            color: theme.textMuted, fontSize: 12, fontWeight: 600,
            fontFamily: 'Montserrat, sans-serif', cursor: 'pointer',
          }}
        >
          Clear
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <SkeletonTable rows={6} cols={5} />
      ) : entries.length === 0 ? (
        <div style={{
          border: `1px solid ${theme.border}`, borderRadius: 10,
          padding: '48px 24px', textAlign: 'center',
          background: theme.card,
        }}>
          <div style={{ fontSize: 24, marginBottom: 12 }}>📜</div>
          <div style={{ color: theme.textMuted, fontSize: 13, fontFamily: 'Montserrat, sans-serif' }}>
            No audit log entries found.
          </div>
        </div>
      ) : (
        <div style={{ border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Timestamp</th>
                  <th style={thStyle}>Admin</th>
                  <th style={thStyle}>Action</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Target ID</th>
                  <th style={thStyle}>Details</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <tr key={entry.id} style={{ background: i % 2 === 0 ? theme.card : theme.cardAlt }}>
                    <td style={{ ...tdStyle, color: theme.textSecondary, whiteSpace: 'nowrap' }}>
                      {new Date(entry.createdAt).toLocaleString()}
                    </td>
                    <td style={{ ...tdStyle, color: theme.textSecondary }}>
                      {entry.adminEmail ?? '—'}
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px',
                        background: '#6366f120', color: '#6366f1',
                        borderRadius: 4, fontSize: 11, fontWeight: 700,
                        fontFamily: 'Montserrat, sans-serif',
                      }}>
                        {entry.action}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: theme.textSecondary }}>
                      {entry.targetType ?? '—'}
                    </td>
                    <td style={{ ...tdStyle, color: theme.textSecondary, fontFamily: 'monospace', fontSize: 11 }}>
                      {entry.targetId ? `${entry.targetId.slice(0, 8)}...` : '—'}
                    </td>
                    <td style={tdStyle}>
                      {entry.details ? (
                        <div>
                          <button
                            onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                            style={{
                              background: 'transparent', border: 'none',
                              color: '#6366f1', fontSize: 11, cursor: 'pointer',
                              fontFamily: 'Montserrat, sans-serif', padding: 0,
                            }}
                          >
                            {expanded === entry.id ? 'Hide' : 'View'}
                          </button>
                          {expanded === entry.id && (
                            <pre style={{
                              marginTop: 6, padding: '8px 10px',
                              background: theme.cardAlt,
                              border: `1px solid ${theme.border}`,
                              borderRadius: 5, fontSize: 10,
                              color: theme.textSecondary,
                              overflowX: 'auto', maxWidth: 240,
                              fontFamily: 'monospace',
                            }}>
                              {JSON.stringify(entry.details, null, 2)}
                            </pre>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: theme.textDim, fontSize: 11 }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ color: theme.textMuted, fontSize: 11, marginTop: 10, fontFamily: 'Montserrat, sans-serif' }}>
        {entries.length} entries
      </div>
    </div>
  );
}
