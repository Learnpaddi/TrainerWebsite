/**
 * Firebase Client - Admin (TypeScript)
 * Re-export shared modules with types
 */

// Runtime import (Vite handles)
import '@shared/firebase/index.js';

// Type re-exports
export type { Course, Enrollment } from '@shared/firebase/index.d.ts';

// Value re-exports (runtime resolved by Vite)
export { 
  getCourses, 
  createCourse, 
  updateCourse, 
  deleteCourse, 
  isAdmin,
  auth,
  onAuthChange,
  logout
 } from '@shared/firebase/index.js';

