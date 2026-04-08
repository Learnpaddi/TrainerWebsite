import { Bell, LockKeyhole, ShieldCheck, UserCog } from 'lucide-react';
import { useState } from 'react';
import { useRole } from '@/hooks/useRole';

const SettingsPage = () => {
  const { profile } = useRole();
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(false);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md">
        <p className="text-sm font-semibold text-corporate-text">Profile Settings</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-corporate-muted">Full Name</span>
            <input defaultValue={profile?.name || ''} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-corporate-text outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-corporate-muted">Email</span>
            <input defaultValue={profile?.email || ''} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-corporate-text outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100" />
          </label>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md">
          <div className="mb-3 flex items-center gap-2">
            <Bell className="h-4.5 w-4.5 text-corporate-accent" />
            <p className="text-sm font-semibold text-corporate-text">Notifications</p>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
              Email updates
              <input type="checkbox" checked={emailUpdates} onChange={() => setEmailUpdates((value) => !value)} />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
              Push alerts
              <input type="checkbox" checked={pushAlerts} onChange={() => setPushAlerts((value) => !value)} />
            </label>
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-corporate-success" />
            <p className="text-sm font-semibold text-corporate-text">Security</p>
          </div>
          <div className="space-y-3">
            <button type="button" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <LockKeyhole className="h-4.5 w-4.5" />
              Change Password
            </button>
            <button type="button" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <UserCog className="h-4.5 w-4.5" />
              Manage Access
            </button>
          </div>
        </article>
      </section>
    </div>
  );
};

export default SettingsPage;
