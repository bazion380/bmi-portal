/**
 * Mock data has been removed — the legacy file-based JSON database (db.json) is gone.
 * All data is now persisted in and served from Neon PostgreSQL via Prisma + Express API.
 *
 * These empty exports exist only to prevent import errors in legacy code paths.
 * They can be safely removed once all import sites are updated.
 */

export const INITIAL_STUDENTS: any[] = [];
export const INITIAL_APPLICATIONS: any[] = [];
export const INITIAL_COURSES: any[] = [];
export const INITIAL_ENROLLMENTS: any[] = [];
export const INITIAL_INVOICES: any[] = [];
export const INITIAL_STAFF: any[] = [];
export const INITIAL_AUDIT_LOGS: any[] = [];
export const INITIAL_BOOKS: any[] = [];
export const INITIAL_LOANS: any[] = [];
export const INITIAL_ADVISING_NOTES: any[] = [];
export const INITIAL_ALUMNI: any[] = [];
