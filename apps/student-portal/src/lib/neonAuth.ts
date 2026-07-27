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

export async function signInWithPassword(email: string, password: string): Promise<AuthTokenResponse> {
  if (!NEON_AUTH_BASE) {
    // Dev fallback — works while VITE_NEON_AUTH_URL is not set
    await new Promise((r) => setTimeout(r, 500));
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

export function signOut() {
  localStorage.removeItem('bmi_token');
  localStorage.removeItem('bmi_user');
}
