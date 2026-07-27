import { Hono } from 'hono';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as campusSchema from '../../../../packages/db/campus-services-schema';
import type { Bindings } from '../index';

type CampusVariables = { campusDb: ReturnType<typeof drizzle<typeof campusSchema>> };

const campusRouter = new Hono<{ Bindings: Bindings; Variables: CampusVariables }>();

campusRouter.use('*', async (c, next) => {
  const sql = neon(c.env.CAMPUS_DATABASE_URL);
  c.set('campusDb', drizzle(sql, { schema: campusSchema }));
  await next();
});

// GET /api/v1/campus/hostels
campusRouter.get('/hostels', async (c) => {
  const db = c.get('campusDb');
  const hostels = await db.select().from(campusSchema.hostels);
  return c.json(hostels);
});

// GET /api/v1/campus/hostels/:id/allocations
campusRouter.get('/hostels/:id/allocations', async (c) => {
  const db = c.get('campusDb');
  const hostelId = parseInt(c.req.param('id'));
  const allocations = await db
    .select()
    .from(campusSchema.hostelAllocations)
    .where(eq(campusSchema.hostelAllocations.hostelId, hostelId));
  return c.json(allocations);
});

// POST /api/v1/campus/hostels/allocate
campusRouter.post('/hostels/allocate', async (c) => {
  const db = c.get('campusDb');
  const body = await c.req.json<typeof campusSchema.hostelAllocations.$inferInsert>();
  const [alloc] = await db.insert(campusSchema.hostelAllocations).values(body).returning();
  return c.json(alloc, 201);
});

// GET /api/v1/campus/transport
campusRouter.get('/transport', async (c) => {
  const db = c.get('campusDb');
  const routes = await db.select().from(campusSchema.transportRoutes);
  return c.json(routes);
});

// GET /api/v1/campus/transport/passes
campusRouter.get('/transport/passes', async (c) => {
  const db = c.get('campusDb');
  const passes = await db
    .select({
      id: campusSchema.transportPasses.id,
      validFrom: campusSchema.transportPasses.validFrom,
      validUntil: campusSchema.transportPasses.validUntil,
      issuedAt: campusSchema.transportPasses.issuedAt,
      routeName: campusSchema.transportRoutes.routeName,
      vehicleNumber: campusSchema.transportRoutes.vehicleNumber,
    })
    .from(campusSchema.transportPasses)
    .innerJoin(campusSchema.transportRoutes, eq(campusSchema.transportPasses.routeId, campusSchema.transportRoutes.id));
  return c.json(passes);
});

// POST /api/v1/campus/transport/passes
campusRouter.post('/transport/passes', async (c) => {
  const db = c.get('campusDb');
  const body = await c.req.json<typeof campusSchema.transportPasses.$inferInsert>();
  const [pass] = await db.insert(campusSchema.transportPasses).values(body).returning();
  return c.json(pass, 201);
});

export default campusRouter;
