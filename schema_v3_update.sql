-- ════════════════════════════════════════════════════════════════
-- InternTrack — Schema Update 3
-- Add resume_url and job_link to internship_cards
-- Run this once in: supabase.com → your project → SQL Editor → Run
-- ════════════════════════════════════════════════════════════════

ALTER TABLE internship_cards ADD COLUMN IF NOT EXISTS resume_url text;
ALTER TABLE internship_cards ADD COLUMN IF NOT EXISTS job_link text;
