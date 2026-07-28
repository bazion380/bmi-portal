import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and } from 'drizzle-orm';
import * as schema from '../../../packages/db/schema';
import { verifyAuth } from './middleware/auth';

// Import auxiliary routers
import hrRouter from './routes/hr';
import libraryRouter from './routes/library';
import alumniRouter from './routes/alumni';
import campusServicesRouter from './routes/campus-services';

export type Bindings = {
  DATABASE_URL: string;
  HR_DATABASE_URL: string;
  LIBRARY_DATABASE_URL: string;
  ALUMNI_DATABASE_URL: string;
  CAMPUS_DATABASE_URL: string;
};

// Extend Hono context variables
export type Variables = {
  db: ReturnType<typeof drizzle<typeof schema>>;
  user: { id: string; role: string };
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ─── Global Middleware ───────────────────────────────────────────────────────
app.use('*', cors({ origin: '*', allowHeaders: ['Authorization', 'Content-Type'] }));

// ─── Core DB: inject per-request (avoids stale connections in serverless) ───
app.use('/api/*', async (c, next) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql, { schema });
  c.set('db', db);
  await next();
});

// ─── Public Routes ────────────────────────────────────────────────────────────
app.get('/health', (c) =>
  c.json({ status: 'ok', service: 'BMI UMS API', timestamp: new Date().toISOString() })
);

// ─── Protected API (All routes below require a valid Neon Auth JWT) ───────────
const api = new Hono<{ Bindings: Bindings; Variables: Variables }>();
api.use('*', verifyAuth);

// ── Admissions ──────────────────────────────────────────────────────────────
api.get('/admissions/applications', async (c) => {
  const db = c.get('db');
  // TODO: filter by role — admissions_officers see all; applicant sees own
  return c.json({ message: 'Admissions list endpoint — implement query' });
});

api.post('/admissions/applications', async (c) => {
  const db = c.get('db');
  const body = await c.req.json();
  // TODO: insert into applications table
  return c.json({ message: 'Application submitted', data: body }, 201);
});

// ── Academics ───────────────────────────────────────────────────────────────
api.get('/academics/courses', async (c) => {
  const db = c.get('db');
  const courses = await db.select().from(schema.courses);
  return c.json(courses);
});

api.get('/academics/offerings', async (c) => {
  const db = c.get('db');
  const term = c.req.query('term');
  const offerings = await db
    .select({
      id: schema.courseOfferings.id,
      term: schema.courseOfferings.term,
      capacity: schema.courseOfferings.capacity,
      courseCode: schema.courses.code,
      courseTitle: schema.courses.title,
      courseCredits: schema.courses.credits,
    })
    .from(schema.courseOfferings)
    .innerJoin(schema.courses, eq(schema.courseOfferings.courseId, schema.courses.id));

  return c.json(offerings);
});

api.post('/academics/register', async (c) => {
  const db = c.get('db');
  const user = c.get('user');
  const body = await c.req.json<{ courseOfferingId: number }>();

  // Find student record for this user
  const [student] = await db
    .select()
    .from(schema.students)
    .where(eq(schema.students.userId, user.id));

  if (!student) return c.json({ error: 'Student record not found' }, 404);

  // DB trigger 'prevent_registration_on_hold' enforces the financial hold check at DB level
  try {
    const [registration] = await db
      .insert(schema.registrations)
      .values({ studentId: student.id, courseOfferingId: body.courseOfferingId })
      .returning();
    return c.json(registration, 201);
  } catch (err: any) {
    // The Postgres trigger raises an exception with this message
    if (err?.message?.includes('financial hold')) {
      return c.json({ error: 'Cannot register: you have an active financial hold.' }, 403);
    }
    throw err;
  }
});

api.get('/academics/grades', async (c) => {
  const db = c.get('db');
  const user = c.get('user');

  const [student] = await db
    .select()
    .from(schema.students)
    .where(eq(schema.students.userId, user.id));

  if (!student) return c.json({ error: 'Student record not found' }, 404);

  // RLS policy on 'grades' enforces that a student can only see their own
  const gradesData = await db
    .select({
      gradeId: schema.grades.id,
      grade: schema.grades.grade,
      letterGrade: schema.grades.letterGrade,
      gradedAt: schema.grades.gradedAt,
      courseCode: schema.courses.code,
      courseTitle: schema.courses.title,
      credits: schema.courses.credits,
      term: schema.courseOfferings.term,
    })
    .from(schema.grades)
    .innerJoin(schema.registrations, eq(schema.grades.registrationId, schema.registrations.id))
    .innerJoin(schema.courseOfferings, eq(schema.registrations.courseOfferingId, schema.courseOfferings.id))
    .innerJoin(schema.courses, eq(schema.courseOfferings.courseId, schema.courses.id))
    .where(eq(schema.registrations.studentId, student.id));

  return c.json(gradesData);
});

// ── Finance ─────────────────────────────────────────────────────────────────
api.get('/finance/holds', async (c) => {
  const db = c.get('db');
  const user = c.get('user');

  const [student] = await db
    .select()
    .from(schema.students)
    .where(eq(schema.students.userId, user.id));

  if (!student) return c.json([]);

  const holds = await db
    .select()
    .from(schema.financialHolds)
    .where(
      and(
        eq(schema.financialHolds.studentId, student.id),
        eq(schema.financialHolds.isActive, true)
      )
    );

  return c.json(holds);
});

// ── Notifications (polling) ─────────────────────────────────────────────────
api.get('/notifications', async (c) => {
  const db = c.get('db');
  const user = c.get('user');

  const notifs = await db
    .select()
    .from(schema.notifications)
    .where(eq(schema.notifications.userId, user.id));

  return c.json(notifs);
});

api.patch('/notifications/:id/read', async (c) => {
  const db = c.get('db');
  const id = parseInt(c.req.param('id'));

  await db
    .update(schema.notifications)
    .set({ isRead: true })
    .where(eq(schema.notifications.id, id));

  return c.json({ success: true });
});

// ─── Mount auxiliary routers ──────────────────────────────────────────────────
api.route('/hr', hrRouter);
api.route('/library', libraryRouter);
api.route('/alumni', alumniRouter);
api.route('/campus', campusServicesRouter);

// Mount all protected routes under /api/v1
app.route('/api/v1', api);

export default app;
