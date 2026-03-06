-- NL2SQL-Lite: Create read-only role for secure SQL execution
-- Run as superuser (e.g. postgres). Replace placeholders before execution.

-- Create role
CREATE ROLE nl2sql_readonly LOGIN PASSWORD 'CHANGE_ME_IN_PRODUCTION';

-- Allow connection to database (run per target database)
GRANT CONNECT ON DATABASE your_database TO nl2sql_readonly;

-- Schema access
GRANT USAGE ON SCHEMA public TO nl2sql_readonly;

-- SELECT on all existing tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO nl2sql_readonly;

-- SELECT on all existing sequences (for metadata if needed)
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO nl2sql_readonly;

-- Future tables: default privileges (run as table owner / postgres)
ALTER DEFAULT PRIVILEGES IN SCHEMA public
   GRANT SELECT ON TABLES TO nl2sql_readonly;

-- Explicit revokes (belt-and-suspenders)
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA public FROM nl2sql_readonly;
REVOKE CREATE ON SCHEMA public FROM nl2sql_readonly;
