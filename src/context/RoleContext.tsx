import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

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
  profile: DemoProfile | null;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

const STORAGE_KEY = 'learnpaddi-role';

const demoProfiles: Record<Exclude<AppRole, null>, DemoProfile> = {
  student: {
    id: 'demo-student',
    name: 'Aarav Learner',
    email: 'student@learnpaddi.com',
    role: 'student',
  },
  trainer: {
    id: 'demo-trainer',
    name: 'Meera Trainer',
    email: 'trainer@learnpaddi.com',
    role: 'trainer',
  },
};

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRoleState] = useState<AppRole>(() => {
    if (typeof window === 'undefined') return null;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'student' || stored === 'trainer' ? stored : null;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (role) {
      window.localStorage.setItem(STORAGE_KEY, role);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [role]);

  const value = useMemo<RoleContextValue>(() => ({
    role,
    setRole: setRoleState,
    profile: role ? demoProfiles[role] : null,
  }), [role]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export const useRoleContext = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRoleContext must be used within a RoleProvider');
  }
  return context;
};
