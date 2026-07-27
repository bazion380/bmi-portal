/**
 * Shared API client for the Student Portal.
 * Attaches the stored JWT to every request automatically.
 */

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8787';

export interface Grade {
  id: number;
  grade: string | null;
  letterGrade: string | null;
  gradedAt: string;
  term: string;
  courseCode: string;
  courseTitle: string;
  credits: number;
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
  studentId: number;
  reason: string;
  amountDue: string;
  isActive: boolean;
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

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

export const api = {
  getGrades:       () => request<Grade[]>('/api/v1/academics/grades'),
  getOfferings:    () => request<CourseOffering[]>('/api/v1/academics/offerings'),
  registerCourse:  (courseOfferingId: number) =>
    request<{ success: boolean }>('/api/v1/academics/register', {
      method: 'POST',
      body: JSON.stringify({ courseOfferingId }),
    }),
  getHolds:          () => request<FinancialHold[]>('/api/v1/finance/holds'),
  getNotifications:  () => request<Notification[]>('/api/v1/notifications'),
  markNotifRead:     (id: number) =>
    request<{ success: boolean }>(`/api/v1/notifications/${id}/read`, { method: 'PATCH' }),
};
