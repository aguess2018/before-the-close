-- BEFORE THE CLOSE v1.2 — Sales Style profile field
-- Run once in Supabase SQL Editor before testing v1.2.

alter table public.profiles
add column if not exists sales_style text;

comment on column public.profiles.sales_style is
'Primary selling motion used to personalize prayers (for example d2d, coldcall, appointments, retail).';
