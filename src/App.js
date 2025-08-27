import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './Visitor-side/LandingPage';
import LoginPage from './Visitor-side/LoginPage';
import RegisterPage from './Visitor-side/RegisterPage';
import ForgotPassword from './Visitor-side/ForgotPassword';
import OtpCodePage from "./Visitor-side/OtpCodePage";
import ResetPassword from "./Visitor-side/ResetPassword";
import AdminLogin from "./Admin-side/AdminLogin";
import Error from "./Visitor-side/Error";
import AssessmentWelcome from "./User-side/AssessmentWelcome";
import UserHomepage from "./User-side/UserHomepage";
import UserResults from "./User-side/UserResults";



function App() {
  return (
    <Router>
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/otp" element={<OtpCodePage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/error" element={<Error />} />
          <Route path="/assessment" element={<AssessmentWelcome />} />
          <Route path="home" element={<UserHomepage />} />
          <Route path="/results" element={<UserResults />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;