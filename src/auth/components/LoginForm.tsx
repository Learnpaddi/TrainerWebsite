import { Mail, Lock } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';

export type AuthRole = 'student' | 'trainer';

export interface LoginValues {
  email: string;
  password: string;
}

interface LoginFormProps {
  title: string;
  subtitle: string;
  submitLabel: string;
  accent: 'blue' | 'emerald';
  inputClassName?: string;
  submitButtonClassName?: string;
  isSubmitting?: boolean;
  externalError?: string | null;
  onSubmit: (values: LoginValues) => Promise<void> | void;
}

const LoginForm = ({
  title,
  subtitle,
  submitLabel,
  accent: _accent,
  inputClassName = '',
  submitButtonClassName = '',
  isSubmitting = false,
  externalError,
  onSubmit,
}: LoginFormProps) => {
  const [values, setValues] = useState<LoginValues>({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginValues, string>>>({});
  const validate = () => {
    const nextErrors: Partial<Record<keyof LoginValues, string>> = {};

    if (!values.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!values.password.trim()) {
      nextErrors.password = 'Password is required.';
    } else if (values.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const hasInlineErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    await onSubmit({ email: values.email.trim(), password: values.password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-xl font-black text-slate-900 sm:text-2xl">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-slate-700">Email</span>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
          <input
            type="email"
            value={values.email}
            onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
            className={`w-full rounded-2xl border border-slate-200 bg-white/95 py-3.5 pl-10 pr-4 text-sm text-slate-900 shadow-[0_10px_25px_rgba(15,23,42,0.05)] outline-none transition duration-300 placeholder:text-slate-400 hover:border-slate-300 ${inputClassName}`}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        {errors.email ? <p className="text-xs font-medium text-red-600">{errors.email}</p> : null}
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-slate-700">Password</span>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
          <input
            type="password"
            value={values.password}
            onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
            className={`w-full rounded-2xl border border-slate-200 bg-white/95 py-3.5 pl-10 pr-4 text-sm text-slate-900 shadow-[0_10px_25px_rgba(15,23,42,0.05)] outline-none transition duration-300 placeholder:text-slate-400 hover:border-slate-300 ${inputClassName}`}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </div>
        {errors.password ? <p className="text-xs font-medium text-red-600">{errors.password}</p> : null}
      </label>

      {externalError ? <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{externalError}</div> : null}
      {!externalError && hasInlineErrors ? <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">Fix the highlighted fields to continue.</div> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className={`group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl px-4 py-3.5 text-sm font-extrabold transition duration-300 disabled:cursor-not-allowed disabled:opacity-70 ${submitButtonClassName}`}
      >
        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_20%,rgba(255,255,255,0.32)_50%,transparent_80%)] opacity-0 transition duration-500 group-hover:translate-x-full group-hover:opacity-100" />
        {isSubmitting ? 'Please wait...' : submitLabel}
        <span className="relative transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
      </button>
    </form>
  );
};

export default LoginForm;
