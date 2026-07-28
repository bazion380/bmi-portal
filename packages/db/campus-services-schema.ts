import { pgTable, serial, text, timestamp, date, uuid, decimal, integer } from 'drizzle-orm/pg-core';

export const hostels = pgTable('hostels', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  capacity: integer('capacity').notNull(),
  location: text('location'),
});

export const hostelAllocations = pgTable('hostel_allocations', {
  id: serial('id').primaryKey(),
  hostelId: integer('hostel_id').references(() => hostels.id).notNull(),
  userId: uuid('user_id').notNull(), // Loosely references student/staff user ID
  roomNumber: text('room_number').notNull(),
  academicTerm: text('academic_term').notNull(), // e.g., 'Fall 2024'
  allocatedAt: timestamp('allocated_at').defaultNow().notNull(),
});

export const transportRoutes = pgTable('transport_routes', {
  id: serial('id').primaryKey(),
  routeName: text('route_name').notNull(),
  description: text('description'),
  vehicleNumber: text('vehicle_number'),
});

export const transportPasses = pgTable('transport_passes', {
  id: serial('id').primaryKey(),
  routeId: integer('route_id').references(() => transportRoutes.id).notNull(),
  userId: uuid('user_id').notNull(),
  validFrom: date('valid_from').notNull(),
  validUntil: date('valid_until').notNull(),
  issuedAt: timestamp('issued_at').defaultNow().notNull(),
});
