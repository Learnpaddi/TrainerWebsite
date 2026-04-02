import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, googleSignIn } from '@/services/firebase/authService';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await login(email, password);
      navigate('/');
    } catch (error: any) {
      setMessage(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Shapes - preserved from HTML */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-[pulse_8s_ease-in-out_infinite_2s]"></div>
      </div>

      <main className="relative z-20 flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-10">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl shadow-2xl flex items-center justify-center">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent mb-3">
              Welcome Back
            </h1>
            <p className="text-lg text-gray-600 font-medium">Sign in to continue learning</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="w-full px-5 py-4 rounded-2xl bg-white/70 backdrop-blur-sm border-2 border-gray-200/70 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 placeholder-gray-500 font-medium shadow-sm"
                placeholder="john@company.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className="w-full px-12 py-4 rounded-2xl bg-white/70 backdrop-blur-sm border-2 border-gray-200/70 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all pr-12"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/50 rounded-full transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                </button>
              </div>
            </div>

            {message && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-2xl">
                {message}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="group w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-black py-5 px-8 rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <i className="fas fa-rocket" />}
              <span>{loading ? 'Signing In...' : 'Enter LearnPaddi'}</span>
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200/50"></div>
            </div>
            <div className="relative bg-white/80 px-8 text-center text-sm font-medium text-gray-500">
              or continue with
            </div>
          </div>

          <button 
            type="button"
            onClick={googleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white/80 border-2 border-gray-200/50 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transition-all font-semibold shadow-lg disabled:opacity-50"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="text-center pt-8 border-t border-gray-200/50">
            <p className="text-sm text-gray-600">
              New? <a href="/register" className="font-bold text-blue-600 hover:text-blue-700">Create Account</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
