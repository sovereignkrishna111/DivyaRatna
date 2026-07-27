-- Follow-up migration (safe): remove apply_url from job_openings if it exists

alter table if exists public.job_openings
  drop column if exists apply_url;
