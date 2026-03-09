'use client';

import { useState, useEffect, useCallback } from 'react';
import { Role, Review, Reminder, SelfReview, LeadReview, HRReview, COOReview, CEOReview } from '@/types';
import { getStorage, setStorage } from '@/lib/storage';
import { ROLE_META } from '@/lib/constants';
import { uid, today } from '@/lib/utils';
import { C, QVT_BLUE } from '@/styles/brand';
import Sidebar from '@/components/Sidebar';
import Toast from '@/components/Toast';
import Dashboard from '@/components/Dashboard';

// ─── Exported type aliases for stage text objects ─────────────────────────────
export type SelfTxt = SelfReview['text'];
export type LeadTxt = LeadReview['text'];
export type HrTxt   = HRReview['text'];
export type CooTxt  = COOReview['text'];
export type CeoTxt  = CEOReview['text'];

// ─── Toast ────────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'info';
export interface ToastState { msg: string; type: ToastType }

// ─── View ─────────────────────────────────────────────────────────────────────
export type ViewType = 'dashboard' | 'new' | 'review';

// ─── canEdit shape ────────────────────────────────────────────────────────────
export interface CanEdit {
  self: boolean;
  lead: boolean;
  hr:   boolean;
  coo:  boolean;
  ceo:  boolean;
}

// ─── AppContext ───────────────────────────────────────────────────────────────
export interface AppContext {
  // ── Core state ──────────────────────────────────────────────────────────────
  role:       Role;
  empName:    string;
  reviews:    Review[];
  reminders:  Reminder[];
  view:       ViewType;
  activeRev:  Review | null;

  // ── Stage edit buffers ───────────────────────────────────────────────────────
  selfBeh: Record<string, number>;
  selfFun: Record<string, number>;
  selfTxt: SelfTxt;
  leadBeh: Record<string, number>;
  leadFun: Record<string, number>;
  leadTxt: LeadTxt;
  hrTxt:   HrTxt;
  cooTxt:  CooTxt;
  ceoTxt:  CeoTxt;

  // ── Buffer setters (used by ReviewDetail) ────────────────────────────────────
  setSelfBeh: (v: Record<string, number>) => void;
  setSelfFun: (v: Record<string, number>) => void;
  setSelfTxt: (v: SelfTxt)  => void;
  setLeadBeh: (v: Record<string, number>) => void;
  setLeadFun: (v: Record<string, number>) => void;
  setLeadTxt: (v: LeadTxt)  => void;
  setHrTxt:   (v: HrTxt)    => void;
  setCooTxt:  (v: CooTxt)   => void;
  setCeoTxt:  (v: CeoTxt)   => void;

  // ── Computed ─────────────────────────────────────────────────────────────────
  canEdit: CanEdit;

  // ── Actions ──────────────────────────────────────────────────────────────────
  setEmpName:     (n: string)                               => void;
  setView:        (v: ViewType)                             => void;
  setActiveRev:   (r: Review | null)                        => void;
  saveReviews:    (r: Review[])                             => void;
  saveReminders:  (r: Reminder[])                           => void;
  openReview:     (rev: Review)                             => void;
  patch:          (updated: Review)                         => void;
  addRem:         (reviewId: string, toRole: Role, msg: string) => void;
  showToast:      (msg: string, type?: ToastType)           => void;
}

// ─── Default text objects (fallbacks in openReview) ───────────────────────────
const DEFAULT_SELF_TXT: SelfTxt = {
  accomplishments: '', challenges: '', goals: '', techDev: '', behDev: '',
};
const DEFAULT_LEAD_TXT: LeadTxt = {
  strengths: '', improvements: '', trainings: '', employeeComments: '', recommendation: '',
};
const DEFAULT_HR_TXT: HrTxt = {
  hrComments: '', techDev: '', behDev: '', hrRemarks: '',
};
const DEFAULT_COO_TXT: CooTxt = {
  strategicAlignment: '', cooComments: '',
};
const DEFAULT_CEO_TXT: CeoTxt = {
  finalDecision: '', ceoNotes: '',
};

// ─── AppShell ─────────────────────────────────────────────────────────────────
export default function AppShell() {
  // ── Core state ──────────────────────────────────────────────────────────────
  const [loaded,    setLoaded]    = useState(false);
  const [role,      setRole]      = useState<Role>('employee');
  const [empName,   setEmpName]   = useState('');
  const [reviews,   setReviews]   = useState<Review[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [view,      setView]      = useState<ViewType>('dashboard');
  const [activeRev, setActiveRev] = useState<Review | null>(null);
  const [toast,     setToast]     = useState<ToastState | null>(null);

  // ── Stage edit buffers ───────────────────────────────────────────────────────
  const [selfBeh, setSelfBeh] = useState<Record<string, number>>({});
  const [selfFun, setSelfFun] = useState<Record<string, number>>({});
  const [selfTxt, setSelfTxt] = useState<SelfTxt>(DEFAULT_SELF_TXT);
  const [leadBeh, setLeadBeh] = useState<Record<string, number>>({});
  const [leadFun, setLeadFun] = useState<Record<string, number>>({});
  const [leadTxt, setLeadTxt] = useState<LeadTxt>(DEFAULT_LEAD_TXT);
  const [hrTxt,   setHrTxt]   = useState<HrTxt>(DEFAULT_HR_TXT);
  const [cooTxt,  setCooTxt]  = useState<CooTxt>(DEFAULT_COO_TXT);
  const [ceoTxt,  setCeoTxt]  = useState<CeoTxt>(DEFAULT_CEO_TXT);

  // ── Load from localStorage on mount ─────────────────────────────────────────
  useEffect(() => {
    const r = getStorage<Review[]>('reviews');
    const n = getStorage<Reminder[]>('remind');
    if (r) setReviews(r);
    if (n) setReminders(n);
    setLoaded(true);
  }, []);

  // ── Persist helpers ──────────────────────────────────────────────────────────
  const saveReviews = useCallback((r: Review[]) => {
    setReviews(r);
    setStorage('reviews', r);
  }, []);

  const saveReminders = useCallback((r: Reminder[]) => {
    setReminders(r);
    setStorage('remind', r);
  }, []);

  // ── Toast helper ─────────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string, type: ToastType = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ── openReview — seeds all 9 stage buffers from stored data or defaults ──────
  const openReview = useCallback((rev: Review) => {
    setActiveRev(rev);
    setView('review');
    setSelfBeh(rev.selfReview?.behavioral ?? {});
    setSelfFun(rev.selfReview?.functional ?? {});
    setSelfTxt(rev.selfReview?.text        ?? DEFAULT_SELF_TXT);
    setLeadBeh(rev.leadReview?.behavioral  ?? {});
    setLeadFun(rev.leadReview?.functional  ?? {});
    setLeadTxt(rev.leadReview?.text        ?? DEFAULT_LEAD_TXT);
    setHrTxt(  rev.hrReview?.text          ?? DEFAULT_HR_TXT);
    setCooTxt( rev.cooReview?.text         ?? DEFAULT_COO_TXT);
    setCeoTxt( rev.ceoReview?.text         ?? DEFAULT_CEO_TXT);
  }, []);

  // ── patch — replace the matching review in the array and persist ─────────────
  const patch = useCallback((updated: Review) => {
    setReviews(prev => {
      const next = prev.map(r => r.id === updated.id ? updated : r);
      setStorage('reviews', next);
      return next;
    });
    setActiveRev(updated);
  }, []);

  // ── addRem — create a reminder and persist ───────────────────────────────────
  const addRem = useCallback((reviewId: string, toRole: Role, message: string) => {
    const rem: Reminder = {
      id:       uid(),
      reviewId,
      toRole,
      message,
      sentAt:   today(),
      sentBy:   role,
      read:     false,
    };
    setReminders(prev => {
      const next = [...prev, rem];
      setStorage('remind', next);
      return next;
    });
  }, [role]);

  // ── canEdit — derived from activeRev status + current role ───────────────────
  const canEdit: CanEdit = {
    self: activeRev?.status === 'draft'     && role === 'employee',
    lead: activeRev?.status === 'self_done' && role === 'lead',
    hr:   activeRev?.status === 'lead_done' && role === 'hr',
    coo:  activeRev?.status === 'hr_done'   && role === 'coo',
    ceo:  activeRev?.status === 'coo_done'  && role === 'ceo',
  };

  // ── Role change ──────────────────────────────────────────────────────────────
  const handleRoleChange = (r: Role) => {
    setRole(r);
    setView('dashboard');
    setActiveRev(null);
    setEmpName('');
  };

  // ── Loading screen ───────────────────────────────────────────────────────────
  if (!loaded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: C.appBg }}>
        <div style={{ textAlign: 'center' }}>
          <QVTLogo size={48} />
          <p style={{ color: C.textMuted, fontFamily: 'Montserrat, sans-serif', fontSize: 13, marginTop: 16, letterSpacing: '0.05em' }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // ── Assemble context ─────────────────────────────────────────────────────────
  const ctx: AppContext = {
    role, empName, reviews, reminders, view, activeRev,
    selfBeh, selfFun, selfTxt,
    leadBeh, leadFun, leadTxt,
    hrTxt, cooTxt, ceoTxt,
    setSelfBeh, setSelfFun, setSelfTxt,
    setLeadBeh, setLeadFun, setLeadTxt,
    setHrTxt, setCooTxt, setCeoTxt,
    canEdit,
    setEmpName, setView, setActiveRev,
    saveReviews, saveReminders,
    openReview, patch, addRem, showToast,
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: C.appBg, fontFamily: 'Montserrat, sans-serif' }}>
      <Sidebar
        role={role}
        view={view}
        reminders={reminders}
        onNav={(v) => { setView(v); setActiveRev(null); }}
        onRoleChange={handleRoleChange}
      />
      <main style={{ flex: 1, overflow: 'auto', minHeight: '100vh' }}>
        <Dashboard ctx={ctx} />
      </main>
      {toast && <Toast msg={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}

// ─── QVT Logo (shared) ────────────────────────────────────────────────────────
function QVTLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill={QVT_BLUE} />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle"
        fill="#fff" fontSize="16" fontWeight="800" fontFamily="Montserrat, sans-serif">
        Q
      </text>
    </svg>
  );
}

export { QVTLogo };
