-- ============================================================
-- BMI UMS — alumni-db Schema Migration
-- Run this in: neon.tech → alumni-db → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS alumni_profiles (
  id                SERIAL PRIMARY KEY,
  user_id           UUID NOT NULL UNIQUE, -- Maps loosely to core-db UUID
  graduation_year   TEXT NOT NULL,
  degree_obtained   TEXT NOT NULL,
  current_employer  TEXT,
  current_job_title TEXT,
  linkedin_url      TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  event_date  TIMESTAMPTZ NOT NULL,
  location    TEXT,
  capacity    INTEGER,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS event_registrations (
  id            SERIAL PRIMARY KEY,
  event_id      INTEGER REFERENCES events(id) NOT NULL,
  alumni_id     INTEGER REFERENCES alumni_profiles(id) NOT NULL,
  registered_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS donations (
  id         SERIAL PRIMARY KEY,
  alumni_id  INTEGER REFERENCES alumni_profiles(id) NOT NULL,
  amount     NUMERIC(12, 2) NOT NULL,
  purpose    TEXT,
  donated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS setup
ALTER TABLE alumni_profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE events              ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations           ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all" ON alumni_profiles FOR ALL USING (true);
CREATE POLICY "allow_all" ON events FOR ALL USING (true);
CREATE POLICY "allow_all" ON event_registrations FOR ALL USING (true);
CREATE POLICY "allow_all" ON donations FOR ALL USING (true);
