import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getLearningMe, loginLearningUser, registerLearningUser } from '@/features/learning/api/learningApi';
import { learningStorage } from '@/features/learning/lib/storage';
import type { LearningUser } from '@/features/learning/types';

interface LearningAuthContextValue {
  user: LearningUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
}

export const LearningAuthContext = createContext<LearningAuthContextValue | undefined>(undefined);

export function LearningAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LearningUser | null>(() => learningStorage.getUser());
  const [token, setToken] = useState<string | null>(() => learningStorage.getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await getLearningMe();
        setUser(response.user);
        learningStorage.setUser(response.user);
      } catch {
        learningStorage.clear();
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    void syncUser();
  }, [token]);

  const value = useMemo<LearningAuthContextValue>(() => ({
    user,
    token,
    loading,
    login: async (email, password) => {
      const response = await loginLearningUser({ email, password });
      learningStorage.setToken(response.token);
      learningStorage.setUser(response.user);
      setToken(response.token);
      setUser(response.user);
    },
    register: async (payload) => {
      const response = await registerLearningUser(payload);
      learningStorage.setToken(response.token);
      learningStorage.setUser(response.user);
      setToken(response.token);
      setUser(response.user);
    },
    logout: () => {
      learningStorage.clear();
      setToken(null);
      setUser(null);
    },
  }), [loading, token, user]);

  return <LearningAuthContext.Provider value={value}>{children}</LearningAuthContext.Provider>;
}
