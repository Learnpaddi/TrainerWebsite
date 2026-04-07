import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState } from 'react';
import { auth } from '@/services/firebase/config';
import { ensureUserDoc, type UserDoc } from '@/services/firebase/userService';
import type { User as FirebaseUser } from 'firebase/auth';

export interface AuthUser extends FirebaseUser {
  role?: 'student' | 'trainer';
  doc?: UserDoc | null;
}

export const useAuth = () => {
  const [user, loading, error] = useAuthState(auth);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (user) {
      setRoleLoading(true);
      setRoleError(null);

      ensureUserDoc(user)
        .then((userDoc) => {
          if (!isMounted) {
            return;
          }

          setAuthUser({ ...user, role: userDoc.role, doc: userDoc });
        })
        .catch(() => {
          if (!isMounted) {
            return;
          }

          setAuthUser(null);
          setRoleError('We signed you in, but could not load your LMS profile. Please sign in again.');
        })
        .finally(() => {
          if (!isMounted) {
            return;
          }

          setRoleLoading(false);
        });
    } else {
      setAuthUser(null);
      setRoleError(null);
      setRoleLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  return { 
    user: authUser, 
    loading: loading || roleLoading, 
    error,
    roleError,
    isStudent: authUser?.role === 'student',
    isTrainer: authUser?.role === 'trainer'
  };
};
