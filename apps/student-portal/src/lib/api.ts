/**
 * Shared API client for the Student Portal.
 * Reads the base URL from the Vite env variable VITE_API_URL.
 */

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8787';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('bmi_token');
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as any).error ?? 'API error');
  }

  return res.json();
}

// ── Typed API helpers ──────────────────────────────────────────────────────

export const api = {
  // Grades
  getGrades: () => request<GradeEntry[]>('/api/v1/academics/grades'),

  // Course offerings
  getOfferings: (term?: string) =>
    request<CourseOffering[]>(`/api/v1/academics/offerings${term ? `?term=${term}` : ''}`),

  // Registration
  registerCourse: (courseOfferingId: number) =>
    request<{ id: number }>('/api/v1/academics/register', {
      method: 'POST',
      body: JSON.stringify({ courseOfferingId }),
    }),

  // Financial holds
  getFinancialHolds: () => request<FinancialHold[]>('/api/v1/finance/holds'),

  // Notifications
  getNotifications: () => request<Notification[]>('/api/v1/notifications'),
  markNotificationRead: (id: number) =>
    request<{ success: boolean }>(`/api/v1/notifications/${id}/read`, { method: 'PATCH' }),
};

// ── Shared Types ───────────────────────────────────────────────────────────

export interface GradeEntry {
  gradeId: number;
  grade: string;
  letterGrade: string;
  gradedAt: string;
  courseCode: string;
  courseTitle: string;
  credits: number;
  term: string;
}

export interface CourseOffering {
  id: number;
  term: string;
  capacity: number;
  courseCode: string;
  courseTitle: string;
  courseCredits: number;
}

export interface FinancialHold {
  id: number;
  reason: string;
  amountDue: string;
  isActive: boolean;
  createdAt: string;
}

export interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}
