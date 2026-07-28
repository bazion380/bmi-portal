-- ============================================================
-- BMI UMS — core-db Schema Migration
-- Run this in: neon.tech → core-db → SQL Editor
-- Or via: psql $DATABASE_URL -f migration.sql
-- ============================================================
-- Run sections in order. Each section is idempotent (safe to re-run).
-- ============================================================

-- ── SECTION 1: Enums ────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE role AS ENUM (
    'student', 'lecturer', 'registrar', 'admissions_officer',
    'finance_officer', 'exam_officer', 'hr_manager', 'advisor',
    'librarian', 'alumni_officer', 'president', 'it_admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected', 'waitlisted');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE enrollment_status AS ENUM ('enrolled', 'graduated', 'withdrawn', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── SECTION 2: Core Tables ───────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY,        -- Must match Neon Auth user.id
  role        role NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS programs (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  code        TEXT NOT NULL UNIQUE,
  department  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS students (
  id                SERIAL PRIMARY KEY,
  user_id           UUID REFERENCES users(id) UNIQUE,
  first_name        TEXT NOT NULL,
  last_name         TEXT NOT NULL,
  date_of_birth     DATE NOT NULL,
  enrollment_status enrollment_status DEFAULT 'enrolled' NOT NULL,
  program_id        INTEGER REFERENCES programs(id),
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS courses (
  id         SERIAL PRIMARY KEY,
  code       TEXT NOT NULL UNIQUE,
  title      TEXT NOT NULL,
  credits    INTEGER NOT NULL,
  program_id INTEGER REFERENCES programs(id)
);

CREATE TABLE IF NOT EXISTS prerequisites (
  id                    SERIAL PRIMARY KEY,
  course_id             INTEGER REFERENCES courses(id) NOT NULL,
  prerequisite_course_id INTEGER REFERENCES courses(id) NOT NULL
);

CREATE TABLE IF NOT EXISTS course_offerings (
  id          SERIAL PRIMARY KEY,
  course_id   INTEGER REFERENCES courses(id) NOT NULL,
  term        TEXT NOT NULL,
  lecturer_id UUID REFERENCES users(id),
  capacity    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS registrations (
  id                SERIAL PRIMARY KEY,
  student_id        INTEGER REFERENCES students(id) NOT NULL,
  course_offering_id INTEGER REFERENCES course_offerings(id) NOT NULL,
  status            TEXT DEFAULT 'registered' NOT NULL,
  registered_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS grades (
  id              SERIAL PRIMARY KEY,
  registration_id INTEGER REFERENCES registrations(id) NOT NULL UNIQUE,
  grade           NUMERIC(5, 2),
  letter_grade    TEXT,
  graded_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS financial_holds (
  id          SERIAL PRIMARY KEY,
  student_id  INTEGER REFERENCES students(id) NOT NULL,
  reason      TEXT NOT NULL,
  amount_due  NUMERIC(10, 2) NOT NULL,
  is_active   BOOLEAN DEFAULT TRUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id         SERIAL PRIMARY KEY,
  user_id    UUID REFERENCES users(id) NOT NULL,
  message    TEXT NOT NULL,
  is_read    BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── SECTION 3: Indexes ──────────────────────────────────────
-- Only on columns that are actually filtered/joined on

CREATE INDEX IF NOT EXISTS idx_students_user_id      ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_student  ON registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_registration    ON grades(registration_id);
CREATE INDEX IF NOT EXISTS idx_financial_holds_student ON financial_holds(student_id, is_active);
CREATE INDEX IF NOT EXISTS idx_notifications_user     ON notifications(user_id, is_read);

-- ── SECTION 4: Row Level Security (RLS) ─────────────────────
-- RLS ensures data isolation at the DATABASE level, not just the API.
-- Even a bug in your API code cannot leak cross-student data.

ALTER TABLE students        ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades          ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications   ENABLE ROW LEVEL SECURITY;

-- NOTE: auth.uid() is a helper function provided by Neon Auth.
-- It reads the JWT sub claim injected into the session by your API middleware.

-- Students: each student sees only their own record
DROP POLICY IF EXISTS "student_own_record" ON students;
CREATE POLICY "student_own_record" ON students
  FOR SELECT
  USING (
    auth.user_id() = user_id
  );

-- Registrar/admissions can see all students
DROP POLICY IF EXISTS "admin_view_students" ON students;
CREATE POLICY "admin_view_students" ON students
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.user_id()
        AND u.role IN ('registrar', 'admissions_officer', 'president', 'it_admin')
    )
  );

-- Grades: student sees only their own; lecturers see grades for their courses
DROP POLICY IF EXISTS "student_own_grades" ON grades;
CREATE POLICY "student_own_grades" ON grades
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM registrations r
      JOIN students s ON r.student_id = s.id
      WHERE r.id = grades.registration_id
        AND s.user_id = auth.user_id()
    )
  );

DROP POLICY IF EXISTS "lecturer_course_grades" ON grades;
CREATE POLICY "lecturer_course_grades" ON grades
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM registrations r
      JOIN course_offerings co ON r.course_offering_id = co.id
      WHERE r.id = grades.registration_id
        AND co.lecturer_id = auth.user_id()
    )
  );

-- Financial holds: student sees own; finance officers see all
DROP POLICY IF EXISTS "student_own_holds" ON financial_holds;
CREATE POLICY "student_own_holds" ON financial_holds
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = financial_holds.student_id
        AND s.user_id = auth.user_id()
    )
  );

DROP POLICY IF EXISTS "finance_all_holds" ON financial_holds;
CREATE POLICY "finance_all_holds" ON financial_holds
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.user_id()
        AND u.role IN ('finance_officer', 'president', 'it_admin')
    )
  );

-- Notifications: users see only their own
DROP POLICY IF EXISTS "own_notifications" ON notifications;
CREATE POLICY "own_notifications" ON notifications
  FOR ALL
  USING (user_id = auth.user_id());

-- ── SECTION 5: Triggers ──────────────────────────────────────

-- TRIGGER: Block course registration if student has an active financial hold
CREATE OR REPLACE FUNCTION check_financial_holds()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM financial_holds
    WHERE student_id = NEW.student_id
      AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Cannot register: Active financial hold exists for this student.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_registration_on_hold ON registrations;
CREATE TRIGGER prevent_registration_on_hold
  BEFORE INSERT ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION check_financial_holds();

-- TRIGGER: Auto-create student record when an application is accepted
-- (Requires an applications table — extend when Admissions module is built)

-- ── SECTION 6: Verify ────────────────────────────────────────
-- Run this SELECT after migration to confirm all tables exist

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
