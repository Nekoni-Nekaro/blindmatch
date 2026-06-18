-- BlindMatch PostgreSQL initialization
-- Run automatically on first docker-compose up

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for full-text search on tags

-- Ensure timezone
SET timezone = 'UTC';

-- Seed default interest rooms (inserted after TypeORM sync creates tables)
-- These are inserted by the RoomsService.seed() on app start
