import { pgTable, serial, text, timestamp, boolean, uuid, decimal, date } from 'drizzle-orm/pg-core';

export const books = pgTable('books', {
  id: serial('id').primaryKey(),
  isbn: text('isbn').notNull().unique(),
  title: text('title').notNull(),
  author: text('author').notNull(),
  publisher: text('publisher'),
  publishedYear: text('published_year'),
  copiesTotal: serial('copies_total').notNull(),
  copiesAvailable: serial('copies_available').notNull(),
});

export const borrowingRecords = pgTable('borrowing_records', {
  id: serial('id').primaryKey(),
  bookId: serial('book_id').references(() => books.id).notNull(),
  userId: uuid('user_id').notNull(), // Loosely references Neon Auth user ID from core-db (students/staff)
  borrowedAt: timestamp('borrowed_at').defaultNow().notNull(),
  dueDate: date('due_date').notNull(),
  returnedAt: timestamp('returned_at'),
});

export const libraryFines = pgTable('library_fines', {
  id: serial('id').primaryKey(),
  borrowingRecordId: serial('borrowing_record_id').references(() => borrowingRecords.id).notNull().unique(),
  userId: uuid('user_id').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  isPaid: boolean('is_paid').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
