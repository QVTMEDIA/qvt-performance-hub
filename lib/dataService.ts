import { supabase, supabaseAdmin } from '@/lib/supabase';
import { Review, Reminder, Role } from '@/types';

// Use admin client (bypasses RLS) on the server; fall back to browser client on the client.
// supabaseAdmin is null in the browser because SUPABASE_SERVICE_ROLE_KEY is not NEXT_PUBLIC_.
const db = supabaseAdmin ?? supabase;

// ─── Row → TypeScript mappers ─────────────────────────────────────────────────

function mapToReview(row: Record<string, unknown>): Review {
  return {
    id:             row.id            as string,
    createdAt:      row.created_at    as string,
    status:         row.status        as Review['status'],
    employeeName:   row.employee_name as string,
    jobTitle:       row.job_title     as string,
    department:     row.department    as string,
    supervisorName: row.supervisor_name as string,
    resumptionDate: row.resumption_date as string,
    period:         row.period        as string,
    selfReview:     (row.self_review  as Review['selfReview'])  ?? null,
    leadReview:     (row.lead_review  as Review['leadReview'])  ?? null,
    hrReview:       (row.hr_review    as Review['hrReview'])    ?? null,
    cooReview:      (row.coo_review   as Review['cooReview'])   ?? null,
    ceoReview:      (row.ceo_review   as Review['ceoReview'])   ?? null,
  };
}

function toDbReview(rev: Review) {
  return {
    id:              rev.id,
    created_at:      rev.createdAt,
    status:          rev.status,
    employee_name:   rev.employeeName,
    job_title:       rev.jobTitle,
    department:      rev.department,
    supervisor_name: rev.supervisorName,
    resumption_date: rev.resumptionDate,
    period:          rev.period,
    self_review:     rev.selfReview,
    lead_review:     rev.leadReview,
    hr_review:       rev.hrReview,
    coo_review:      rev.cooReview,
    ceo_review:      rev.ceoReview,
  };
}

function mapToReminder(row: Record<string, unknown>): Reminder {
  return {
    id:       row.id        as string,
    reviewId: row.review_id as string,
    toRole:   row.to_role   as Role,
    message:  row.message   as string,
    sentAt:   row.sent_at   as string,
    sentBy:   row.sent_by   as Role,
    read:     row.read      as boolean,
  };
}

function toDbReminder(rem: Reminder) {
  return {
    id:        rem.id,
    review_id: rem.reviewId,
    to_role:   rem.toRole,
    message:   rem.message,
    sent_at:   rem.sentAt,
    sent_by:   rem.sentBy,
    read:      rem.read,
  };
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export async function fetchReviews(): Promise<Review[]> {
  const { data, error } = await db.from('reviews').select('*');
  if (error) throw error;
  return (data ?? []).map(mapToReview);
}

export async function createReview(rev: Review): Promise<void> {
  const { error } = await db.from('reviews').insert(toDbReview(rev));
  if (error) throw error;
}

export async function updateReview(rev: Review): Promise<void> {
  const { error } = await db
    .from('reviews')
    .update(toDbReview(rev))
    .eq('id', rev.id);
  if (error) throw error;
}

// ─── Reminders ────────────────────────────────────────────────────────────────

export async function fetchReminders(): Promise<Reminder[]> {
  const { data, error } = await db.from('reminders').select('*');
  if (error) throw error;
  return (data ?? []).map(mapToReminder);
}

export async function createReminder(rem: Reminder): Promise<void> {
  const { error } = await db.from('reminders').insert(toDbReminder(rem));
  if (error) throw error;
}

export async function updateReminder(id: string, updates: Partial<Reminder>): Promise<void> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.read     !== undefined) dbUpdates.read      = updates.read;
  if (updates.message  !== undefined) dbUpdates.message   = updates.message;
  if (updates.toRole   !== undefined) dbUpdates.to_role   = updates.toRole;
  if (updates.sentAt   !== undefined) dbUpdates.sent_at   = updates.sentAt;
  if (updates.sentBy   !== undefined) dbUpdates.sent_by   = updates.sentBy;
  if (updates.reviewId !== undefined) dbUpdates.review_id = updates.reviewId;

  const { error } = await db
    .from('reminders')
    .update(dbUpdates)
    .eq('id', id);
  if (error) throw error;
}
