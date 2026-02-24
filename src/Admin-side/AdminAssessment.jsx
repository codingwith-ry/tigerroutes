import { FileCheck, Calendar, BarChart2, Users, Star, TrendingUp, GitBranch, LayoutGrid, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import React from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from './AdminHeader';
import { useNavigate } from "react-router-dom";
import { formatDisplayName } from "../utils/nameFormat";
/* eslint-disable react/prop-types */


const AdminAssessment = () => {
  const navigate = useNavigate();
  // State for tab selection: 'assessments' or 'strandAnalytics'
  const [activeTab, setActiveTab] = useState('assessments');

  // --- Assessment Dashboard & Table Data ---

  const [stats, setStats] = useState({
    totalStudents: 0,
    completedAssessments: 0,
    completedStudents: 0,
    overallAlignment: 0,
    pendingAssessments: 0,
  });

  useEffect(() => {
    document.title = "Admin Dashboard | Student Assessments";
    fetchDashboardStats();
  }, []);

  async function fetchDashboardStats(){
    try {
      setLoading(true);
      const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const res = await fetch(`${base}/api/admin/dashboard-stats`, { credentials: 'include' });
      const data = await res.json();
      if (data && data.success && data.data) {
        setStats(prev => ({
          ...prev,
          totalStudents: data.data.totalStudents || 0,
          // total number of assessment records
          completedAssessments: data.data.completedAssessments || 0,
          // number of distinct students with >=1 assessment (used for completion rate)
          completedStudents: data.data.completedStudents || 0,
          overallAlignment: data.data.overallAlignment || 0
        }));
        // Ensure totalAssessments uses the DB count from dashboard-stats
        if (typeof data.data.completedAssessments === 'number') {
          setTotalAssessments(data.data.completedAssessments);
        }
        // Also fetch combined total (completed + pending) from admin routes
        try {
          const totalsRes = await fetch(`${base}/api/admin/total-assessments`, { credentials: 'include' });
          const totalsJson = await totalsRes.json();
          if (totalsJson && totalsJson.success && totalsJson.data) {
            setTotalAssessments(totalsJson.data.total || 0);
            // update completedAssessments and pendingAssessments based on totals endpoint
            setStats(prev => ({ 
              ...prev, 
              completedAssessments: totalsJson.data.completed || prev.completedAssessments,
              pendingAssessments: totalsJson.data.pending || prev.pendingAssessments
            }));
          }
        } catch (e) {
          // ignore failure and fall back to dashboard-stats value
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }

  const [assessments, setAssessments] = useState([]);
  const [totalAssessments, setTotalAssessments] = useState(0);
  const [loading, setLoading] = useState(false);
  // Only show the full-screen "Preparing..." spinner on the very first assessments load.
  const [initialLoading, setInitialLoading] = useState(true);
  const [error] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Filters (ActivityLogs-style)
  const [filterText, setFilterText] = useState("");
  // Debounced copy of filterText to avoid firing requests on every keystroke
  const [debouncedFilterText, setDebouncedFilterText] = useState(filterText);
  const [dateRangeFilter, setDateRangeFilter] = useState({ startDate: "", endDate: "" });
  // Date range for Strand Analytics tab (separate so filters don't conflict)
  const [strandDateRangeFilter, setStrandDateRangeFilter] = useState({ startDate: "", endDate: "" });
  // Grade filters
  const [gradeFilter, setGradeFilter] = useState(""); // '' = All, '11' = Grade 11, '12' = Grade 12
  const [strandGradeFilter, setStrandGradeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.max(1, Math.ceil((totalAssessments || 0) / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentStudents = assessments;

  // Helper: format UTC datetime to Manila time with full month name
  const formatToManilaTime = (value) => {
    if (!value) return '—';
    
    const date = new Date(value);
    if (isNaN(date.getTime())) return '—';
    
    // Use timeZone option to properly convert UTC to Manila time
    return date.toLocaleString('en-US', { 
      timeZone: 'Asia/Manila',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatStudentLabel = (student) => {
    const displayName = formatDisplayName(student?.studentName || '') || student?.studentName || '-';
    return `STU${student?.studentAccountId || ''}-${displayName}`;
  };

  

  // Debounce filterText -> debouncedFilterText (300ms)
  useEffect(() => {
    const id = setTimeout(() => setDebouncedFilterText(filterText), 300);
    return () => clearTimeout(id);
  }, [filterText]);

  // fetch assessments when page or debounced filters change
  useEffect(() => {
    if (activeTab !== 'assessments') return;

    const controller = new AbortController();
    async function load() {
      setLoading(true);
      try {
        const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const params = new URLSearchParams({ page: String(currentPage), pageSize: String(itemsPerPage) });
        if (debouncedFilterText) params.set('q', debouncedFilterText);
        if (dateRangeFilter.startDate) params.set('startDate', dateRangeFilter.startDate);
        if (dateRangeFilter.endDate) params.set('endDate', dateRangeFilter.endDate);
        if (gradeFilter) params.set('grade', gradeFilter);

        const url = `${base}/api/admin/assessments?${params.toString()}`;
        const res = await fetch(url, { signal: controller.signal, credentials: 'include' });
        const data = await res.json();
        if (data && data.success) {
          const list = data.data || [];
          setAssessments(list);
          if (data.total != null) setTotalAssessments(data.total);
        } else {
          setAssessments([]);
          setTotalAssessments(0);
        }
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Error fetching assessments:', err);
        setAssessments([]);
        setTotalAssessments(0);
      } finally {
        setLoading(false);
        // Clear the initial loading flag after the first attempt (success or fail)
        setInitialLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [currentPage, debouncedFilterText, dateRangeFilter, gradeFilter, activeTab]);

  // When switching to the assessments tab and we have no cached assessments, treat it as the initial load.
  useEffect(() => {
    if (activeTab === 'assessments' && assessments.length === 0) {
      setInitialLoading(true);
    }
  }, [activeTab, assessments.length]);

  // (debounce handled directly on input change using ref)

  // --- Strand Analytics Data ---

  // Real strand analytics fetched from the server
  const [strandAnalytics, setStrandAnalytics] = useState([]);

  // Effective data source: use backend data (empty array if none)
  const effectiveStrandData = strandAnalytics || [];

  const totalStrands = effectiveStrandData.length;
  const overallAvgAlignment = effectiveStrandData.reduce((acc, curr) => acc + (curr.avgAlignment ?? curr.averageAlignment ?? 0), 0) / (totalStrands || 1);

  // Fetch strand analytics when user opens the strand analytics tab
  useEffect(() => {
    if (activeTab !== 'strandAnalytics') return;
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const params = new URLSearchParams();
        if (strandDateRangeFilter.startDate) params.set('startDate', strandDateRangeFilter.startDate);
        if (strandDateRangeFilter.endDate) params.set('endDate', strandDateRangeFilter.endDate);
        if (strandGradeFilter) params.set('grade', strandGradeFilter);
        const url = `${base}/api/admin/strand-analytics${params.toString() ? `?${params.toString()}` : ''}`;
        const res = await fetch(url, { credentials: 'include' });
        const json = await res.json();
        if (!cancelled && json && json.success && Array.isArray(json.data)) {
          setStrandAnalytics(json.data || []);
        }
      } catch (err) {
        console.error('Error fetching strand analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [activeTab, strandDateRangeFilter, strandGradeFilter]);

  // --- Common Components ---

  const renderStars = (count) => {
    return [...Array(5)].map((_, i) => {
      if (i < count) return <FaStar key={i} className="text-yellow-500 w-4 h-4" />;
      return <FaRegStar key={i} className="text-gray-300 w-4 h-4" />;
    });
  };

  const getStrandColors = (strand) => {
    let bgColor = "bg-gray-100";
    let textColor = "text-gray-500";
    if (strand === "STEM") { bgColor = "bg-yellow-100"; textColor = "text-yellow-500"; }
    else if (strand === "ABM") { bgColor = "bg-green-100"; textColor = "text-green-500"; }
    else if (strand === "HUMSS") { bgColor = "bg-blue-100"; textColor = "text-blue-500"; }
    else if (strand.includes("Health-Allied")) { bgColor = "bg-red-100"; textColor = "text-red-500"; }
    else if (strand.includes("Music, Arts, and Design")) { bgColor = "bg-purple-100"; textColor = "text-purple-500"; }
    else if (strand.includes("Physical Education and Sports")) { bgColor = "bg-pink-100"; textColor = "text-pink-500"; }
    return { bgColor, textColor };
  };

  const getStrandAcronym = (strand) => {
    if (strand === "STEM") return "STEM";
    if (strand === "ABM") return "ABM";
    if (strand === "HUMSS") return "HUMSS";
    if (strand.includes("Health-Allied")) return "HA";
    if (strand.includes("Music, Arts, and Design")) return "MAD";
    if (strand.includes("Physical Education and Sports")) return "PES";
    return strand; // fallback
  };

  const ProgressCircle = ({ value, max, color, children }) => {
    const radius = 32;
    const strokeWidth = 12;
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = 2 * Math.PI * normalizedRadius;
    const safeMax = (typeof max === 'number' && max > 0) ? max : 1;
    const safeValue = (typeof value === 'number') ? value : 0;
    const strokeDashoffset = circumference - (safeValue / safeMax) * circumference;

    return (


      //Create a static HTML page that resembles an admin dashboard for student assessments. Include a sidebar and a top header. Show summary statistics cards for total students, completed assessments, pending assessments, and overall alignment. Add a searchable and filterable table of assessments with columns for Assessment ID, Student, Strand, Assessment Date, Alignment Score, Satisfaction Rating, and an action button. Include a responsive mobile view with accordion-style assessment cards. Below the table, add pagination controls. Style the page with TailwindCSS using rounded corners, shadows, spacing, hover effects, and a responsive layout.

      <div className="relative w-16 h-16 sm:w-12 sm:h-12 md:w-16 md:h-16">
        <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={normalizedRadius} fill="transparent" stroke="#eef2ff" strokeWidth={strokeWidth} />
          <circle
            cx="32"
            cy="32"
            r={normalizedRadius}
            fill="transparent"
            stroke={color || '#4f46e5'}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      </div>
    );
  };

  const StatCard = ({ title, value, subtitle, subtitleColor, icon, progress, max, color }) => (
    <div className="bg-white p-8 sm:p-6 rounded-xl shadow border border-gray-200 hover:border-yellow-500 transition-all duration-200">
      <div className="flex items-center justify-between">
        {/* Left side text */}
        <div className="text-left">
          <p className="text-gray-600 text-lg sm:text-sm font-medium">{title}</p>
          <h3 className="text-3xl sm:text-2xl font-extrabold mt-1">{value}</h3>
          {subtitle && (
            <p className={`text-xs sm:text-sm font-medium ${subtitleColor}`}>{subtitle}</p>
          )}
        </div>

        {/* Right side progress circle */}
        <ProgressCircle value={progress} max={max} color={color}>
          {icon}
        </ProgressCircle>
      </div>
    </div>
  );

  // --- Individual Tab Content Components ---

  const AssessmentsTab = () => (
    <div className="p-4 sm:p-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          subtitle="All active users"
          subtitleColor="text-blue-600"
          progress={stats.totalStudents}
          max={stats.totalStudents > 0 ? stats.totalStudents : 1} // Ensure max is not zero
          icon={<Users className="w-6 h-6 text-blue-600" />}
          color="#2563eb"
        />
        <StatCard
          title="Pending Assessments"
          value={stats.pendingAssessments}
          subtitle="Awaiting completion"
          subtitleColor="text-orange-600"
          // progress visualization: pending / total (completed+pending)
          progress={stats.pendingAssessments}
          max={totalAssessments || 1}
          icon={<LayoutGrid className="w-6 h-6 text-gray-500" />}
          color="#6b7280"
        />
        <StatCard
          title="Completed Assessments"
          // display total assessment records as the main number
          value={stats.completedAssessments}
          // completion rate is based on students with >=1 assessment vs total students
          subtitle={`${((stats.completedStudents / (stats.totalStudents || 1)) * 100).toFixed(1)}% of Students Assessed`}
          subtitleColor="text-green-600"
          // show progress as proportion of students who have at least one assessment
          progress={stats.completedStudents}
          max={stats.totalStudents || 1}
          icon={<FileCheck className="w-6 h-6 text-green-600" />}
          color="#16a34a"
        />
        <StatCard
          title="Overall Alignment"
          value={`${stats.overallAlignment}%`}
          subtitle="Average score"
          subtitleColor="text-purple-600"
          progress={stats.overallAlignment}
          max={100}
          icon={<BarChart2 className="w-6 h-6 text-purple-600" />}
          color="#9333ea"
        />
      </div>

      {/* Search Bar inside Card (text + date filters like ActivityLogs) */}
      <div className="bg-white p-4 mb-4 rounded-xl shadow border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
          <input
            type="text"
            data-testid="assessments-search"
            placeholder="Search students or assessment ID..."
            value={filterText}
            onChange={(e) => { setFilterText(e.target.value); setCurrentPage(1); }}
            className="w-full sm:flex-1 px-4 py-2 border rounded-lg focus:ring focus:ring-yellow-300 focus:outline-none mb-3 sm:mb-0"
          />
          <div className="w-full sm:w-auto mt-3 sm:mt-0">
            <div className="grid grid-cols-1 gap-2 sm:flex sm:items-center sm:gap-2">
              <label htmlFor="assess-from" className="sr-only sm:inline text-gray-600 text-sm whitespace-nowrap">From:</label>
              <input
                id="assess-from"
                type="date"
                value={dateRangeFilter.startDate}
                onChange={(e) => { setDateRangeFilter({...dateRangeFilter, startDate: e.target.value}); setCurrentPage(1); }}
                className="px-3 py-2 border rounded-lg bg-white w-full sm:w-auto"
              />

              <label htmlFor="assess-to" className="sr-only sm:inline text-gray-600 text-sm whitespace-nowrap">To:</label>
              <input
                id="assess-to"
                type="date"
                value={dateRangeFilter.endDate}
                onChange={(e) => { setDateRangeFilter({...dateRangeFilter, endDate: e.target.value}); setCurrentPage(1); }}
                className="px-3 py-2 border rounded-lg bg-white w-full sm:w-auto"
              />

              <label htmlFor="assess-grade" className="sr-only sm:inline text-gray-600 text-sm whitespace-nowrap">Grade:</label>
              <select
                id="assess-grade"
                value={gradeFilter}
                onChange={(e) => { setGradeFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 border rounded-lg bg-white w-full sm:w-auto"
              >
                <option value="">All Grades</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
              </select>

              <button
                type="button"
                onClick={() => { setDateRangeFilter({ startDate: '', endDate: '' }); setGradeFilter(''); setCurrentPage(1); }}
                className="px-3 py-2 border rounded-md bg-yellow-400 text-white text-sm hover:bg-yellow-500 w-full sm:w-auto"
                aria-label="Clear filters"
              >
                Clear
              </button>
            </div>
          </div>
         </div>

  <div className="bg-white rounded-xl shadow border border-gray-200 mt-4">
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Assessment ID</th>
                  <th className="px-6 py-3">Student</th>
                  <th className="px-6 py-3">Strand</th>
                  <th className="px-6 py-3">Assessment Date</th>
                  <th className="px-6 py-3">Alignment Score</th>
                  <th className="px-6 py-3">Satisfaction Rating</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan="8" className="text-center py-4 text-gray-500">Loading assessments...</td></tr>
                ) : currentStudents.length === 0 ? (
                  <tr><td colSpan="8" className="text-center py-4 text-gray-500">No assessments found.</td></tr>
                ) : (
                  currentStudents.map((student) => (
                    <tr key={student.assessmentId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{student.assessmentCode}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 font-medium">
                          {formatStudentLabel(student)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStrandColors(student.strand).bgColor} ${getStrandColors(student.strand).textColor}`}>
                          {getStrandAcronym(student.strand)}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatToManilaTime(student.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {student.alignment != null ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            {Math.round(student.alignment)}%
                          </span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center space-x-1">
                            {renderStars(Math.round(student.rating) || 0)}
                          </div>
                          <span className="text-sm text-gray-500">{student.rating || ""}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {student.status === 'reviewed' ? (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Reviewed
                          </span>
                        ) : student.status === 'reassigned' ? (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                            Reassigned
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Open
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                          onClick={() => {
                            setPreviewLoading(true);
                            setTimeout(() => {
                              try {
                                sessionStorage.setItem('selectedAssessmentId', String(student.assessmentId));
                                if (student.studentAccountId) sessionStorage.setItem('selectedStudentAccountId', String(student.studentAccountId));
                              } catch (e) { console.warn('sessionStorage unavailable', e); }
                              navigate(`/admin/assessment/${student.assessmentId}`);
                            }, 1000);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Accordion */}
          <div className="sm:hidden divide-y divide-gray-200">
            {loading ? (
              <div className="text-center py-4 text-gray-500">Loading assessments...</div>
            ) : currentStudents.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No assessments found.</div>
            ) : (
              currentStudents.map((student) => (
                <div key={student.assessmentId} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <div className="font-semibold text-gray-900">{student.assessmentCode}</div>
                      <div className="text-xs text-gray-600">{formatStudentLabel(student)}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStrandColors(student.strand).bgColor} ${getStrandColors(student.strand).textColor}`}>
                      {getStrandAcronym(student.strand)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-500 text-xs">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {student.date ? new Date(student.date).toLocaleDateString() : "-"}
                    </div>
                    <div className="flex items-center text-xs">
                      {student.alignment != null ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          {Math.round(student.alignment)}%
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </div>
                    <div className="flex items-center text-gray-500 text-xs">
                      <span className="min-w-[80px] font-medium">Satisfaction:</span>
                      <div className="flex items-center">
                        {renderStars(Math.round(student.rating) || 0)}
                        <span className="ml-1 text-gray-600">{student.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-blue-600 text-xs mt-3">
                      <Eye className="w-4 h-4 mr-2" />
                      <button
                        className="font-medium hover:text-blue-800"
                        onClick={() => {
                          setPreviewLoading(true);
                          setTimeout(() => {
                            try {
                              sessionStorage.setItem('selectedAssessmentId', String(student.assessmentId));
                              if (student.studentAccountId) sessionStorage.setItem('selectedStudentAccountId', String(student.studentAccountId));
                            } catch (e) { console.warn('sessionStorage unavailable', e); }
                            navigate(`/admin/assessment/${student.assessmentId}`);
                          }, 1000);
                        }}
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm text-gray-600">
            <div className="mb-2 sm:mb-0">
            Showing {assessments.length === 0 && !loading ? 0 : startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalAssessments || assessments.length)} of {totalAssessments || assessments.length} entries
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded ${currentPage === i + 1 ? "bg-yellow-200 font-bold" : ""}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // --- Strand Analytics Tab Content ---

  const StrandAnalyticsTab = () => {
    return (
      <div className="p-4 sm:p-6">
        {/* Title and date-range aligned on one row (right-aligned on sm+) */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl font-bold text-gray-800">Strand Analytics Overview</h2>

          <div className="w-full sm:w-auto mt-3 sm:mt-0">
            <div className="grid grid-cols-1 gap-2 sm:flex sm:items-center sm:gap-2">
              <label htmlFor="strand-from" className="sr-only sm:inline text-gray-600 text-sm whitespace-nowrap">From:</label>
              <input
                id="strand-from"
                type="date"
                value={strandDateRangeFilter.startDate}
                onChange={(e) => { setStrandDateRangeFilter({ ...strandDateRangeFilter, startDate: e.target.value }); }}
                className="px-3 py-2 border rounded-lg bg-white w-full sm:w-auto"
              />

              <label htmlFor="strand-to" className="sr-only sm:inline text-gray-600 text-sm whitespace-nowrap">To:</label>
              <input
                id="strand-to"
                type="date"
                value={strandDateRangeFilter.endDate}
                onChange={(e) => { setStrandDateRangeFilter({ ...strandDateRangeFilter, endDate: e.target.value }); }}
                className="px-3 py-2 border rounded-lg bg-white w-full sm:w-auto"
              />

              <label htmlFor="strand-grade" className="sr-only sm:inline text-gray-600 text-sm whitespace-nowrap">Grade:</label>
              <select
                id="strand-grade"
                value={strandGradeFilter}
                onChange={(e) => setStrandGradeFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white w-full sm:w-auto"
              >
                <option value="">All Grades</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
              </select>

              <button
                type="button"
                onClick={() => setStrandDateRangeFilter({ startDate: '', endDate: '' })}
                className="px-3 py-2 border rounded-md bg-yellow-400 text-white text-sm hover:bg-yellow-500 w-full sm:w-auto"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {effectiveStrandData.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200 text-center text-gray-600">
            <div className="mx-auto mb-3 w-12 h-12 flex items-center justify-center rounded-full bg-gray-100">
              <GitBranch className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-lg font-medium">No strand analytics available</p>
            <p className="text-sm mt-1">Strand analytics will appear here once assessments are recorded.</p>
          </div>
        ) : (
          <>
            {/* Stats Grid for Strands */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
              <StatCard
                title="Total Strands"
                value={totalStrands}
                subtitle="Active academic tracks"
                subtitleColor="text-indigo-600"
                progress={totalStrands}
                max={5} // Max a reasonable number for display
                icon={<GitBranch className="w-6 h-6 text-indigo-600" />}
                color="#4f46e5"
              />
              <StatCard
                title="Average Strand Alignment"
                value={`${overallAvgAlignment.toFixed(1)}%`}
                subtitle="Overall mean alignment score"
                subtitleColor="text-red-600"
                progress={overallAvgAlignment}
                max={100}
                icon={<BarChart2 className="w-6 h-6 text-red-600" />}
                color="#ef4444"
              />
              {/* Placeholder for two more stats if needed */}
              <StatCard
                title="Avg. Assessments / Strand"
                value={(stats.completedAssessments / (totalStrands || 1)).toFixed(1)}
                subtitle="Completed assessments per strand"
                subtitleColor="text-gray-600"
                progress={stats.completedAssessments / (totalStrands || 1)}
                max={20}
                icon={<LayoutGrid className="w-6 h-6 text-gray-500" />}
                color="#6b7280"
              />
              <StatCard
                title="Avg. Satisfaction / Strand"
                value={`${(effectiveStrandData.reduce((acc, curr) => acc + (curr.avgSatisfaction ?? curr.averageSatisfaction ?? 0), 0) / (totalStrands || 1)).toFixed(1)} / 5`}
                subtitle="Mean satisfaction rating"
                subtitleColor="text-yellow-600"
                progress={(effectiveStrandData.reduce((acc, curr) => acc + (curr.avgSatisfaction ?? curr.averageSatisfaction ?? 0), 0) / (totalStrands || 1)) * 20}
                max={100}
                icon={<Star className="w-6 h-6 text-yellow-600" />}
                color="#f59e0b"
              />
            </div>

            {/* Strand-Specific Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {effectiveStrandData.map((strandData) => {
                const name = strandData.strand || strandData.strandName || 'Unknown';
                const riasecDisplay = Array.isArray(strandData.topRiasec) ? strandData.topRiasec.join(', ') : strandData.riasecTraits || 'N/A';
                const bigFiveDisplay = Array.isArray(strandData.topBigFive) ? strandData.topBigFive.join(', ') : strandData.bigFiveTraits || 'N/A';
                const alignment = strandData.avgAlignment ?? strandData.averageAlignment ?? 0;
                const totalAssess = strandData.assessments ?? strandData.totalAssessments ?? 0;
                const avgSat = strandData.avgSatisfaction ?? strandData.averageSatisfaction ?? 0;
                const programs = Array.isArray(strandData.topPrograms) ? strandData.topPrograms : (strandData.recommendedPrograms || []);

                return (
                  <div key={name} className="bg-white p-6 rounded-xl shadow border border-gray-200">
                    <h3 className="text-xl font-extrabold text-indigo-700 mb-3 flex items-center">
                      <GitBranch className="w-5 h-5 mr-2" />
                      {name} Strand
                    </h3>

                    <div className="space-y-3 mb-4">
                      <div className="p-3 rounded-lg border">
                        <p className="text-xs font-semibold uppercase text-gray-500 mb-1">RIASEC Traits</p>
                        {totalAssess > 0 && riasecDisplay && riasecDisplay !== 'N/A' ? (
                          <span className={`text-sm font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded`}>
                            {riasecDisplay}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500 bg-gray-50 px-2 py-0.5 rounded">No data</span>
                        )}
                      </div>
                      <div className="p-3 rounded-lg border">
                        <p className="text-xs font-semibold uppercase text-gray-500 mb-1">Big Five Traits</p>
                        {totalAssess > 0 && bigFiveDisplay && bigFiveDisplay !== 'N/A' ? (
                          <span className={`text-sm font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded`}>
                            {bigFiveDisplay}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500 bg-gray-50 px-2 py-0.5 rounded">No data</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm font-medium mb-3 border-b pb-2">
                        <span className="text-gray-600">Alignment Score:</span>
                        <span className="text-2xl font-bold text-red-600">{alignment}%</span>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Total Assessments:</span>
                            <span className="font-semibold">{totalAssess}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Average Satisfaction:</span>
                            <div className="flex items-center space-x-1">
                                {renderStars(Math.round(avgSat))}
                                <span className="font-semibold text-gray-700">({Number(avgSat).toFixed(1)})</span>
                            </div>
                        </div>
                    </div>

                    <h4 className="text-lg font-bold text-gray-800 mt-4 border-t pt-4">
                      Top 5 Recommended Programs
                    </h4>
                    
                    <ul className="mt-2 space-y-2">
                      {programs.map((program, index) => {
                        const programName = program.programName ?? program.program ?? 'Unknown Program';
                        // Use explicit recommendation count when available. fall back to `program.count` or other numeric fields.
                        const count = program.count ?? program.recommendationCount ?? program.recs ?? program.score ?? 0;
                        return (
                          <li key={index} className="flex justify-between items-center text-sm p-2 rounded-lg bg-gray-50 hover:bg-yellow-50 transition-colors">
                            <span className="font-medium text-gray-700">{index + 1}. {programName}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700`}>
                              {count}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </>
        )}

      </div>
    );
  };

    if (loading && initialLoading) {
          return (
              <div className="min-h-screen w-full bg-[#FFFCED] flex">
                  <AdminSidebar />
                  <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                          <p className="mt-4 text-gray-600">Preparing for assessments analytics...</p>
                      </div>
                  </div>
              </div>
          );
    }

    if (previewLoading) {
      return (
        <div className="min-h-screen w-full bg-[#FFFCED] flex">
          <AdminSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Preparing for student assessment analytics...</p>
            </div>
          </div>
        </div>
      );
    }
  
      if (error) {
          return (
              <div className="min-h-screen w-full bg-[#FFFCED] flex">
                  <AdminSidebar />
                  <div className="flex-1 flex items-center justify-center">
                      <div className="text-center text-red-500">
                          <p className="text-lg font-semibold">Error loading assessments analytics</p>
                          <p className="mt-2">{error}</p>
                          <button 
                              onClick={() => { window.location.reload(); }}
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
    <div className="flex flex-col md:flex-row w-screen h-screen bg-[#fdfcf8]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Student Assessments" />
        
        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                    onClick={() => setActiveTab('assessments')}
                    className={`
                        ${activeTab === 'assessments'
                            ? 'border-yellow-500 text-yellow-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                        whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-150 ease-in-out
                    `}
                >
                    Assessments
                </button>
                <button
                    onClick={() => setActiveTab('strandAnalytics')}
                    className={`
                        ${activeTab === 'strandAnalytics'
                            ? 'border-yellow-500 text-yellow-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                        whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-150 ease-in-out
                    `}
                >
                    Strand Analytics
                </button>
            </nav>
        </div>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'assessments' && AssessmentsTab()}
          {activeTab === 'strandAnalytics' && StrandAnalyticsTab()}
        </main>
      </div>
    </div>
  );
};

export default AdminAssessment;