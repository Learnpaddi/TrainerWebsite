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
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './config';


export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'trainer';
}

export const register = async (payload: RegisterPayload): Promise<User> => {
  const { user } = await createUserWithEmailAndPassword(auth, payload.email, payload.password);
  await updateProfile(user, { displayName: payload.name });
  await setDoc(doc(db, 'users', user.uid), { 
    name: payload.name, 
    email: payload.email, 
    role: payload.role,
    createdAt: new Date().toISOString()
  });
  return user;
};

export const login = async (email: string, password: string): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const googleSignIn = async (): Promise<UserCredential> => {
  return signInWithPopup(auth, googleProvider);
};

export const logout = async (): Promise<void> => {
  await signOutAuth(auth);
};

export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};
