import { ReviewStatus, Role } from '@/types';

export interface Competency {
  key: string;
  label: string;
  description: string;
}

export const BEHAVIORAL: Competency[] = [
  { key: 'communication', label: 'Communication & Clarity', description: 'Exchanges information effectively, both verbally and in writing.' },
  { key: 'teamwork', label: 'Teamwork & Collaboration', description: 'Willingness to cooperate, share knowledge, and support team goals.' },
  { key: 'adaptability', label: 'Adaptability & Flexibility', description: 'Ability to adjust to changing tasks, responsibilities, or environment.' },
  { key: 'problem_solving', label: 'Problem-Solving & Creativity', description: 'Approaches issues logically, proposes innovative ideas.' },
  { key: 'integrity', label: 'Integrity & Confidentiality', description: 'Upholds ethical standards, respects confidential information.' },
  { key: 'reliability', label: 'Reliability & Ownership', description: 'Takes accountability for tasks, meets commitments and deadlines.' },
  { key: 'customer_focus', label: 'Customer Focus', description: "Demonstrates commitment to both internal and external clients' needs." },
  { key: 'initiative', label: 'Initiative & Proactiveness', description: 'Anticipates needs, takes action without waiting for instruction.' },
  { key: 'interpersonal', label: 'Interpersonal Skills', description: 'Maintains positive relationships with all colleagues.' },
  { key: 'presentation', label: 'Personal Presentation', description: 'Presents self professionally (dress, punctuality, attitude).' },
];

export const FUNCTIONAL: Competency[] = [
  { key: 'campaign_planning', label: 'Campaign Planning & Execution', description: 'Plans and manages digital ad campaigns across all channels.' },
  { key: 'creative_collab', label: 'Creative Collaboration', description: 'Collaborates with creative teams to develop ad materials.' },
  { key: 'perf_optimization', label: 'Performance Optimization', description: 'Monitors and refines CTR, CPC, ROAS for continuous improvement.' },
  { key: 'budget_mgmt', label: 'Project & Budget Management', description: 'Maintains campaign calendars, budgets, and asset libraries.' },
  { key: 'content_seo', label: 'Content Adaptation & SEO', description: 'Ensures content meets platform and SEO requirements.' },
  { key: 'client_servicing', label: 'Client Servicing & Communication', description: 'Manages client relationships and campaign updates.' },
  { key: 'analytics_reporting', label: 'Analytical Reporting', description: 'Produces dashboards, uses data insights to enhance conversions.' },
  { key: 'internal_collab', label: 'Internal Collaboration', description: 'Works with media buying, creative, and research teams.' },
  { key: 'market_research', label: 'Market Research & Competitor Analysis', description: 'Identifies trends, proposes innovative strategies.' },
  { key: 'thought_leadership', label: 'Thought Leadership & Knowledge Sharing', description: 'Contributes to case studies and internal knowledge.' },
];

export const STATUS_ORDER: ReviewStatus[] = [
  'draft',
  'self_done',
  'lead_done',
  'hr_done',
  'coo_done',
  'completed',
];

export interface StageMeta {
  label: string;
  color: string;
  role: Role | null;
}

export const STAGE_META: Record<ReviewStatus, StageMeta> = {
  draft: { label: 'Draft', color: '#4a7a99', role: 'employee' },
  self_done: { label: 'Awaiting Lead', color: '#3b82f6', role: 'lead' },
  lead_done: { label: 'Awaiting HR', color: '#8b5cf6', role: 'hr' },
  hr_done: { label: 'Awaiting COO', color: '#d97706', role: 'coo' },
  coo_done: { label: 'Awaiting CEO', color: '#f97316', role: 'ceo' },
  completed: { label: 'Completed', color: '#22c55e', role: null },
};

export interface RoleMeta {
  label: string;
  color: string;
  icon: string;
}

export const ROLE_META: Record<Role, RoleMeta> = {
  employee: { label: 'Employee', color: '#0b73a8', icon: '👤' },
  lead: { label: 'Team Lead', color: '#3b82f6', icon: '👥' },
  hr: { label: 'People Lead (HR)', color: '#8b5cf6', icon: '🏢' },
  coo: { label: 'COO', color: '#d97706', icon: '📊' },
  ceo: { label: 'CEO', color: '#dc2626', icon: '🎯' },
  admin: { label: 'Admin', color: '#6366f1', icon: '🛡️' },
};

export const PERIODS: string[] = [
  'Q1 2026',
  'Q2 2026',
  'Q3 2026',
  'Q4 2026',
  'Q1 2027',
  'Q2 2027',
  'Q3 2027',
  'Q4 2027',
];

export const SCORE_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Satisfactory',
  4: 'Good',
  5: 'Outstanding',
};

export const RECOMMENDATION_OPTIONS = [
  { v: 'Promote', l: 'Promote' },
  { v: 'Retain', l: 'Retain' },
  { v: 'PIP', l: 'PIP (Performance Improvement Plan)' },
  { v: 'Review', l: 'Review' },
];
