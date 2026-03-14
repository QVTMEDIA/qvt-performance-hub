'use client';

import { useState } from 'react';
import Image from 'next/image';
import { signIn, getCurrentProfile } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focusEl,  setFocusEl]  = useState<'email' | 'password' | 'resetEmail' | null>(null);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail,         setResetEmail]         = useState('');
  const [resetSent,          setResetSent]           = useState(false);
  const [resetLoading,       setResetLoading]        = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: authError } = await signIn(email, password);
      if (authError) {
        setError(authError.message);
      } else {
        const profile = await getCurrentProfile();
        window.location.href = profile?.isAdmin ? '/admin' : '/';
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setResetLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setResetSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const inputStyle = (field: 'email' | 'password' | 'resetEmail'): React.CSSProperties => ({
    width: '100%',
    padding: '12px 14px',
    background: '#ffffff',
    border: `1.5px solid ${focusEl === field ? '#29ABE2' : '#e0e0e0'}`,
    borderRadius: 8,
    color: '#1a1a1a',
    fontSize: 14,
    fontFamily: 'Montserrat, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxShadow: focusEl === field ? '0 0 0 3px rgba(41,171,226,0.15)' : 'none',
  });

  const labelStyle: React.CSSProperties = {
    display: 'block',
    color: '#3D3D3D',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 6,
    fontFamily: 'Montserrat, sans-serif',
  };

  const btnStyle = (disabled: boolean, hov: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '13px',
    background: disabled
      ? 'linear-gradient(135deg, #1A5FA880 0%, #29ABE280 100%)'
      : hov
      ? 'linear-gradient(135deg, #154d8a 0%, #1A5FA8 100%)'
      : 'linear-gradient(135deg, #1A5FA8 0%, #29ABE2 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 800,
    fontFamily: 'Montserrat, sans-serif',
    letterSpacing: '0.05em',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 0.2s',
  });

  const CardWrapper = ({ children }: { children: React.ReactNode }) => (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        input::placeholder { color: #aaaaaa; }
      `}</style>
      <div style={{
        minHeight: '100vh',
        background: '#f0f4f8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Montserrat, sans-serif',
        padding: 24,
      }}>
        <div style={{
          width: '100%',
          maxWidth: 420,
          background: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
          padding: '48px 40px',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <Image
              src="/logo-light.png"
              alt="QVT Media"
              width={180}
              height={54}
              style={{ objectFit: 'contain', width: 180, height: 'auto' }}
              priority
            />
          </div>
          {/* Gradient divider */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <div style={{ width: 60, height: 2, background: 'linear-gradient(to right, #C1272D, #29ABE2)', borderRadius: 1 }} />
          </div>
          {children}
        </div>
      </div>
    </>
  );

  // ── Forgot password success ───────────────────────────────────────────────
  if (showForgotPassword && resetSent) {
    return (
      <CardWrapper>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 18, fontWeight: 800, color: '#16a34a', margin: '0 0 12px' }}>
            Reset link sent!
          </h2>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: '#666666', lineHeight: 1.6, margin: '0 0 24px' }}>
            Check your inbox at <strong>{resetEmail}</strong> for a password reset link.
            <br />The link will expire in 1 hour.
          </p>
          <button
            onClick={() => { setShowForgotPassword(false); setResetSent(false); setResetEmail(''); setError(''); }}
            style={{ background: 'none', border: 'none', color: '#29ABE2', fontSize: 12, fontFamily: 'Montserrat, sans-serif', cursor: 'pointer', fontWeight: 600 }}
          >
            ← Back to Sign In
          </button>
        </div>
      </CardWrapper>
    );
  }

  // ── Forgot password form ──────────────────────────────────────────────────
  if (showForgotPassword) {
    return (
      <CardWrapper>
        <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 18, fontWeight: 800, color: '#1a1a1a', textAlign: 'center', margin: '0 0 10px' }}>
          Reset Password
        </h2>
        <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: '#666666', textAlign: 'center', margin: '0 0 24px', lineHeight: 1.6 }}>
          Enter your QVT Media email address and we&apos;ll send you a reset link.
        </p>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={resetEmail}
            onChange={e => setResetEmail(e.target.value)}
            onFocus={() => setFocusEl('resetEmail')}
            onBlur={() => setFocusEl(null)}
            placeholder="you@qvtmedia.com"
            style={inputStyle('resetEmail')}
            onKeyDown={e => e.key === 'Enter' && handleForgotPassword()}
          />
        </div>

        <button
          onClick={handleForgotPassword}
          disabled={resetLoading}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          style={btnStyle(resetLoading, hovering)}
        >
          {resetLoading ? 'Sending…' : 'Send Reset Link'}
        </button>

        {error && (
          <div style={{ marginTop: 12, color: '#C1272D', fontSize: 12, textAlign: 'center', fontFamily: 'Montserrat, sans-serif' }}>
            {error}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            onClick={() => { setShowForgotPassword(false); setError(''); }}
            style={{ background: 'none', border: 'none', color: '#29ABE2', fontSize: 12, fontFamily: 'Montserrat, sans-serif', cursor: 'pointer', fontWeight: 600 }}
          >
            ← Back to Sign In
          </button>
        </div>
      </CardWrapper>
    );
  }

  // ── Login form (default) ──────────────────────────────────────────────────
  return (
    <CardWrapper>
      {/* Performance Hub label */}
      <div style={{ textAlign: 'center', fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#29ABE2', marginBottom: 6 }}>
        Performance Hub
      </div>
      <div style={{ textAlign: 'center', fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: '#666666', marginBottom: 32 }}>
        Sign in to access your performance reviews
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onFocus={() => setFocusEl('email')}
            onBlur={() => setFocusEl(null)}
            placeholder="you@qvtmedia.com"
            required
            style={inputStyle('email')}
          />
        </div>

        <div style={{ marginBottom: 6 }}>
          <label style={labelStyle}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onFocus={() => setFocusEl('password')}
            onBlur={() => setFocusEl(null)}
            placeholder="••••••••"
            required
            style={inputStyle('password')}
          />
        </div>

        {/* Forgot password link */}
        <div style={{ textAlign: 'right', marginBottom: 24 }}>
          <ForgotLink onClick={() => { setShowForgotPassword(true); setError(''); setResetEmail(email); }} />
        </div>

        <button
          type="submit"
          disabled={loading}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          style={btnStyle(loading, hovering)}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        {error && (
          <div style={{ marginTop: 12, color: '#C1272D', fontSize: 12, textAlign: 'center', fontFamily: 'Montserrat, sans-serif' }}>
            {error}
          </div>
        )}
      </form>

      {/* Footer */}
      <div style={{ marginTop: 28, textAlign: 'center', fontFamily: 'Montserrat, sans-serif', fontSize: 10, color: '#aaaaaa' }}>
        QVT Media Ltd — Confidential
      </div>
    </CardWrapper>
  );
}

function ForgotLink({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'none', border: 'none',
        color: '#29ABE2', fontSize: 12,
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: 600, cursor: 'pointer',
        textDecoration: hov ? 'underline' : 'none',
        padding: 0,
      }}
    >
      Forgot password?
    </button>
  );
}
