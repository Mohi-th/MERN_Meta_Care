
import { Routes, Route } from 'react-router-dom'
import AuthLayout from "./components/Auth/Layout"
import LoginPage from "./pages/Login"
import RegisterPage from "./pages/Register"
import HomeLayout from './components/Home/Layout'
import AppointmentsPage from './pages/Appointments'
import ConnectionRequests from './pages/ConnectionRequests'
import { useNavigate} from "react-router-dom"
import { use } from 'react'
import { useEffect } from 'react'
import SummariesPage from './pages/SummariesPage'
import { useState } from 'react'

function App() {

  const navigate=useNavigate()

  const [currentPatientId,setCurrentPatientId]=useState("");

  useEffect(()=>{
    navigate("/auth/login")
  },[])

  return (
    <Routes>
      <Route path="/auth/*" element={<AuthLayout/>}>
        <Route path="login" element={<LoginPage/>}/>
        <Route path="register" element={<RegisterPage/>}/>
      </Route>
      <Route path="/home/*" element={<HomeLayout/>}>
        <Route path="appointments" element={<AppointmentsPage setCurrentPatientId={setCurrentPatientId} currentPatientId={currentPatientId}/>}/>
        <Route path="requests" element={<ConnectionRequests/>}/>
        <Route path="summaries" element={<SummariesPage />} />
      </Route>
    </Routes>
  )
}

export default App