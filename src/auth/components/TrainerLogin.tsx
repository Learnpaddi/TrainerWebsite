import type { FormEvent } from 'react';
import AuthFormCard from '@/auth/components/AuthFormCard';

interface TrainerLoginProps {
  onBack: () => void;
  onToggleMode: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const TrainerLogin = ({ onBack, onToggleMode, onSubmit }: TrainerLoginProps) => (
  <AuthFormCard
    role="trainer"
    mode="login"
    title="Trainer sign in"
    description="Open the trainer console to manage courses, review analytics, and keep your content workflow moving."
    submitLabel="Enter Trainer LMS"
    onBack={onBack}
    onToggleMode={onToggleMode}
    onSubmit={onSubmit}
  >
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="sm:col-span-2">
        <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
        <input
          type="email"
          name="email"
          placeholder="trainer@learnpaddi.com"
          className="w-full rounded-2xl border border-white/70 bg-white/95 px-4 py-3.5 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
          required
        />
      </label>
      <label className="sm:col-span-2">
        <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          className="w-full rounded-2xl border border-white/70 bg-white/95 px-4 py-3.5 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
          required
        />
      </label>
    </div>
  </AuthFormCard>
);

export default TrainerLogin;
