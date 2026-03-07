-- ═══════════════════════════════════════════════════════════════
-- ALPHA DESK — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────
-- 1. ANALYSES TABLE
-- ───────────────────────────────────────────────
create table public.analyses (
  id            uuid default gen_random_uuid() primary key,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null,

  -- Content
  ticker        text not null,
  title         text not null,
  description   text,
  rating        text not null check (rating in ('BUY', 'HOLD', 'SELL', 'WATCH')),
  sector        text,
  analyst       text,
  current_price numeric(10,2),
  price_target  numeric(10,2),

  -- PDF
  pdf_path      text,       -- path inside Supabase Storage bucket
  pdf_name      text,       -- original filename

  -- Visibility
  published     boolean default false not null,

  -- Author (links to auth.users)
  author_id     uuid references auth.users(id) on delete set null
);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_analyses_updated
  before update on public.analyses
  for each row execute procedure public.handle_updated_at();

-- ───────────────────────────────────────────────
-- 2. ROW LEVEL SECURITY (RLS) — Critical!
-- ───────────────────────────────────────────────
alter table public.analyses enable row level security;

-- PUBLIC: only see published analyses
create policy "Public can view published analyses"
  on public.analyses for select
  using (published = true);

-- ADMIN: authenticated users can do everything
create policy "Authenticated users have full access"
  on public.analyses for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ───────────────────────────────────────────────
-- 3. STORAGE BUCKET FOR PDFs
-- ───────────────────────────────────────────────
-- Run in Dashboard → Storage → Create bucket named "analyses-pdfs"
-- Or run via SQL:
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'analyses-pdfs',
  'analyses-pdfs',
  false,                          -- private bucket!
  52428800,                       -- 50MB max per file
  array['application/pdf']        -- only PDFs allowed
)
on conflict (id) do nothing;

-- Storage RLS: only authenticated users can upload
create policy "Authenticated users can upload PDFs"
  on storage.objects for insert
  with check (
    bucket_id = 'analyses-pdfs'
    and auth.role() = 'authenticated'
  );

-- Storage RLS: authenticated users can read all
create policy "Authenticated users can read PDFs"
  on storage.objects for select
  using (
    bucket_id = 'analyses-pdfs'
    and auth.role() = 'authenticated'
  );

-- Storage RLS: authenticated users can delete their own files
create policy "Authenticated users can delete PDFs"
  on storage.objects for delete
  using (
    bucket_id = 'analyses-pdfs'
    and auth.role() = 'authenticated'
  );

-- ───────────────────────────────────────────────
-- 4. SIGNED URL FUNCTION (for secure PDF access)
--    Public users get a time-limited signed URL
-- ───────────────────────────────────────────────
create or replace function public.get_analysis_pdf_url(analysis_id uuid)
returns text
language plpgsql security definer
as $$
declare
  v_pdf_path text;
  v_signed_url text;
begin
  -- Check analysis is published
  select pdf_path into v_pdf_path
  from public.analyses
  where id = analysis_id and published = true;

  if v_pdf_path is null then
    return null;
  end if;

  -- Generate signed URL valid for 1 hour
  select storage.foldername(v_pdf_path) into v_signed_url;
  return v_pdf_path;
end;
$$;

-- ───────────────────────────────────────────────
-- 5. ADMIN USER SETUP
-- After running this schema:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add user" → "Create new user"
-- 3. Enter your admin email + strong password
-- 4. That's it — only this user can access the admin panel
-- ───────────────────────────────────────────────
