import { Outlet } from 'react-router-dom';
import { Heart } from 'lucide-react';

function AuthLayout() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0b1120 0%, #0f172a 40%, #1e293b 100%)' }}
    >
      {/* Animated background orbs */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full opacity-20 animate-float"
        style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }}
      />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full opacity-15 animate-float"
        style={{ background: 'radial-gradient(circle, #14b8a6, transparent)', animationDelay: '3s' }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
        style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8" id="auth-branding">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4 shadow-lg shadow-cyan-500/20">
            <Heart className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gradient">MetaCare</h1>
          <p className="text-slate-400 mt-2 text-sm">Comprehensive Pregnancy Care Platform</p>
        </div>

        {/* Form card */}
        <div className="glass rounded-2xl p-8 shadow-2xl animate-slide-up" id="auth-form-card">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
