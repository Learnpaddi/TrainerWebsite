import type { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useLearningAuth } from '@/features/learning/hooks/useLearningAuth';

export function LearningProtectedRoute({ children }: { children: ReactElement }) {
  const location = useLocation();
  const { user, loading } = useLearningAuth();

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-6">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white px-8 py-6 text-center shadow-panel">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">LearnPaddi</p>
          <p className="mt-3 text-lg font-bold text-slate-900">Checking your learning workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/learn/auth" replace state={{ from: location.pathname }} />;
  }

  return children;
}
