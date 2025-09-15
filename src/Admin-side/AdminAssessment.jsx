import React from "react";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import { FileCheck, Calendar, BarChart2, Users } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

const AdminAssessment = () => {
  // Mock Data
  const stats = {
    totalStudents: 12,
    completedAssessments: 10,
    pendingAssessments: 355,
    overallAlignment: 88.5,
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

  const StatCard = ({
    title,
    value,
    subtitle,
    subtitleColor,
    icon,
    progress,
    max,
    color,
  }) => (
    <div className="bg-white p-8 sm:p-6 rounded-xl shadow border border-gray-200 hover:border-yellow-500 transition-all duration-200">
      <div className="flex items-center justify-between">
        {/* Left side text */}
        <div className="text-left">
          <p className="text-gray-600 text-lg sm:text-sm font-medium">
            {title}
          </p>
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-start sm:items-center p-4 sm:p-6 border-b">
          <h1 className="text-2xl sm:text-4xl font-semibold mb-2 sm:mb-0">
            Student Assessments
          </h1>
          <div className="flex items-center space-x-3">
            <span className="text-xs sm:text-sm text-gray-600 sm:inline">
              Welcome back, Admin User!
            </span>
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm sm:text-base">
              AU
            </div>
          </div>
        </header>

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
              icon={
                <Users className="w-6 h-6 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" />
              }
              color="#2563eb"
            />
            <StatCard
              title="Completed Assessments"
              value={stats.completedAssessments}
              subtitle={`${(
                (stats.completedAssessments / stats.totalStudents) *
                100
              ).toFixed(1)}% completion rate`}
              subtitleColor="text-green-600"
              progress={stats.completedAssessments}
              max={stats.totalStudents}
              icon={
                <FileCheck className="w-6 h-6 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600" />
              }
              color="#16a34a"
            />
            <StatCard
              title="Pending Assessments"
              value={stats.pendingAssessments}
              subtitle="Awaiting completion"
              subtitleColor="text-orange-600"
              progress={stats.pendingAssessments}
              max={400}
              icon={
                <Calendar className="w-6 h-6 sm:w-5 sm:h-5 md:w-6 md:h-6 text-orange-600" />
              }
              color="#ea580c"
            />
            <StatCard
              title="Overall Alignment"
              value={`${stats.overallAlignment}%`}
              subtitle="Average score"
              subtitleColor="text-purple-600"
              progress={stats.overallAlignment}
              max={100}
              icon={
                <BarChart2 className="w-6 h-6 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-600" />
              }
              color="#9333ea"
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminAssessment;
