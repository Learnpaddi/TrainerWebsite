// Central types export
export * from '@/services/database/types';
export type { Course, Enrollment } from '@/services/database/types';

// UI types
export interface NavItem {
  path: string;
  label: string;
  icon?: string;
}

// Extend as needed
export type Role = 'student' | 'trainer';
