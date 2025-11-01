import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiFileText, FiMessageCircle, FiCalendar, FiCopy } from "react-icons/fi";
import UserNavbar from "./UserNavbar";
import Footer from "../Visitor-side/Footer";
import Swal from "sweetalert2";

const UserResultsHistory = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAssessments: 0,
    avgSatisfaction: 0,
    counselorReplies: 0,
  });
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch assessment history
  useEffect(() => {
    document.title = 'TigerRoutes | Results';
    fetchAssessmentHistory();
  }, []);

  const fetchAssessmentHistory = async () => {
      try {
          setLoading(true);
          
          // Get studentAccount_ID from localStorage
          const userData = sessionStorage.getItem('user');
          if (!userData) {
              setError('User not logged in');
              setLoading(false);
              return;
          }

          const user = JSON.parse(userData);
          const studentAccount_ID = user.studentAccount_ID;

          if (!studentAccount_ID) {
              setError('Student account ID not found');
              setLoading(false);
              return;
          }

          const response = await fetch(`http://localhost:5000/api/assessment/history?studentID=${studentAccount_ID}`);
          const data = await response.json();
          
          if (data.success) {
              setStats(data.data.stats);
              setAssessments(data.data.assessments);
          } else {
              setError(data.message || 'Failed to fetch assessment history');
          }
      } catch (err) {
          setError('Error fetching assessment history: ' + err.message);
      } finally {
          setLoading(false);
      }
  };

  // Copy assessment ID to clipboard
  const copyToClipboard = (assessmentId) => {
    navigator.clipboard.writeText(assessmentId).then(() => {
      // You can add a toast notification here
      alert('Assessment ID copied to clipboard!');
    });
  };

  // Reusable ProgressCircle wrapper
  const ProgressCircle = ({ value, max, color, children }) => {
    const radius = 32;
    const strokeWidth = 14;
    const circumference = 2 * Math.PI * radius;
    const progress = (value / max) * circumference;

    return (
      <div className="relative w-20 h-20 flex items-center justify-center">
        <div className="absolute inset-0 transform -rotate-90">
          <svg width="100" height="100">
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="#e5e7eb"
              strokeWidth={strokeWidth}
              fill="none"
            />
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              strokeLinecap="round"
            />
          </svg>
        </div>
        {children}
      </div>
    );
  };


  const handleShowFeedback = (feedback, userRating) => {
    const notes = feedback;
    const rating = userRating; // assuming rating is a number (e.g. 4)
    
    const stars = Array.from({ length: 5 }, (_, i) => 
      i < rating
        ? `<span style="color: gold; font-size: 20px;">&#9733;</span>`
        : `<span style="color: lightgray; font-size: 20px;">&#9733;</span>`
    ).join("");

    Swal.fire({
      title: '<span style="font-size: 24px; font-weight: 600;">Assessment Feedback</span>',
      html: `
        <div class="feedback-details" style="
          background: #F9FAFB;
          border-radius: 8px;
          padding: 20px;
          margin-top: 15px;
        ">
          <div style="
            margin-bottom: 16px;
            padding-bottom: 16px;
            border-bottom: 1px solid #E5E7EB;
          ">
            <p style="
              font-size: 14px;
              color: #6B7280;
              margin-bottom: 8px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            ">Satisfaction Rating</p>
            <div style="display: flex; align-items: center; justify-content: center;">
              ${stars}
            </div>
          </div>
          
          <div>
            <p style="
              font-size: 14px;
              color: #6B7280;
              margin-bottom: 8px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            ">Student Comments</p>
            <p style="
              font-size: 16px;
              line-height: 1.5;
              color: #374151;
              background: white;
              padding: 12px;
              border-radius: 6px;
              border: 1px solid #E5E7EB;
            ">${notes}</p>
          </div>
        </div>
      `,
      confirmButtonText: "Close",
      confirmButtonColor: '#FBBF24',
      width: 600,
      padding: '2em',
      customClass: {
        container: 'font-sfpro',
        popup: 'rounded-xl shadow-xl',
        confirmButton: 'px-6 py-2 rounded-lg text-white font-medium hover:bg-yellow-500'
      }
    });
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#FFFCED] flex flex-col font-sfpro">
        <UserNavbar />
        <div className="flex-grow flex items-center justify-center mt-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading assessment history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-[#FFFCED] flex flex-col font-sfpro">
        <UserNavbar />
        <div className="flex-grow flex items-center justify-center mt-24">
          <div className="text-center text-red-500">
            <p className="text-lg font-semibold">Error loading assessment history</p>
            <p className="mt-2">{error}</p>
            <button 
              onClick={fetchAssessmentHistory}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FFFCED] flex flex-col font-sfpro">
      <UserNavbar />
      <div className="flex-grow px-6 md:px-12 py-6 space-y-6 mt-24">
        <h2 className="text-3xl font-black mb-6">Previous Assessment Results</h2>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Assessments */}
          <div className="bg-white p-6 rounded-xl shadow flex items-center justify-between border border-black">
            <div>
              <p className="text-gray-600 text-sm">Total Assessments</p>
              <h3 className="text-4xl font-extrabold">{stats.totalAssessments}</h3>
            </div>
            <ProgressCircle value={stats.totalAssessments} max={10} color="#3b82f6">
              <FiFileText className="text-blue-500 text-2xl" />
            </ProgressCircle>
          </div>

          {/* Average Satisfaction */}
          <div className="bg-white p-6 rounded-xl shadow flex items-center justify-between border border-black">
            <div>
              <p className="text-gray-600 text-sm">Average Satisfaction</p>
              <h3 className="text-4xl font-extrabold">{stats.avgSatisfaction}</h3>
            </div>
            <ProgressCircle value={stats.avgSatisfaction} max={5} color="#facc15">
              <span className="text-yellow-500 text-3xl">★</span>
            </ProgressCircle>
          </div>
          

          {/* Counselor Replies */}
          <div className="bg-white p-6 rounded-xl shadow flex items-center justify-between border border-black">
            <div>
              <p className="text-gray-600 text-sm">Counselor Replies</p>
              <h3 className="text-4xl font-extrabold">{stats.counselorReplies}</h3>
            </div>
            <ProgressCircle value={stats.counselorReplies} max={stats.totalAssessments || 1} color="#22c55e">
              <FiMessageCircle className="text-green-500 text-2xl" />
            </ProgressCircle>
          </div>
        </div>

        {/* Assessment History */}
        <div className="bg-white p-6 rounded-xl shadow border border-black">
          <h3 className="text-xl font-bold mb-4">Assessment History</h3>

          {assessments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No assessment history found.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-t">
                  <thead className="bg-gray-100 text-left text-sm">
                    <tr>
                      <th className="py-3 px-4">Assessment ID</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Satisfaction</th>
                      <th className="py-3 px-4">Feedback</th>
                      <th className="py-3 px-4">Counselor Reply</th>
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessments.map((assessment, idx) => (
                      <tr
                        key={idx}
                        className="border-b text-sm hover:bg-gray-50 transition"
                      >
                        {/* Assessment ID Column */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                              {assessment.assessmentId.substring(0, 8)}...
                            </span>
                            <button
                              onClick={() => copyToClipboard(assessment.assessmentId)}
                              className="text-gray-400 hover:text-gray-600 transition"
                              title="Copy Assessment ID"
                            >
                              <FiCopy size={14} />
                            </button>
                          </div>
                        </td>
                        
                        {/* Date Column */}
                        <td className="py-3 px-4 flex items-center gap-2">
                          <FiCalendar className="text-gray-500" />
                          <div>
                            <p className="font-medium">{assessment.date}</p>
                            <p className="text-gray-500 text-xs">{assessment.day}</p>
                          </div>
                        </td>
                        
                        {/* Satisfaction Column */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={`text-lg ${
                                  i < assessment.satisfaction ? "text-yellow-400" : "text-gray-300"
                                }`}
                              >
                                ★
                              </span>
                            ))}
                            <span className="ml-2 text-gray-600">{assessment.satisfaction}/5</span>
                          </div>
                        </td>

                        {assessment.feedback ? (
                          <td
                            className="py-3 px-4 max-w-xs truncate cursor-pointer text-blue-600 hover:underline"
                            onClick={() => handleShowFeedback(assessment.feedback, assessment.satisfaction)}
                            title="Click to view full feedback"
                          >
                            {assessment.feedback}
                          </td>
                        ) : (
                          <td className="py-3 px-4 text-gray-500">No Feedback</td>
                        )}
                        
                        
                        {/* Counselor Reply Column */}
                        <td className="py-3 px-4">
                          {typeof assessment.reply === "string" ? (
                            <p className="text-gray-500">{assessment.reply}</p>
                          ) : (
                            <div className="flex items-center gap-2">
                              <FiFileText className="text-blue-500" />
                              <div>
                                <p className="text-blue-600 font-medium">{assessment.reply.counselor}</p>
                                <p className="text-xs text-gray-500">{assessment.reply.date}</p>
                              </div>
                              {assessment.reply.isNew && (
                                <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                                  New
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        
                        {/* Action Column */}
                        <td className="py-3 px-4">
                          <button
                            onClick={() => navigate(`/assessment/results/${assessment.assessmentId}`)}
                            className="flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            <FiEye /> View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="space-y-4 md:hidden">
                {assessments.map((assessment, idx) => (
                  <div
                    key={idx}
                    className="relative bg-gray-50 p-4 pl-6 rounded-lg shadow-sm border border-gray-200"
                  >
                    {/* Accent Bar */}
                    <div className="absolute left-0 top-0 h-full w-1 rounded-l-lg bg-blue-500"></div>

                    {/* Assessment ID */}
                    <div className="mb-3">
                      <span className="font-semibold text-gray-500">Assessment ID: </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {assessment.assessmentId.substring(0, 12)}...
                        </span>
                        <button
                          onClick={() => copyToClipboard(assessment.assessmentId)}
                          className="text-gray-400 hover:text-gray-600 transition"
                          title="Copy Assessment ID"
                        >
                          <FiCopy size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 mb-2">
                      <FiCalendar className="text-gray-500" />
                      <div>
                        <p className="font-medium">{assessment.date}</p>
                        <p className="text-gray-500 text-xs">{assessment.day}</p>
                      </div>
                    </div>

                    {/* Satisfaction */}
                    <p className="mb-2">
                      <span className="font-semibold text-gray-500">Satisfaction: </span>
                      <span className="inline-flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${
                              i < assessment.satisfaction ? "text-yellow-400" : "text-gray-300"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                        <span className="ml-1 text-gray-600">{assessment.satisfaction}/5</span>
                      </span>
                    </p>

                    {/* Counselor Reply */}
                    <div className="mb-3">
                      <span className="font-semibold text-gray-500">Counselor Reply: </span>
                      {typeof assessment.reply === "string" ? (
                        <span className="text-gray-500">{assessment.reply}</span>
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <FiFileText className="text-blue-500" />
                          <div>
                            <p className="text-blue-600 font-medium">{assessment.reply.counselor}</p>
                            <p className="text-xs text-gray-500">{assessment.reply.date}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    <button
                      onClick={() => navigate(`/assessment/results/${assessment.assessmentId}`)}
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <FiEye /> View Details
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="mt-5">
        <Footer />
      </div>
    </div>
  );
};

export default UserResultsHistory;