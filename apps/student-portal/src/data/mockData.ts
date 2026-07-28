/**
 * Mock data has been removed — all data now comes from the live Neon PostgreSQL database
 * via the Express API at /api/*.
 *
 * These empty exports are kept for backward compatibility with any remaining
 * import statements that haven't been updated yet. Remove after full refactor.
 */
import {
  Student,
  Application,
  Course,
  StudentCourseEnrollment,
  FeeInvoice,
  StaffRecord,
  AuditLog,
  LibraryBook,
  LibraryLoan,
  AdvisingNote,
  AlumniRecord
} from '../types';

export const INITIAL_STUDENTS: Student[] = [];
export const INITIAL_APPLICATIONS: Application[] = [];
export const INITIAL_COURSES: Course[] = [];
export const INITIAL_ENROLLMENTS: StudentCourseEnrollment[] = [];
export const INITIAL_INVOICES: FeeInvoice[] = [];
export const INITIAL_STAFF: StaffRecord[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
export const INITIAL_BOOKS: LibraryBook[] = [];
export const INITIAL_LOANS: LibraryLoan[] = [];
export const INITIAL_ADVISING_NOTES: AdvisingNote[] = [];
export const INITIAL_ALUMNI: AlumniRecord[] = [];
