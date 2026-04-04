import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AuthLayout from './components/layouts/AuthLayout';
import DashboardLayout from './components/layouts/DashboardLayout';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';

// Doctor pages
import DoctorAppointments from './pages/doctor/Appointments';
import DoctorConnectionRequests from './pages/doctor/ConnectionRequests';
import DoctorSummaries from './pages/doctor/Summaries';

// Patient pages
import PatientAppointments from './pages/patient/Appointments';
import PatientRiskPrediction from './pages/patient/RiskPrediction';
import PatientDietPlan from './pages/patient/DietPlan';

function App() {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      {/* Protected dashboard routes */}
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? <DashboardLayout /> : <Navigate to="/auth/login" replace />
        }
      >
        {/* Doctor routes */}
        {role === 'doctor' && (
          <>
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="connections" element={<DoctorConnectionRequests />} />
            <Route path="summaries" element={<DoctorSummaries />} />
          </>
        )}

        {/* Patient routes */}
        {role === 'patient' && (
          <>
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="risk-prediction" element={<PatientRiskPrediction />} />
            <Route path="diet" element={<PatientDietPlan />} />
          </>
        )}

        {/* Default redirect */}
        <Route index element={<Navigate to="appointments" replace />} />
      </Route>

      {/* Root redirect */}
      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? '/dashboard/appointments' : '/auth/login'} replace />
        }
      />
    </Routes>
  );
}

export default App;
