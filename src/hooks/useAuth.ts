import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/services/firebase/config';
import { getUserDoc, type UserDoc } from '@/services/firebase/userService';

export interface AuthUser extends FirebaseUser {
  role?: 'student' | 'trainer';
  doc?: UserDoc | null;
}

export const useAuth = () => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!active) {
        return;
      }
      setLoading(true);
      setError(null);
      setRoleError(null);

      if (!firebaseUser) {
        setAuthUser(null);
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getUserDoc(firebaseUser.uid);
        if (!userDoc) {
          setAuthUser(null);
          setRoleError('Account profile was not found. Please complete sign up first.');
          setLoading(false);
          return;
        }

        setAuthUser({ ...firebaseUser, role: userDoc.role, doc: userDoc });
      } catch (authLoadError) {
        setAuthUser(null);
        setRoleError('We signed you in, but could not load your user profile from Firestore.');
        setError(authLoadError instanceof Error ? authLoadError : new Error('Unable to load auth state.'));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return { 
    user: authUser, 
    loading, 
    error,
    roleError,
    isStudent: authUser?.role === 'student',
    isTrainer: authUser?.role === 'trainer'
  };
};
