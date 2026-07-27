import { 
  pgTable, 
  serial, 
  text, 
  timestamp, 
  boolean, 
  uuid, 
  integer, 
  pgEnum,
  decimal,
  date
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// --- ENUMS ---
export const roleEnum = pgEnum('role', [
  'student', 'lecturer', 'registrar', 'admissions_officer', 
  'finance_officer', 'exam_officer', 'hr_manager', 'advisor', 
  'librarian', 'alumni_officer', 'president', 'it_admin'
]);

export const applicationStatusEnum = pgEnum('application_status', ['pending', 'accepted', 'rejected', 'waitlisted']);
export const enrollmentStatusEnum = pgEnum('enrollment_status', ['enrolled', 'graduated', 'withdrawn', 'suspended']);

// --- CORE TABLES ---

export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // Maps to Neon Auth user.id
  role: roleEnum('role').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id).unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  dateOfBirth: date('date_of_birth').notNull(),
  enrollmentStatus: enrollmentStatusEnum('enrollment_status').default('enrolled').notNull(),
  programId: integer('program_id').references(() => programs.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const programs = pgTable('programs', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  department: text('department').notNull(),
});

export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  title: text('title').notNull(),
  credits: integer('credits').notNull(),
  programId: integer('program_id').references(() => programs.id),
});

export const prerequisites = pgTable('prerequisites', {
  id: serial('id').primaryKey(),
  courseId: integer('course_id').references(() => courses.id).notNull(),
  prerequisiteCourseId: integer('prerequisite_course_id').references(() => courses.id).notNull(),
});

export const courseOfferings = pgTable('course_offerings', {
  id: serial('id').primaryKey(),
  courseId: integer('course_id').references(() => courses.id).notNull(),
  term: text('term').notNull(), // e.g., 'Fall 2024'
  lecturerId: uuid('lecturer_id').references(() => users.id),
  capacity: integer('capacity').notNull(),
});

export const registrations = pgTable('registrations', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id).notNull(),
  courseOfferingId: integer('course_offering_id').references(() => courseOfferings.id).notNull(),
  status: text('status').default('registered').notNull(),
  registeredAt: timestamp('registered_at').defaultNow().notNull(),
});

export const grades = pgTable('grades', {
  id: serial('id').primaryKey(),
  registrationId: integer('registration_id').references(() => registrations.id).notNull().unique(),
  grade: decimal('grade', { precision: 5, scale: 2 }),
  letterGrade: text('letter_grade'),
  gradedAt: timestamp('graded_at').defaultNow().notNull(),
});

export const financialHolds = pgTable('financial_holds', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id).notNull(),
  reason: text('reason').notNull(),
  amountDue: decimal('amount_due', { precision: 10, scale: 2 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- RLS & TRIGGERS (Raw SQL setup script) ---
// Drizzle migrations run these raw SQL blocks to enforce Neon DB level security
export const setupRLSAndTriggers = sql`
  -- Enable RLS
  ALTER TABLE students ENABLE ROW LEVEL SECURITY;
  ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
  ALTER TABLE financial_holds ENABLE ROW LEVEL SECURITY;

  -- Example RLS Policy: Students can only read their own data
  CREATE POLICY "Student can view own record" ON students
    FOR SELECT
    USING (auth.uid() = user_id);

  CREATE POLICY "Student can view own grades" ON grades
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM registrations r
        JOIN students s ON r.student_id = s.id
        WHERE r.id = grades.registration_id AND s.user_id = auth.uid()
      )
    );

  -- Trigger: Prevent registration if financial hold exists
  CREATE OR REPLACE FUNCTION check_financial_holds()
  RETURNS TRIGGER AS $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM financial_holds 
      WHERE student_id = NEW.student_id AND is_active = true
    ) THEN
      RAISE EXCEPTION 'Cannot register: Active financial hold exists for this student.';
    END IF;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER prevent_registration_on_hold
  BEFORE INSERT ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION check_financial_holds();
`;
