import { Hono } from 'hono';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as hrSchema from '../../../../packages/db/hr-schema';
import { Bindings } from '../index';

const hrRouter = new Hono<{ Bindings: Bindings }>();

// Middleware to inject HR DB instance
hrRouter.use('*', async (c, next) => {
  const sql = neon(c.env.HR_DATABASE_URL);
  const db = drizzle(sql, { schema: hrSchema });
  c.set('hrDb', db);
  await next();
});

hrRouter.get('/staff', async (c) => {
  const db = c.get('hrDb');
  // const staffList = await db.query.staff.findMany();
  // return c.json(staffList);
  return c.json({ module: 'HR', endpoint: '/staff' });
});

hrRouter.get('/leave-requests', async (c) => {
  const db = c.get('hrDb');
  return c.json({ module: 'HR', endpoint: '/leave-requests' });
});

export default hrRouter;
