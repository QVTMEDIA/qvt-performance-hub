'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Role, Review, Reminder, SelfReview, LeadReview, HRReview, COOReview, CEOReview } from '@/types';
import { getStorage, setStorage } from '@/lib/storage';
import { fetchReviews, createReview, updateReview, fetchReminders, createReminder, updateReminder } from '@/lib/dataService';
import { getSession, getCurrentProfile, signOut } from '@/lib/auth';
import { ROLE_META } from '@/lib/constants';
import { uid, today } from '@/lib/utils';
import { QVT_BLUE } from '@/styles/brand';
import { useTheme } from '@/lib/ThemeContext';
import { useWindowSize } from '@/lib/useWindowSize';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import Toast from '@/components/Toast';
import Dashboard from '@/components/Dashboard';
import { SkeletonCard } from '@/components/atoms/Skeleton';
import ErrorBoundary from '@/components/ErrorBoundary';

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

// ─── Raw Supabase row → Review mapper (mirrors dataService.ts) ────────────────
function mapRawReview(raw: Record<string, unknown>): Review {
  return {
    id:             String(raw.id ?? ''),
    employeeName:   String(raw.employee_name ?? ''),
    jobTitle:       String(raw.job_title ?? ''),
    department:     String(raw.department ?? ''),
    supervisorName: String(raw.supervisor_name ?? ''),
    resumptionDate: String(raw.resumption_date ?? ''),
    period:         String(raw.period ?? ''),
    status:         raw.status as Review['status'],
    createdAt:      String(raw.created_at ?? ''),
    selfReview:   (raw.self_review as Review['selfReview']) ?? null,
    leadReview:   (raw.lead_review as Review['leadReview']) ?? null,
    hrReview:     (raw.hr_review  as Review['hrReview'])   ?? null,
    cooReview:    (raw.coo_review as Review['cooReview'])  ?? null,
    ceoReview:    (raw.ceo_review as Review['ceoReview'])  ?? null,
  };
}

function mapRawReminder(raw: Record<string, unknown>): Reminder {
  return {
    id:       String(raw.id ?? ''),
    reviewId: String(raw.review_id ?? ''),
    toRole:   raw.to_role as Role,
    message:  String(raw.message ?? ''),
    sentAt:   String(raw.sent_at ?? ''),
    sentBy:   raw.sent_by as Role,
    read:     Boolean(raw.read),
  };
}

// ─── AppShell ─────────────────────────────────────────────────────────────────
export default function AppShell() {
  const { theme } = useTheme();
  const { isMobile } = useWindowSize();

  // ── Core state ──────────────────────────────────────────────────────────────
  const [loaded,      setLoaded]      = useState(false);
  const [role,        setRole]        = useState<Role>('employee');
  const [empName,     setEmpName]     = useState('');
  const [reviews,     setReviews]     = useState<Review[]>([]);
  const [reminders,   setReminders]   = useState<Reminder[]>([]);
  const [view,        setView]        = useState<ViewType>('dashboard');
  const [activeRev,   setActiveRev]   = useState<Review | null>(null);
  const [toast,       setToast]       = useState<ToastState | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Realtime channel refs ────────────────────────────────────────────────────
  const reviewsChanRef   = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const remindersChanRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

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

  // ── Toast helper ─────────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string, type: ToastType = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Realtime state updaters ──────────────────────────────────────────────────
  const addReviewToState = useCallback((raw: Record<string, unknown>) => {
    const rev = mapRawReview(raw);
    setReviews(prev => prev.some(r => r.id === rev.id) ? prev : [...prev, rev]);
  }, []);

  const updateReviewInState = useCallback((raw: Record<string, unknown>) => {
    const rev = mapRawReview(raw);
    setReviews(prev => prev.map(r => r.id === rev.id ? rev : r));
    setActiveRev(prev => prev?.id === rev.id ? rev : prev);
  }, []);

  const addReminderToState = useCallback((raw: Record<string, unknown>) => {
    const rem = mapRawReminder(raw);
    setReminders(prev => prev.some(r => r.id === rem.id) ? prev : [...prev, rem]);
    setRole(currentRole => {
      if (rem.toRole === currentRole) {
        const truncated = rem.message.length > 60
          ? rem.message.slice(0, 60) + '…'
          : rem.message;
        showToast(`📬 New notification — ${truncated}`, 'info');
      }
      return currentRole;
    });
  }, [showToast]);

  const updateReminderInState = useCallback((raw: Record<string, unknown>) => {
    const rem = mapRawReminder(raw);
    setReminders(prev => prev.map(r => r.id === rem.id ? rem : r));
  }, []);

  // ── Load from Supabase on mount (fallback to localStorage) ──────────────────
  useEffect(() => {
    async function init() {
      const session = await getSession();
      if (session) {
        const profile = await getCurrentProfile();
        if (profile) {
          if (profile.isAdmin) { window.location.href = '/admin'; return; }
          setRole(profile.role);
        }
      }
      try {
        const [revs, rems] = await Promise.all([fetchReviews(), fetchReminders()]);
        setReviews(revs);
        setReminders(rems);
      } catch {
        const r = getStorage<Review[]>('reviews');
        const n = getStorage<Reminder[]>('remind');
        if (r) setReviews(r);
        if (n) setReminders(n);
      }
      setLoaded(true);
    }
    init();
  }, []);

  // ── Realtime subscriptions ───────────────────────────────────────────────────
  useEffect(() => {
    reviewsChanRef.current = supabase
      .channel('reviews-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reviews' },
        payload => addReviewToState(payload.new as Record<string, unknown>))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'reviews' },
        payload => updateReviewInState(payload.new as Record<string, unknown>))
      .subscribe();

    remindersChanRef.current = supabase
      .channel('reminders-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reminders' },
        payload => addReminderToState(payload.new as Record<string, unknown>))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'reminders' },
        payload => updateReminderInState(payload.new as Record<string, unknown>))
      .subscribe();

    return () => {
      if (reviewsChanRef.current)   supabase.removeChannel(reviewsChanRef.current);
      if (remindersChanRef.current) supabase.removeChannel(remindersChanRef.current);
    };
  }, [addReviewToState, updateReviewInState, addReminderToState, updateReminderInState]);

  // ── Persist helpers ──────────────────────────────────────────────────────────
  const saveReviews = useCallback((r: Review[]) => {
    setReviews(prev => {
      const prevIds = new Set(prev.map(x => x.id));
      r.filter(x => !prevIds.has(x.id)).forEach(rev => createReview(rev).catch(() => {}));
      return r;
    });
    setStorage('reviews', r);
  }, []);

  const saveReminders = useCallback((r: Reminder[]) => {
    setReminders(prev => {
      const prevMap = new Map(prev.map(x => [x.id, x]));
      r.forEach(rem => {
        if (!prevMap.has(rem.id)) createReminder(rem).catch(() => {});
        else if (prevMap.get(rem.id)!.read !== rem.read)
          updateReminder(rem.id, { read: rem.read }).catch(() => {});
      });
      return r;
    });
    setStorage('remind', r);
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
    updateReview(updated).catch(() => {});
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
    createReminder(rem).catch(() => {});
  }, [role]);

  // ── signOut ──────────────────────────────────────────────────────────────────
  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: theme.bg }}>
        <div style={{ width: 360 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
            <QVTLogo size={48} />
            <p style={{ color: theme.textMuted, fontFamily: 'Montserrat, sans-serif', fontSize: 13, marginTop: 16, letterSpacing: '0.05em' }}>
              Loading...
            </p>
          </div>
          <SkeletonCard rows={4} />
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
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: theme.bg, fontFamily: 'Montserrat, sans-serif' }}>
      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 199,
          }}
        />
      )}

      <Sidebar
        role={role}
        view={view}
        reminders={reminders}
        onNav={(v) => { setView(v); setActiveRev(null); setSidebarOpen(false); }}
        onRoleChange={handleRoleChange}
        onSignOut={handleSignOut}
        isMobile={isMobile}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main style={{
        flex: 1,
        overflow: 'auto',
        minHeight: '100vh',
        marginLeft: isMobile ? 0 : 0,
      }}>
        {/* Hamburger on mobile */}
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              position:   'fixed',
              top:        12,
              left:       12,
              zIndex:     198,
              background: theme.sidebar,
              border:     `1px solid ${theme.border}`,
              borderRadius: 6,
              color:      theme.textPrimary,
              fontSize:   18,
              width:      36,
              height:     36,
              cursor:     'pointer',
              display:    'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ☰
          </button>
        )}
        <ErrorBoundary>
          <Dashboard ctx={ctx} />
        </ErrorBoundary>
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
