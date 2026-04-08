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
  isSubmitting?: boolean;
  externalError?: string | null;
  onSubmit: (values: LoginValues) => Promise<void> | void;
}

const accentStyles = {
  blue: {
    input: 'focus:border-blue-400 focus:ring-blue-100',
    button: 'from-blue-600 to-cyan-500 hover:shadow-blue-200/80',
  },
  emerald: {
    input: 'focus:border-emerald-400 focus:ring-emerald-100',
    button: 'from-emerald-600 to-teal-500 hover:shadow-emerald-200/80',
  },
} as const;

const LoginForm = ({
  title,
  subtitle,
  submitLabel,
  accent,
  isSubmitting = false,
  externalError,
  onSubmit,
}: LoginFormProps) => {
  const [values, setValues] = useState<LoginValues>({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginValues, string>>>({});

  const styles = accentStyles[accent];

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
            className={`w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 shadow-sm outline-none transition duration-200 focus:scale-[1.01] focus:ring-4 ${styles.input}`}
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
            className={`w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 shadow-sm outline-none transition duration-200 focus:scale-[1.01] focus:ring-4 ${styles.input}`}
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
        className={`w-full rounded-xl bg-gradient-to-r px-4 py-3 text-sm font-bold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70 ${styles.button}`}
      >
        {isSubmitting ? 'Please wait...' : submitLabel}
      </button>
    </form>
  );
};

export default LoginForm;
