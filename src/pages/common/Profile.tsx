import { Mail, ShieldCheck, UserCircle2 } from 'lucide-react';
import { useRole } from '@/hooks/useRole';

const ProfilePage = () => {
  const { profile } = useRole();

  return (
    <div className="space-y-8">
      <section className="surface-panel px-6 py-8 lg:px-8">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          LearnPaddi LMS
        </p>
        <h2 className="text-3xl font-black text-slate-950">Profile</h2>
        <p className="mt-3 text-base text-slate-600">
          Manage your LMS identity and workspace details from one place.
        </p>
      </section>

      <section className="lms-panel p-6 lg:p-8">
        <div className="grid gap-5 md:grid-cols-3">
          <article className="metric-card p-5">
            <div className="mb-3 inline-flex rounded-2xl bg-blue-100 p-3 text-primary">
              <UserCircle2 className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Name</p>
            <p className="mt-2 text-xl font-black text-slate-950">{profile?.name || 'LearnPaddi User'}</p>
          </article>

          <article className="metric-card p-5">
            <div className="mb-3 inline-flex rounded-2xl bg-emerald-100 p-3 text-emerald-600">
              <Mail className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Email</p>
            <p className="mt-2 text-xl font-black text-slate-950">{profile?.email || 'contact@learnpaddi.in'}</p>
          </article>

          <article className="metric-card p-5">
            <div className="mb-3 inline-flex rounded-2xl bg-violet-100 p-3 text-violet-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Role</p>
            <p className="mt-2 text-xl font-black capitalize text-slate-950">{profile?.role || 'student'}</p>
          </article>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
