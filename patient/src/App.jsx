
import { Routes, Route, useNavigate } from 'react-router-dom'
import AuthLayout from "./components/Auth/Layout"
import LoginPage from "./pages/Login"
import RegisterPage from "./pages/Register"
import HomeLayout from './components/Home/HomeLayout'
import Appointment from './pages/Appointment'
import RiskPrediction from './pages/RiskPrediction'
import { useEffect, useState } from 'react'
import { messaging, getToken, onMessage } from './firebase';
import axios from 'axios'
import DietPlan from './pages/DietPlan'
import { Toaster } from "sonner";

function App() {

  const navigate=useNavigate()

  const [token, setToken] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    navigate("/auth/login")
    // Request permission for notifications
    Notification.requestPermission().then(async (permission) => {
      if (permission === 'granted') {
        const currentToken = await getToken(messaging, { vapidKey: 'BLdjc9Ioj5VXA82wIUAMrBPQ_ffDTO1SIYl0_UKRFPO9vqeNTzBN2lccvT_7BUpBkl01LVnrHvgwcGkhdH253II' });
        console.log(permission,"permission")
        setToken(currentToken);
        console.log('FCM Token:', currentToken);
      }
    });

    // Listen to foreground messages
    onMessage(messaging, (payload) => {
      console.log('Message received: ', payload);
      alert(payload.notification.body);
      setMessages((prev) => [...prev, payload.notification.body]);
    });
  }, []);

  const scheduleNotification = async (slot) => {
  if (!token) return alert('Token not generated yet!');

  try {
    await axios.post(`${import.meta.env.VITE_API_URL}/schedule-notification`, {
      token,
      slot, // e.g., '03:00 PM'
      message: `Your appointment is at ${slot}. Please be ready!`
    });
    alert('Notification scheduled 30 minutes before the appointment!');
  } catch (err) {
    console.error("Error scheduling notification:", err);
    alert('Failed to schedule notification');
  }
};


  

  return (
    <>
    <Toaster richColors/>
    <Routes>
      <Route path="/auth/*" element={<AuthLayout/>}>
        <Route path="login" element={<LoginPage/>}/>
        <Route path="register" element={<RegisterPage/>}/>
      </Route>
      <Route path='/home/*' element={<HomeLayout scheduleNotification={scheduleNotification}/>}>
        <Route path='appointment' element={<Appointment scheduleNotification={scheduleNotification}/>}/>
        <Route path='riskprediction' element={<RiskPrediction/>}/>
        <Route path="diet" element={<DietPlan fcmToken={token}/>} />
      </Route>
    </Routes>
    </>
  )
}

export default App