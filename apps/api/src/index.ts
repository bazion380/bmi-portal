import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../../packages/db/schema';
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
  // Other bindings like R2 buckets can go here
};

const app = new Hono<{ Bindings: Bindings }>();

// Global middleware
app.use('*', cors());

// Initialize Core Drizzle ORM per request
app.use('*', async (c, next) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql, { schema });
  c.set('db', db);
  await next();
});

// Public routes
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Protected API routes
const api = app.route('/api/v1');

// Apply Neon Auth verification middleware to all /api/v1 routes
api.use('*', verifyAuth);

// --- Core DB Modules ---

api.get('/admissions/applications', async (c) => {
  const db = c.get('db');
  return c.json({ message: 'Admissions endpoint' });
});

api.get('/academics/courses', async (c) => {
  const db = c.get('db');
  const courses = await db.query.courses.findMany();
  return c.json(courses);
});

api.post('/academics/register', async (c) => {
  const db = c.get('db');
  const user = c.get('user'); // populated by auth middleware
  const body = await c.req.json();
  
  return c.json({ status: 'success' });
});

api.get('/finance/holds', async (c) => {
  const db = c.get('db');
  const user = c.get('user');
  
  return c.json([]);
});

api.get('/notifications', async (c) => {
  const db = c.get('db');
  const user = c.get('user');
  
  return c.json([]);
});

// --- Auxiliary DB Modules ---
// Mounting the separated routers for the other 4 Neon databases
api.route('/hr', hrRouter);
api.route('/library', libraryRouter);
api.route('/alumni', alumniRouter);
api.route('/campus', campusServicesRouter);

export default app;
