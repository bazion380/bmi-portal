import { Context, Next } from 'hono';
import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';

// ─── Types ────────────────────────────────────────────────────────────────────
interface NeonAuthPayload extends JWTPayload {
  sub: string;           // Neon Auth user ID (UUID)
  email?: string;
  role?: string;         // Custom claim we set in Neon Auth "Extra Claims" config
}

// ─── JWKS cache (module-level — survives across requests in the same isolate) ─
// Neon Auth publishes its JWKS at this standard path for your project.
// The URL format is: https://<your-neon-project-host>/.well-known/jwks.json
// Set NEON_AUTH_JWKS_URL as a secret in .dev.vars and wrangler secrets.
let jwksCache: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJWKS(jwksUrl: string) {
  if (!jwksCache) {
    jwksCache = createRemoteJWKSet(new URL(jwksUrl));
  }
  return jwksCache;
}

// ─── Middleware ───────────────────────────────────────────────────────────────
export const verifyAuth = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: Missing Bearer token' }, 401);
  }

  const token = authHeader.slice(7);
  const jwksUrl = (c.env as any).NEON_AUTH_JWKS_URL as string;

  if (!jwksUrl) {
    // Fallback to dev mock if NEON_AUTH_JWKS_URL is not set
    console.warn('[auth] NEON_AUTH_JWKS_URL not set — using dev mock user');
    c.set('user', { id: 'dev-mock-user-id', role: 'student' });
    await next();
    return;
  }

  try {
    const JWKS = getJWKS(jwksUrl);

    const { payload } = await jwtVerify<NeonAuthPayload>(token, JWKS, {
      // Neon Auth issues tokens with audience 'authenticated'
      // Uncomment when you confirm your Neon Auth audience claim:
      // audience: 'authenticated',
    });

    const userId = payload.sub;
    if (!userId) {
      return c.json({ error: 'Unauthorized: Token missing subject claim' }, 401);
    }

    // Set the decoded user on context — available in all downstream route handlers
    c.set('user', {
      id: userId,
      role: payload.role ?? 'student',
      email: payload.email ?? '',
    });

    // ── Set Postgres session variable so RLS policies can use auth.uid() ──
    // This is the bridge between the JWT and Postgres Row-Level Security.
    // The Neon serverless driver supports running raw SQL before your queries.
    // We do this by setting a session-local variable that your RLS policies read.
    //
    // In your RLS policies, replace auth.uid() with:
    //   current_setting('request.jwt.claim.sub', true)::uuid
    //
    // The actual session variable injection happens in individual route handlers
    // using: await db.execute(sql`SET LOCAL "request.jwt.claim.sub" = ${userId}`)
    // This is done per-transaction to avoid leaking between requests.

    await next();
  } catch (err: any) {
    console.error('[auth] JWT verification failed:', err?.message);
    return c.json({ error: 'Unauthorized: Invalid or expired token' }, 401);
  }
};
