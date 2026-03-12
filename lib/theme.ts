// ─── Theme Token Interface ────────────────────────────────────────────────────
export interface Theme {
  bg: string;
  sidebar: string;
  card: string;
  cardAlt: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textDim: string;
  input: string;
  inputBorder: string;
}

// ─── Dark Theme (default) ─────────────────────────────────────────────────────
export const darkTheme: Theme = {
  bg:            '#04111e',
  sidebar:       '#020c17',
  card:          '#071523',
  cardAlt:       '#051020',
  border:        '#0c2035',
  textPrimary:   '#f0f6fb',
  textSecondary: '#94a3b8',
  textMuted:     '#4a7a99',
  textDim:       '#2a4a65',
  input:         '#071523',
  inputBorder:   '#0c2035',
};

// ─── Light Theme ──────────────────────────────────────────────────────────────
export const lightTheme: Theme = {
  bg:            '#f0f4f8',
  sidebar:       '#e2eaf2',
  card:          '#ffffff',
  cardAlt:       '#f5f9fd',
  border:        '#d1dde8',
  textPrimary:   '#0d1f2d',
  textSecondary: '#475569',
  textMuted:     '#5a8aaa',
  textDim:       '#8aabbd',
  input:         '#ffffff',
  inputBorder:   '#c5d4e0',
};
