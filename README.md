# 🩺 MetaCare — Comprehensive Pregnancy Care Platform

MetaCare is a full-stack telemedicine platform designed for pregnancy care. It connects patients with doctors through real-time video consultations (WebRTC), appointment scheduling, AI-powered consultation summaries, pregnancy risk prediction, and personalized diet planning — all in a unified, modern interface.

---

## ✨ Features

### 🔐 Authentication
- Unified login and registration with **role-based access** (Doctor / Patient)
- Role toggle on auth pages — one app, two experiences

### 📅 Appointment Management
- Patients browse and connect with available doctors
- Book appointments with a **calendar + time slot picker** (future dates only)
- Appointment status tracking: `scheduled` → `completed` / `cancelled`

### 📹 Real-Time Video Consultations (WebRTC)
- Peer-to-peer video calls between doctor and patient via WebRTC
- Server-managed signaling ensures both parties are connected before the call begins
- Mutual call termination — ending from either side closes both
- Appointments auto-marked as **completed** upon call end
- Audio recording with **Deepgram transcription** for post-call summaries

### 🤖 AI-Powered Summaries
- Consultation audio is transcribed and summarized using **Groq AI**
- Doctors can view and regenerate AI summaries per consultation

### 🔮 Pregnancy Risk Prediction
- Input vital signs (BP, blood sugar, hemoglobin, heart rate, etc.) and symptoms
- ML model predicts risk level for the pregnancy

### 🥗 Diet Plan & Notifications
- Curated pregnancy diet plan with 6 daily meals
- **Firebase Cloud Messaging (FCM)** push notifications for meal reminders

### 🔔 Real-Time Updates
- Socket.IO powers live connection request notifications, doctor online status, and call signaling

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 7, Redux Toolkit, TailwindCSS v4, Radix UI, Lucide Icons |
| **Backend** | Node.js, Express, Socket.IO, Mongoose |
| **Database** | MongoDB Atlas |
| **Video Calls** | WebRTC + STUN (Google) |
| **AI/ML** | Deepgram (transcription), Groq AI (summaries), Flask (risk prediction) |
| **Notifications** | Firebase Cloud Messaging |
| **UI Design** | Dark medical theme with glassmorphism, gradient accents, Inter font |

---

## 📁 Project Structure

```
MajorProject/
├── backend/                 # Express + Socket.IO server
│   ├── app.js               # Server entry, Socket.IO signaling
│   ├── controllers/         # Auth, appointments, connections, summaries
│   ├── models/              # Mongoose schemas (Doctor, Patient, Appointment, etc.)
│   ├── routes/              # API routes
│   └── utils/               # AI helpers
│
├── client/                  # Unified React frontend (Vite)
│   ├── src/
│   │   ├── components/      # VideoCall, UI components (shadcn), layouts
│   │   ├── pages/
│   │   │   ├── Login.jsx    # Role-toggle login
│   │   │   ├── Register.jsx # Role-toggle register
│   │   │   ├── doctor/      # Appointments, ConnectionRequests, Summaries
│   │   │   └── patient/     # Appointments, RiskPrediction, DietPlan
│   │   ├── store/           # Redux (authSlice)
│   │   ├── context/         # SocketProvider
│   │   └── firebase.js      # FCM config
│   └── index.html
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas connection string
- Firebase project (for push notifications)
- Deepgram API key (for transcription)

### 1. Clone the repo
```bash
git clone https://github.com/Mohi-th/MERN_Meta_Care.git
cd MERN_Meta_Care
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file:
```env
MONGO_DB_URL=your_mongodb_connection_string
FIREBASE_KEY=your_firebase_service_account_json
DEEPGRAM_API_KEY=your_deepgram_key
PORT=3000
```

Start the server:
```bash
npm start        # or: nodemon app.js
```

### 3. Client setup
```bash
cd client
npm install
```

The `.env` file is pre-configured:
```env
VITE_API_URL='http://localhost:3000'
VITE_GROQ_API='https://groq-ai-sjkl.onrender.com'
```

Start the dev server:
```bash
npm run dev
```

### 4. (Optional) Risk Prediction ML Server
```bash
cd ml-server     # if applicable
pip install -r requirements.txt
python app.py    # runs on http://localhost:5000
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/doctor/register` | Register a doctor |
| POST | `/api/doctor/login` | Doctor login |
| POST | `/api/patient/register` | Register a patient |
| POST | `/api/patient/login` | Patient login |
| GET | `/api/doctor/all` | List all doctors |
| POST | `/api/connection/send` | Send connection request |
| POST | `/api/connection/update-status` | Accept/reject request |
| GET | `/api/connection/doctor/:docId` | Doctor's requests |
| GET | `/api/connection/patient/:patientId` | Patient's requests |
| GET | `/api/connection/connected/:patientId` | Patient's connected doctors |
| POST | `/api/appointments/book` | Book an appointment |
| GET | `/api/appointments/slots/:docId` | Available slots |
| GET | `/api/appointments/doctor/:docId` | Doctor's appointments |
| GET | `/api/appointments/patient/:patientId` | Patient's appointments |
| PUT | `/api/appointments/:id/complete` | Mark appointment completed |

---

## 🔌 Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `register` | Client → Server | Register user's socket for targeted events |
| `doctor-joined` | Client → Server | Doctor joins a call room |
| `patient-joined` | Client → Server | Patient joins a call room |
| `start-call` | Server → Client | Both parties present — doctor creates offer |
| `offer` / `answer` | Peer ↔ Peer | WebRTC SDP exchange |
| `ice-candidate` | Peer ↔ Peer | ICE candidate exchange |
| `end-call` | Client → Server | End call + mark appointment completed |
| `call-ended` | Server → Client | Notify other party that call ended |

---

## 👨‍💻 Author

**Mohith** — [GitHub](https://github.com/Mohi-th)
