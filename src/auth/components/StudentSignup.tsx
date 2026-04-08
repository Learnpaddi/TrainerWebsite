import type { FormEvent } from 'react';
import AuthFormCard from '@/auth/components/AuthFormCard';

interface StudentSignupProps {
  onBack: () => void;
  onToggleMode: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  errorMessage?: string | null;
  isSubmitting?: boolean;
}

const StudentSignup = ({ onBack, onToggleMode, onSubmit, errorMessage, isSubmitting }: StudentSignupProps) => (
  <AuthFormCard
    role="student"
    mode="signup"
    title="Create student account"
    description="Set up your learner profile and jump straight into the LMS experience while backend auth stays disabled."
    submitLabel="Create Student Access"
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
          className="w-full rounded-2xl border border-white/70 bg-white/95 px-4 py-3.5 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
          required
        />
      </label>
      <label className="sm:col-span-2">
        <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
        <input
          type="email"
          name="email"
          placeholder="student@learnpaddi.com"
          className="w-full rounded-2xl border border-white/70 bg-white/95 px-4 py-3.5 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
          required
        />
      </label>
      <label className="sm:col-span-2">
        <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
        <input
          type="password"
          name="password"
          placeholder="Create a password"
          className="w-full rounded-2xl border border-white/70 bg-white/95 px-4 py-3.5 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
          required
        />
      </label>
    </div>
  </AuthFormCard>
);

export default StudentSignup;
