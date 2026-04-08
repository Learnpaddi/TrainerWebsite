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
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1320px]">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
