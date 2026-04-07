import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl animate-[pulse_8s_ease-in-out_infinite_2s]" />
      </div>

      <main className="relative z-20 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl space-y-8">
          <div className="text-center mb-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-r from-blue-500 to-cyan-500 shadow-2xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="mb-3 bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-4xl font-black text-transparent">
              Choose Your LMS Workspace
            </h1>
            <p className="text-lg font-medium text-gray-600">
              Authentication is disabled for now. Pick a role and open the LMS directly.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="group rounded-[2rem] border border-white/70 bg-white/85 p-8 text-left shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-3xl"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-xl">
                <GraduationCap className="h-8 w-8" />
              </div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">Student Login</p>
              <h2 className="mb-3 text-3xl font-black text-gray-900">Enter Student LMS</h2>
              <p className="mb-8 text-base leading-7 text-gray-600">
                Open the learner dashboard, browse courses, and continue your lessons instantly.
              </p>
              <span className="primary-cta px-6 py-4 text-base">Go to Student Page</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="group rounded-[2rem] border border-white/70 bg-white/85 p-8 text-left shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-3xl"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xl">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Trainer Login</p>
              <h2 className="mb-3 text-3xl font-black text-gray-900">Enter Trainer Panel</h2>
              <p className="mb-8 text-base leading-7 text-gray-600">
                Open the trainer workspace to manage courses, enrollments, and delivery in one place.
              </p>
              <span className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 text-base font-black text-white shadow-xl">
                Go to Trainer Page
              </span>
            </button>
          </div>

          <div className="border-t border-gray-200/50 pt-8 text-center">
            <p className="text-sm text-gray-600">
              Need the alternate launcher? <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700">Open Access Page</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
