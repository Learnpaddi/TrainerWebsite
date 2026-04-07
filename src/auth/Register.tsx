import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, ShieldCheck } from 'lucide-react';

const Register: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      <main className="relative z-20 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl space-y-8">
          <div className="text-center mb-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-2xl">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="mb-3 bg-gradient-to-r from-gray-900 to-emerald-600 bg-clip-text text-4xl font-black text-transparent">
              Open The Correct Workspace
            </h1>
            <p className="text-lg font-medium text-gray-600">
              Accounts are temporarily bypassed. Choose the LMS area you want to enter directly.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="group rounded-[2rem] border border-white/70 bg-white/85 p-8 text-left shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-3xl"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xl">
                <GraduationCap className="h-8 w-8" />
              </div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Student Access</p>
              <h2 className="mb-3 text-3xl font-black text-gray-900">Open Student Workspace</h2>
              <p className="mb-8 text-base leading-7 text-gray-600">
                Enter the redesigned LMS, browse all courses, and learn without a sign-in barrier.
              </p>
              <span className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 text-base font-black text-white shadow-xl">
                Go to Student Page
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="group rounded-[2rem] border border-white/70 bg-white/85 p-8 text-left shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-3xl"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-xl">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">Trainer Access</p>
              <h2 className="mb-3 text-3xl font-black text-gray-900">Open Trainer Workspace</h2>
              <p className="mb-8 text-base leading-7 text-gray-600">
                Jump into the trainer panel to manage courses and run the professional LMS back office.
              </p>
              <span className="primary-cta px-6 py-4 text-base">Go to Trainer Page</span>
            </button>
          </div>

          <div className="border-t border-gray-200/50 pt-8 text-center">
            <p className="text-sm text-gray-600">
              Need the quick selector? <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700">Open Login</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
