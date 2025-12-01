import React, {useState, useEffect} from "react";
import Swal from 'sweetalert2';
import { FileCheck, BarChart2, Users } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
/* eslint-disable react/prop-types */

const AdminDashboard = () => {
  // Mock Data
  // const stats = {
  //   totalStudents: 12,
  //   completedAssessments: 10,
  //   pendingAssessments: 355,
  //   overallAlignment: 88.5,
  // };

  const [stats, setStats] = useState({
    totalStudents: 0,
    completedAssessments: 0,
    completedStudents: 0,
    pendingAssessments: 0,
    overallAlignment: 0,
    totalCounselors: 0,
  });
  const [, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Admin Dashboard | Overview";
    fetchDashboardStats();
    fetchStrandScores();
    fetchTopPrograms();
    fetchUnassessedStudents();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/dashboard-stats`, { credentials: 'include' });
      const data = await response.json();

      if (data.success) {
        setStats(prevStats => ({
          ...prevStats,
          totalStudents: data.data.totalStudents,
          // main displayed number: total assessment records
          completedAssessments: data.data.completedAssessments,
          // number of students with >=1 assessment (used for % completion)
          completedStudents: data.data.completedStudents || 0,
          overallAlignment: data.data.overallAlignment,
          totalCounselors: data.data.totalCounselors || 0
        }))
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }

  // const strands = [
  //   { name: "STEM", score: 85 },
  //   { name: "ABM", score: 75 },
  //   { name: "HUMSS", score: 65 },
  //   { name: "GAS", score: 60 },
  //   { name: "TVL", score: 55 },
  // ];

  const [strandScores, setStrandScores] = useState([]);

  async function fetchStrandScores() {
    try {
      const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      // Fetch canonical strands and analytics in parallel
      const [strandsRes, analyticsRes] = await Promise.all([
        fetch(`${base}/api/strands`, { credentials: 'include' }),
        fetch(`${base}/api/admin/strand-alignment`, { credentials: 'include' })
      ]);

      const strandsJson = await strandsRes.json().catch(() => null);
      const analyticsJson = await analyticsRes.json().catch(() => null);

      const strandsList = Array.isArray(strandsJson) ? strandsJson : (strandsJson && strandsJson.data ? strandsJson.data : []);
      const analyticsList = analyticsJson && analyticsJson.success && Array.isArray(analyticsJson.data) ? analyticsJson.data : [];

      const analyticsMap = {};
      (analyticsList || []).forEach(a => {
        const key = (a.strandName || a.strand || '').toString();
        analyticsMap[key] = a;
      });

      const merged = (strandsList || []).map(s => {
        const name = s.strandName || s.name || s.strand || '';
        const a = analyticsMap[name] || null;
        return {
          name: name,
          score: a && a.avgAlignment != null ? Number(a.avgAlignment) : 0
        };
      });

      setStrandScores(merged);
      console.log('Strand scores merged and set:', merged);
    } catch (e) {
      console.error('Error fetching strand alignment:', e);
    }
  }

  // const programs = [
  //   { name: "Computer Science", recommendations: 234, score: 85.2 },
  //   { name: "Business Administration", recommendations: 189, score: 82.1 },
  //   { name: "Engineering", recommendations: 156, score: 88.7 },
  //   { name: "Education", recommendations: 143, score: 79.3 },
  //   { name: "Nursing", recommendations: 127, score: 84.6 },
  // ];

  const [topPrograms, setTopPrograms] = useState([]);
  const [unassessedStudents, setUnassessedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  async function fetchTopPrograms() {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/top-programs`, { credentials: 'include' });
      const json = await res.json();
      console.log('Top programs response:', json);
      if (json.success) {
        setTopPrograms(json.data.map(r => ({
          name: r.programName,
          recommendations: Number(r.recommendations),
          score: Number(r.avgAlignment)
        })));
      }
    } catch (e) {
      console.error('Error fetching top programs:', e);
    }
  }

  async function fetchUnassessedStudents() {
    try {
      const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const res = await fetch(`${base}/api/admin/unassessed-students`, { credentials: 'include' });
      const json = await res.json();
      if (json && json.success) setUnassessedStudents(json.data || []);
    } catch (e) {
      console.error('Error fetching unassessed students:', e);
    }
  }

  // client-side search + pagination
  const filteredStudents = (unassessedStudents || []).filter(s => {
    if (!searchTerm) return true;
    return (s.name || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const currentPage = Math.min(page, Math.max(0, totalPages - 1));
  const currentPageItems = filteredStudents.slice(currentPage * pageSize, (currentPage + 1) * pageSize);


  // Program mismatch cases removed — not used in current system

  // ✅ Progress Circle Component (responsive)
  const ProgressCircle = ({ value, max, color, children }) => {
    const radius = 32;
    const strokeWidth = 12;
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = 2 * Math.PI * normalizedRadius;
    const strokeDashoffset = circumference - (value / max) * circumference;

    return (
      <div className="relative w-16 h-16 sm:w-12 sm:h-12 md:w-16 md:h-16">
        <svg
          className="transform -rotate-90 w-full h-full"
          viewBox="0 0 64 64"
        >
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


// statsContent variable removed (unused)


const StatCard = ({ title, value, subtitle, subtitleColor, icon, progress, max, color }) => (
  <div className="bg-white p-8 sm:p-6 rounded-xl shadow border border-gray-200 hover:border-yellow-500 transition-all duration-200">
    <div className="flex items-center justify-between">
      {/* Left side text */}
      <div className="text-left">
        <p className="text-gray-600 text-lg sm:text-sm font-medium">{title}</p>
        <h3 className="text-3xl sm:text-2xl font-extrabold mt-1">{value}</h3>
        {subtitle && (
          <p className={`text-xs sm:text-sm font-medium ${subtitleColor}`}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Right side progress circle */}
      <ProgressCircle value={progress} max={max} color={color}>
        {icon}
      </ProgressCircle>
    </div>
  </div>
);


  return (
    <div className="flex flex-col md:flex-row w-screen h-screen bg-[#fdfcf8]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Dashboard Overview" />

        {/* Dashboard Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {/* ✅ Stats Grid (stacked vertically on mobile) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
            <StatCard
              title="Total Students"
              value={stats.totalStudents}
              subtitle="All active users"
              subtitleColor="text-blue-600"
              progress={stats.totalStudents}
              max={20}
              icon={<Users className="w-6 h-6 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" />}
              color="#2563eb"
            />
            <StatCard
              title="Completed Assessments"
              // main number: total assessment rows
              value={stats.completedAssessments}
              // completion rate is based on distinct students with >=1 assessment
              subtitle={`${((stats.completedStudents / (stats.totalStudents || 1)) * 100).toFixed(1)}% of Students Assessed`}
              subtitleColor="text-green-600"
              // progress visual shows students-with-assessments / total students
              progress={stats.completedStudents}
              max={stats.totalStudents || 1}
              icon={<FileCheck className="w-6 h-6 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600" />}
              color="#16a34a"
            />
            {/* <StatCard
              title="Pending Assessments"
              value={stats.pendingAssessments}
              subtitle="Awaiting completion"
              subtitleColor="text-orange-600"
              progress={stats.pendingAssessments}
              max={400}
              icon={<Calendar className="w-6 h-6 sm:w-5 sm:h-5 md:w-6 md:h-6 text-orange-600" />}
              color="#ea580c"
            /> */}
            <StatCard
              title="Overall Alignment"
              value={`${stats.overallAlignment}%`}
              subtitle="Average score"
              subtitleColor="text-purple-600"
              progress={stats.overallAlignment}
              max={100}
              icon={<BarChart2 className="w-6 h-6 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-600" />}
              color="#9333ea"
            />
            <StatCard
              title="Total Counselors"
              value={stats.totalCounselors}
              subtitle="Active counselors"
              subtitleColor="text-indigo-600"
              progress={stats.totalCounselors}
              max={50}
              icon={<Users className="w-6 h-6 sm:w-5 sm:h-5 md:w-6 md:h-6 text-indigo-600" />}
              color="#4f46e5"
            />
          </div>

          {/* Strand + Programs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Strand Scores */}
            <div className="bg-white rounded-2xl shadow p-4 sm:p-6">
              <h2 className="text-lg font-semibold mb-6 flex items-center">
                <span className="mr-2">📊</span> Strand Alignment Scores
              </h2>
              {(strandScores.length ? strandScores : []).map((s, i) => {
                let barColor = "bg-gray-400";
                let textColor = "text-gray-400";
                if (s.name === "STEM") { barColor = "bg-blue-500"; textColor = "text-blue-500"; }
                else if (s.name === "ABM") { barColor = "bg-green-500"; textColor = "text-green-500"; }
                else if (s.name === "HUMSS") { barColor = "bg-purple-500"; textColor = "text-purple-500"; }
                // else if (s.name === "GAS") { barColor = "bg-orange-500"; textColor = "text-orange-500"; }
                // else if (s.name === "TVL") { barColor = "bg-red-500"; textColor = "text-red-500"; }
                else if (s.name.includes("Health")) { barColor = "bg-orange-500"; textColor = "text-orange-500"; }                

                return (
                  <div key={i} className="mb-6 last:mb-0">
                    <div className="flex justify-between text-xs sm:text-sm mb-2">
                      <span className="font-medium text-gray-900">{s.name}</span>
                      <span className={`font-bold ${textColor}`}>{s.score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4">
                      <div 
                        className={`${barColor} h-3 sm:h-4 rounded-full transition-all duration-300`} 
                        style={{ width: `${Math.min(100, Math.max(0, s.score))}%` }}                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Top Programs */}
            <div className="bg-white rounded-2xl shadow p-4 sm:p-6">
              <h2 className="text-lg font-semibold mb-6 flex items-center">
                <span className="mr-2">🏅</span> Top 5 Most Recommended Programs
              </h2>
              <div className="space-y-3">
                {topPrograms.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-100 transition-all duration-200"
                  >
                    <div>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{p.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{p.recommendations} recommendations</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-base sm:text-lg font-semibold ${
                        p.score >= 85
                          ? "text-green-600"
                          : p.score >= 80
                          ? "text-green-500"
                          : "text-yellow-600"
                      }`}>
                        {p.score}%
                      </p>
                      <p className="text-xs sm:text-sm font-normal text-gray-500">avg. alignment</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Students without completed assessments */}
            <div className="mt-6 bg-white rounded-2xl shadow p-4 sm:p-6">
              <h2 className="text-lg font-semibold mb-4">Students Pending Assessment Completion</h2>

              <div className="flex items-center gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setPage(0); }}
                  className="px-3 py-2 border rounded-md w-full max-w-sm"
                />
                <div className="text-xs text-gray-500">Showing {filteredStudents.length} result(s)</div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-xs text-gray-500">
                      <th className="px-3 py-2">Student Name</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Pending Assessment</th>
                      <th className="px-3 py-2">Date Reminded</th>
                      <th className="px-3 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr><td colSpan={4} className="px-3 py-4 text-sm text-gray-500">No students found</td></tr>
                    ) : currentPageItems.map(s => (
                      <tr key={s.studentAccount_ID} className="border-t">
                        <td className="px-3 py-3 font-medium text-gray-900">{s.name}</td>
                        <td className="px-3 py-3 text-gray-600">{s.email}</td>
                        <td className="px-3 py-3">{s.pendingAssessment_ID ? s.pendingAssessment_ID : 'No'}</td>
                        <td className="px-3 py-3 text-gray-600">{s.lastReminderDate ? new Date(s.lastReminderDate).toLocaleString() : '—'}</td>
                        <td className="px-3 py-3">
                          <button
                            onClick={async () => {
                              const confirm = await Swal.fire({
                                title: 'Send reminder?',
                                text: `Send reminder email to ${s.name}?`,
                                icon: 'question',
                                showCancelButton: true,
                                confirmButtonText: 'Send',
                                cancelButtonText: 'Cancel'
                              });
                              if (!confirm.isConfirmed) return;
                              try {
                                const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
                                const resp = await fetch(`${base}/api/admin/remind-student`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  credentials: 'include',
                                  body: JSON.stringify({ studentAccount_ID: s.studentAccount_ID })
                                });
                                const body = await resp.json();
                                if (resp.ok && body.success) {
                                  Swal.fire('Sent', 'Reminder email sent successfully.', 'success');
                                } else {
                                  Swal.fire('Error', (body && body.message) || 'Failed to send reminder.', 'error');
                                }
                              } catch (err) {
                                console.error('Error sending reminder:', err);
                                Swal.fire('Error', 'Failed to send reminder.', 'error');
                              }
                            }}
                            className="bg-yellow-400 text-white px-3 py-1 rounded-md hover:bg-yellow-500"
                          >
                            Remind
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              {filteredStudents.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">Showing {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, filteredStudents.length)} of {filteredStudents.length}</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={currentPage === 0}
                      className={`px-3 py-1 rounded-md border ${currentPage === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                    >Prev</button>
                    <div className="text-sm text-gray-700">Page {currentPage + 1} / {totalPages}</div>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={currentPage >= totalPages - 1}
                      className={`px-3 py-1 rounded-md border ${currentPage >= totalPages - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                    >Next</button>
                  </div>
                </div>
              )}
            </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
