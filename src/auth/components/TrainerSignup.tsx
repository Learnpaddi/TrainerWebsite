import type { FormEvent } from 'react';
import AuthFormCard from '@/auth/components/AuthFormCard';

interface TrainerSignupProps {
  onBack: () => void;
  onToggleMode: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  errorMessage?: string | null;
  isSubmitting?: boolean;
}

const TrainerSignup = ({ onBack, onToggleMode, onSubmit, errorMessage, isSubmitting }: TrainerSignupProps) => (
  <AuthFormCard
    role="trainer"
    mode="signup"
    title="Create trainer account"
    description="Set up your instructor access and move directly into course operations while authentication is still in staging mode."
    submitLabel="Create Trainer Access"
    onBack={onBack}
    onToggleMode={onToggleMode}
    onSubmit={onSubmit}
    errorMessage={errorMessage}
    isSubmitting={isSubmitting}
  >
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="sm:col-span-2">
        <span className="mb-2 block text-sm font-semibold text-slate-700">Name</span>
        <input
          type="text"
          name="name"
          placeholder="Enter your full name"
          className="w-full rounded-2xl border border-white/70 bg-white/95 px-4 py-3.5 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
          required
        />
      </label>
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
          placeholder="Create a password"
          className="w-full rounded-2xl border border-white/70 bg-white/95 px-4 py-3.5 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
          required
        />
      </label>
    </div>
  </AuthFormCard>
);

export default TrainerSignup;
