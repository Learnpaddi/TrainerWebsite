import type { LearningUser } from '@/features/learning/types';

const USER_KEY = 'learnpaddi-learning-user';

/**
 * @deprecated The backend now uses Firebase Authentication tokens.
 * JWT token storage is no longer needed. Kept for backward compat with cached user data.
 */
export const learningStorage = {
  getToken: () => null,
  setToken: (_token: string) => {},
  clearToken: () => {},
  getUser: (): LearningUser | null => {
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as LearningUser;
    } catch {
      return null;
    }
  },
  setUser: (user: LearningUser) => window.localStorage.setItem(USER_KEY, JSON.stringify(user)),
  clearUser: () => window.localStorage.removeItem(USER_KEY),
  clear: () => {
    window.localStorage.removeItem(USER_KEY);
  },
};

