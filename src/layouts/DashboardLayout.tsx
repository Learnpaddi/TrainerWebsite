import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useRole } from '@/hooks/useRole';

interface DashboardLayoutProps {
  role: 'student' | 'trainer';
  title: string;
  subtitle: string;
  actionLabel: string;
  actionPath: string;
  children: ReactNode;
}

const DashboardLayout = ({
  role,
  title,
  subtitle,
  actionLabel,
  actionPath,
  children,
}: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { profile } = useRole();

  return (
    <div className="min-h-screen bg-corporate-background">
      <div className="min-w-0">
        <div className="sticky top-0 z-40 px-3 pt-3 sm:px-5 lg:px-6">
          <div className="lms-hero-shell rounded-[1.35rem] px-4 py-3 sm:px-5 sm:py-3">
            <div className="lms-grid-bg absolute inset-0 opacity-30" />
            <div className="relative flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-2 inline-flex items-center rounded-full border border-blue-100 bg-white/82 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-blue-700 shadow-sm">
                  {role === 'trainer' ? 'Trainer command center' : 'Student learning hub'}
                </div>
                <h1 className="truncate font-display text-[1.35rem] font-bold leading-none text-corporate-text sm:text-[1.55rem] lg:text-[1.8rem]">
                  {title}
                </h1>
                <p className="mt-1 max-w-3xl text-xs leading-5 text-corporate-muted sm:text-sm">
                  {subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>
        <Header
          role={role}
          actionLabel={actionLabel}
          onAction={() => navigate(actionPath)}
          profileName={profile?.name}
        />
        <main className="relative overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-blue-100/40 via-cyan-50/25 to-transparent" />
          <div className="pointer-events-none absolute -left-16 top-20 h-56 w-56 rounded-full bg-blue-200/25 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-10 h-64 w-64 rounded-full bg-emerald-100/30 blur-3xl" />
          <div className="mx-auto w-full max-w-[1320px]">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
