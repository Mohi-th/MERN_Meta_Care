import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/store/authSlice';
import {
  Heart,
  Calendar,
  Users,
  FileText,
  Activity,
  UtensilsCrossed,
  LogOut,
  ChevronRight,
} from 'lucide-react';

const doctorNav = [
  { path: '/dashboard/appointments', label: 'Appointments', icon: Calendar },
  { path: '/dashboard/connections', label: 'Connections', icon: Users },
  { path: '/dashboard/summaries', label: 'Summaries', icon: FileText },
];

const patientNav = [
  { path: '/dashboard/appointments', label: 'Appointments', icon: Calendar },
  { path: '/dashboard/risk-prediction', label: 'Risk Assessment', icon: Activity },
  { path: '/dashboard/diet', label: 'Diet Plan', icon: UtensilsCrossed },
];

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, role } = useSelector((state) => state.auth);

  const navItems = role === 'doctor' ? doctorNav : patientNav;
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth/login');
  };

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden" style={{ background: '#0b1120' }}>
      {/* ── Header ─────────────────────────────────── */}
      <header className="glass border-b border-white/5 px-6 py-3 flex items-center justify-between z-20" id="dashboard-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Heart className="text-white" size={18} />
          </div>
          <h1 className="text-xl font-bold text-gradient">MetaCare</h1>
          <span className="ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
            style={{
              background: role === 'doctor' ? 'rgba(6,182,212,0.15)' : 'rgba(20,184,166,0.15)',
              color: role === 'doctor' ? '#06b6d4' : '#14b8a6',
            }}
          >
            {role}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="text-sm text-slate-300 font-medium">{user?.name || 'User'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
            id="logout-btn"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[240px] glass border-r border-white/5 flex flex-col py-4 overflow-y-auto" id="dashboard-sidebar">
          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group
                    ${active
                      ? 'gradient-primary text-white shadow-lg shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                  id={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                >
                  <Icon size={18} className={active ? 'text-white' : 'text-slate-500 group-hover:text-cyan-400'} />
                  <span>{item.label}</span>
                  {active && <ChevronRight size={14} className="ml-auto" />}
                </button>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="px-3 mt-auto">
            <div className="glass-light rounded-xl p-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                {role === 'doctor'
                  ? '🩺 Manage your patient consultations and appointments.'
                  : '🤰 Track your pregnancy journey with expert care.'}
              </p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6" style={{ background: '#0b1120' }} id="dashboard-content">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
