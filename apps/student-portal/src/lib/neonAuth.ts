/**
 * Neon Auth client for the Student Portal.
 *
 * HOW NEON AUTH WORKS:
 * 1. The user logs in → Neon Auth validates credentials → issues a JWT
 * 2. We store that JWT in localStorage
 * 3. Every API request attaches it as: Authorization: Bearer <jwt>
 * 4. The API middleware (auth.ts) verifies the JWT against Neon's JWKS endpoint
 * 5. Postgres RLS policies use the verified user ID to filter rows
 *
 * HOW TO GET YOUR NEON AUTH URLS:
 * → neon.tech → your core-db project → "Auth" tab → enable Neon Auth
 * → You'll see:
 *     Sign-in URL:   https://<project>.neon.tech/auth/v1/token
 *     JWKS URL:      https://<project>.neon.tech/.well-known/jwks.json
 * → Set VITE_NEON_AUTH_URL in .env.local to the sign-in base URL
 */

const NEON_AUTH_BASE = import.meta.env.VITE_NEON_AUTH_URL ?? '';

export interface AuthTokenResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
  user: {
    id: string;
    email: string;
    user_metadata?: {
      full_name?: string;
      role?: string;
      student_id?: string;
      program?: string;
    };
  };
}

/**
 * Sign in with email + password via Neon Auth.
 * Returns the JWT access token and user metadata.
 */
export async function signInWithPassword(
  email: string,
  password: string
): Promise<AuthTokenResponse> {
  if (!NEON_AUTH_BASE) {
    // ── DEV FALLBACK: no Neon Auth URL set ──────────────────────────────────
    // Returns a mock token so you can develop the UI without a live Neon project.
    // Remove this block once VITE_NEON_AUTH_URL is set in .env.local
    console.warn('[neonAuth] VITE_NEON_AUTH_URL not set — using dev mock login');
    await new Promise((r) => setTimeout(r, 500)); // simulate network delay
    if (!email || !password) throw new Error('Email and password are required.');
    return {
      access_token: 'dev-mock-jwt-token',
      token_type: 'bearer',
      expires_in: 3600,
      user: {
        id: 'dev-mock-user-id',
        email,
        user_metadata: {
          full_name: 'Kwame Mensah',
          role: 'student',
          student_id: 'BMI/2024/001',
          program: 'BSc Computer Science',
        },
      },
    };
    // ── END DEV FALLBACK ────────────────────────────────────────────────────
  }

  const res = await fetch(`${NEON_AUTH_BASE}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any)?.error_description ?? 'Login failed. Please check your credentials.');
  }

  return res.json();
}

/** Sign out: clear local storage */
export function signOut() {
  localStorage.removeItem('bmi_token');
  localStorage.removeItem('bmi_user');
}
