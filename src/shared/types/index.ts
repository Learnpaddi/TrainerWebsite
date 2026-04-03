// Central types export
export * from '@/services/firebase/types';
export type { Course, Enrollment, UserDoc } from '@/services/firebase/types';

// UI types
export interface NavItem {
  path: string;
  label: string;
  icon?: string;
}

// Extend as needed
export type Role = 'student' | 'trainer';
