import React, { useEffect, useState } from "react";
import { useAuth } from "../utils/AuthContext";
import { UserCircle2, SquarePen, BookOpen, Brain, FileText, AlertCircle, Clock, Calendar, TrendingUp } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import Swal from "sweetalert2";
import UserNavbar from "./UserNavbar";
import Footer from "../Visitor-side/Footer";

const AssessmentPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [pendingAssessment, setPendingAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const [progress, setProgress] = useState({
    riasecTotal: 42,
    bigFiveTotal: 30,
    riasecProgress: 0,
    bigFiveProgress: 0,
    overallPercentage: 0
  });

  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    document.title = "Assessment | Overview";
    
      if(localStorage.getItem('riasecAnswers') && localStorage.getItem('riasecResults')){
        localStorage.removeItem('riasecAnswers');
        localStorage.removeItem('riasecResults');
      } else if(localStorage.getItem('riasecAnswers')){
        localStorage.removeItem('riasecAnswers');
      } else {
        localStorage.removeItem('riasecResults');
      }

      if(localStorage.getItem('bigFiveAnswers') && localStorage.getItem('bigFiveResults')){
        localStorage.removeItem('bigFiveAnswers');
        localStorage.removeItem('bigFiveResults');
      } else if(localStorage.getItem('bigFiveAnswers')){
        localStorage.removeItem('bigFiveAnswers');
      } else {
        localStorage.removeItem('bigFiveResults');
      }

      if(localStorage.getItem('currentAssessmentId')){
        localStorage.removeItem('currentAssessmentId');
      }
    // Fetch user data and check for pending assessment once auth resolved
    if (!authLoading) {
      fetchData();
    }
    getAssessmentProgress(pendingAssessment);

    return () => {
      document.title = "Default Title";
    };
  }, []);

  const fetchData = async () => {
    try {
      if (!user || !user.studentAccount_ID) {
        throw new Error('No user found');
      }

      // Fetch user profile and pending assessment in parallel
      const [profileResponse, pendingResponse] = await Promise.all([
        fetch(`http://localhost:5000/api/assessment/profile?studentAccountId=${user.studentAccount_ID}`),
        fetch(`http://localhost:5000/api/assessment/get-PendingAssessment?studentAccountId=${user.studentAccount_ID}`)
      ]);
      
      if (!profileResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      const profileData = await profileResponse.json();
      setUserData(profileData);

      // Check if there's a pending assessment
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        if (pendingData) {
          console.log('Pending assessment found:', pendingData);
          setPendingAssessment(pendingData.data);
          // Store the pending assessment ID in localStorage
          localStorage.setItem('currentAssessmentId', pendingData.assessment_ID);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isProfileComplete = (data) => {
    if (!data) return false;
    const requiredFields = [
      "name",
      "email",
      "gradeLevel",
      "strand",
      "mathGrade",
      "scienceGrade",
      "englishGrade",
      "genAverageGrade"
    ];
    return requiredFields.every((key) => {
      const v = data[key];
      return v !== undefined && v !== null && String(v).trim() !== "";
    });
  };

  const continuePendingAssessment = () => {
    if (!pendingAssessment) return;

    window.scrollTo(0, 0);
    localStorage.setItem('currentAssessmentId', pendingAssessment.pendingAssessment_ID);
    localStorage.setItem('riasecAnswers', JSON.stringify(pendingAssessment.riasec_responses || []));
    localStorage.setItem('bigFiveAnswers', JSON.stringify(pendingAssessment.bigfive_responses || []));
    localStorage.setItem('riasecProgress', pendingAssessment.riasec_progress || 0);
    localStorage.setItem('bigFiveProgress', pendingAssessment.bigfive_progress || 0);
    
    // Determine which assessment to continue based on progress
    
    if (pendingAssessment.riasec_progress <= progress.riasecTotal && pendingAssessment.bigfive_progress === 0) {
      navigate(`/assessment/test/RIASEC/${pendingAssessment.pendingAssessment_ID}`);
    } else if (pendingAssessment.bigfive_progress <= progress.bigFiveTotal) {
      navigate(`/assessment/test/BigFive/${pendingAssessment.pendingAssessment_ID}`);
    } else {
      // If both are complete, go to results
      navigate(`/assessment/results/${pendingAssessment.pendingAssessment_ID}`);
    }
  };

  const startNewAssessment = () => {
    if (!isProfileComplete(userData)) {
      Swal.fire({
        icon: "warning",
        title: "Complete your profile",
        html:
          "Please complete your student profile before starting the assessment. You will be redirected to your profile page to update missing information.",
        timer: 2500,
        showConfirmButton: false,
      }).then(() => {
        navigate("/profile");
      });
      return;
    }

    const assessmentId = uuidv4();
    localStorage.setItem('currentAssessmentId', assessmentId);
    window.scrollTo(0, 0);
    navigate(`/assessmentRIASEC/${assessmentId}`);
  };

  const cancelPendingAssessment = async () => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Cancel Assessment?",
      text: "Are you sure you want to cancel your pending assessment? All progress will be lost.",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it",
      cancelButtonText: "No, keep it",
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280"
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/assessment/delete-progress/${pendingAssessment.pendingAssessment_ID}`,
          { method: 'DELETE' }
        );

        if (response.ok) {
          setPendingAssessment(null);
          localStorage.removeItem('currentAssessmentId');
          Swal.fire({
            icon: "success",
            title: "Assessment Cancelled",
            text: "You can now start a new assessment.",
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          throw new Error('Failed to cancel assessment');
        }
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to cancel assessment. Please try again.",
          confirmButtonColor: "#FBBF24"
        });
      }
    }
  };

  const formatGrade = (grade) => {
    return grade !== null && grade !== undefined ? grade : 'N/A';
  };

  const getAssessmentProgress = (pendingData) => {
    if (!pendingAssessment) return;

    const riasecTotal = 42;
    const bigFiveTotal = 30;

    const riasecProgress = pendingData.riasec_progress || 0;
    const bigFiveProgress = pendingData.bigfive_progress || 0;

    const totalQuestions = riasecTotal + bigFiveTotal;
    const answeredQuestions = riasecProgress + bigFiveProgress;

    const overallPercentage = Math.round((answeredQuestions / totalQuestions) * 100);

    setProgress({
      riasecTotal,
      bigFiveTotal,
      riasecProgress,
      bigFiveProgress,
      overallPercentage
    });
  };


  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#FFFCED] flex flex-col font-sfpro">
        <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 flex items-center justify-center">
          <div className="text-center">Loading profile data...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-[#FFFCED] flex flex-col font-sfpro">
        <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 flex items-center justify-center">
          <div className="text-center text-red-600">Error: {error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FFFCED] flex flex-col font-sfpro">
      <UserNavbar />
      <main className="flex-grow w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 mt-16">
        <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
          
          {/* Pending Assessment Alert */}
          {pendingAssessment && (
            <div>
              <div className="bg-amber-50 border-2 border-amber-400 rounded-lg shadow p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 text-base sm:text-lg mb-2">
                      You Have a Pending Assessment
                    </h3>
                    <p className="text-amber-800 text-sm mb-3">
                      You have an incomplete assessment from your previous session. Do you want to continue where you left off or cancel it and start a new one?
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <button
                        onClick={continuePendingAssessment}
                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition text-sm"
                      >
                        Continue Assessment
                      </button>
                      <button
                        onClick={cancelPendingAssessment}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition text-sm"
                      >
                        Cancel & Start New
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Section */}
              <div className="bg-white rounded-lg shadow p-4 sm:p-5 border border-black mt-3">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <UserCircle2 size={32} stroke="#FB9724" strokeWidth={2} className="sm:w-10 sm:h-10" />
                      <h2 className="font-semibold ml-2 text-base sm:text-lg lg:text-xl">
                        Previous Profile
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                      <div>
                        <span className="font-semibold block mb-1">Name:</span>
                        <span className="text-gray-700">{userData?.name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-semibold block mb-1">Email:</span>
                        <span className="text-gray-700 break-all">{userData?.email || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-semibold block mb-1">Grade Level:</span>
                        <span className="text-gray-700">{userData?.gradeLevel || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-semibold block mb-1">Strand:</span>
                        <span className="text-gray-700">{userData?.strand || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="pt-3 sm:pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div>
                          <span className="font-semibold block mb-1">Math Grade:</span>
                          <span className="text-gray-700">{formatGrade(userData?.mathGrade)}</span>
                        </div>
                        <div>
                          <span className="font-semibold block mb-1">Science Grade:</span>
                          <span className="text-gray-700">{formatGrade(userData?.scienceGrade)}</span>
                        </div>
                        <div>
                          <span className="font-semibold block mb-1">English Grade:</span>
                          <span className="text-gray-700">{formatGrade(userData?.englishGrade)}</span>
                        </div>
                        <div>
                          <span className="font-semibold block mb-1">Average Grade:</span>
                          <span className="text-gray-700">{formatGrade(userData?.genAverageGrade)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assessment Progress Details */}
              <div className="bg-white rounded-lg shadow border border-gray-300 p-4 sm:p-6 mt-3">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                  <h3 className="font-bold text-lg sm:text-xl text-gray-800">Assessment Progress</h3>
                </div>

                {/* Overall Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">Overall Completion</span>
                    <span className="text-sm font-bold text-purple-600">
                      {Math.round(((pendingAssessment.riasec_progress + pendingAssessment.bigfive_progress) / (progress.riasecTotal + progress.bigFiveTotal)) * 100)}%
                    </span>

                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.round(((pendingAssessment.riasec_progress + pendingAssessment.bigfive_progress) / (progress.riasecTotal + progress.bigFiveTotal)) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* RIASEC and Big Five Progress Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  {/* RIASEC Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        <h4 className="font-bold text-blue-900">RIASEC Test</h4>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full`}>
                        Done
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-blue-700">Progress</span>
                        <span className="text-xs font-bold text-blue-900">
                          {Math.round((pendingAssessment.riasec_progress / progress.riasecTotal) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${(pendingAssessment.riasec_progress / progress.riasecTotal) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Response Count */}
                    <div className="flex items-center justify-between text-xs text-blue-700">
                      <span>Questions Answered:</span>
                      <span className="font-semibold">{pendingAssessment.riasec_progress} / {progress.riasecTotal}</span>
                    </div>
                  </div>

                  {/* Big Five Card */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-green-600" />
                        <h4 className="font-bold text-green-900">Big Five Test</h4>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full`}>
                        Done
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-green-700">Progress</span>
                        <span className="text-xs font-bold text-green-900">
                          {Math.round((pendingAssessment.bigfive_progress / progress.bigFiveTotal) * 100)}%
                        </span>

                      </div>
                      <div className="w-full bg-green-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-green-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${(pendingAssessment.bigfive_progress / progress.bigFiveTotal) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Response Count */}
                    <div className="flex items-center justify-between text-xs text-green-700">
                      <span>Questions Answered:</span>
                      <span className="font-semibold">{(pendingAssessment.bigfive_progress)} / {progress.bigFiveTotal}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline Information */}
                <div className="border-t border-gray-200 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">Started:</span>
                    <span>{formatDate(pendingAssessment.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">Last Updated:</span>
                    <span>{formatDate(pendingAssessment.last_Updated)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Start New Assessment Section */}
          {!pendingAssessment && (
            <>
              {/* Profile Section */}
              <div className="bg-white rounded-lg shadow p-4 sm:p-5 border border-black">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <UserCircle2 size={32} stroke="#FB9724" strokeWidth={2} className="sm:w-10 sm:h-10" />
                      <h2 className="font-semibold ml-2 text-base sm:text-lg lg:text-xl">
                        Current Profile
                      </h2>
                    </div>
                    <button
                      type="button"
                      className="p-1.5 hover:bg-[#FFF7E6] rounded transition"
                      onClick={() => navigate("/profile")}
                    >
                      <SquarePen className="w-5 h-5 sm:w-6 sm:h-6 text-[#FBBF24]" />
                    </button>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                      <div>
                        <span className="font-semibold block mb-1">Name:</span>
                        <span className="text-gray-700">{userData?.name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-semibold block mb-1">Email:</span>
                        <span className="text-gray-700 break-all">{userData?.email || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-semibold block mb-1">Grade Level:</span>
                        <span className="text-gray-700">{userData?.gradeLevel || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-semibold block mb-1">Strand:</span>
                        <span className="text-gray-700">{userData?.strand || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="pt-3 sm:pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div>
                          <span className="font-semibold block mb-1">Math Grade:</span>
                          <span className="text-gray-700">{formatGrade(userData?.mathGrade)}</span>
                        </div>
                        <div>
                          <span className="font-semibold block mb-1">Science Grade:</span>
                          <span className="text-gray-700">{formatGrade(userData?.scienceGrade)}</span>
                        </div>
                        <div>
                          <span className="font-semibold block mb-1">English Grade:</span>
                          <span className="text-gray-700">{formatGrade(userData?.englishGrade)}</span>
                        </div>
                        <div>
                          <span className="font-semibold block mb-1">Average Grade:</span>
                          <span className="text-gray-700">{formatGrade(userData?.genAverageGrade)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Career Journey Section */}
              <div className="bg-white rounded-lg shadow p-4 sm:p-6 lg:p-10 border border-gray-300">
                <h2 className="font-bold text-xl sm:text-2xl lg:text-3xl text-gray-800 mb-2 sm:mb-3 text-center px-2">
                  Start Your Career Journey
                </h2>

                <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8 text-center max-w-2xl mx-auto px-2">
                  Discover your ideal career path through our comprehensive personality
                  and interest assessment designed to unlock your potential.
                </p>

                <div className="mb-6 sm:mb-10 overflow-x-auto">
                  <div className="flex justify-center items-center text-xs sm:text-sm min-w-max px-4">
                    <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6 text-purple-700">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <UserCircle2 size={16} className="sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                        <span className="font-medium whitespace-nowrap">Overview</span>
                      </div>
                      <span className="text-gray-400">{">"}</span>
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <BookOpen size={16} className="sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                        <span className="font-medium whitespace-nowrap">RIASEC</span>
                      </div>
                      <span className="text-gray-400">{">"}</span>
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <Brain size={16} className="sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                        <span className="font-medium whitespace-nowrap">Big Five</span>
                      </div>
                      <span className="text-gray-400">{">"}</span>
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <FileText size={16} className="sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                        <span className="font-medium whitespace-nowrap">Results</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-100 border border-gray-200 rounded-xl p-4 sm:p-6 mb-4 sm:mb-5 text-center">
                  <h3 className="text-blue-700 font-semibold text-base sm:text-lg mb-2 sm:mb-3">
                    What You'll Discover
                  </h3>
                  <p className="text-blue-700 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
                    Our assessment will help you understand your personality traits,
                    interests, and work preferences. You'll receive personalized career
                    recommendations based on the RIASEC and Big Five models, giving you
                    valuable insights into careers that align with who you are and what
                    motivates you.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-5 sm:mb-7">
                  <div className="bg-yellow-100 border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition">
                    <h4 className="text-yellow-700 font-semibold text-sm sm:text-base mb-1 sm:mb-2">
                      Scientifically Based
                    </h4>
                    <p className="text-xs sm:text-sm text-yellow-700">
                      Built on the proven RIASEC and Big Five personality theories.
                    </p>
                  </div>
                  <div className="bg-yellow-100 border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition">
                    <h4 className="text-yellow-700 font-semibold text-sm sm:text-base mb-1 sm:mb-2">
                      Personalized Results
                    </h4>
                    <p className="text-xs sm:text-sm text-yellow-700">
                      Get career recommendations tailored to you.
                    </p>
                  </div>
                  <div className="bg-yellow-100 border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition">
                    <h4 className="text-yellow-700 font-semibold text-sm sm:text-base mb-1 sm:mb-2">
                      Quick & Easy
                    </h4>
                    <p className="text-xs sm:text-sm text-yellow-700">
                      Takes only 10-15 minutes to complete.
                    </p>
                  </div>
                </div>

                <div className="flex items-start sm:items-center justify-center gap-2 mb-4 px-2">
                  <input
                    id="privacy-consent"
                    type="checkbox"
                    checked={acceptedPrivacy}
                    onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                    className="w-4 h-4 mt-0.5 sm:mt-0 text-[#FBBF24] border-gray-300 rounded flex-shrink-0"
                    disabled={!!pendingAssessment}
                  />
                  <label htmlFor="privacy-consent" className="text-xs sm:text-sm text-gray-700">
                    I agree to the{" "}
                    <Link
                      to="/privacy-policy"
                      state={{ fromAssessment: true }}
                      className="text-[#195FD3] underline"
                    >
                      TigerRoutes Privacy Policy
                    </Link>
                  </label>
                </div>

                <div className="flex justify-center px-2">
                  <button
                    onClick={startNewAssessment}
                    disabled={!acceptedPrivacy || !!pendingAssessment}
                    className={`bg-[#FBBF24] text-white px-6 sm:px-10 md:px-12 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-[#FB9724] shadow-[0_5px_5px_rgba(0,0,0,0.3)] text-sm sm:text-base transition-all ${(!acceptedPrivacy || pendingAssessment) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Begin Assessment
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        
      </main>
      <Footer />
    </div>
    
  );
};

export default AssessmentPage;