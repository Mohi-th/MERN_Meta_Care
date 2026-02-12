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
dotenv.config(); // This remains the same as it's a function call
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
  if (date < new Date()) date.setDate(date.getDate() + 1); // next day if passed
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
app.use('/api/summary',summaryRoutes );

app.post("/schedule-notification", (req, res) => { 
  const { token, slot, message } = req.body; // slot = '03:00 PM'
  console.log("Scheduling for token:", token);
  
  // Convert slot string to Date object
  const [time, modifier] = slot.split(' '); // e.g., '03:00' and 'PM'
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  
  const appointmentDate = new Date();
  appointmentDate.setHours(hours, minutes, 0, 0);
  
  // Schedule notification 30 minutes before
  // const notificationDate = new Date(appointmentDate.getTime() - 30 * 60 * 1000);
  const notificationDate = new Date(Date.now() + 5 * 1000); // 5 seconds later

  // if (notificationDate < new Date()) {
  //   return res.status(400).json({ error: "Appointment is too close or already passed" });
  // }

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

    // 🟢 Deepgram SDK returns { result, error }
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

    console.log("Deepgram response keys:", Object.keys(result));

    // ✅ Extract transcript safely
    const transcript =
      result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

    if (!transcript.trim()) {
      console.error("Full Deepgram result:", JSON.stringify(result, null, 2));
      throw new Error("No transcript returned from Deepgram. Check audio content or format.");
    }

    console.log("Transcript:", transcript);



    // const summary = await sendSummary(transcript);

    // Optional: Generate a summary (placeholder logic)
    const summary = "Doctor summary: " + transcript.slice(0, 150) + "...";

    fs.unlinkSync(filePath); // cleanup
    res.json({ transcript, summary });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      error: "Processing failed",
      details: error.message || "Unknown error",
    });
  }
});


// Pass io to connection controller if needed
setIO(io);

// Track active rooms where doctor has joined
const activeRooms = {}; // { roomId: { doctorJoined: true } }

io.on('connection', (socket) => {
  console.log('🔌 A user connected:', socket.id);

  // Register personal socket room
  socket.on('register', ({ userId }) => {
    socket.join(userId);
    console.log(`📥 User ${userId} joined personal room`);
  });

  // Doctor joins the room
  socket.on('doctor-joined', ({ roomId, doctorId, patientId }) => {
    socket.join(roomId);
    if (!activeRooms[roomId]) activeRooms[roomId] = {};
    activeRooms[roomId].doctorJoined = true;
    console.log(`🩺 Doctor ${doctorId} joined room ${roomId}`);

    // Notify patient if they registered
    if (patientId) {
      console.log(patientId)
      io.to(patientId).emit('doctor-joined', { appointmentId: roomId });
      console.log(`📢 Notified patient ${patientId} that doctor joined room ${roomId}`);
    }
  });

  // Patient tries to join
  socket.on('patient-joined', ({ roomId }) => {

    console.log("patient joined")
    if (!activeRooms[roomId]?.doctorJoined) {
      console.log(`⏳ Patient tried joining room ${roomId}, but doctor not joined`);
      socket.emit('wait-for-doctor');
      return;
    } 

    socket.join(roomId);
    console.log(`🤰 Patient joined room ${roomId}`);
    console.log(roomId,"idd")
    socket.to(roomId).emit('user-joined', { userType: 'patient' });
  });

  // WebRTC signaling
  socket.on('offer', ({ roomId, offer }) => {
    console.log(`📤 Offer from doctor in room ${roomId}`);
    socket.to(roomId).emit('receive-offer', offer);
  });

  socket.on('answer', ({ roomId, answer }) => {
    console.log(`📥 Answer from patient in room ${roomId}`);
    socket.to(roomId).emit('receive-answer', answer);
  });

  socket.on('ice-candidate', ({ roomId, candidate }) => {
    console.log(`❄️ ICE candidate in room ${roomId}`);
    socket.to(roomId).emit('receive-ice-candidate', candidate);
  });

  // Leave call or disconnect
  socket.on('leave-room', ({ roomId, userType }) => {
    socket.leave(roomId);
    console.log(`🚪 ${userType} left room ${roomId}`);
    socket.to(roomId).emit('user-left', { userType });

    if (userType === 'doctor') {
      delete activeRooms[roomId];
      console.log(`🧹 Cleared room ${roomId} as doctor left`);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// Start server
server.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
 