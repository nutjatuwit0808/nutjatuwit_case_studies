-- NL2SQL-Lite: Create read-only role for Supabase
-- Run in Supabase Dashboard → SQL Editor (as postgres)
-- Replace CHANGE_ME_IN_PRODUCTION with your desired password

-- Create role
CREATE ROLE nl2sql_readonly LOGIN PASSWORD 'nl2sql_readonly';

-- Allow connection to database (Supabase uses 'postgres' as default database)
GRANT CONNECT ON DATABASE postgres TO nl2sql_readonly;

-- Schema access
GRANT USAGE ON SCHEMA public TO nl2sql_readonly;

-- SELECT on all existing tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO nl2sql_readonly;

-- SELECT on all existing sequences (for metadata if needed)
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO nl2sql_readonly;

-- Future tables: default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public
   GRANT SELECT ON TABLES TO nl2sql_readonly;

-- Explicit revokes (belt-and-suspenders)
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA public FROM nl2sql_readonly;
REVOKE CREATE ON SCHEMA public FROM nl2sql_readonly;
