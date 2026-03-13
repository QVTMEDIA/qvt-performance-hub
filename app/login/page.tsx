'use client';

import { useState } from 'react';
import Image from 'next/image';
import { signIn } from '@/lib/auth';
import { useTheme } from '@/lib/ThemeContext';

export default function LoginPage() {
  const { theme, isDark } = useTheme();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: authError } = await signIn(email, password);
      if (authError) {
        setError(authError.message);
      } else {
        window.location.href = '/';
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    background: theme.input,
    border: `1px solid ${theme.inputBorder}`,
    borderRadius: 8,
    color: theme.textPrimary,
    fontSize: 13,
    fontFamily: 'Montserrat, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Montserrat, sans-serif',
      padding: 24,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: theme.card,
        border: `1px solid ${theme.border}`,
        borderRadius: 16,
        padding: '40px 36px',
      }}>
        {/* Logo + Heading */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <Image
              src={isDark ? '/logo-dark.png' : '/logo-light.png'}
              alt="QVT Media"
              width={180}
              height={54}
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <div style={{ color: '#0b73a8', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif', marginBottom: 12 }}>
            Performance Hub
          </div>
          <div style={{ color: theme.textMuted, fontSize: 12, marginTop: 4 }}>
            Sign in to access your performance reviews
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: theme.textSecondary, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@qvtmedia.com"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', color: theme.textSecondary, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{
              background: '#dc262620',
              border: '1px solid #dc262640',
              borderRadius: 8,
              padding: '10px 14px',
              color: '#dc2626',
              fontSize: 12,
              marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? '#0b73a880' : '#0b73a8',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              fontFamily: 'Montserrat, sans-serif',
              letterSpacing: '0.04em',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
