import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/services/database/authService';
import { clearPendingCourseIntent } from '@/student/lib/courseIntent';

export type AppRole = 'student' | 'trainer' | null;

export interface DemoProfile {
  id: string;
  name: string;
  email: string;
  role: Exclude<AppRole, null>;
}

interface RoleContextValue {
  role: AppRole;
  setRole: (role: AppRole) => void;
  logoutCurrentUser: () => Promise<void>;
  profile: DemoProfile | null;
  loading: boolean;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const role: AppRole = user?.role || null;

  const profile = useMemo<DemoProfile | null>(() => {
    if (!user || !user.role) {
      return null;
    }

    return {
      id: user.uid,
      name: user.doc?.name || user.displayName || user.email?.split('@')[0] || 'LearnPaddi User',
      email: user.doc?.email || user.email || '',
      role: user.role,
    };
  }, [user]);

  const logoutCurrentUser = useCallback(async () => {
    clearPendingCourseIntent();
    await logout();
  }, []);

  const setRole = useCallback((nextRole: AppRole) => {
    if (nextRole === null) {
      void logoutCurrentUser();
    }
  }, [logoutCurrentUser]);

  const value = useMemo<RoleContextValue>(() => ({
    role,
    setRole,
    logoutCurrentUser,
    profile,
    loading,
  }), [loading, logoutCurrentUser, profile, role, setRole]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export const useRoleContext = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRoleContext must be used within a RoleProvider');
  }
  return context;
};
