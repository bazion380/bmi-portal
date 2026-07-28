-- ============================================================
-- BMI UMS — hr-db Schema Migration
-- Run this in: neon.tech → hr-db → SQL Editor
-- ============================================================

DO $$ BEGIN
  CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS staff (
  id          SERIAL PRIMARY KEY,
  user_id     UUID NOT NULL UNIQUE, -- Maps loosely to Neon Auth user.id from core-db
  department  TEXT NOT NULL,
  job_title   TEXT NOT NULL,
  hire_date   DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS leave_requests (
  id          SERIAL PRIMARY KEY,
  staff_id    INTEGER REFERENCES staff(id) NOT NULL,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  reason      TEXT,
  status      leave_status DEFAULT 'pending' NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS payroll_records (
  id               SERIAL PRIMARY KEY,
  staff_id         INTEGER REFERENCES staff(id) NOT NULL,
  pay_period_start DATE NOT NULL,
  pay_period_end   DATE NOT NULL,
  base_salary      NUMERIC(10, 2) NOT NULL,
  deductions       NUMERIC(10, 2) DEFAULT '0' NOT NULL,
  net_pay          NUMERIC(10, 2) NOT NULL,
  issued_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS setup (Assuming HR manager has access)
ALTER TABLE staff           ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;

-- Note: Because this is an auxiliary DB, auth.user_id() might not be natively populated 
-- if Neon Auth is only on core-db. The API will pass the user role/ID directly or 
-- via a custom session variable.

-- For simplicity in the auxiliary DBs without native Neon Auth linked:
CREATE POLICY "allow_all_admin" ON staff FOR ALL USING (true);
CREATE POLICY "allow_all_admin" ON leave_requests FOR ALL USING (true);
CREATE POLICY "allow_all_admin" ON payroll_records FOR ALL USING (true);
