import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '@/store/authSlice';
import { Phone, Lock, LogIn, UserPlus, Stethoscope, Baby } from 'lucide-react';
import { toast } from 'sonner';

function LoginPage() {
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [role, setRole] = useState('patient');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.phone || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);

    dispatch(loginUser({ formData, role }))
      .then((data) => {
        setLoading(false);
        if (data?.payload?.success) {
          toast.success('Login successful', { description: `Welcome back to MetaCare` });
          navigate('/dashboard/appointments');
        } else {
          toast.error('Login failed', { description: 'Invalid phone number or password' });
          setFormData({ phone: '', password: '' });
        }
      })
      .catch(() => setLoading(false));
  };

  return (
    <div className="space-y-6" id="login-page">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
        <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
      </div>

      {/* Role Toggle */}
      <div className="flex rounded-xl overflow-hidden border border-white/10" id="role-toggle">
        <button
          type="button"
          onClick={() => setRole('patient')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all ${
            role === 'patient'
              ? 'gradient-primary text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Baby size={18} />
          Patient
        </button>
        <button
          type="button"
          onClick={() => setRole('doctor')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all ${
            role === 'doctor'
              ? 'gradient-primary text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Stethoscope size={18} />
          Doctor
        </button>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="tel"
              id="login-phone"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all text-sm"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Password
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              id="login-password"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all text-sm"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 gradient-primary text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          id="login-submit"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <LogIn size={18} />
              Sign In
            </>
          )}
        </button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 text-slate-500" style={{ background: 'rgba(17, 24, 39, 0.7)' }}>
            Don't have an account?
          </span>
        </div>
      </div>

      <button
        onClick={() => navigate('/auth/register')}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 text-slate-300 font-medium hover:bg-white/5 hover:border-white/20 transition-all text-sm"
        id="go-to-register"
      >
        <UserPlus size={16} />
        Create New Account
      </button>
    </div>
  );
}

export default LoginPage;
