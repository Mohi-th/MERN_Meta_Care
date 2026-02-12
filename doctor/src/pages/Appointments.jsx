import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useSelector } from "react-redux";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useSocket } from '../context/SocketProvider';

function AppointmentsPage({setCurrentPatientId,currentPatientId}) {
  const [appointments, setAppointments] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🎙️ Recording-related states
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const socket = useSocket();
  const peerRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const { user } = useSelector(state => state.doctor);
  const doctorId = user?._id;

  // ✅ Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/appointments/doctor/${doctorId}`);
      setAppointments(res.data.appointments);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveTranscript = async (doctorId, patientId, transcript) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/summary/create`, {
      doctorId,
      patientId,
      transcript,
    });

    console.log("✅ Transcript stored successfully:", response.data);
    return response.data; // newly created summary document
  } catch (error) {
    console.error("❌ Error saving transcript:", error.response?.data || error);
    throw error;
  }
};

  // ✅ Start Call
  const startCall = async (appointment) => {
    setCurrentPatient(appointment);
    setCurrentPatientId(appointment?.patientId?._id);
    const roomId = appointment._id;
    setActiveRoom(roomId);
    setIsDialogOpen(true);

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setLocalStream(stream);
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    peerRef.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    stream.getTracks().forEach(track => peerRef.current.addTrack(track, stream));

    peerRef.current.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
    };

    peerRef.current.onicecandidate = (e) => {
      if (e.candidate) socket.emit("ice-candidate", { roomId, candidate: e.candidate });
    };

    socket.emit("doctor-joined", {
      roomId,
      doctorId,
      patientId: appointment?.patientId?._id
    });

    const offer = await peerRef.current.createOffer();
    await peerRef.current.setLocalDescription(offer);
    socket.emit("offer", { roomId, offer });
  };

  // ✅ End Call + stop recording + send audio to backend
  const endCall = async () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }

    if (peerRef.current) peerRef.current.close();
    if (localStream) localStream.getTracks().forEach(track => track.stop());
    setLocalStream(null);
    setRemoteStream(null);
    setActiveRoom(null);
    setIsDialogOpen(false);
  };

  // ✅ Recording merged doctor + patient audio
  const startRecording = () => {
    if (!localStream || !remoteStream) {
      alert("Start the call and wait for patient to join before recording.");
      return;
    }
    console.log("recording")

    const audioContext = new AudioContext();
    const dest = audioContext.createMediaStreamDestination();

    const localSource = audioContext.createMediaStreamSource(localStream);
    const remoteSource = audioContext.createMediaStreamSource(remoteStream);

    localSource.connect(dest);
    remoteSource.connect(dest);

    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";

    const mediaRecorder = new MediaRecorder(dest.stream, { mimeType });
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(audioChunksRef.current, { type: mimeType });
      if (blob.size === 0) {
        alert("⚠️ No audio captured. Please ensure both sides spoke.");
        return;
      }

      const file = new File([blob], "consultation.webm", { type: mimeType });
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/process-audio`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.summary) {
          console.log("🧠 Consultation Summary:\n" + data.summary);
          saveTranscript(doctorId,currentPatientId,data.summary)
        } else {
          alert("No summary received from backend");
        }
      } catch (err) {
        console.error("Error sending audio:", err);
      }
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setRecording(true);
  };

  useEffect(() => {
    if (doctorId) fetchAppointments();
  }, [doctorId]);

  useEffect(() => {
    if (!socket) return;

    socket.on("receive-offer", async (offer) => {
      if (!peerRef.current) return;
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);
      socket.emit("answer", { roomId: activeRoom, answer });
    });

    socket.on("receive-answer", async (answer) => {
      if (peerRef.current) {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on("receive-ice-candidate", (candidate) => {
      if (peerRef.current) peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    });

    return () => {
      socket.off("receive-offer");
      socket.off("receive-answer");
      socket.off("receive-ice-candidate");
    };
  }, [socket, activeRoom]);

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks()[0].enabled = !micOn;
      setMicOn(!micOn);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks()[0].enabled = !videoOn;
      setVideoOn(!videoOn);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Your Appointments</h2>
        <p className="text-gray-600 mt-1">Manage and join your scheduled consultations</p>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No appointments scheduled.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment._id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900">{appointment.patientId?.name}</h3>
                  <p className="text-sm text-gray-500">{appointment.patientId?.phone}</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <button
                      onClick={() => startCall(appointment)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Join Call
                    </button>
                  </DialogTrigger>

                  <DialogContent className="p-0 h-[98vh] w-full max-w-full bg-gray-900 flex flex-col">
                    {/* Header */}
                    <div className="bg-gray-800 px-6 py-4 flex justify-between items-center border-b border-gray-700">
                      <div>
                        <h3 className="text-xl font-bold text-white">Video Consultation</h3>
                        <p className="text-sm text-gray-400">
                          {currentPatient?.patientId?.name || "Patient"}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        {!recording ? (
                          <button
                            onClick={startRecording}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                          >
                            🎙️ Start Recording
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              mediaRecorderRef.current.stop();
                              setRecording(false);
                            }}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg"
                          >
                            ⏹ Stop & Summarize
                          </button>
                        )}
                        <button
                          onClick={endCall}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                        >
                          End Call
                        </button>
                      </div>
                    </div>

                    {/* Videos */}
                    <div className="flex-1 flex justify-center items-center relative">
                      <video ref={remoteVideoRef} autoPlay className="w-full h-full object-cover" />
                      <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        className="absolute bottom-6 right-6 w-40 h-32 object-cover rounded-lg border-2 border-white"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AppointmentsPage;
