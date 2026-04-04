import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useSocket } from '@/context/SocketProvider';
import {
  Calendar as CalendarIcon, Clock, User, Building, Award, Phone, Send,
  CheckCircle, Video, Stethoscope, CalendarDays, ArrowRight, Timer,
  MapPin, Star, CircleDot, Sparkles, Search
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import VideoCall from '@/components/VideoCall';

const FIXED_SLOTS = ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM'];

function PatientAppointments() {
  const { user } = useSelector((state) => state.auth);
  const patientId = user?._id;
  const socket = useSocket();
  const API = import.meta.env.VITE_API_URL;

  const [doctors, setDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [requestStatus, setRequestStatus] = useState({});
  const [selectedDates, setSelectedDates] = useState({});
  const [selectedSlots, setSelectedSlots] = useState({});
  const [availableSlots, setAvailableSlots] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [doctorOnline, setDoctorOnline] = useState({});
  const [activeCall, setActiveCall] = useState(null);

  // ── Fetchers ──
  const fetchConnectedDoctors = async () => {
    try {
      const res = await axios.get(`${API}/api/connection/connected/${patientId}`);
      setDoctors(res.data.doctors);
    } catch (err) { console.error('Failed to fetch connected doctors', err); }
  };

  const fetchAllDoctors = async () => {
    try {
      const res = await axios.get(`${API}/api/doctor/all`);
      setAllDoctors(res.data.doctors || []);
    } catch (err) { console.error('Failed to load doctors', err); }
  };

  const fetchPatientRequests = async () => {
    try {
      const res = await axios.get(`${API}/api/connection/patient/${patientId}`);
      const statusMap = {};
      res.data.requests.forEach((req) => { statusMap[req.docId._id] = req.status; });
      setRequestStatus(statusMap);
    } catch (err) { console.error('Failed to fetch connection requests', err); }
  };

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(`${API}/api/appointments/patient/${patientId}`);
      setAppointments(res.data.appointments);
    } catch (err) { console.error('Failed to load appointments', err); }
  };

  const fetchAvailableSlots = async (docId, date) => {
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const res = await axios.get(`${API}/api/appointments/slots/${docId}?date=${formattedDate}`);
      setAvailableSlots((prev) => ({ ...prev, [`${docId}-${formattedDate}`]: res.data.availableSlots }));
    } catch (err) { console.error('Error fetching slots', err); }
  };

  // ── Socket events ──
  useEffect(() => {
    if (!socket || !patientId) return;
    socket.emit('register', { userId: patientId });

    socket.on('doctor-joined', ({ appointmentId }) => {
      setDoctorOnline((prev) => ({ ...prev, [appointmentId]: true }));
    });

    socket.on('connection-response', (data) => {
      if (data.status === 'accepted' && data.patientId === patientId) {
        toast.success('Doctor accepted your request!');
        fetchConnectedDoctors();
        fetchPatientRequests();
      }
    });

    return () => {
      socket.off('doctor-joined');
      socket.off('connection-response');
    };
  }, [socket, patientId]);

  useEffect(() => {
    if (patientId) {
      fetchConnectedDoctors();
      fetchAllDoctors();
      fetchPatientRequests();
      fetchAppointments();
    }
  }, [patientId]);

  // ── Handlers ──
  const handleDateSelect = (docId, date) => {
    setSelectedDates((prev) => ({ ...prev, [docId]: date }));
    setSelectedSlots((prev) => ({ ...prev, [docId]: null }));
    fetchAvailableSlots(docId, date);
  };

  const handleBookSlot = async (docId) => {
    const selectedDate = selectedDates[docId];
    const selectedTime = selectedSlots[docId];
    if (!selectedDate || !selectedTime) return;

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    try {
      await axios.post(`${API}/api/appointments/book`, {
        patientId, docId, date: formattedDate, time: selectedTime,
      });
      toast.success(`Appointment booked for ${format(selectedDate, 'PPP')} at ${selectedTime}`);
      fetchAvailableSlots(docId, selectedDate);
      fetchAppointments();
      setSelectedSlots((prev) => ({ ...prev, [docId]: null }));
      setSelectedDates((prev) => ({ ...prev, [docId]: null }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    }
  };

  const sendRequest = async (docId) => {
    try {
      await axios.post(`${API}/api/connection/send`, { patientId, docId });
      setRequestStatus((prev) => ({ ...prev, [docId]: 'pending' }));
      toast.success('Connection request sent!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send request');
    }
  };

  const isSlotPast = (date, slotTime) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selectedDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (selectedDay > today) return false;
    const [timePart, mod] = slotTime.split(' ');
    let [h, m] = timePart.split(':').map(Number);
    if (mod === 'PM' && h !== 12) h += 12;
    if (mod === 'AM' && h === 12) h = 0;
    const slotDate = new Date(date);
    slotDate.setHours(h, m, 0, 0);
    return slotDate < now;
  };

  // ── Gradient arrays for doctor cards ──
  const gradients = [
    'from-cyan-500 to-blue-600',
    'from-violet-500 to-purple-600',
    'from-teal-500 to-emerald-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-indigo-500 to-blue-600',
  ];

  return (
    <div id="patient-appointments-page" className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <CalendarDays className="text-white" size={20} />
          </div>
          Appointments
        </h1>
        <p className="text-slate-400 mt-2 ml-[52px]">Book consultations and connect with your doctors</p>
      </div>

      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="w-full mb-6 glass p-1.5 rounded-2xl h-auto border border-white/5">
          <TabsTrigger value="schedule" className="flex-1 flex items-center justify-center gap-2 py-3.5 data-[state=active]:gradient-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/20 rounded-xl text-slate-400 font-semibold text-sm transition-all">
            <CalendarDays size={16} />
            My Doctors
          </TabsTrigger>
          <TabsTrigger value="find" className="flex-1 flex items-center justify-center gap-2 py-3.5 data-[state=active]:gradient-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/20 rounded-xl text-slate-400 font-semibold text-sm transition-all">
            <Search size={16} />
            Find Doctors
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════
            MY DOCTORS TAB
        ═══════════════════════════════════════════ */}
        <TabsContent value="schedule">
          {doctors.length === 0 ? (
            <div className="glass rounded-2xl p-16 text-center border border-white/5">
              <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-5">
                <User className="text-slate-600" size={36} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Connected Doctors</h3>
              <p className="text-slate-400 text-sm">Switch to "Find Doctors" to connect and start booking.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {doctors.map((doc, idx) => {
                const gradient = gradients[idx % gradients.length];
                const selectedDate = selectedDates[doc._id];
                const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
                const slots = formattedDate ? (availableSlots[`${doc._id}-${formattedDate}`] || []) : [];
                const selected = selectedSlots[doc._id];
                const myApt = appointments.find((a) => a.docId?._id === doc._id && a.status === 'scheduled');

                return (
                  <div key={doc._id} className="glass rounded-2xl overflow-hidden group hover:border-white/10 transition-all animate-slide-up" style={{ animationDelay: `${idx * 0.06}s` }}>
                    {/* Gradient top bar */}
                    <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />

                    <div className="p-5 space-y-5">
                      {/* ── Doctor Profile Card ── */}
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0`}>
                          {doc.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-white truncate">{doc.name}</h3>
                          <div className="mt-2 space-y-1.5">
                            <div className="flex items-center gap-2 text-slate-400 text-xs">
                              <div className="w-5 h-5 rounded-md bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                                <Award size={10} className="text-cyan-400" />
                              </div>
                              <span>{doc.experience} years experience</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 text-xs">
                              <div className="w-5 h-5 rounded-md bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                                <Building size={10} className="text-violet-400" />
                              </div>
                              <span className="truncate">{doc.hospital}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 text-xs">
                              <div className="w-5 h-5 rounded-md bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                                <Phone size={10} className="text-teal-400" />
                              </div>
                              <span>{doc.phone}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ── Active Appointment → Join Call ── */}
                      {myApt ? (
                        <div className="space-y-3">
                          {/* Appointment info card */}
                          <div className="glass-light rounded-xl p-4 flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                              <CalendarDays className="text-cyan-400" size={18} />
                            </div>
                            <div className="flex-1">
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Upcoming Appointment</p>
                              <p className="text-sm text-white font-semibold mt-0.5">
                                {format(new Date(myApt.scheduleTime), 'EEE, MMM d')} • {format(new Date(myApt.scheduleTime), 'hh:mm a')}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                              Active
                            </div>
                          </div>

                          {/* Join call button */}
                          <button
                            onClick={() => setActiveCall({ ...myApt, doctorName: doc.name })}
                            disabled={!doctorOnline[myApt._id]}
                            className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold transition-all ${
                              doctorOnline[myApt._id]
                                ? `bg-gradient-to-r ${gradient} text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] shadow-lg`
                                : 'glass-light text-slate-500 cursor-not-allowed border border-white/5'
                            }`}
                          >
                            <Video size={18} />
                            {doctorOnline[myApt._id] ? (
                              <>Join Video Call <ArrowRight size={14} /></>
                            ) : (
                              <>Waiting for Doctor<span className="ml-1 flex gap-0.5">{[0,1,2].map(i => <span key={i} className="w-1 h-1 bg-slate-500 rounded-full animate-pulse" style={{animationDelay:`${i*0.3}s`}} />)}</span></>
                            )}
                          </button>
                        </div>
                      ) : (
                        /* ── Slot Booking UI ── */
                        <div className="space-y-4">
                          {/* Date picker */}
                          <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <CalendarIcon size={11} className="text-cyan-400" /> Select Date
                            </p>
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className={cn(
                                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                                  selectedDate
                                    ? "glass-light border-cyan-500/30 text-cyan-300"
                                    : "glass-light border-white/5 text-slate-400 hover:border-white/15"
                                )}>
                                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                    <CalendarIcon size={14} className="text-cyan-400" />
                                  </div>
                                  {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Pick appointment date'}
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 bg-[#1e293b] border-white/10" align="start">
                                <Calendar
                                  mode="single"
                                  selected={selectedDate}
                                  onSelect={(date) => date && handleDateSelect(doc._id, date)}
                                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>

                          {/* Time Slots */}
                          {selectedDate && (
                            <div>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Clock size={11} className="text-violet-400" /> Available Slots
                              </p>
                              <div className="grid grid-cols-3 gap-2">
                                {(slots.length > 0 ? slots : FIXED_SLOTS.map((t) => ({ time: t, isBooked: false }))).map((slot) => {
                                  const time = typeof slot === 'string' ? slot : slot.time;
                                  const isBooked = typeof slot === 'object' ? slot.isBooked : false;
                                  const isPast = isSlotPast(selectedDate, time);
                                  const isSelected = selected === time;
                                  const disabled = isBooked || isPast;

                                  return (
                                    <button
                                      key={time}
                                      disabled={disabled}
                                      onClick={() => setSelectedSlots((prev) => ({ ...prev, [doc._id]: time }))}
                                      className={`relative px-2 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                                        disabled
                                          ? 'bg-white/2 text-slate-600 border-white/3 cursor-not-allowed line-through'
                                          : isSelected
                                          ? `bg-gradient-to-r ${gradient} text-white border-transparent shadow-lg scale-105`
                                          : 'glass-light text-slate-300 border-white/5 hover:border-cyan-500/30 hover:text-white hover:scale-105'
                                      }`}
                                    >
                                      {time}
                                      {isBooked && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#111827]" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Book button */}
                          {selectedDate && selected && (
                            <button
                              onClick={() => handleBookSlot(doc._id)}
                              className={`w-full flex items-center justify-center gap-2.5 py-3.5 bg-gradient-to-r ${gradient} text-white rounded-xl text-sm font-bold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg`}
                            >
                              <Sparkles size={16} />
                              Book for {format(selectedDate, 'MMM d')} at {selected}
                              <ArrowRight size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ═══════════════════════════════════════════
            FIND DOCTORS TAB
        ═══════════════════════════════════════════ */}
        <TabsContent value="find">
          {allDoctors.length === 0 ? (
            <div className="glass rounded-2xl p-16 text-center border border-white/5">
              <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-5">
                <Stethoscope className="text-slate-600" size={36} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Doctors Available</h3>
              <p className="text-slate-400 text-sm">Check back later for available doctors.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {allDoctors.map((doc, idx) => {
                const gradient = gradients[idx % gradients.length];
                const status = requestStatus[doc._id];

                return (
                  <div key={doc._id} className="glass rounded-2xl overflow-hidden group hover:border-white/10 transition-all animate-slide-up" style={{ animationDelay: `${idx * 0.06}s` }}>
                    {/* Gradient header */}
                    <div className={`bg-gradient-to-r ${gradient} p-5 relative overflow-hidden`}>
                      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
                      <div className="absolute -right-2 -bottom-8 w-16 h-16 rounded-full bg-white/5" />
                      <div className="relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl mb-3 border border-white/20">
                          {doc.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <h3 className="text-lg font-bold text-white">{doc.name}</h3>
                      </div>
                    </div>

                    <div className="p-5 space-y-4">
                      {/* Doctor details */}
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                            <Award size={12} className="text-cyan-400" />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Experience</p>
                            <p className="text-sm text-white font-medium">{doc.experience} years</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                            <Building size={12} className="text-violet-400" />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Hospital</p>
                            <p className="text-sm text-white font-medium truncate">{doc.hospital}</p>
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      <button
                        onClick={() => sendRequest(doc._id)}
                        disabled={status === 'pending' || status === 'accepted'}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                          status === 'accepted'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : `bg-gradient-to-r ${gradient} text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] shadow-lg`
                        }`}
                      >
                        {status === 'accepted' ? (
                          <><CheckCircle size={16} /> Connected</>
                        ) : status === 'pending' ? (
                          <><Timer size={16} /> Pending</>
                        ) : (
                          <><Send size={16} /> Connect <ArrowRight size={14} /></>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Video Call Modal */}
      {activeCall && (
        <VideoCall
          open={!!activeCall}
          onClose={() => { setActiveCall(null); fetchAppointments(); }}
          roomId={activeCall._id}
          role="patient"
          doctorId={activeCall.docId?._id}
          patientId={patientId}
          doctorName={activeCall.doctorName || activeCall.docId?.name}
        />
      )}
    </div>
  );
}

export default PatientAppointments;
