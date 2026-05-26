import { useEffect, useState } from 'react';
import {
  getCurrentUser,
  subscribeAuthChanged,
  type DatabaseUser,
} from '@/services/database/authState';
import { getUserDoc, type UserDoc } from '@/services/database/userService';

export interface AuthUser extends DatabaseUser {
  role: 'student' | 'trainer';
  doc?: UserDoc | null;
}

export const useAuth = () => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authResolved, setAuthResolved] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      setLoading(true);
      setError(null);
      setRoleError(null);

      try {
        const user = getCurrentUser();
        if (!user) {
          if (active) {
            setAuthUser(null);
          }
          return;
        }

        const userDoc = await getUserDoc(user.uid);
        if (!userDoc) {
          setRoleError('Account profile was not found. Please sign in again.');
          setAuthUser({ ...user, role: user.role === 'trainer' ? 'trainer' : 'student', doc: null });
          return;
        }

        setAuthUser({ ...user, role: userDoc.role, doc: userDoc });
      } catch (authLoadError) {
        setError(authLoadError instanceof Error ? authLoadError : new Error('Unable to load auth state.'));
      } finally {
        if (active) {
          setAuthResolved(true);
          setLoading(false);
        }
      }
    };

    void loadUser();
    const unsubscribe = subscribeAuthChanged(() => {
      void loadUser();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return {
    user: authUser,
    loading,
    authResolved,
    error,
    roleError,
    isStudent: authUser?.role === 'student',
    isTrainer: authUser?.role === 'trainer',
  };
};
