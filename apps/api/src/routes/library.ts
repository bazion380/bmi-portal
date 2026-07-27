import { Hono } from 'hono';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as librarySchema from '../../../../packages/db/library-schema';
import { Bindings } from '../index';

const libraryRouter = new Hono<{ Bindings: Bindings }>();

// Middleware to inject Library DB instance
libraryRouter.use('*', async (c, next) => {
  const sql = neon(c.env.LIBRARY_DATABASE_URL);
  const db = drizzle(sql, { schema: librarySchema });
  c.set('libraryDb', db);
  await next();
});

libraryRouter.get('/books', async (c) => {
  const db = c.get('libraryDb');
  return c.json({ module: 'Library', endpoint: '/books' });
});

libraryRouter.get('/borrowing', async (c) => {
  const db = c.get('libraryDb');
  return c.json({ module: 'Library', endpoint: '/borrowing' });
});

export default libraryRouter;
