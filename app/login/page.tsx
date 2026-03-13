'use client';

import { useState } from 'react';
import Image from 'next/image';
import { signIn } from '@/lib/auth';

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focusEl,  setFocusEl]  = useState<'email' | 'password' | null>(null);

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

  const inputStyle = (field: 'email' | 'password'): React.CSSProperties => ({
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

  return (
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
            <div style={{
              width: 60,
              height: 2,
              background: 'linear-gradient(to right, #C1272D, #29ABE2)',
              borderRadius: 1,
            }} />
          </div>

          {/* Performance Hub label */}
          <div style={{
            textAlign: 'center',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#29ABE2',
            marginBottom: 6,
          }}>
            Performance Hub
          </div>

          {/* Subtitle */}
          <div style={{
            textAlign: 'center',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 13,
            color: '#666666',
            marginBottom: 32,
          }}>
            Sign in to access your performance reviews
          </div>

          {/* Form */}
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

            <div style={{ marginBottom: 28 }}>
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

            <button
              type="submit"
              disabled={loading}
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
              style={{
                width: '100%',
                padding: '13px',
                background: loading
                  ? 'linear-gradient(135deg, #1A5FA880 0%, #29ABE280 100%)'
                  : hovering
                  ? 'linear-gradient(135deg, #154d8a 0%, #1A5FA8 100%)'
                  : 'linear-gradient(135deg, #1A5FA8 0%, #29ABE2 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 800,
                fontFamily: 'Montserrat, sans-serif',
                letterSpacing: '0.05em',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            {error && (
              <div style={{
                marginTop: 12,
                color: '#C1272D',
                fontSize: 12,
                textAlign: 'center',
                fontFamily: 'Montserrat, sans-serif',
              }}>
                {error}
              </div>
            )}
          </form>

          {/* Footer */}
          <div style={{
            marginTop: 28,
            textAlign: 'center',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 10,
            color: '#aaaaaa',
          }}>
            QVT Media Ltd — Confidential
          </div>
        </div>
      </div>
    </>
  );
}
