import {
  loginLearningUser,
  registerLearningUser,
} from '@/features/learning/api/learningApi';
import { learningStorage } from '@/features/learning/lib/storage';
import { notifyAuthChanged, toDatabaseUser, type DatabaseUser } from '@/services/database/authState';

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'trainer';
}

export interface UserCredential {
  user: DatabaseUser;
}

export const register = async (payload: RegisterPayload): Promise<DatabaseUser> => {
  const response = await registerLearningUser({
    name: payload.name,
    email: payload.email,
    password: payload.password,
  });
  const user = toDatabaseUser({ ...response.user, role: payload.role });
  learningStorage.setToken(response.token);
  learningStorage.setUser(user);
  notifyAuthChanged();
  return user;
};

export const login = async (email: string, password: string): Promise<UserCredential> => {
  const response = await loginLearningUser({ email, password });
  const user = toDatabaseUser(response.user);
  learningStorage.setToken(response.token);
  learningStorage.setUser(user);
  notifyAuthChanged();
  return { user };
};

export const googleSignIn = async (): Promise<UserCredential> => {
  throw new Error('Google sign-in is not configured for database auth.');
};

export const logout = async (): Promise<void> => {
  learningStorage.clear();
  notifyAuthChanged();
};

export const resetPassword = async (_email: string): Promise<void> => {
  void _email;
  throw new Error('Password reset is not configured for database auth.');
};

export const getAuthErrorMessage = (error: unknown, fallback: string): string => {
  return error instanceof Error ? error.message : fallback;
};
