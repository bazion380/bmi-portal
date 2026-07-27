import { pgTable, serial, text, timestamp, date, uuid, decimal } from 'drizzle-orm/pg-core';

export const alumniProfiles = pgTable('alumni_profiles', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().unique(), // Maps loosely to core-db user ID
  graduationYear: text('graduation_year').notNull(),
  degreeObtained: text('degree_obtained').notNull(),
  currentEmployer: text('current_employer'),
  currentJobTitle: text('current_job_title'),
  linkedinUrl: text('linkedin_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  eventDate: timestamp('event_date').notNull(),
  location: text('location'),
  capacity: serial('capacity'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const eventRegistrations = pgTable('event_registrations', {
  id: serial('id').primaryKey(),
  eventId: serial('event_id').references(() => events.id).notNull(),
  alumniId: serial('alumni_id').references(() => alumniProfiles.id).notNull(),
  registeredAt: timestamp('registered_at').defaultNow().notNull(),
});

export const donations = pgTable('donations', {
  id: serial('id').primaryKey(),
  alumniId: serial('alumni_id').references(() => alumniProfiles.id).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  purpose: text('purpose'), // e.g., 'Scholarship Fund', 'Campus Development'
  donatedAt: timestamp('donated_at').defaultNow().notNull(),
});
