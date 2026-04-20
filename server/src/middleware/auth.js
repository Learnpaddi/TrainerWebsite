import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

export async function requireAuth(req, _res, next) {
  const authorization = req.headers.authorization || '';
  const [, token] = authorization.split(' ');

  if (!token) {
    return next(new ApiError(401, 'Authentication token is required.'));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub).select('-passwordHash');

    if (!user) {
      return next(new ApiError(401, 'Authenticated user was not found.'));
    }

    req.user = user;
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired authentication token.'));
  }
}
