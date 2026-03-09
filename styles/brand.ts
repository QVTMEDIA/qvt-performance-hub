import { Band } from '@/lib/scoring';

// ─── Primary Palette ──────────────────────────────────────────────────────────
export const QVT_BLUE = '#0b73a8';
export const QVT_NAVY = '#04111e';

// ─── Full Color Tokens ────────────────────────────────────────────────────────
export const C = {
  // Backgrounds
  appBg: '#04111e',
  sidebarBg: '#020c17',
  cardBg: '#071523',

  // Borders
  border: '#0c2035',

  // Text
  textPrimary: '#f0f6fb',
  textSecondary: '#94a3b8',
  textMuted: '#4a7a99',
  textDim: '#2a4a65',

  // Accents
  blue: '#0b73a8',
  success: '#22c55e',
  error: '#dc2626',
  warning: '#d97706',
  purple: '#8b5cf6',
  orange: '#f97316',

  // Roles
  roleEmployee: '#0b73a8',
  roleLead: '#3b82f6',
  roleHr: '#8b5cf6',
  roleCoo: '#d97706',
  roleCeo: '#dc2626',
} as const;

// ─── Score Button Colors ──────────────────────────────────────────────────────
export const SC_COLORS: Record<number, string> = {
  1: '#ef4444',
  2: '#f97316',
  3: '#eab308',
  4: '#22c55e',
  5: '#10b981',
};

export const SC_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Satisfactory',
  4: 'Good',
  5: 'Outstanding',
};

// ─── Band Colors ─────────────────────────────────────────────────────────────
export const BAND_COLORS: Record<Band, string> = {
  Exceptional: '#10b981',
  'Very Good': '#22c55e',
  Good: '#3b82f6',
  'Improvement Needed': '#f59e0b',
  Unacceptable: '#ef4444',
};

export const BANDS: Array<{ label: Band; minPct: number; color: string }> = [
  { label: 'Exceptional', minPct: 90, color: '#10b981' },
  { label: 'Very Good', minPct: 80, color: '#22c55e' },
  { label: 'Good', minPct: 60, color: '#3b82f6' },
  { label: 'Improvement Needed', minPct: 40, color: '#f59e0b' },
  { label: 'Unacceptable', minPct: 0, color: '#ef4444' },
];
