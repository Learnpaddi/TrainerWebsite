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
        <Header
          role={role}
          title={title}
          subtitle={subtitle}
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
