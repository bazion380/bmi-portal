-- ============================================================
-- BMI UMS — library-db Schema Migration
-- Run this in: neon.tech → library-db → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS books (
  id               SERIAL PRIMARY KEY,
  isbn             TEXT NOT NULL UNIQUE,
  title            TEXT NOT NULL,
  author           TEXT NOT NULL,
  publisher        TEXT,
  published_year   TEXT,
  copies_total     INTEGER NOT NULL,
  copies_available INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS borrowing_records (
  id          SERIAL PRIMARY KEY,
  book_id     INTEGER REFERENCES books(id) NOT NULL,
  user_id     UUID NOT NULL, -- references student/staff UUID from core
  borrowed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  due_date    DATE NOT NULL,
  returned_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS library_fines (
  id                  SERIAL PRIMARY KEY,
  borrowing_record_id INTEGER REFERENCES borrowing_records(id) NOT NULL UNIQUE,
  user_id             UUID NOT NULL,
  amount              NUMERIC(10, 2) NOT NULL,
  is_paid             BOOLEAN DEFAULT FALSE NOT NULL,
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS setup
ALTER TABLE books             ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrowing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_fines     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all" ON books FOR ALL USING (true);
CREATE POLICY "allow_all" ON borrowing_records FOR ALL USING (true);
CREATE POLICY "allow_all" ON library_fines FOR ALL USING (true);
