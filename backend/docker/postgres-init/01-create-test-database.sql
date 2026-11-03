-- Runs once, when the Postgres volume is first created. Creates the
-- disposable database integration tests use (TEST_DATABASE_URL). For an
-- existing volume, create it by hand:
--   docker compose exec postgres createdb -U alls alls_test
CREATE DATABASE alls_test;
