import { Hono } from 'hono';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as hrSchema from '../../../../packages/db/hr-schema';
import type { Bindings } from '../index';

type HrVariables = { hrDb: ReturnType<typeof drizzle<typeof hrSchema>> };

const hrRouter = new Hono<{ Bindings: Bindings; Variables: HrVariables }>();

// Inject HR DB per-request
hrRouter.use('*', async (c, next) => {
  const sql = neon(c.env.HR_DATABASE_URL);
  c.set('hrDb', drizzle(sql, { schema: hrSchema }));
  await next();
});

// GET /api/v1/hr/staff
hrRouter.get('/staff', async (c) => {
  const db = c.get('hrDb');
  const staffList = await db.select().from(hrSchema.staff);
  return c.json(staffList);
});

// GET /api/v1/hr/staff/:id
hrRouter.get('/staff/:id', async (c) => {
  const db = c.get('hrDb');
  const id = parseInt(c.req.param('id'));
  const [member] = await db.select().from(hrSchema.staff).where(eq(hrSchema.staff.id, id));
  if (!member) return c.json({ error: 'Staff member not found' }, 404);
  return c.json(member);
});

// GET /api/v1/hr/leave-requests
hrRouter.get('/leave-requests', async (c) => {
  const db = c.get('hrDb');
  const requests = await db.select().from(hrSchema.leaveRequests);
  return c.json(requests);
});

// POST /api/v1/hr/leave-requests
hrRouter.post('/leave-requests', async (c) => {
  const db = c.get('hrDb');
  const body = await c.req.json<typeof hrSchema.leaveRequests.$inferInsert>();
  const [created] = await db.insert(hrSchema.leaveRequests).values(body).returning();
  return c.json(created, 201);
});

// PATCH /api/v1/hr/leave-requests/:id
hrRouter.patch('/leave-requests/:id', async (c) => {
  const db = c.get('hrDb');
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json<{ status: 'approved' | 'rejected' }>();
  const [updated] = await db
    .update(hrSchema.leaveRequests)
    .set({ status: body.status })
    .where(eq(hrSchema.leaveRequests.id, id))
    .returning();
  return c.json(updated);
});

// GET /api/v1/hr/payroll
hrRouter.get('/payroll', async (c) => {
  const db = c.get('hrDb');
  const records = await db.select().from(hrSchema.payrollRecords);
  return c.json(records);
});

export default hrRouter;
