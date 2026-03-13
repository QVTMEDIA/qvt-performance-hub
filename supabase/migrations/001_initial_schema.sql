-- ─── Profiles ─────────────────────────────────────────────────────────────────
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  email       text,
  role        text,
  job_title   text,
  department  text
);

-- ─── Reviews ──────────────────────────────────────────────────────────────────
create table reviews (
  id              text primary key,
  created_at      text,
  status          text,
  employee_name   text,
  job_title       text,
  department      text,
  supervisor_name text,
  resumption_date text,
  period          text,
  self_review     jsonb,
  lead_review     jsonb,
  hr_review       jsonb,
  coo_review      jsonb,
  ceo_review      jsonb
);

-- ─── Reminders ────────────────────────────────────────────────────────────────
create table reminders (
  id        text primary key,
  review_id text references reviews(id) on delete cascade,
  to_role   text,
  message   text,
  sent_at   text,
  sent_by   text,
  read      boolean default false
);
