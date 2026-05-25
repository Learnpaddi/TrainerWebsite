import { 
  type User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut as signOutAuth, 
  sendPasswordResetEmail,
  updateProfile,
  type UserCredential
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth, authReady, googleProvider } from './config';
import { setUserDoc } from './userService';


export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'trainer';
}

export const register = async (payload: RegisterPayload): Promise<User> => {
  await authReady;
  const { user } = await createUserWithEmailAndPassword(auth, payload.email, payload.password);
  await updateProfile(user, { displayName: payload.name });
  await setUserDoc(user.uid, {
    uid: user.uid,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    trainerId: payload.role === 'trainer' ? user.uid : null,
  });
  return user;
};

export const login = async (email: string, password: string): Promise<UserCredential> => {
  await authReady;
  return signInWithEmailAndPassword(auth, email, password);
};

export const googleSignIn = async (): Promise<UserCredential> => {
  await authReady;
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  await setUserDoc(user.uid, {
    uid: user.uid,
    name: user.displayName || 'Learner',
    email: user.email || '',
    role: 'student',
  });
  return result;
};

export const logout = async (): Promise<void> => {
  await signOutAuth(auth);
};

export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

export const getAuthErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Invalid email or password. Please try again.';
      case 'auth/invalid-email':
        return 'Enter a valid email address.';
      case 'auth/popup-closed-by-user':
        return 'Google sign-in was closed before it could finish.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a moment and try again.';
      default:
        return error.message || fallback;
    }
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
};
