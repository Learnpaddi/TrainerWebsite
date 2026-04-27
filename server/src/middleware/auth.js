import { admin, db } from '../config/firebase.js';
import { ApiError } from '../utils/ApiError.js';

export async function requireAuth(req, _res, next) {
  const authorization = req.headers.authorization || '';
  const [, token] = authorization.split(' ');

  if (!token) {
    return next(new ApiError(401, 'Authentication token is required.'));
  }

  try {
    const payload = await admin.auth().verifyIdToken(token);
    const userDoc = await db.collection('users').doc(payload.uid).get();

    if (!userDoc.exists) {
      return next(new ApiError(401, 'Authenticated user was not found.'));
    }

    const userData = userDoc.data();
    req.user = {
      uid: payload.uid,
      id: payload.uid,
      name: userData.name || '',
      email: userData.email || '',
      role: userData.role || 'student',
    };
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired authentication token.'));
  }
}

