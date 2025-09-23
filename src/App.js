import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './Visitor-side/LandingPage';
import LoginPage from './Visitor-side/LoginPage';
import RegisterPage from './Visitor-side/RegisterPage';
import ForgotPassword from './Visitor-side/ForgotPassword';
import OtpCodePage from "./Visitor-side/OtpCodePage";
import ResetPassword from "./Visitor-side/ResetPassword";
import Error from "./Visitor-side/Error";
import AssessmentWelcome from "./User-side/AssessmentWelcome";
import UserHomepage from "./User-side/UserHomepage";
import UserResults from "./User-side/UserResults";
import UserResultsHistory from "./User-side/UserResultsHistory";
import ProfilePage from "./User-side/ProfilePage";
import NoResultPage from "./User-side/NoResultPage";
import AssessmentPage from "./User-side/AssessmentPage";
import AssessmentBigFive from "./User-side/AssessmentBigFive";
import AssessmentRIASEC from "./User-side/AssessmentRIASEC";
import AdminDashboard from './Admin-side/AdminDashboard';
import AdminLogin from "./Admin-side/AdminLogin";
import AdminAssessment from "./Admin-side/AdminAssessment";
import AdminCounselors from "./Admin-side/AdminCounselors";
import AdminStudentProfile from './Admin-side/AdminStudentProfile';
import PrivacyPolicy from './Visitor-side/PrivacyPolicy';
import TermsOfService from './Visitor-side/TermsOfService';
import CookiesModal from './Visitor-side/CookiesModal';

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
          <Route path="/noresult" element={<NoResultPage />} />
          <Route path="/assessment-test" element={<AssessmentPage />} />
          <Route path="/assessmentBigFive" element={<AssessmentBigFive />} />
          <Route path="/assessmentRIASEC" element={<AssessmentRIASEC />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/assessment" element={<AdminAssessment />} />
          <Route path="/admin/counselors" element={<AdminCounselors />} />
          <Route path="/admin/assessment/:id" element={<AdminStudentProfile />} /> 
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/cookies-settings" element={<CookiesModal />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;