'use client';

import { useState, InputHTMLAttributes } from 'react';
import { QVT_BLUE } from '@/styles/brand';
import { useTheme } from '@/lib/ThemeContext';

interface InpProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

export default function Inp({ label, value, onChange, type = 'text', ...rest }: InpProps) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label
        style={{
          color: theme.textDim,
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
          background: theme.input,
          border: `1px solid ${focused ? QVT_BLUE : theme.inputBorder}`,
          borderRadius: 6,
          padding: '9px 12px',
          color: theme.textPrimary,
          fontSize: 12,
          fontWeight: 500,
          fontFamily: 'Montserrat, sans-serif',
          outline: 'none',
          transition: 'border-color 0.15s',
          width: '100%',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}
