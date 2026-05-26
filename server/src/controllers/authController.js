import { prisma } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { hashPassword, signToken, verifyPassword } from '../utils/auth.js';

function normalizeAuthPayload(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'student' } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email, and password are required.');
  }

  const normalizedEmail = email.toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    throw new ApiError(409, 'A user with this email already exists.');
  }

  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      role,
      passwordHash: await hashPassword(password),
    },
  });
  const token = await signToken(user);

  res.status(201).json({
    success: true,
    token,
    user: normalizeAuthPayload(user),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required.');
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = await signToken(user);

  res.json({
    success: true,
    token,
    user: normalizeAuthPayload(user),
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: normalizeAuthPayload(req.user),
  });
});
