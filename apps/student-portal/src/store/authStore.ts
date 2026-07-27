import { create } from 'zustand';
import { UserRole } from '../types';

interface AuthState {
  authToken: string | null;
  authUser: { name: string; role: UserRole } | null;
  activeRole: UserRole;
  currentPortal: 'student' | 'staff';
  activeStudentId: string;
  setAuthToken: (token: string | null) => void;
  setAuthUser: (user: { name: string; role: UserRole } | null) => void;
  setActiveRole: (role: UserRole) => void;
  setCurrentPortal: (portal: 'student' | 'staff') => void;
  setActiveStudentId: (id: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Initialize from storage if present (only authUser, as authToken shouldn't be in storage anymore to prevent XSS)
  const savedUser = localStorage.getItem('bmi_ums_auth_user');
  const initialUser = savedUser ? JSON.parse(savedUser) : null;

  return {
    authToken: null,
    authUser: initialUser,
    activeRole: 'student',
    currentPortal: 'student',
    activeStudentId: 'std-101',

    setAuthToken: (token) => {
      set({ authToken: token });
    },

    setAuthUser: (user) => {
      if (user) {
        localStorage.setItem('bmi_ums_auth_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('bmi_ums_auth_user');
      }
      set({ authUser: user });
    },

    setActiveRole: (role) => {
      set({ activeRole: role });
      if (role === 'student') {
        set({ currentPortal: 'student' });
      } else {
        set({ currentPortal: 'staff' });
      }
    },

    setCurrentPortal: (portal) => {
      set({ currentPortal: portal });
      if (portal === 'student') {
        set({ activeRole: 'student' });
      } else if (get().activeRole === 'student') {
        // default staff view
        set({ activeRole: 'president' });
      }
    },

    setActiveStudentId: (id) => {
      set({ activeStudentId: id });
    }
  };
});
