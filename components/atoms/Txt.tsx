'use client';

import { useState } from 'react';
import { QVT_BLUE } from '@/styles/brand';
import { useTheme } from '@/lib/ThemeContext';

interface TxtProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  readonly?: boolean;
  rows?: number;
  placeholder?: string;
}

export default function Txt({
  label,
  value,
  onChange,
  readonly = false,
  rows = 4,
  placeholder,
}: TxtProps) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label
        style={{
          color: readonly ? theme.textDim : theme.textMuted,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontFamily: 'Montserrat, sans-serif',
        }}
      >
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => !readonly && onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={rows}
        placeholder={readonly ? undefined : placeholder}
        readOnly={readonly}
        style={{
          background: readonly ? `${theme.input}80` : theme.input,
          border: `1px solid ${focused && !readonly ? QVT_BLUE : theme.inputBorder}`,
          borderRadius: 6,
          padding: '9px 12px',
          color: readonly ? theme.textMuted : theme.textPrimary,
          fontSize: 12,
          fontWeight: 500,
          fontFamily: 'Montserrat, sans-serif',
          outline: 'none',
          resize: readonly ? 'none' : 'vertical',
          transition: 'border-color 0.15s',
          cursor: readonly ? 'default' : 'text',
          opacity: readonly ? 0.75 : 1,
          width: '100%',
          boxSizing: 'border-box',
          lineHeight: 1.6,
        }}
      />
    </div>
  );
}
