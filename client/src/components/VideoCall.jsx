import { useEffect, useRef, useState, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useSocket } from '@/context/SocketProvider';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Circle } from 'lucide-react';
import axios from 'axios';

/**
 * Shared VideoCall component for both doctor and patient.
 *
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - roomId: string (appointment _id)
 * - role: 'doctor' | 'patient'
 * - doctorId: string
 * - patientId: string
 * - patientName: string
 * - doctorName: string
 */
function VideoCall({ open, onClose, roomId, role, doctorId, patientId, patientName, doctorName }) {
  const socket = useSocket();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const iceCandidateQueue = useRef([]);

  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [callEnded, setCallEnded] = useState(false);

  // Recording (doctor only)
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const API = import.meta.env.VITE_API_URL;

  // ── Teardown helper ─────────────────────────────
  const cleanup = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
    iceCandidateQueue.current = [];
    setRemoteConnected(false);
  }, [recording]);

  // ── End call (user-initiated) ────────────────────
  const endCall = useCallback(() => {
    if (callEnded) return;
    setCallEnded(true);
    socket.emit('end-call', { roomId, appointmentId: roomId });
    cleanup();
    onClose();
  }, [socket, roomId, cleanup, onClose, callEnded]);

  // ── Setup WebRTC ────────────────────────────────
  useEffect(() => {
    if (!open || !roomId || !socket) return;
    setCallEnded(false);

    let pc;

    const init = async () => {
      // Get media
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      // Create peer
      pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      });
      peerRef.current = pc;

      // Add tracks
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Remote track handler
      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setRemoteConnected(true);
        }
      };

      // ICE candidates
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit('ice-candidate', { roomId, candidate: e.candidate });
        }
      };

      // Join room
      if (role === 'doctor') {
        socket.emit('doctor-joined', { roomId, doctorId, patientId });
      } else {
        socket.emit('patient-joined', { roomId, patientId });
      }
    };

    init();

    // ── Doctor: create offer when server says both are ready ──
    const handleStartCall = async () => {
      if (!peerRef.current || role !== 'doctor') return;
      try {
        const offer = await peerRef.current.createOffer();
        await peerRef.current.setLocalDescription(offer);
        socket.emit('offer', { roomId, offer });
      } catch (err) {
        console.error('Error creating offer:', err);
      }
    };

    // ── Receive offer (patient side) ──
    const handleReceiveOffer = async (offer) => {
      if (!peerRef.current) return;
      try {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        // Process queued ICE candidates
        for (const candidate of iceCandidateQueue.current) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
        iceCandidateQueue.current = [];

        const answer = await peerRef.current.createAnswer();
        await peerRef.current.setLocalDescription(answer);
        socket.emit('answer', { roomId, answer });
      } catch (err) {
        console.error('Error handling offer:', err);
      }
    };

    // ── Receive answer (doctor side) ──
    const handleReceiveAnswer = async (answer) => {
      if (!peerRef.current) return;
      try {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        // Process queued ICE candidates
        for (const candidate of iceCandidateQueue.current) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
        iceCandidateQueue.current = [];
      } catch (err) {
        console.error('Error handling answer:', err);
      }
    };

    // ── Receive ICE candidate ──
    const handleReceiveIce = async (candidate) => {
      if (!peerRef.current) return;
      try {
        if (peerRef.current.remoteDescription) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          iceCandidateQueue.current.push(candidate);
        }
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    };

    // ── Remote ended the call ──
    const handleCallEnded = () => {
      setCallEnded(true);
      cleanup();
      onClose();
    };

    socket.on('start-call', handleStartCall);
    socket.on('receive-offer', handleReceiveOffer);
    socket.on('receive-answer', handleReceiveAnswer);
    socket.on('receive-ice-candidate', handleReceiveIce);
    socket.on('call-ended', handleCallEnded);

    return () => {
      socket.off('start-call', handleStartCall);
      socket.off('receive-offer', handleReceiveOffer);
      socket.off('receive-answer', handleReceiveAnswer);
      socket.off('receive-ice-candidate', handleReceiveIce);
      socket.off('call-ended', handleCallEnded);
      cleanup();
    };
  }, [open, roomId, socket, role, doctorId, patientId]);

  // ── Mic toggle ──
  const toggleMic = () => {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getAudioTracks()[0];
      if (track) { track.enabled = !micOn; setMicOn(!micOn); }
    }
  };

  // ── Video toggle ──
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getVideoTracks()[0];
      if (track) { track.enabled = !videoOn; setVideoOn(!videoOn); }
    }
  };

  // ── Recording (doctor only) ──
  const startRecording = () => {
    if (!localStreamRef.current) return;
    const audioContext = new AudioContext();
    const dest = audioContext.createMediaStreamDestination();
    const localSource = audioContext.createMediaStreamSource(localStreamRef.current);
    localSource.connect(dest);

    if (remoteVideoRef.current?.srcObject) {
      const remoteSource = audioContext.createMediaStreamSource(remoteVideoRef.current.srcObject);
      remoteSource.connect(dest);
    }

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus' : 'audio/webm';

    const recorder = new MediaRecorder(dest.stream, { mimeType });
    audioChunksRef.current = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
    recorder.onstop = async () => {
      const blob = new Blob(audioChunksRef.current, { type: mimeType });
      if (blob.size === 0) return;
      const file = new File([blob], 'consultation.webm', { type: mimeType });
      const fd = new FormData();
      fd.append('file', file);
      try {
        const res = await fetch(`${API}/api/process-audio`, { method: 'POST', body: fd });
        const data = await res.json();
        if (data.summary) {
          await axios.post(`${API}/api/summary/create`, {
            doctorId, patientId, transcript: data.summary,
          });
        }
      } catch (err) { console.error('Error sending audio:', err); }
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={() => endCall()}>
      <DialogContent
        className="p-0 h-[98vh] w-full max-w-full flex flex-col overflow-hidden"
        style={{ background: '#0b1120', border: '1px solid rgba(255,255,255,0.05)' }}
        showCloseButton={false}
      >
        {/* Header */}
        <div className="glass px-6 py-4 flex items-center justify-between border-b border-white/5" id="video-call-header">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Video size={20} className="text-cyan-400" />
              Video Consultation
            </h3>
            <p className="text-sm text-slate-400">
              {role === 'doctor' ? `Patient: ${patientName || 'Patient'}` : `Doctor: ${doctorName || 'Doctor'}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Recording (doctor only) */}
            {role === 'doctor' && (
              <button
                onClick={recording ? stopRecording : startRecording}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  recording
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse-glow'
                    : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                }`}
                id="record-btn"
              >
                <Circle size={14} className={recording ? 'fill-red-500 text-red-500' : ''} />
                {recording ? 'Stop Recording' : 'Record'}
              </button>
            )}

            {/* End Call */}
            <button
              onClick={endCall}
              className="flex items-center gap-2 px-5 py-2 gradient-danger text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-red-500/25 transition-all"
              id="end-call-btn"
            >
              <PhoneOff size={16} />
              End Call
            </button>
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 flex flex-col md:flex-row gap-3 p-4 min-h-0">
          {/* Local video */}
          <div className="relative flex-1 rounded-2xl overflow-hidden border border-cyan-500/30 shadow-lg shadow-cyan-500/10" id="local-video-wrapper">
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover bg-slate-900" />
            <div className="absolute bottom-3 left-3 glass px-3 py-1.5 rounded-lg">
              <p className="text-white text-xs font-semibold">You</p>
            </div>
          </div>

          {/* Remote video */}
          <div className="relative flex-1 rounded-2xl overflow-hidden border border-teal-500/30 shadow-lg shadow-teal-500/10" id="remote-video-wrapper">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover bg-slate-900" />
            {!remoteConnected && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-400 text-sm">Waiting for {role === 'doctor' ? 'patient' : 'doctor'}...</p>
              </div>
            )}
            <div className="absolute bottom-3 left-3 glass px-3 py-1.5 rounded-lg">
              <p className="text-white text-xs font-semibold">
                {role === 'doctor' ? patientName || 'Patient' : doctorName || 'Doctor'}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="glass px-6 py-4 flex items-center justify-center gap-4 border-t border-white/5" id="video-call-controls">
          <button
            onClick={toggleMic}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              micOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500/20 text-red-400'
            }`}
          >
            {micOn ? <Mic size={20} /> : <MicOff size={20} />}
          </button>
          <button
            onClick={toggleVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              videoOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500/20 text-red-400'
            }`}
          >
            {videoOn ? <Video size={20} /> : <VideoOff size={20} />}
          </button>
          <button
            onClick={endCall}
            className="w-14 h-14 rounded-full gradient-danger flex items-center justify-center text-white shadow-lg shadow-red-500/25 hover:scale-105 transition-all"
          >
            <PhoneOff size={22} />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default VideoCall;
