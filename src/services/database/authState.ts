import { learningStorage } from '@/features/learning/lib/storage';
import type { LearningUser } from '@/features/learning/types';

export type DatabaseUser = LearningUser & {
  uid: string;
  displayName?: string | null;
};

const AUTH_EVENT = 'learnpaddi-auth-change';

export function toDatabaseUser(user: LearningUser): DatabaseUser {
  return {
    ...user,
    uid: user.id,
    displayName: user.name,
  };
}

export function getCurrentUser(): DatabaseUser | null {
  const user = learningStorage.getUser();
  return user ? toDatabaseUser(user) : null;
}

export function notifyAuthChanged() {
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function subscribeAuthChanged(callback: () => void) {
  window.addEventListener(AUTH_EVENT, callback);
  window.addEventListener('storage', callback);

  return () => {
    window.removeEventListener(AUTH_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}
