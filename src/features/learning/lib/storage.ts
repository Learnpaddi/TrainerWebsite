import type { LearningUser } from '@/features/learning/types';

const TOKEN_KEY = 'learnpaddi-learning-token';
const USER_KEY = 'learnpaddi-learning-user';

export const learningStorage = {
  getToken: () => window.localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => window.localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => window.localStorage.removeItem(TOKEN_KEY),
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
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  },
};
