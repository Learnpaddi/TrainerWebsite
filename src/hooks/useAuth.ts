import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState } from 'react';
import { auth } from '@/services/firebase/config';
import { getUserDoc, type UserDoc } from '@/services/firebase/userService';
import type { User as FirebaseUser } from 'firebase/auth';

export interface AuthUser extends FirebaseUser {
  role?: 'student' | 'trainer';
  doc?: UserDoc | null;
}

export const useAuth = () => {
  const [user, loading, error] = useAuthState(auth);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setRoleLoading(true);
      getUserDoc(user.uid).then(userDoc => {
        setAuthUser({ ...user, role: userDoc?.role, doc: userDoc });
        setRoleLoading(false);
      }).catch(() => setRoleLoading(false));
    } else {
      setAuthUser(null);
    }
  }, [user]);

  return { 
    user: authUser, 
    loading: loading || roleLoading, 
    error,
    isStudent: authUser?.role === 'student',
    isTrainer: authUser?.role === 'trainer'
  };
};
