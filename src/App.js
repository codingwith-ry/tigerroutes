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
import UserResultsHistory from "./User-side/UserResultsHistory";
import ProfilePage from "./User-side/ProfilePage";
<<<<<<< HEAD
import AdminDashboard from './Admin-side/AdminDashboard';
=======
import NoResultPage from "./User-side/NoResultPage";
import AssessmentPage from "./User-side/AssessmentPage";


>>>>>>> 125946bdf4c8522b9fed951fc19e4fea1b2efb8e


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
          <Route path="/error" element={<Error />} />
          <Route path="/assessment" element={<AssessmentWelcome />} />
          <Route path="home" element={<UserHomepage />} />
          <Route path="/results" element={<UserResults />} />
          <Route path="/results-history" element={<UserResultsHistory />} />
          <Route path="/profile" element={<ProfilePage />} />
<<<<<<< HEAD
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
=======
          <Route path="/noresult" element={<NoResultPage />} />
          <Route path="/assessment-test" element={<AssessmentPage />} />

>>>>>>> 125946bdf4c8522b9fed951fc19e4fea1b2efb8e
        </Routes>
      </div>
    </Router>
  );
}

export default App;