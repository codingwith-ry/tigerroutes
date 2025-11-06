import { FileCheck, Calendar, BarChart2, Users, Target, Star, Activity, TrendingUp, Bell, GitBranch, LayoutGrid, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import React from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from './AdminHeader';
import { useNavigate } from "react-router-dom";



const AdminAssessment = () => {
  const navigate = useNavigate();
  // State for tab selection: 'assessments' or 'strandAnalytics'
  const [activeTab, setActiveTab] = useState('assessments');

  // --- Assessment Dashboard & Table Data ---

  const [stats, setStats] = useState({
    totalStudents: 0,
    completedAssessments: 0,
    overallAlignment: 0,
  });

  useEffect(() => {
    document.title = "Admin Dashboard | Student Assessments";

    fetchDashboardStats();
  }, []);

  async function fetchDashboardStats(){
    // MOCK DATA FETCH for Assessments Dashboard Stats (Replace with actual fetch)
    const mockStats = {
      totalStudents: 45,
      completedAssessments: 32,
      overallAlignment: 88.5,
    };
    setStats(mockStats);
    /*
    try {
      const response = await fetch('http://localhost:5000/api/admin/dashboard-stats');
      const data = await response.json();

      if (data.success) {
        setStats(prevStats => ({
          ...prevStats,
          totalStudents: data.data.totalStudents,
          completedAssessments: data.data.completedAssessments,
          overallAlignment: data.data.overallAlignment
        }))
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
    */
  }

  const [assessments, setAssessments] = useState([]);
  const [totalAssessments, setTotalAssessments] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.max(1, Math.ceil((totalAssessments || 0) / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentStudents = assessments;

  // fetch assessments when page or search changes
  useEffect(() => {
    if (activeTab !== 'assessments') return;

    const controller = new AbortController();
    async function load() {
      setLoading(true);
      // MOCK DATA FETCH for Assessments Table (Replace with actual fetch)
      const mockAssessments = [
        { assessmentId: 'A001', studentAccountId: 101, studentName: 'Alice Johnson', strand: 'STEM', date: new Date().toISOString(), alignment: 92, rating: 5 },
        { assessmentId: 'A002', studentAccountId: 102, studentName: 'Bob Smith', strand: 'HUMSS', date: new Date(Date.now() - 86400000).toISOString(), alignment: 85, rating: 4 },
        { assessmentId: 'A003', studentAccountId: 103, studentName: 'Charlie Brown', strand: 'ABM', date: new Date(Date.now() - 172800000).toISOString(), alignment: 78, rating: 3 },
        { assessmentId: 'A004', studentAccountId: 104, studentName: 'Diana Prince', strand: 'TVL', date: new Date(Date.now() - 259200000).toISOString(), alignment: 95, rating: 5 },
      ];
      if (searchTerm) {
        setAssessments(mockAssessments.filter(a => a.studentName.toLowerCase().includes(searchTerm.toLowerCase())));
      } else {
        setAssessments(mockAssessments);
      }
      setTotalAssessments(mockAssessments.length);
      setLoading(false);
      
      /*
      try {
        const url = `http://localhost:5000/api/assessments?page=${currentPage}&pageSize=${itemsPerPage}&q=${encodeURIComponent(searchTerm)}`;
        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();
        if (data && data.success) {
          setAssessments(data.data || []);
          setTotalAssessments(data.total != null ? data.total : (data.data || []).length);
        }
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Error fetching assessments:', err);
      } finally {
        setLoading(false);
      }
      */
    }
    load();
    return () => controller.abort();
  }, [currentPage, searchTerm, activeTab]);

  // --- Strand Analytics Data ---

  // MOCK DATA for Strand Analytics
  const mockStrandAnalytics = [
    {
      strand: 'STEM',
      totalAssessments: 12,
      averageSatisfaction: 4.8,
      averageAlignment: 92,
      riasecTraits: 'Investigative, Realistic',
      bigFiveTraits: 'Openness, Conscientiousness',
      riasecColor: 'bg-blue-100 text-blue-800',
      bigFiveColor: 'bg-purple-100 text-purple-800',
      recommendedPrograms: [
        { program: 'BS Computer Science', score: 95 },
        { program: 'BS Civil Engineering', score: 93 },
        { program: 'BS Information Technology', score: 92 },
        { program: 'BS Physics', score: 91 },
        { program: 'BS Mathematics', score: 90 },
      ],
    },
    {
      strand: 'HUMSS',
      totalAssessments: 8,
      averageSatisfaction: 4.2,
      averageAlignment: 85,
      riasecTraits: 'Social, Artistic',
      bigFiveTraits: 'Extraversion, Agreeableness',
      riasecColor: 'bg-blue-100 text-blue-800',
      bigFiveColor: 'bg-purple-100 text-purple-800',
      recommendedPrograms: [
        { program: 'BA Political Science', score: 88 },
        { program: 'BA Sociology', score: 86 },
        { program: 'BS Psychology', score: 85 },
        { program: 'BA History', score: 83 },
        { program: 'B Secondary Education', score: 82 },
      ],
    },
    {
      strand: 'ABM',
      totalAssessments: 10,
      averageSatisfaction: 3.9,
      averageAlignment: 78,
      riasecTraits: 'Enterprising, Conventional',
      bigFiveTraits: 'Conscientiousness, Extraversion',
      riasecColor: 'bg-blue-100 text-blue-800',
      bigFiveColor: 'bg-purple-100 text-purple-800',
      recommendedPrograms: [
        { program: 'BS Accountancy', score: 82 },
        { program: 'BS Business Administration', score: 80 },
        { program: 'BS Real Estate Management', score: 79 },
        { program: 'BS Marketing Management', score: 77 },
        { program: 'BS Entrepreneurship', score: 75 },
      ],
    },
    {
      strand: 'Health-Allied',
      totalAssessments: 6,
      averageSatisfaction: 4.5,
      averageAlignment: 88,
      riasecTraits: 'Social, Investigative',
      bigFiveTraits: 'Agreeableness, Conscientiousness',
      riasecColor: 'bg-blue-100 text-blue-800',
      bigFiveColor: 'bg-purple-100 text-purple-800',
      recommendedPrograms: [
        { program: 'BS Nursing', score: 90 },
        { program: 'BS Medical Technology', score: 88 },
        { program: 'BS Pharmacy', score: 87 },
        { program: 'BS Radiologic Technology', score: 85 },
        { program: 'BS Physical Therapy', score: 84 },
      ],
    },
    {
      strand: 'MAD',
      totalAssessments: 9,
      averageSatisfaction: 3.5,
      averageAlignment: 76,
      riasecTraits: 'Artistic, Conventional',
      bigFiveTraits: 'Openness, Conscientiousness',
      riasecColor: 'bg-blue-100 text-blue-800',
      bigFiveColor: 'bg-purple-100 text-purple-800',
      recommendedPrograms: [
        { program: 'BS Advertising Arts', score: 94 },
        { program: 'BS Interior Design', score: 90 },
        { program: 'BS Fine Arts', score: 88 },
        { program: 'Bachelor of Music in Music Theathre', score: 87 },
        { program: 'Bachelor of Music in Performance', score: 82 },
      ],
    },
    {
      strand: 'PE and Sports',
      totalAssessments: 4,
      averageSatisfaction: 2.8,
      averageAlignment: 86,
      riasecTraits: 'Realistic, Social',
      bigFiveTraits: 'Extraversion, Agreeableness',
      riasecColor: 'bg-blue-100 text-blue-800',
      bigFiveColor: 'bg-purple-100 text-purple-800',
      recommendedPrograms: [
        { program: 'BS Fitness and Sports Management', score: 95 },
        { program: 'Bachelor of Physical Education', score: 92 },
      ],
    },
  ];

  const totalStrands = mockStrandAnalytics.length;
  const overallAvgAlignment = mockStrandAnalytics.reduce((acc, curr) => acc + curr.averageAlignment, 0) / totalStrands;

  // --- Common Components ---

  const renderStars = (count) => {
    return [...Array(5)].map((_, i) => {
      if (i < count) return <FaStar key={i} className="text-yellow-500 w-4 h-4" />;
      return <FaRegStar key={i} className="text-gray-300 w-4 h-4" />;
    });
  };

  const ProgressCircle = ({ value, max, color, children }) => {
    const radius = 32;
    const strokeWidth = 12;
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = 2 * Math.PI * normalizedRadius;
    const strokeDashoffset = circumference - (value / max) * circumference;

    return (
      <div className="relative w-16 h-16 sm:w-12 sm:h-12 md:w-16 md:h-16">
        <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 64 64">
          <circle
            stroke="#e5e7eb"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx="32"
            cy="32"
          />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            r={normalizedRadius}
            cx="32"
            cy="32"
            className="transition-all duration-700 ease-out"
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
          title="Completed Assessments"
          value={stats.completedAssessments}
          subtitle={`${((stats.completedAssessments / (stats.totalStudents || 1)) * 100).toFixed(1)}% completion rate`}
          subtitleColor="text-green-600"
          progress={stats.completedAssessments}
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
        {/* Placeholder for the 4th stat card, if needed */}
        <StatCard
          title="Total Assessments"
          value={totalAssessments}
          subtitle="Total recorded assessments"
          subtitleColor="text-gray-600"
          progress={totalAssessments}
          max={totalAssessments > 0 ? totalAssessments : 1}
          icon={<LayoutGrid className="w-6 h-6 text-gray-500" />}
          color="#6b7280"
        />
      </div>

      {/* Search Bar inside Card */}
      <div className="bg-white p-4 mb-4 rounded-xl shadow border border-gray-200">
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // reset to first page on search
          }}
          className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-yellow-300 focus:outline-none mb-6"
        />

        <div className="bg-white rounded-xl shadow border border-gray-200">
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
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-4 text-gray-500">Loading assessments...</td></tr>
                ) : currentStudents.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-4 text-gray-500">No assessments found.</td></tr>
                ) : (
                  currentStudents.map((student) => (
                    <tr key={student.assessmentId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{student.assessmentId}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 font-medium">
                          {`STU${student.studentAccountId || ''}-${student.studentName || '-'}`}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600`}>
                          {student.strand}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {student.date ? new Date(student.date).toLocaleDateString() : "-"}
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
                        <button
                          className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                          onClick={() => {
                            try {
                              sessionStorage.setItem('selectedAssessmentId', String(student.assessmentId));
                              if (student.studentAccountId) sessionStorage.setItem('selectedStudentAccountId', String(student.studentAccountId));
                            } catch (e) { /* ignore */ }
                            navigate(`/admin/assessment/${student.assessmentId}`)
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
                      <div className="font-semibold text-gray-900">{student.assessmentId}</div>
                      <div className="text-xs text-gray-600">{`STU${student.studentAccountId || ''}-${student.studentName || '-'}`}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600`}>
                      {student.strand}
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
                          try {
                            sessionStorage.setItem('selectedAssessmentId', String(student.assessmentId));
                            if (student.studentAccountId) sessionStorage.setItem('selectedStudentAccountId', String(student.studentAccountId));
                          } catch (e) {}
                          navigate(`/admin/assessment/${student.assessmentId}`)
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

  const StrandAnalyticsTab = () => (
    <div className="p-4 sm:p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Strand Analytics Overview</h2>
      
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
          value={`${(mockStrandAnalytics.reduce((acc, curr) => acc + curr.averageSatisfaction, 0) / (totalStrands || 1)).toFixed(1)} / 5`}
          subtitle="Mean satisfaction rating"
          subtitleColor="text-yellow-600"
          progress={(mockStrandAnalytics.reduce((acc, curr) => acc + curr.averageSatisfaction, 0) / (totalStrands || 1)) * 20}
          max={100}
          icon={<Star className="w-6 h-6 text-yellow-600" />}
          color="#f59e0b"
        />
      </div>

      {/* Strand-Specific Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockStrandAnalytics.map((strandData) => (
          <div key={strandData.strand} className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <h3 className="text-xl font-extrabold text-indigo-700 mb-3 flex items-center">
              <GitBranch className="w-5 h-5 mr-2" />
              {strandData.strand} Strand
            </h3>

            <div className="space-y-3 mb-4">
              <div className="p-3 rounded-lg border">
                <p className="text-xs font-semibold uppercase text-gray-500 mb-1">RIASEC Traits</p>
                <span className={`text-sm font-bold ${strandData.riasecColor} px-2 py-0.5 rounded`}>
                  {strandData.riasecTraits || "N/A"}
                </span>
              </div>
              <div className="p-3 rounded-lg border">
                <p className="text-xs font-semibold uppercase text-gray-500 mb-1">Big Five Traits</p>
                <span className={`text-sm font-bold ${strandData.bigFiveColor} px-2 py-0.5 rounded`}>
                  {strandData.bigFiveTraits || "N/A"}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-sm font-medium mb-3 border-b pb-2">
                <span className="text-gray-600">Alignment Score:</span>
                <span className="text-2xl font-bold text-red-600">{strandData.averageAlignment}%</span>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Total Assessments:</span>
                    <span className="font-semibold">{strandData.totalAssessments}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Average Satisfaction:</span>
                    <div className="flex items-center space-x-1">
                        {renderStars(Math.round(strandData.averageSatisfaction))}
                        <span className="font-semibold text-gray-700">({strandData.averageSatisfaction.toFixed(1)})</span>
                    </div>
                </div>
            </div>

            <h4 className="text-lg font-bold text-gray-800 mt-4 border-t pt-4">
              Top 5 Recommended Programs
            </h4>
            
            <ul className="mt-2 space-y-2">
              {strandData.recommendedPrograms.map((program, index) => (
                <li key={index} className="flex justify-between items-center text-sm p-2 rounded-lg bg-gray-50 hover:bg-yellow-50 transition-colors">
                  <span className="font-medium text-gray-700">{index + 1}. {program.program}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${program.score > 90 ? 'bg-green-100 text-green-700' : program.score > 80 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {program.score}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

    </div>
  );


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
          {activeTab === 'assessments' && <AssessmentsTab />}
          {activeTab === 'strandAnalytics' && <StrandAnalyticsTab />}
        </main>
      </div>
    </div>
  );
};

export default AdminAssessment;