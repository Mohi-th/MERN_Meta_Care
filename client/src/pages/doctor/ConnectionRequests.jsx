import { useEffect, useState } from 'react';
import { useSocket } from '@/context/SocketProvider';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Users, Phone, Check, X, UserPlus } from 'lucide-react';

function DoctorConnectionRequests() {
  const socket = useSocket();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useSelector((state) => state.auth);
  const doctorId = user?._id;
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!socket || !doctorId) return;
    socket.emit('register', { userId: doctorId });

    socket.on('new-connection-request', (data) => {
      setRequests((prev) => [...prev, data.request]);
    });

    return () => { socket.off('new-connection-request'); };
  }, [socket, doctorId]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/api/connection/doctor/${doctorId}`);
        setRequests(res.data.requests);
      } catch (err) {
        console.error('Failed to fetch connection requests', err);
      } finally {
        setLoading(false);
      }
    };
    if (doctorId) fetchRequests();
  }, [doctorId]);

  const handleRespond = async (requestId, status) => {
    try {
      await axios.post(`${API}/api/connection/update-status`, { requestId, status });
      setRequests((prev) =>
        prev.map((req) => (req._id === requestId ? { ...req, status } : req))
      );
    } catch (err) {
      console.error('Failed to update request status', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="doctor-connections-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Users className="text-cyan-400" size={28} />
          Connection Requests
        </h1>
        <p className="text-slate-400 mt-2">Manage patient connection requests</p>
      </div>

      {requests.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <UserPlus className="text-slate-600 mx-auto mb-4" size={48} />
          <h3 className="text-xl font-semibold text-white mb-2">No Requests</h3>
          <p className="text-slate-400">No connection requests at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((req) => {
            const statusColors = {
              pending: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
              accepted: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
              rejected: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
            };
            const sc = statusColors[req.status] || statusColors.pending;

            return (
              <div key={req._id} className="glass rounded-2xl p-6 animate-slide-up">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center text-white font-bold">
                      {req.patientId?.name?.charAt(0)?.toUpperCase() || 'P'}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{req.patientId?.name}</h3>
                      <div className="flex items-center gap-1.5 text-slate-400 text-sm mt-0.5">
                        <Phone size={13} />
                        {req.patientId?.phone}
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize border ${sc.bg} ${sc.text} ${sc.border}`}>
                    {req.status}
                  </span>
                </div>

                {req.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t border-white/5">
                    <button
                      onClick={() => handleRespond(req._id, 'accepted')}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 gradient-success text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
                    >
                      <Check size={16} /> Accept
                    </button>
                    <button
                      onClick={() => handleRespond(req._id, 'rejected')}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <X size={16} /> Reject
                    </button>
                  </div>
                )}

                {req.status === 'accepted' && (
                  <div className="flex items-center gap-2 pt-4 border-t border-white/5 text-emerald-400 text-sm">
                    <Check size={16} /> Connection established
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DoctorConnectionRequests;
