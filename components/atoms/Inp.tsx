'use client';

import { useState, InputHTMLAttributes } from 'react';
import { C, QVT_BLUE } from '@/styles/brand';

interface InpProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

export default function Inp({ label, value, onChange, type = 'text', ...rest }: InpProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label
        style={{
          color: C.textDim,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontFamily: 'Montserrat, sans-serif',
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...rest}
        style={{
          background: C.cardBg,
          border: `1px solid ${focused ? QVT_BLUE : C.border}`,
          borderRadius: 6,
          padding: '9px 12px',
          color: C.textPrimary,
          fontSize: 12,
          fontWeight: 500,
          fontFamily: 'Montserrat, sans-serif',
          outline: 'none',
          transition: 'border-color 0.15s',
          colorScheme: 'dark',
          width: '100%',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}
