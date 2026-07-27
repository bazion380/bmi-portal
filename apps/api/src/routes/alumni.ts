import { Hono } from 'hono';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as alumniSchema from '../../../../packages/db/alumni-schema';
import { Bindings } from '../index';

const alumniRouter = new Hono<{ Bindings: Bindings }>();

// Middleware to inject Alumni DB instance
alumniRouter.use('*', async (c, next) => {
  const sql = neon(c.env.ALUMNI_DATABASE_URL);
  const db = drizzle(sql, { schema: alumniSchema });
  c.set('alumniDb', db);
  await next();
});

alumniRouter.get('/profiles', async (c) => {
  const db = c.get('alumniDb');
  return c.json({ module: 'Alumni', endpoint: '/profiles' });
});

alumniRouter.get('/events', async (c) => {
  const db = c.get('alumniDb');
  return c.json({ module: 'Alumni', endpoint: '/events' });
});

export default alumniRouter;
