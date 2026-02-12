import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSocket } from "@/context/SocketProvider";

function VideoCallDialog({ open = true, onClose, roomId, role }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [peerConnection, setPeerConnection] = useState(null);
  const socket = useSocket();

  useEffect(() => {
    if (!open || !roomId || !socket) return;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    setPeerConnection(pc);

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      });

    // Role-based join
    if (role === "doctor") {
      socket.emit("doctor-joined", { roomId });
    } else {
      socket.emit("patient-joined", { roomId });
    }

    // Signals
    if (role === "doctor") {
      pc.onnegotiationneeded = async () => {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { roomId, offer });
      };
    }

    socket.on("receive-offer", async (offer) => {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { roomId, answer });
    });

    socket.on("receive-answer", async (answer) => {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("receive-ice-candidate", (candidate) => {
      if (candidate) pc.addIceCandidate(new RTCIceCandidate(candidate));
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { candidate: event.candidate, roomId });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    socket.on("wait-for-doctor", () => {
      alert("Please wait. Doctor hasn't joined the room yet.");
      onClose();
    });

    return () => {
      socket.emit("leave-room", { roomId, userType: role });
      socket.off("receive-offer");
      socket.off("receive-answer");
      socket.off("receive-ice-candidate");
      socket.off("wait-for-doctor");
      pc.close();
    };
  }, [open, roomId, socket]);

  const toggleMic = () => {
    const stream = localVideoRef.current?.srcObject;
    if (stream) {
      stream.getAudioTracks().forEach((track) => (track.enabled = !micOn));
      setMicOn((prev) => !prev);
    }
  };

  const toggleCamera = () => {
    const stream = localVideoRef.current?.srcObject;
    if (stream) {
      stream.getVideoTracks().forEach((track) => (track.enabled = !cameraOn));
      setCameraOn((prev) => !prev);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] h-[80vh] p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Video Call Room: {roomId}</h2>
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            End
          </button>
        </div>
        <div className="flex gap-4 justify-center">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-1/2 rounded" />
          <video ref={remoteVideoRef} autoPlay playsInline className="w-1/2 rounded" />
        </div>
        <div className="flex justify-center mt-4 gap-4">
          <button onClick={toggleMic} className="px-4 py-2 bg-gray-700 text-white rounded">
            {micOn ? "Mute Mic" : "Unmute Mic"}
          </button>
          <button onClick={toggleCamera} className="px-4 py-2 bg-gray-700 text-white rounded">
            {cameraOn ? "Turn Off Camera" : "Turn On Camera"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default VideoCallDialog;
