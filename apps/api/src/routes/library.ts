import { Hono } from 'hono';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, like } from 'drizzle-orm';
import * as librarySchema from '../../../../packages/db/library-schema';
import type { Bindings } from '../index';

type LibVariables = { libraryDb: ReturnType<typeof drizzle<typeof librarySchema>> };

const libraryRouter = new Hono<{ Bindings: Bindings; Variables: LibVariables }>();

libraryRouter.use('*', async (c, next) => {
  const sql = neon(c.env.LIBRARY_DATABASE_URL);
  c.set('libraryDb', drizzle(sql, { schema: librarySchema }));
  await next();
});

// GET /api/v1/library/books?q=searchterm
libraryRouter.get('/books', async (c) => {
  const db = c.get('libraryDb');
  const q = c.req.query('q');
  const books = q
    ? await db.select().from(librarySchema.books).where(like(librarySchema.books.title, `%${q}%`))
    : await db.select().from(librarySchema.books);
  return c.json(books);
});

// GET /api/v1/library/books/:id
libraryRouter.get('/books/:id', async (c) => {
  const db = c.get('libraryDb');
  const id = parseInt(c.req.param('id'));
  const [book] = await db.select().from(librarySchema.books).where(eq(librarySchema.books.id, id));
  if (!book) return c.json({ error: 'Book not found' }, 404);
  return c.json(book);
});

// GET /api/v1/library/borrowing
libraryRouter.get('/borrowing', async (c) => {
  const db = c.get('libraryDb');
  const records = await db
    .select({
      id: librarySchema.borrowingRecords.id,
      borrowedAt: librarySchema.borrowingRecords.borrowedAt,
      dueDate: librarySchema.borrowingRecords.dueDate,
      returnedAt: librarySchema.borrowingRecords.returnedAt,
      bookTitle: librarySchema.books.title,
      bookIsbn: librarySchema.books.isbn,
    })
    .from(librarySchema.borrowingRecords)
    .innerJoin(librarySchema.books, eq(librarySchema.borrowingRecords.bookId, librarySchema.books.id));
  return c.json(records);
});

// POST /api/v1/library/borrowing (checkout)
libraryRouter.post('/borrowing', async (c) => {
  const db = c.get('libraryDb');
  const body = await c.req.json<typeof librarySchema.borrowingRecords.$inferInsert>();
  const [record] = await db.insert(librarySchema.borrowingRecords).values(body).returning();
  return c.json(record, 201);
});

// PATCH /api/v1/library/borrowing/:id/return
libraryRouter.patch('/borrowing/:id/return', async (c) => {
  const db = c.get('libraryDb');
  const id = parseInt(c.req.param('id'));
  const [updated] = await db
    .update(librarySchema.borrowingRecords)
    .set({ returnedAt: new Date() })
    .where(eq(librarySchema.borrowingRecords.id, id))
    .returning();
  return c.json(updated);
});

// GET /api/v1/library/fines
libraryRouter.get('/fines', async (c) => {
  const db = c.get('libraryDb');
  const fines = await db.select().from(librarySchema.libraryFines);
  return c.json(fines);
});

export default libraryRouter;
