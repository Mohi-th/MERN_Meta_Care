import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useSocket } from '@/context/SocketProvider';
import {
  Calendar, Clock, User, Video, CheckCircle, Phone,
  Stethoscope, MapPin, Award, ArrowRight, Sparkles,
  CalendarDays, Timer, CircleDot
} from 'lucide-react';
import VideoCall from '@/components/VideoCall';

function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCall, setActiveCall] = useState(null);
  const [filter, setFilter] = useState('all');

  const { user } = useSelector((state) => state.auth);
  const socket = useSocket();
  const doctorId = user?._id;
  const API = import.meta.env.VITE_API_URL;

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/appointments/doctor/${doctorId}`);
      setAppointments(res.data.appointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctorId) fetchAppointments();
  }, [doctorId]);

  // Register doctor socket & listen for patient-joined
  useEffect(() => {
    if (!socket || !doctorId) return;
    socket.emit('register', { userId: doctorId });
    return () => {};
  }, [socket, doctorId]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatFullDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const isUpcoming = (dateStr) => new Date(dateStr) > new Date();

  const statusConfig = {
    scheduled: {
      color: 'from-cyan-500 to-blue-500',
      bg: 'bg-cyan-500/8',
      text: 'text-cyan-400',
      border: 'border-cyan-500/20',
      dot: 'bg-cyan-400',
      label: 'Scheduled',
    },
    completed: {
      color: 'from-emerald-500 to-green-500',
      bg: 'bg-emerald-500/8',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      dot: 'bg-emerald-400',
      label: 'Completed',
    },
    cancelled: {
      color: 'from-red-500 to-rose-500',
      bg: 'bg-red-500/8',
      text: 'text-red-400',
      border: 'border-red-500/20',
      dot: 'bg-red-400',
      label: 'Cancelled',
    },
  };

  const filtered = appointments.filter((apt) => {
    if (filter === 'all') return true;
    return (apt.status || 'scheduled') === filter;
  });

  const stats = {
    total: appointments.length,
    scheduled: appointments.filter((a) => (a.status || 'scheduled') === 'scheduled').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center animate-pulse-glow">
              <Stethoscope className="text-white" size={24} />
            </div>
          </div>
          <p className="text-slate-400 text-sm font-medium">Loading your appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="doctor-appointments-page" className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <CalendarDays className="text-white" size={20} />
            </div>
            Appointments
          </h1>
          <p className="text-slate-400 mt-2 ml-[52px]">Manage and join your scheduled consultations</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Calendar, gradient: 'from-slate-600 to-slate-700', glow: 'shadow-slate-500/10' },
          { label: 'Upcoming', value: stats.scheduled, icon: Timer, gradient: 'from-cyan-500 to-blue-600', glow: 'shadow-cyan-500/20' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, gradient: 'from-emerald-500 to-green-600', glow: 'shadow-emerald-500/20' },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-5 group hover:border-white/10 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg ${stat.glow} group-hover:scale-110 transition-transform`}>
                <stat.icon className="text-white" size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['all', 'scheduled', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
              filter === f
                ? 'gradient-primary text-white shadow-lg shadow-cyan-500/20'
                : 'glass text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {/* Appointment Cards */}
      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-5">
            <Calendar className="text-slate-600" size={36} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Appointments Found</h3>
          <p className="text-slate-400 text-sm">
            {filter === 'all' ? "You don't have any appointments yet." : `No ${filter} appointments.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((apt, idx) => {
            const status = apt.status || 'scheduled';
            const sc = statusConfig[status];
            const upcoming = isUpcoming(apt.scheduleTime);
            const isScheduled = status === 'scheduled';

            return (
              <div
                key={apt._id}
                className="glass rounded-2xl overflow-hidden group hover:border-white/10 transition-all animate-slide-up"
                style={{ animationDelay: `${idx * 0.05}s` }}
                id={`appointment-${apt._id}`}
              >
                {/* Top color bar */}
                <div className={`h-1 bg-gradient-to-r ${sc.color}`} />

                <div className="p-5 space-y-4">
                  {/* Patient Info Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${sc.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                        {apt.patientId?.name?.charAt(0)?.toUpperCase() || 'P'}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {apt.patientId?.name || 'Patient'}
                        </h3>
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5">
                          <Phone size={11} />
                          <span>{apt.patientId?.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${sc.bg} ${sc.text} ${sc.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                  </div>

                  {/* Date / Time Card */}
                  <div className="flex gap-3">
                    <div className="flex-1 glass-light rounded-xl p-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                        <CalendarDays className="text-cyan-400" size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Date</p>
                        <p className="text-sm text-white font-semibold">{formatDate(apt.scheduleTime)}</p>
                      </div>
                    </div>
                    <div className="flex-1 glass-light rounded-xl p-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <Clock className="text-violet-400" size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Time</p>
                        <p className="text-sm text-white font-semibold">{formatTime(apt.scheduleTime)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  {isScheduled && upcoming && (
                    <button
                      onClick={() => setActiveCall(apt)}
                      className="w-full flex items-center justify-center gap-2.5 py-3 gradient-primary text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-cyan-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      id={`join-call-${apt._id}`}
                    >
                      <Video size={18} />
                      Start Consultation
                      <ArrowRight size={14} className="ml-1" />
                    </button>
                  )}

                  {status === 'completed' && (
                    <div className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                      <CheckCircle size={15} className="text-emerald-400" />
                      <span className="text-xs font-semibold text-emerald-400">Consultation completed on {formatFullDate(apt.scheduleTime)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Video Call Modal */}
      {activeCall && (
        <VideoCall
          open={!!activeCall}
          onClose={() => { setActiveCall(null); fetchAppointments(); }}
          roomId={activeCall._id}
          role="doctor"
          doctorId={doctorId}
          patientId={activeCall.patientId?._id}
          patientName={activeCall.patientId?.name}
        />
      )}
    </div>
  );
}

export default DoctorAppointments;
