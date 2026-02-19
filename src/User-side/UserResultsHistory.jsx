import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiFileText, FiMessageCircle, FiCalendar, FiCopy, FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import UserNavbar from "./UserNavbar";
import Footer from "../Visitor-side/Footer";
import Swal from "sweetalert2";
import { useAuth } from "../utils/AuthContext";
import Chatbot from "./Chatbot";
import PropTypes from 'prop-types';

const UserResultsHistory = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAssessments: 0,
    avgSatisfaction: 0,
    counselorReplies: 0,
  });
  const [assessments, setAssessments] = useState([]);
  const [filteredAssessments, setFilteredAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [satisfactionFilter, setSatisfactionFilter] = useState("");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const { user, loading: authLoading } = useAuth();

  // Fetch assessment history
  useEffect(() => {
    document.title = 'TigerRoutes | Results';
    if (!authLoading) fetchAssessmentHistory();

  }, [authLoading, user]);

  // Filter assessments when search, date filter, or original data changes
  useEffect(() => {
    const s = searchTerm.trim().toLowerCase();
    let filtered = assessments;

    // Apply search filter (safe checks for multiple ID fields and reply formats)
    if (s) {
      filtered = filtered.filter((assessment) => {
        try {
          const id = (
            assessment.assessmentCode
          ).toString().toLowerCase();

          const feedback = (assessment.feedback || "").toString().toLowerCase();

          let replyStr = "";
          if (assessment.reply) {
            if (typeof assessment.reply === "string") {
              replyStr = assessment.reply.toLowerCase();
            } else if (typeof assessment.reply === "object") {
              replyStr = (
                (assessment.reply.counselor || "") +
                " " +
                (assessment.reply.message || "") +
                " " +
                (assessment.reply.body || "")
              )
                .toString()
                .toLowerCase();
            } else {
              replyStr = String(assessment.reply).toLowerCase();
            }
          }

          return id.includes(s) || feedback.includes(s) || replyStr.includes(s);
        } catch (err) {
          return false;
        }
      });
    }

    // Apply date filter
    if (dateFilter) {
      filtered = filtered.filter(assessment => assessment.date === dateFilter);
    }

    // Apply satisfaction filter
    if (satisfactionFilter) {
      const rating = parseInt(satisfactionFilter);
      filtered = filtered.filter(assessment => assessment.satisfaction === rating);
    }

    setFilteredAssessments(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, dateFilter, satisfactionFilter, assessments]);

  const fetchAssessmentHistory = async () => {
      try {
          setLoading(true);
          
            // Get studentAccount_ID from auth context
            if (!user) {
              setError('User not logged in');
              setLoading(false);
              return;
            }

            const studentAccount_ID = user.studentAccount_ID;

          if (!studentAccount_ID) {
              setError('Student account ID not found');
              setLoading(false);
              return;
          }

          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/assessment/history?studentID=${studentAccount_ID}`, {
            credentials: 'include'
          });
          const data = await response.json();
          
          if (data.success) {
              setStats(data.data.stats);
              setAssessments(data.data.assessments);
              setFilteredAssessments(data.data.assessments);
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
      Swal.fire({
        title: 'Copied!',
        text: 'Assessment ID copied to clipboard',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: 'rounded-xl'
        }
      });
    });
  };

  // Get unique dates for date filter
  const uniqueDates = [...new Set(assessments.map(assessment => assessment.date))].sort().reverse();

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAssessments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAssessments.length / itemsPerPage);

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setDateFilter("");
    setSatisfactionFilter("");
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
    const rating = userRating;
    
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

  ProgressCircle.propTypes = {
    value: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired,
    children: PropTypes.node
  };

  handleShowFeedback.propTypes = {
    feedback: PropTypes.string.isRequired,
    userRating: PropTypes.number.isRequired
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

    //Create a responsive React frontend page for displaying a student’s assessment history using Tailwind CSS. The page should include a statistics section showing total assessments, average satisfaction rating, and counselor replies using circular progress indicators. Add a searchable, filterable, and paginated assessment history section with both desktop table and mobile card layouts. Each assessment item should display assessment ID with copy-to-clipboard UI, date, satisfaction stars, student feedback preview, counselor reply status, and a button to view detailed results. Include UI elements for search, date filter, satisfaction filter, pagination controls, and loading and error states. Focus only on UI structure and layout; backend logic and data fetching behavior are assumed.


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
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-2 gap-4">
            <h3 className="text-xl font-bold">Assessment History</h3>
            
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Search Input */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assessments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                />
              </div>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Dates</option>
                {uniqueDates.map(date => (
                  <option key={date} value={date}>{date}</option>
                ))}
              </select>

              {/* Satisfaction Filter */}
              <select
                value={satisfactionFilter}
                onChange={(e) => setSatisfactionFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
                <option value="0">No Rating</option>
              </select>

              {/* Clear Filters */}
              {(searchTerm || dateFilter || satisfactionFilter) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredAssessments.length} of {assessments.length} assessments
            {(searchTerm || dateFilter || satisfactionFilter) && " (filtered)"}
          </div>

          {filteredAssessments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No assessment history found.</p>
              {(searchTerm || dateFilter || satisfactionFilter) && (
                <button
                  onClick={clearFilters}
                  className="mt-2 text-blue-600 hover:underline"
                >
                  Clear filters to show all assessments
                </button>
              )}
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
                    {currentItems.map((assessment, idx) => (
                      <tr
                        key={idx}
                        className="border-b text-sm hover:bg-gray-50 transition"
                      >
                        {/* Assessment ID Column */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                              {assessment.assessmentCode}
                            </span>
                            <button
                              onClick={() => copyToClipboard(assessment.assessmentCode)}
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
                            onClick={() => {
                              localStorage.setItem('currentAssessmentId', assessment.assessmentId);
                              navigate(`/assessment/results`);
                            }}
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
                {currentItems.map((assessment, idx) => (
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
                      className="flex items-center gap-1 text-blue-600 hover:underline md:text-blue-600 md:hover:underline md:flex md:items-center md:gap-1 bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition-all duration-300 md:bg-transparent md:shadow-none md:px-0 md:py-0"
                    >
                      <FiEye className="md:text-blue-600" />
                      <span className="hidden md:inline">View Details</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {(
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                  {/* Items per page selector */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Show</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-gray-300 rounded px-2 py-1"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span>entries</span>
                  </div>

                  {/* Page info */}
                  <div className="text-sm text-gray-600">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAssessments.length)} of {filteredAssessments.length} entries
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg border ${
                        currentPage === 1
                          ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                          : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <FiChevronLeft size={16} />
                    </button>

                    {/* Page Numbers */}
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageClick(pageNumber)}
                            className={`px-3 py-1 rounded-lg border text-sm ${
                              currentPage === pageNumber
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg border ${
                        currentPage === totalPages
                          ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                          : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <FiChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Chatbot 
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            onOpen={() => setIsChatOpen(true)}
            minimized={isMinimized}
            onMinimize={() => setIsMinimized(!isMinimized)}
          />
      <div className="mt-5">
        <Footer />
      </div>
    </div>
  );
};

export default UserResultsHistory;