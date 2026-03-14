-- ── Admin Schema Migration ────────────────────────────────────────────────────

alter table profiles add column if not exists is_admin boolean default false;

-- ── Audit Log ─────────────────────────────────────────────────────────────────
create table if not exists audit_log (
  id          uuid        primary key default gen_random_uuid(),
  action      text        not null,
  admin_email text,
  target_type text,
  target_id   text,
  details     jsonb,
  created_at  timestamptz default now()
);

alter table audit_log enable row level security;

create index if not exists audit_log_created_at_idx on audit_log (created_at desc);

-- ── Security-definer helper (avoids infinite recursion in RLS policies) ────────
-- Runs as DB owner → bypasses RLS → safe to use inside other RLS policies
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select is_admin from profiles where id = auth.uid() limit 1),
    false
  );
$$;

-- ── Profile policies for admins ───────────────────────────────────────────────
-- NOTE: "Users can read own profile" policy must already exist on this table.
-- These policies add admin-level access on top.

create policy "Users and admins read profiles" on profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Admins update profiles" on profiles for update
  using (public.is_admin());

create policy "Admins delete profiles" on profiles for delete
  using (public.is_admin());

-- ── Audit log policies ────────────────────────────────────────────────────────
create policy "Admins read audit_log" on audit_log for select
  using (public.is_admin());

create policy "Admins insert audit_log" on audit_log for insert
  with check (public.is_admin());

-- ── Set first admin (run after migration) ─────────────────────────────────────
-- update profiles set is_admin = true
-- where id = (select id from auth.users where email = 'info@qvtmedia.com');
