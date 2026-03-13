'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function getStrength(pw: string): { level: 0 | 1 | 2 | 3; label: string; color: string; width: string } {
  if (pw.length === 0)  return { level: 0, label: '',       color: '#e0e0e0', width: '0%' };
  if (pw.length < 8)    return { level: 1, label: 'Weak',   color: '#C1272D', width: '33%' };
  if (/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw))
                        return { level: 3, label: 'Strong',  color: '#16a34a', width: '100%' };
  return               { level: 2, label: 'Fair',   color: '#d97706', width: '66%' };
}

export default function ResetPasswordPage() {
  const router = useRouter();

  const [newPassword,      setNewPassword]      = useState('');
  const [confirmPassword,  setConfirmPassword]  = useState('');
  const [showNew,          setShowNew]          = useState(false);
  const [showConfirm,      setShowConfirm]      = useState(false);
  const [error,            setError]            = useState('');
  const [loading,          setLoading]          = useState(false);
  const [success,          setSuccess]          = useState(false);
  const [hovering,         setHovering]         = useState(false);
  const [focusEl,          setFocusEl]          = useState<'new' | 'confirm' | null>(null);

  const strength = getStrength(newPassword);

  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const inputWrapStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const inputStyle = (field: 'new' | 'confirm'): React.CSSProperties => ({
    width: '100%',
    padding: '12px 42px 12px 14px',
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

  const eyeBtnStyle: React.CSSProperties = {
    position: 'absolute',
    right: 12,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#aaaaaa',
    fontSize: 16,
    padding: 0,
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
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
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <div style={{ width: 60, height: 2, background: 'linear-gradient(to right, #C1272D, #29ABE2)', borderRadius: 1 }} />
          </div>

          {/* Success state */}
          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
              <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 18, fontWeight: 800, color: '#16a34a', margin: '0 0 10px' }}>
                Password updated!
              </h2>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: '#666666', lineHeight: 1.6, margin: '0 0 20px' }}>
                Redirecting you to sign in…
              </p>
              {/* Progress bar */}
              <div style={{ height: 3, background: '#e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(to right, #1A5FA8, #29ABE2)',
                  borderRadius: 2,
                  animation: 'progress 3s linear forwards',
                }} />
              </div>
              <style>{`
                @keyframes progress { from { width: 0% } to { width: 100% } }
              `}</style>
            </div>
          ) : (
            <>
              <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 18, fontWeight: 800, color: '#1a1a1a', textAlign: 'center', margin: '0 0 8px' }}>
                Set New Password
              </h2>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: '#666666', textAlign: 'center', margin: '0 0 28px', lineHeight: 1.6 }}>
                Enter your new password below.
              </p>

              {/* New password */}
              <div style={{ marginBottom: 8 }}>
                <label style={labelStyle}>New Password</label>
                <div style={inputWrapStyle}>
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    onFocus={() => setFocusEl('new')}
                    onBlur={() => setFocusEl(null)}
                    placeholder="Min. 8 characters"
                    style={inputStyle('new')}
                  />
                  <button type="button" onClick={() => setShowNew(v => !v)} style={eyeBtnStyle} tabIndex={-1}>
                    {showNew ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              {/* Strength bar */}
              {newPassword.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                  <div style={{ flex: 1, height: 4, background: '#e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: strength.width,
                      background: strength.color,
                      borderRadius: 2,
                      transition: 'width 0.25s, background 0.25s',
                    }} />
                  </div>
                  <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, color: strength.color, minWidth: 40 }}>
                    {strength.label}
                  </span>
                </div>
              )}
              {!newPassword.length && <div style={{ marginBottom: 18 }} />}

              {/* Confirm password */}
              <div style={{ marginBottom: 28 }}>
                <label style={labelStyle}>Confirm Password</label>
                <div style={inputWrapStyle}>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocusEl('confirm')}
                    onBlur={() => setFocusEl(null)}
                    placeholder="Re-enter password"
                    style={inputStyle('confirm')}
                    onKeyDown={e => e.key === 'Enter' && handleResetPassword()}
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)} style={eyeBtnStyle} tabIndex={-1}>
                    {showConfirm ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <button
                onClick={handleResetPassword}
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
                {loading ? 'Updating…' : 'Update Password'}
              </button>

              {error && (
                <div style={{ marginTop: 12, color: '#C1272D', fontSize: 12, textAlign: 'center', fontFamily: 'Montserrat, sans-serif' }}>
                  {error}
                </div>
              )}
            </>
          )}

          {/* Footer */}
          <div style={{ marginTop: 28, textAlign: 'center', fontFamily: 'Montserrat, sans-serif', fontSize: 10, color: '#aaaaaa' }}>
            QVT Media Ltd — Confidential
          </div>
        </div>
      </div>
    </>
  );
}
