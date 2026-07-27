-- ============================================================
-- BMI UMS — campus-db Schema Migration
-- Run this in: neon.tech → campus-db → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS hostels (
  id       SERIAL PRIMARY KEY,
  name     TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  location TEXT
);

CREATE TABLE IF NOT EXISTS hostel_allocations (
  id            SERIAL PRIMARY KEY,
  hostel_id     INTEGER REFERENCES hostels(id) NOT NULL,
  user_id       UUID NOT NULL, -- references student/staff UUID from core
  room_number   TEXT NOT NULL,
  academic_term TEXT NOT NULL,
  allocated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS transport_routes (
  id             SERIAL PRIMARY KEY,
  route_name     TEXT NOT NULL,
  description    TEXT,
  vehicle_number TEXT
);

CREATE TABLE IF NOT EXISTS transport_passes (
  id          SERIAL PRIMARY KEY,
  route_id    INTEGER REFERENCES transport_routes(id) NOT NULL,
  user_id     UUID NOT NULL,
  valid_from  DATE NOT NULL,
  valid_until DATE NOT NULL,
  issued_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS setup
ALTER TABLE hostels            ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_routes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_passes   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all" ON hostels FOR ALL USING (true);
CREATE POLICY "allow_all" ON hostel_allocations FOR ALL USING (true);
CREATE POLICY "allow_all" ON transport_routes FOR ALL USING (true);
CREATE POLICY "allow_all" ON transport_passes FOR ALL USING (true);
