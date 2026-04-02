import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, googleSignIn } from '@/services/firebase/authService';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as 'student' | 'trainer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await register(formData);
      navigate('/');
    } catch (error: any) {
      setMessage(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (role: 'student' | 'trainer') => {
    setFormData({...formData, role});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      <main className="relative z-20 flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-10">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl shadow-2xl flex items-center justify-center">
              <i className="fas fa-user-plus text-2xl text-white" />
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-emerald-600 bg-clip-text text-transparent mb-3">
              Start Learning Today
            </h1>
            <p className="text-lg text-gray-600 font-medium">Create account & unlock premium courses</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Full Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required 
                className="w-full px-5 py-4 rounded-2xl bg-white/70 border-2 border-gray-200/70 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Email Address</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required 
                className="w-full px-5 py-4 rounded-2xl bg-white/70 border-2 border-gray-200/70 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                placeholder="john@company.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  minLength={6}
                  required 
                  className="w-full px-12 py-4 rounded-2xl bg-white/70 border-2 border-gray-200/70 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 pr-12 transition-all"
                  placeholder="At least 6 characters"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/50 rounded-full"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center p-4 border-2 border-gray-200/70 rounded-2xl hover:border-emerald-400 cursor-pointer transition-all group">
                  <input 
                    type="radio" 
                    name="role" 
                    value="student"
                    checked={formData.role === 'student'}
                    onChange={() => handleRoleChange('student')}
                    className="mr-3 w-5 h-5 text-emerald-600"
                  />
                  <span className="font-medium group-hover:text-emerald-600">Student</span>
                </label>
                <label className="flex items-center p-4 border-2 border-gray-200/70 rounded-2xl hover:border-blue-400 cursor-pointer transition-all group">
                  <input 
                    type="radio" 
                    name="role" 
                    value="trainer"
                    checked={formData.role === 'trainer'}
                    onChange={() => handleRoleChange('trainer')}
                    className="mr-3 w-5 h-5 text-blue-600"
                  />
                  <span className="font-medium group-hover:text-blue-600">Trainer</span>
                </label>
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
              className="group w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black py-5 px-8 rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-2 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <i className="fas fa-rocket" />}
              <span>{loading ? 'Creating...' : 'Create Account'}</span>
            </button>
          </form>

          <button 
            onClick={googleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white/80 border-2 border-gray-200/50 hover:border-emerald-300 hover:shadow-xl transition-all font-semibold shadow-lg"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            </svg>
            Continue with Google
          </button>

          <div className="text-center pt-8 border-t border-gray-200/50">
            <p className="text-sm text-gray-600">
              Have account? <a href="/login" className="font-bold text-emerald-600 hover:text-emerald-700">Sign In</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
