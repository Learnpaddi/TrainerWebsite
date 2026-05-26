import { prisma } from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { verifyToken } from '../utils/auth.js';

export async function requireAuth(req, _res, next) {
  const authorization = req.headers.authorization || '';
  const [, token] = authorization.split(' ');

  if (!token) {
    return next(new ApiError(401, 'Authentication token is required.'));
  }

  try {
    const payload = verifyToken(token);
    if (!payload) {
      return next(new ApiError(401, 'Invalid or expired authentication token.'));
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return next(new ApiError(401, 'Authenticated user was not found.'));
    }

    req.user = {
      uid: user.id,
      id: user.id,
      name: user.name || '',
      email: user.email,
      role: user.role || 'student',
    };
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired authentication token.'));
  }
}
