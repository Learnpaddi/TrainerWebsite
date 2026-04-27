import { auth } from '../config/firebase.js';

export const signToken = async (user) => {
  return auth.createCustomToken(user.uid || user.id);
};

