import { supabase } from '@/lib/supabase';
import { Role } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminProfile {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  jobTitle?: string;
  department?: string;
  isAdmin: boolean;
}

export interface AuditEntry {
  id: string;
  action: string;
  adminEmail: string | null;
  targetType: string | null;
  targetId: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapProfile(row: Record<string, unknown>): AdminProfile {
  return {
    id:         row.id         as string,
    fullName:   (row.full_name as string) ?? '',
    email:      (row.email     as string) ?? '',
    role:       (row.role      as Role)   ?? 'employee',
    jobTitle:   (row.job_title as string) ?? undefined,
    department: (row.department as string) ?? undefined,
    isAdmin:    (row.is_admin  as boolean) ?? false,
  };
}

function mapAudit(row: Record<string, unknown>): AuditEntry {
  return {
    id:          row.id           as string,
    action:      row.action       as string,
    adminEmail:  (row.admin_email as string) ?? null,
    targetType:  (row.target_type as string) ?? null,
    targetId:    (row.target_id   as string) ?? null,
    details:     (row.details     as Record<string, unknown>) ?? null,
    createdAt:   row.created_at   as string,
  };
}

// ─── Profiles ─────────────────────────────────────────────────────────────────

export async function fetchProfiles(): Promise<AdminProfile[]> {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) throw error;
  return (data ?? []).map(mapProfile);
}

export async function updateProfile(
  id: string,
  updates: Partial<{
    full_name: string;
    role: Role;
    job_title: string;
    department: string;
    is_admin: boolean;
  }>
): Promise<void> {
  const { error } = await supabase.from('profiles').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteProfileRow(id: string): Promise<void> {
  const { error } = await supabase.from('profiles').delete().eq('id', id);
  if (error) throw error;
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export async function deleteReview(id: string): Promise<void> {
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) throw error;
}

export async function forceReviewStatus(id: string, newStatus: string): Promise<void> {
  const { error } = await supabase.from('reviews').update({ status: newStatus }).eq('id', id);
  if (error) throw error;
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

export interface AuditFetchOpts {
  limit?: number;
  targetType?: string;
  from?: string;
  to?: string;
}

export async function fetchAuditLog(opts: AuditFetchOpts = {}): Promise<AuditEntry[]> {
  let query = supabase
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(opts.limit ?? 200);

  if (opts.targetType) query = query.eq('target_type', opts.targetType);
  if (opts.from)       query = query.gte('created_at', opts.from);
  if (opts.to)         query = query.lte('created_at', opts.to);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapAudit);
}

export async function logAuditAction(
  action: string,
  adminEmail: string,
  targetType: string,
  targetId: string,
  details?: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase.from('audit_log').insert({
    action,
    admin_email: adminEmail,
    target_type: targetType,
    target_id:   targetId,
    details:     details ?? null,
  });
  if (error) console.warn('[audit] insert failed:', error.message);
}
