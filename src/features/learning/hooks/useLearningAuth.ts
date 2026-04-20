import { useContext } from 'react';
import { LearningAuthContext } from '@/features/learning/context/LearningAuthContext';

export function useLearningAuth() {
  const context = useContext(LearningAuthContext);

  if (!context) {
    throw new Error('useLearningAuth must be used within LearningAuthProvider.');
  }

  return context;
}
