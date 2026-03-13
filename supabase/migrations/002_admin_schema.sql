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

-- RLS on audit_log
alter table audit_log enable row level security;

create policy "Admins read audit_log" on audit_log for select
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

create policy "Admins insert audit_log" on audit_log for insert
  with check (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- ── Profile policies for admins ───────────────────────────────────────────────
create policy "Admins read all profiles" on profiles for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

create policy "Admins update profiles" on profiles for update
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

create policy "Admins delete profiles" on profiles for delete
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

create index if not exists audit_log_created_at_idx on audit_log (created_at desc);

-- ── Set first admin ───────────────────────────────────────────────────────────
-- Run separately after migration:
-- update profiles set is_admin = true where email = 'info@qvtmedia.com';
