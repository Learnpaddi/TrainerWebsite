import crypto from 'node:crypto';
import { env } from '../config/env.js';

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;
const KEY_LENGTH = 64;

function base64UrlEncode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function base64UrlDecode(value) {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
}

function sign(value) {
  return crypto.createHmac('sha256', env.authTokenSecret).update(value).digest('base64url');
}

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('base64url');
  const derivedKey = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });

  return `${salt}:${derivedKey.toString('base64url')}`;
}

export async function verifyPassword(password, storedHash) {
  if (!storedHash) return false;

  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;

  const derivedKey = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });

  const stored = Buffer.from(hash, 'base64url');
  return stored.length === derivedKey.length && crypto.timingSafeEqual(stored, derivedKey);
}

export const signToken = async (user) => {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user.id,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  };
  const encodedPayload = base64UrlEncode(payload);

  return `${encodedPayload}.${sign(encodedPayload)}`;
};

export function verifyToken(token) {
  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature || sign(encodedPayload) !== signature) {
    return null;
  }

  const payload = base64UrlDecode(encodedPayload);
  if (!payload.sub || payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}
