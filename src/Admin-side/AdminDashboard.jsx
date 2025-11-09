import React, {useState, useEffect} from "react";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import { FileCheck, Calendar, BarChart2, Users } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

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
    pendingAssessments: 0,
    overallAlignment: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Admin Dashboard | Overview";
    fetchDashboardStats();
    fetchStrandScores();
    fetchTopPrograms();
  }, []);

  const fetchDashboardStats = async () => {
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
        fetch(`${base}/api/strands`),
        fetch(`${base}/api/admin/strand-alignment`)
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
  
  async function fetchTopPrograms() {
    try {
      const res = await fetch('http://localhost:5000/api/admin/top-programs');
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


let statsContent;


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
              value={stats.completedAssessments}
              subtitle={`${((stats.completedAssessments / stats.totalStudents) * 100).toFixed(1)}% completion rate`}
              subtitleColor="text-green-600"
              progress={stats.completedAssessments}
              max={stats.totalStudents}
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

          {/* Program mismatch cases removed */}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
