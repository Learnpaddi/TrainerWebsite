import { auth, db } from '../config/firebase.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { signToken } from '../utils/auth.js';

function normalizeAuthPayload(user) {
  return {
    id: user.uid || user.id,
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

  const existingDoc = await db.collection('users').where('email', '==', email.toLowerCase()).limit(1).get();
  if (!existingDoc.empty) {
    throw new ApiError(409, 'A user with this email already exists.');
  }

  const userRecord = await auth.createUser({
    email: email.toLowerCase(),
    password,
    displayName: name,
  });

  const userPayload = {
    uid: userRecord.uid,
    name,
    email: email.toLowerCase(),
    role,
    enrolledCourses: [],
    certificates: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.collection('users').doc(userRecord.uid).set(userPayload);
  const roleCollection = role === 'trainer' ? 'trainers' : 'students';
  await db.collection(roleCollection).doc(userRecord.uid).set(userPayload);

  const token = await signToken({ uid: userRecord.uid });

  res.status(201).json({
    success: true,
    token,
    user: normalizeAuthPayload(userPayload),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required.');
  }

  const userSnapshot = await db.collection('users').where('email', '==', email.toLowerCase()).limit(1).get();

  if (userSnapshot.empty) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const userData = userSnapshot.docs[0].data();
  const token = await signToken({ uid: userData.uid });

  res.json({
    success: true,
    token,
    user: normalizeAuthPayload(userData),
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: normalizeAuthPayload(req.user),
  });
});

