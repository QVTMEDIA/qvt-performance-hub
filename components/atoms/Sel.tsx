'use client';

import { useState } from 'react';
import { QVT_BLUE } from '@/styles/brand';
import { useTheme } from '@/lib/ThemeContext';

interface SelOption {
  v: string;
  l: string;
}

interface SelProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: SelOption[];
  disabled?: boolean;
  placeholder?: string;
}

export default function Sel({ label, value, onChange, options, disabled = false, placeholder }: SelProps) {
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
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        style={{
          background: theme.input,
          border: `1px solid ${focused ? QVT_BLUE : theme.inputBorder}`,
          borderRadius: 6,
          padding: '9px 12px',
          color: value ? theme.textPrimary : theme.textMuted,
          fontSize: 12,
          fontWeight: 500,
          fontFamily: 'Montserrat, sans-serif',
          outline: 'none',
          transition: 'border-color 0.15s',
          cursor: disabled ? 'default' : 'pointer',
          width: '100%',
          boxSizing: 'border-box',
          opacity: disabled ? 0.6 : 1,
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%234a7a99' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          paddingRight: 32,
        }}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.v} value={opt.v} style={{ background: theme.input, color: theme.textPrimary }}>
            {opt.l}
          </option>
        ))}
      </select>
    </div>
  );
}
