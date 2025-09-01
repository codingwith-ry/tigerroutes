import React from "react";
import { Home, ClipboardCheck, Users, FileCheck, Calendar, BarChart2 } from "lucide-react";

const AdminDashboard = () => {
  // Data
  const strands = [
    { name: "STEM", score: 82.9 },
    { name: "HUMSS", score: 82.3 },
    { name: "ABM", score: 82.3 },
    { name: "TVL", score: 81.2 },
    { name: "GAS", score: 82.3 },
  ];

  const programs = [
    { name: "Computer Science", score: 85.2 },
    { name: "Business Administration", score: 82.1 },
    { name: "Engineering", score: 88.7 },
    { name: "Education", score: 79.3 },
    { name: "Nursing", score: 84.6 },
  ];

  const mismatchCases = [
    { id: "#1001", from: "STEM", to: "Fine Arts", reason: "Low alignment with current track" },
    { id: "#1145", from: "HUMSS", to: "Engineering", reason: "Significant strand mismatch" },
    { id: "#1289", from: "ABM", to: "Sports Science", reason: "Unexpected career interest" },
    { id: "#1456", from: "GAS", to: "Medicine", reason: "Prerequisites not met" },
    { id: "#1765", from: "TVL", to: "Literature", reason: "Complete field change" },
  ];

  // Reusable Stat Card
  const StatCard = ({ title, value, icon, color }) => (
    <div className="flex flex-col items-center bg-white rounded-2xl shadow p-4 w-full">
      <div className={`w-10 h-10 flex items-center justify-center rounded-full ${color}`}>
        {icon}
      </div>
      <p className="text-sm text-gray-500 mt-2">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );

  return (
    <div className="flex w-screen h-screen bg-[#fdfcf8]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#fdfcf8] border-r relative">
        <div className="flex justify-between items-center p-6">
        <img
          src="/images/TIGER ROUTES.png"
          alt="TigerRoutes Logo"
          className="h-8 cursor-pointer"
        /></div>
        <nav className="mt-2 space-y-2">
          <a className="flex items-center px-4 py-2 bg-yellow-100 text-yellow-600 rounded-lg">
            <Home className="mr-3 w-5 h-5" /> Dashboard
          </a>
          <a className="flex items-center px-4 py-2 hover:bg-gray-100 rounded-lg">
            <ClipboardCheck className="mr-3 w-5 h-5" /> Assessment
          </a>
          <a className="flex items-center px-4 py-2 hover:bg-gray-100 rounded-lg">
            <Users className="mr-3 w-5 h-5" /> Manage Counselors
          </a>
        </nav>
        <div className="absolute bottom-6 left-6 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            AU
          </div>
          <div>
            <p className="font-semibold">Admin User</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center p-6 border-b">
          <h1 className="text-4xl font-semibold">Overview</h1>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">Welcome back, Admin User!</span>
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              AU
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6 grid grid-cols-12 gap-6 overflow-y-auto">
          {/* Stats */}
          <div className="col-span-12 grid grid-cols-4 gap-6">
            <StatCard title="Total Students" value="12" icon={<Users />} color="bg-blue-100 text-blue-600" />
            <StatCard title="Completed Assessments" value="10" icon={<FileCheck />} color="bg-green-100 text-green-600" />
            <StatCard title="Pending Assessments" value="355" icon={<Calendar />} color="bg-orange-100 text-orange-600" />
            <StatCard title="Overall Alignment" value="88.5%" icon={<BarChart2 />} color="bg-purple-100 text-purple-600" />
          </div>

          {/* Strand Scores */}
          <div className="col-span-6 bg-white rounded-2xl shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Strand Alignment Scores</h2>
            {strands.map((s, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>{s.name}</span>
                  <span className="font-medium">{s.score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${s.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Top Programs */}
          <div className="col-span-6 bg-white rounded-2xl shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Top 5 Most Recommended Programs</h2>
            <ul>
              {programs.map((p, i) => (
                <li key={i} className="flex justify-between py-2 border-b last:border-none">
                  <span>{p.name}</span>
                  <span className="font-medium">{p.score}%</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mismatch Cases */}
          <div className="col-span-12 bg-white rounded-2xl shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Program Mismatch Cases</h2>
            <ul className="space-y-3">
              {mismatchCases.map((c, i) => (
                <li key={i} className="p-3 border rounded-lg bg-gray-50">
                  <p className="font-medium">
                    Student {c.id}: {c.from} → {c.to}
                  </p>
                  <p className="text-sm text-gray-500">{c.reason}</p>
                </li>
              ))}
            </ul>
            <button className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded-lg">
              View All
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
