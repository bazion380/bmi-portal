import { Hono } from 'hono';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as alumniSchema from '../../../../packages/db/alumni-schema';
import type { Bindings } from '../index';

type AlumniVariables = { alumniDb: ReturnType<typeof drizzle<typeof alumniSchema>> };

const alumniRouter = new Hono<{ Bindings: Bindings; Variables: AlumniVariables }>();

alumniRouter.use('*', async (c, next) => {
  const sql = neon(c.env.ALUMNI_DATABASE_URL);
  c.set('alumniDb', drizzle(sql, { schema: alumniSchema }));
  await next();
});

// GET /api/v1/alumni/profiles
alumniRouter.get('/profiles', async (c) => {
  const db = c.get('alumniDb');
  const profiles = await db.select().from(alumniSchema.alumniProfiles);
  return c.json(profiles);
});

// POST /api/v1/alumni/profiles
alumniRouter.post('/profiles', async (c) => {
  const db = c.get('alumniDb');
  const body = await c.req.json<typeof alumniSchema.alumniProfiles.$inferInsert>();
  const [created] = await db.insert(alumniSchema.alumniProfiles).values(body).returning();
  return c.json(created, 201);
});

// GET /api/v1/alumni/events
alumniRouter.get('/events', async (c) => {
  const db = c.get('alumniDb');
  const events = await db.select().from(alumniSchema.events);
  return c.json(events);
});

// POST /api/v1/alumni/events
alumniRouter.post('/events', async (c) => {
  const db = c.get('alumniDb');
  const body = await c.req.json<typeof alumniSchema.events.$inferInsert>();
  const [created] = await db.insert(alumniSchema.events).values(body).returning();
  return c.json(created, 201);
});

// POST /api/v1/alumni/events/:id/register
alumniRouter.post('/events/:id/register', async (c) => {
  const db = c.get('alumniDb');
  const eventId = parseInt(c.req.param('id'));
  const body = await c.req.json<{ alumniId: number }>();
  const [reg] = await db
    .insert(alumniSchema.eventRegistrations)
    .values({ eventId, alumniId: body.alumniId })
    .returning();
  return c.json(reg, 201);
});

// GET /api/v1/alumni/donations
alumniRouter.get('/donations', async (c) => {
  const db = c.get('alumniDb');
  const donations = await db.select().from(alumniSchema.donations);
  return c.json(donations);
});

// POST /api/v1/alumni/donations
alumniRouter.post('/donations', async (c) => {
  const db = c.get('alumniDb');
  const body = await c.req.json<typeof alumniSchema.donations.$inferInsert>();
  const [created] = await db.insert(alumniSchema.donations).values(body).returning();
  return c.json(created, 201);
});

export default alumniRouter;
