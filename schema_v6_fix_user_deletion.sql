-- ════════════════════════════════════════════════════════════════
-- InternTrack — Schema Update 6
-- Fix Database Error Deleting User
-- Run this once in: supabase.com → your project → SQL Editor → Run
-- ════════════════════════════════════════════════════════════════

-- 1. Drop the NOT NULL and FOREIGN KEY constraint from activity_logs
-- This prevents the "violates foreign key constraint" error from throwing
-- when the trigger tries to write a log for an internship card that is 
-- being cascade-deleted right as the parent user account is being deleted.

ALTER TABLE public.activity_logs 
ALTER COLUMN user_id DROP NOT NULL;

DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT tc.constraint_name INTO constraint_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_name = 'activity_logs' 
      AND kcu.column_name = 'user_id';

    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.activity_logs DROP CONSTRAINT ' || constraint_name;
    END IF;
END $$;
