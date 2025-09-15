import { useState } from "react";
import React from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import { FileCheck, Calendar, BarChart2, Users, Target, Star, Activity, Eye, TrendingUp } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

const AdminAssessment = () => {
  // Mock Data
  const stats = {
    totalStudents: 12,
    completedAssessments: 10,
    pendingAssessments: 355,
    overallAlignment: 88.5,
  };

  const students = [
    { id: "STU-0001", strand: "STEM", strandColor: "bg-blue-100 text-blue-600", date: "06/27/2025", alignment: "92%", satisfaction: 4, rating: 4.8 },
    { id: "STU-0002", strand: "ABM", strandColor: "bg-green-100 text-green-600", date: "06/20/2025", alignment: "92%", satisfaction: 4, rating: 4.8 },
    { id: "STU-0003", strand: "HUMSS", strandColor: "bg-purple-100 text-purple-600", date: "06/13/2025", alignment: "92%", satisfaction: 4, rating: 4.8 },
    { id: "STU-0004", strand: "TVL", strandColor: "bg-yellow-100 text-yellow-600", date: "05/30/2025", alignment: "92%", satisfaction: 4, rating: 4.8 },
    { id: "STU-0005", strand: "GAS", strandColor: "bg-red-100 text-red-600", date: "05/05/2025", alignment: "N/A", satisfaction: 0, rating: "" },
    { id: "STU-0006", strand: "STEM", strandColor: "bg-blue-100 text-blue-600", date: "04/11/2025", alignment: "N/A", satisfaction: 0, rating: "" },
    { id: "STU-0007", strand: "STEM", strandColor: "bg-blue-100 text-blue-600", date: "04/02/2025", alignment: "92%", satisfaction: 4, rating: 4.8 },
    { id: "STU-0008", strand: "ABM", strandColor: "bg-green-100 text-green-600", date: "02/14/2025", alignment: "92%", satisfaction: 4, rating: 4.8 },
    { id: "STU-0009", strand: "TVL", strandColor: "bg-yellow-100 text-yellow-600", date: "01/23/2025", alignment: "92%", satisfaction: 4, rating: 4.8 },
  ];

   // ✅ Search + Pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ Filter students by ID or strand
  const filteredStudents = students.filter(
    (s) =>
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.strand.toLowerCase().includes(searchTerm.toLowerCase())
  );

    // ✅ Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  // ✅ Satisfaction stars
  const renderStars = (count) => {
    return [...Array(5)].map((_, i) => {
      if (i < count) return <FaStar key={i} className="text-yellow-500" />;
      return <FaRegStar key={i} className="text-gray-300" />;
    });
  };

  // ✅ Progress Circle Component (responsive)
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

  return (
    <div className="flex flex-col md:flex-row w-screen h-screen bg-[#fdfcf8]">
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-start sm:items-center p-4 sm:p-6 border-b">
          <h1 className="text-2xl sm:text-4xl font-semibold mb-2 sm:mb-0">Student Assessments</h1>
          <div className="flex items-center space-x-3">
            <span className="text-xs sm:text-sm text-gray-600 sm:inline">Welcome back, Admin User!</span>
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm sm:text-base">
              AU
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {/* ✅ Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
            <StatCard
              title="Total Students"
              value={stats.totalStudents}
              subtitle="All active users"
              subtitleColor="text-blue-600"
              progress={stats.totalStudents}
              max={20}
              icon={<Users className="w-6 h-6 text-blue-600" />}
              color="#2563eb"
            />
            <StatCard
              title="Completed Assessments"
              value={stats.completedAssessments}
              subtitle={`${((stats.completedAssessments / stats.totalStudents) * 100).toFixed(1)}% completion rate`}
              subtitleColor="text-green-600"
              progress={stats.completedAssessments}
              max={stats.totalStudents}
              icon={<FileCheck className="w-6 h-6 text-green-600" />}
              color="#16a34a"
            />
            <StatCard
              title="Pending Assessments"
              value={stats.pendingAssessments}
              subtitle="Awaiting completion"
              subtitleColor="text-orange-600"
              progress={stats.pendingAssessments}
              max={400}
              icon={<Calendar className="w-6 h-6 text-orange-600" />}
              color="#ea580c"
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

          {/* ✅ Search Bar inside Card */}
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
                    <th className="px-6 py-3">Student ID</th>
                    <th className="px-6 py-3">Strand</th>
                    <th className="px-6 py-3">Assessment Date</th>
                    <th className="px-6 py-3">Alignment Score</th>
                    <th className="px-6 py-3">Satisfaction Rating</th>
                    <th className="px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{student.id}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${student.strandColor}`}>
                          {student.strand}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {student.date}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {student.alignment !== "N/A" ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            {student.alignment}
                          </span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center space-x-1">
                            {renderStars(student.satisfaction)}
                          </div>
                          <span className="text-sm text-gray-500">{student.rating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className="flex items-center text-sm text-red-600 hover:text-red-800 font-medium"
                          onClick={() => {/* Add your preview handler here */}}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Accordion */}
            <div className="sm:hidden divide-y divide-gray-200">
              {students.map((student) => (
                <div key={student.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">{student.id}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${student.strandColor}`}>
                      {student.strand}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-500 text-xs">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {student.date}
                    </div>
                    <div className="flex items-center text-xs">
                      {student.alignment !== "N/A" ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          {student.alignment}
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </div>
                    <div className="flex items-center text-gray-500 text-xs">
                      <span className="min-w-[80px] font-medium">Satisfaction:</span>
                      <div className="flex items-center">
                        {renderStars(student.satisfaction)}
                        <span>{student.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-blue-600 text-xs mt-3">
                      <Eye className="w-4 h-4 mr-2" />
                      <button
                        className="font-medium hover:text-blue-800"
                        onClick={() => {/* Add preview handler here */}}
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* ✅ Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm text-gray-600">
            <div className="mb-2 sm:mb-0">
              Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredStudents.length)} of {filteredStudents.length} entries
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
        </main>
      </div>
    </div>
  );
};

export default AdminAssessment;
