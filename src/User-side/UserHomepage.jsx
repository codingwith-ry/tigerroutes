import React, { useEffect, useState } from "react";
import { FiBarChart2, FiAlertCircle, FiChevronRight, FiFileText } from "react-icons/fi";
import { GiBrain } from "react-icons/gi";
import { useNavigate } from "react-router-dom";
import UserNavbar from "./UserNavbar"; 
import Footer from "../Visitor-side/Footer";

const UserHomepage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user'));
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'TigerRoutes | Homepage';
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      if (!user || !user.studentAccount_ID) {
        throw new Error('No user found in session storage');
      }

      const response = await fetch(`http://localhost:5000/api/assessment/getHomeAnalytics?studentAccountId=${user.studentAccount_ID}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startAssessment = () => {
    navigate("/assessment");
  };

  // Helper function to calculate progress bar width
  const getProgressWidth = (value, maxValue = 5) => {
    return `${(value / maxValue) * 100}%`;
  };

  // Helper function for engagement progress (percentage)
  const getEngagementProgress = (engagement) => {
    return `${engagement}%`;
  };

  return (
    <div className="w-full min-h-screen bg-[#FFFCED] flex flex-col font-sfpro">
      <UserNavbar />

      {/* Main Content */}
      <main className="flex-grow px-6 md:px-12 py-6 space-y-6 mt-24">

        {/* Welcome + Analytics */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Welcome */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-3xl font-black">
              Welcome back, <span className="text-yellow-600">
                {user?.name ? user.name.split(' ')[0] : "Student"}
              </span>
            </h2>
            <p className="mt-2 text-gray-700">Let's continue your career discovery journey.</p>
            <h3 className="mt-4 font-bold">Complete your career assessment</h3>
            <p className="text-gray-600 text-sm">
              Take our comprehensive Big Five & RIASEC assessment to discover your ideal UST college programs.
            </p>
            <button 
              onClick={startAssessment}
              className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-full text-white sm:text-md font-sfpro font-semibold transition-transform hover:scale-105"
            >
              Start Assessment
            </button>
          </div>

          {/* Analytics */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FiBarChart2 /> Analytics Overview
            </h3>
            
            {loading ? (
              <div className="space-y-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded-full"></div>
                </div>
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded-full"></div>
                </div>
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            ) : error ? (
              <div className="text-red-600 text-sm">
                Error loading analytics. Please try again.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Total Assessments */}
                <div>
                  <p className="flex justify-between text-sm">
                    <span>Total Assessment Completed</span>
                    <span className="font-semibold">{analytics?.totalAssessments || 0}</span>
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: analytics?.totalAssessments 
                          ? getProgressWidth(Math.min(analytics.totalAssessments, 10), 10) 
                          : '0%' 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Average Satisfaction */}
                <div>
                  <p className="flex justify-between text-sm">
                    <span>Average Satisfaction</span>
                    <span className="font-semibold">
                      {analytics?.averageSatisfaction || 0}/5
                    </span>
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: analytics?.averageSatisfaction 
                          ? getProgressWidth(analytics.averageSatisfaction, 5) 
                          : '0%' 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Average Engagement */}
                <div>
                  <p className="flex justify-between text-sm">
                    <span>Average Engagement</span>
                    <span className="font-semibold">
                      {analytics?.averageEngagement || 0}%
                    </span>
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: analytics?.averageEngagement 
                          ? getEngagementProgress(analytics.averageEngagement) 
                          : '0%' 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Additional Stats (optional) */}
                {analytics && (
                  <div className="pt-4 border-t border-gray-200 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Rated Assessments:</span>
                      <span className="font-semibold">{analytics.ratedAssessments}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Highest Rating:</span>
                      <span className="font-semibold">{analytics.highestRating}/5</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Complete Profile Banner */}
        <div className="bg-yellow-100 p-6 rounded-xl shadow flex flex-col md:flex-row items-start md:items-center justify-between">
          <div>
            <h3 className="font-bold flex items-center gap-2 text-yellow-700">
              <FiAlertCircle /> Complete Your Profile
            </h3>
            <p className="text-sm text-yellow-700">
              Please complete your academic profile to get personalized recommendations.
            </p>
          </div>
          <button className="mt-4 md:mt-0 self-start md:self-auto px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow transition hover:scale-105 duration-200"
          onClick={() => navigate("/profile")}>
            Complete Profile
          </button>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <h3 className="font-bold text-lg">Quick Actions</h3>
          <div className="flex flex-col gap-4">

            {/* Take Assessments */}
            <div
              onClick={() => navigate("/assessment")}
              className="flex items-center justify-between p-4 bg-blue-100 rounded-lg cursor-pointer hover:bg-blue-200 transition duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="text-blue-600 text-2xl"><GiBrain /></div>
                <div>
                  <h4 className="font-semibold text-blue-700">Take Assessments</h4>
                  <p className="text-sm text-blue-600">Discover your interests and personality</p>
                </div>
              </div>
              <div className="text-blue-600 text-xl"><FiChevronRight /></div>
            </div>

            {/* View Results */}
            <div
              onClick={() => navigate("/results")}
              className="flex items-center justify-between p-4 bg-green-100 rounded-lg cursor-pointer hover:bg-green-200 transition duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="text-green-600 text-2xl"><FiFileText /></div>
                <div>
                  <h4 className="font-semibold text-green-700">View Results</h4>
                  <p className="text-sm text-green-600">Review your assessment history</p>
                </div>
              </div>
              <div className="text-green-600 text-xl"><FiChevronRight /></div>
            </div>

          </div>
        </div>

        {/* Tips & Resources */}
        <div className="bg-white p-6 rounded-xl shadow mt-6">
          <h3 className="font-bold text-lg text-gray-800 mb-4">Tips & Resources</h3>
          <div className="grid md:grid-cols-2 gap-4">
            
            {/* Tip 1 */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg shadow hover:bg-gray-100 transition cursor-pointer">
              <div className="text-yellow-500 text-2xl">💡</div>
              <div>
                <h4 className="font-semibold text-gray-800">Prepare for Your Assessment</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Make sure you're in a quiet environment and have 30-40 minutes free to focus.
                </p>
              </div>
            </div>

            {/* Tip 2 */}
            <div
              role="link"
              tabIndex={0}
              onClick={() => window.open("https://www.ust.edu.ph/academics/faculties-colleges-institutes-and-schools/", "_blank", "noopener,noreferrer")}
              onKeyDown={(e) => { if (e.key === "Enter") window.open("https://www.ust.edu.ph/academics/faculties-colleges-institutes-and-schools/", "_blank", "noopener,noreferrer"); }}
              className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg shadow hover:bg-gray-100 transition cursor-pointer"
            >
              <div className="text-purple-500 text-2xl">🔗</div>
              <div>
                <h4 className="font-semibold text-gray-800">Explore Career Paths</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Check the recommended UST programs based on your results to plan ahead.
                </p>
              </div>
            </div>

            {/* Tip 3 */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate("/profile")}
              onKeyDown={(e) => { if (e.key === "Enter") navigate("/profile"); }}
              className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg shadow hover:bg-gray-100 transition cursor-pointer"
            >
              <div className="text-blue-500 text-2xl">📝</div>
              <div>
                <h4 className="font-semibold text-gray-800">Complete/Update Your Profile</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Fill out your academic info to get more accurate program recommendations.
                </p>
              </div>
            </div>

            {/* Tip 4 */}
            <div
              role="link"
              tabIndex={0}
              onClick={() => window.open("https://www.ust.edu.ph", "_blank", "noopener,noreferrer")}
              onKeyDown={(e) => { if (e.key === "Enter") window.open("https://www.ust.edu.ph", "_blank", "noopener,noreferrer"); }}
              className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg shadow hover:bg-gray-100 transition cursor-pointer"
            >
              <div className="text-purple-500 text-2xl">🔗</div>
              <div>
                <h4 className="font-semibold text-gray-800">Useful Resources</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Visit UST's official site for program details, scholarships, and university information.
                </p>
              </div>
            </div>

          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default UserHomepage;