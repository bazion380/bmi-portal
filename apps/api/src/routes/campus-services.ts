import { Hono } from 'hono';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as campusSchema from '../../../../packages/db/campus-services-schema';
import { Bindings } from '../index';

const campusServicesRouter = new Hono<{ Bindings: Bindings }>();

// Middleware to inject Campus Services DB instance
campusServicesRouter.use('*', async (c, next) => {
  const sql = neon(c.env.CAMPUS_DATABASE_URL);
  const db = drizzle(sql, { schema: campusSchema });
  c.set('campusDb', db);
  await next();
});

campusServicesRouter.get('/hostels', async (c) => {
  const db = c.get('campusDb');
  return c.json({ module: 'Campus Services', endpoint: '/hostels' });
});

campusServicesRouter.get('/transport', async (c) => {
  const db = c.get('campusDb');
  return c.json({ module: 'Campus Services', endpoint: '/transport' });
});

export default campusServicesRouter;
