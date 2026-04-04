import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import bodyParser from "body-parser";
import schedule from "node-schedule";
import multer from "multer";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { createClient } from "@deepgram/sdk";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import Appointment from './models/Appointment.js';

dotenv.config();
const upload = multer({ dest: "uploads/" });

import patientAuthRouter from "./routes/patientRoutes.js";
import doctorAuthRouter from "./routes/doctorRoutes.js";
import connectionRequestRoutes from "./routes/connectionRequestRoutes.js";
import appointmentRoutes from './routes/appointmentRoutes.js';
import summaryRoutes from './routes/summaryRoutes.js';
import Dbconnection from './DBconnection.js';
import { setIO } from './controllers/connectionRequestController.js';
import { sendSummary } from './utils/GenAi.js';

const PREGNANCY_DIET_PLANS = [
  { meal: "Breakfast", time: "08:00 AM", items: ["Oats porridge", "2 boiled eggs", "Milk"] },
  { meal: "Mid-Morning Snack", time: "10:30 AM", items: ["Fruit", "Roasted seeds"] },
  { meal: "Lunch", time: "12:30 PM", items: ["Chapati/Rice", "Dal", "Veggies", "Yogurt"] },
  { meal: "Evening Snack", time: "04:00 PM", items: ["Sprouts salad", "Herbal tea"] },
  { meal: "Dinner", time: "07:00 PM", items: ["Chapati/Rice", "Grilled paneer/fish", "Veggies"] },
  { meal: "Before Bed", time: "09:00 PM", items: ["Warm milk", "Almonds"] },
];

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);
console.log("Service Account loaded successfully:", serviceAccount.project_id);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

function getMealDate(timeStr) {
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (modifier === "PM" && hours < 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  if (date < new Date()) date.setDate(date.getDate() + 1);
  return date;
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const port = process.env.PORT || 3000;
Dbconnection();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from your real-time backend!');
});

app.use("/api/patient", patientAuthRouter);
app.use("/api/doctor", doctorAuthRouter);
app.use("/api/connection", connectionRequestRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/summary', summaryRoutes);

app.post("/schedule-notification", (req, res) => {
  const { token, slot, message } = req.body;
  console.log("Scheduling for token:", token);

  const [time, modifier] = slot.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  const appointmentDate = new Date();
  appointmentDate.setHours(hours, minutes, 0, 0);

  const notificationDate = new Date(Date.now() + 5 * 1000);

  schedule.scheduleJob(notificationDate, async () => {
    try {
      await admin.messaging().send({
        token,
        notification: {
          title: "Appointment Reminder",
          body: message,
        },
      });
      console.log("Notification sent:", message);
    } catch (err) {
      console.error("Error sending notification:", err);
    }
  });

  res.json({ status: `Notification scheduled 30 minutes before ${slot}` });
});

app.post("/schedule-diet", (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Token missing" });

  PREGNANCY_DIET_PLANS.forEach(plan => {
    const date = getMealDate(plan.time);
    schedule.scheduleJob(date, async () => {
      try {
        await admin.messaging().send({
          token,
          notification: {
            title: `Time for ${plan.meal}!`,
            body: plan.items.join(", "),
          },
        });
        console.log(`Notification sent for ${plan.meal}`);
      } catch (err) {
        console.error("Error sending diet notification:", err);
      }
    });
    console.log(`Scheduled ${plan.meal} notification at ${date}`);
  });

  res.json({ status: "Diet notifications scheduled" });
});

app.post("/api/process-audio", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const audioBuffer = fs.readFileSync(filePath);
    console.log(`Audio size: ${audioBuffer.length} bytes`);
    console.log("Uploading audio for transcription...");

    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      {
        model: "nova-2",
        smart_format: true,
        diarize: true,
        language: "en",
      }
    );

    if (error) {
      throw new Error(error.message || "Deepgram error");
    }

    const transcript =
      result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

    if (!transcript.trim()) {
      console.error("Full Deepgram result:", JSON.stringify(result, null, 2));
      throw new Error("No transcript returned from Deepgram.");
    }

    console.log("Transcript:", transcript);
    const summary = "Doctor summary: " + transcript.slice(0, 150) + "...";

    fs.unlinkSync(filePath);
    res.json({ transcript, summary });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      error: "Processing failed",
      details: error.message || "Unknown error",
    });
  }
});

// Pass io to connection controller
setIO(io);

// ============================================================
// SOCKET.IO — Fixed WebRTC signaling flow
// ============================================================

// Track room participants: { roomId: { doctor: socketId, patient: socketId } }
const rooms = {};

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // Register personal socket room (for targeted events like connection-requests)
  socket.on('register', ({ userId }) => {
    socket.join(userId);
    console.log(`📥 User ${userId} joined personal room`);
  });

  // ── Doctor joins room ──────────────────────────────────────
  socket.on('doctor-joined', ({ roomId, doctorId, patientId }) => {
    socket.join(roomId);

    if (!rooms[roomId]) rooms[roomId] = {};
    rooms[roomId].doctor = socket.id;
    rooms[roomId].doctorId = doctorId;

    console.log(`🩺 Doctor ${doctorId} joined room ${roomId}`);

    // Notify patient that doctor is online (so "Join Call" button enables)
    if (patientId) {
      io.to(patientId).emit('doctor-joined', { appointmentId: roomId });
      console.log(`📢 Notified patient ${patientId} about doctor in room ${roomId}`);
    }

    // If patient is already in the room, signal both to start
    if (rooms[roomId].patient) {
      console.log(`🚀 Both in room ${roomId} — signaling start-call to doctor`);
      io.to(rooms[roomId].doctor).emit('start-call', { roomId });
    }
  });

  // ── Patient joins room ─────────────────────────────────────
  socket.on('patient-joined', ({ roomId, patientId }) => {
    if (!rooms[roomId]?.doctor) {
      console.log(`⏳ Patient tried joining room ${roomId}, but doctor not present`);
      socket.emit('wait-for-doctor');
      return;
    }

    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = {};
    rooms[roomId].patient = socket.id;
    rooms[roomId].patientId = patientId;

    console.log(`🤰 Patient joined room ${roomId}`);

    // Signal doctor to create offer now that patient is ready
    console.log(`🚀 Both in room ${roomId} — signaling start-call to doctor`);
    io.to(rooms[roomId].doctor).emit('start-call', { roomId });
  });

  // ── WebRTC signaling ────────────────────────────────────────
  socket.on('offer', ({ roomId, offer }) => {
    console.log(`📤 Offer sent in room ${roomId}`);
    socket.to(roomId).emit('receive-offer', offer);
  });

  socket.on('answer', ({ roomId, answer }) => {
    console.log(`📥 Answer sent in room ${roomId}`);
    socket.to(roomId).emit('receive-answer', answer);
  });

  socket.on('ice-candidate', ({ roomId, candidate }) => {
    socket.to(roomId).emit('receive-ice-candidate', candidate);
  });

  // ── End Call (either side) ──────────────────────────────────
  socket.on('end-call', async ({ roomId, appointmentId }) => {
    console.log(`🔴 End call in room ${roomId}`);

    // Notify everyone in the room that the call has ended
    socket.to(roomId).emit('call-ended', { roomId });

    // Mark appointment as completed in DB
    if (appointmentId) {
      try {
        await Appointment.findByIdAndUpdate(appointmentId, { status: 'completed' });
        console.log(`✅ Appointment ${appointmentId} marked as completed`);
      } catch (err) {
        console.error(`❌ Failed to complete appointment ${appointmentId}:`, err);
      }
    }

    // Clean up room
    delete rooms[roomId];
  });

  // ── Leave room (legacy, for cleanup) ────────────────────────
  socket.on('leave-room', ({ roomId, userType }) => {
    socket.leave(roomId);
    console.log(`🚪 ${userType} left room ${roomId}`);
    socket.to(roomId).emit('user-left', { userType });

    if (rooms[roomId]) {
      if (userType === 'doctor') delete rooms[roomId].doctor;
      if (userType === 'patient') delete rooms[roomId].patient;
      if (!rooms[roomId].doctor && !rooms[roomId].patient) {
        delete rooms[roomId];
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    // Clean up any rooms this socket was in
    for (const [roomId, room] of Object.entries(rooms)) {
      if (room.doctor === socket.id) {
        socket.to(roomId).emit('call-ended', { roomId });
        delete rooms[roomId];
      } else if (room.patient === socket.id) {
        socket.to(roomId).emit('call-ended', { roomId });
        delete rooms[roomId];
      }
    }
  });
});

// Start server
server.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});