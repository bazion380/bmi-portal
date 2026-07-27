import { Context, Next } from 'hono';

// This is a stub for the authentication middleware.
// In a real implementation, you would verify the JWT issued by Neon Auth.
// You can use libraries like 'jose' to verify the JWT signature against Neon's JWKS endpoint.

export const verifyAuth = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: Missing or invalid token' }, 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    // TODO: Verify the token using your Neon project's JWKS
    // const payload = await verifyJwt(token, NEON_JWKS_URL);
    
    // For now, we mock a decoded user payload
    const mockUser = {
      id: 'neon-auth-uuid-here',
      role: 'student'
    };

    // Make the user available to the route handlers
    c.set('user', mockUser);
    
    // Pass the token to Postgres so RLS can use `auth.uid()`
    // This is crucial for the "Neon Auth" native integration.
    // Drizzle/Neon HTTP driver allows passing parameters or setting session variables.
    // e.g. await db.execute(sql`set local role authenticated; set local request.jwt.claim.sub = ${mockUser.id}`);
    
    await next();
  } catch (error) {
    return c.json({ error: 'Unauthorized: Invalid token' }, 401);
  }
};
