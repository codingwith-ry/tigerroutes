import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { Search, Edit, Eye, UserPlus, ChevronLeft, ChevronRight } from "lucide-react";

const AdminCounselors = () => {
  const [entries, setEntries] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const counselors = [
    { name: "Dr. John Cruz", email: "john.cruz@school.edu", strand: "STEM", lastLogin: "2025-09-16 08:10", status: "Active" },
    { name: "Dr. Lily Cruz", email: "lily.cruz@school.edu", strand: "ABM", lastLogin: "2025-09-16 06:45", status: "Active" },
    { name: "Ms. Carla Rivera", email: "carla.rivera@school.edu", strand: "HUMSS", lastLogin: "2025-09-15 19:20", status: "Active" },
    { name: "Dr. John Doe", email: "john.doe@school.edu", strand: "TVL", lastLogin: "2025-09-18 08:20", status: "Inactive" },
  ];

  const filteredCounselors = counselors.filter(
    (counselor) =>
      counselor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      counselor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      counselor.strand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCounselors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCounselors = filteredCounselors.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex flex-col md:flex-row w-screen h-screen bg-[#fdfcf8]">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b">
          <h1 className="text-2xl sm:text-4xl font-semibold">Manage Counselors</h1>
          <div className="flex items-center space-x-3 mt-2 sm:mt-0">
            <span className="text-sm text-gray-600">Welcome back, Admin User!</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 flex items-center justify-center font-semibold">
              AU
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <div className="bg-white rounded-xl p-6 shadow border border-gray-200">
            {/* Search + Add Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-2 sm:space-y-0">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search counselors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring focus:ring-yellow-300 focus:border-transparent focus:outline-none"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              <button className="flex items-center bg-[#FBBC05] hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <UserPlus className="mr-2 w-4 h-4" /> Add Counselor
              </button>
            </div>

            {/* Table View (Desktop/Tablet) */}
            <div className="hidden sm:block overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="w-2/6 px-6 py-4 text-left">COUNSELOR</th>
                    <th className="w-1/6 px-6 py-4 text-center">STRAND</th>
                    <th className="w-1/6 px-6 py-4 text-center">LAST LOGIN</th>
                    <th className="w-1/6 px-6 py-4 text-center">STATUS</th>
                    <th className="w-1/6 px-6 py-4 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentCounselors.map((c, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{c.name}</span>
                          <span className="text-sm text-gray-500">{c.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium inline-block min-w-[80px]"
                          style={{
                            backgroundColor:
                              c.strand === "STEM"
                                ? "#E5EEFF"
                                : c.strand === "ABM"
                                ? "#DAFFE4"
                                : c.strand === "HUMSS"
                                ? "#EDE0FF"
                                : c.strand === "TVL"
                                ? "#FFE49E"
                                : "#F0F0F0",
                            color:
                              c.strand === "STEM"
                                ? "#195FD3"
                                : c.strand === "ABM"
                                ? "#34A853"
                                : c.strand === "HUMSS"
                                ? "#9747FF"
                                : c.strand === "TVL"
                                ? "#FB9724"
                                : "#000000",
                          }}
                        >
                          {c.strand}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-500">{c.lastLogin}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium inline-block min-w-[80px]"
                          style={{
                            backgroundColor: c.status === "Active" ? "#DAFFE4" : "#D9D9D9",
                            color: c.status === "Active" ? "#34A853" : "#1E1E1E",
                          }}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-4">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Eye className="w-5 h-5" />
                          </button>
                          <button className="text-blue-600 hover:text-blue-800">
                            <Edit className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Card View (Mobile) */}
            <div className="grid gap-4 sm:hidden">
              {currentCounselors.map((c, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50 shadow-sm">
                  <div className="font-semibold text-gray-900">{c.name}</div>
                  <div className="text-sm text-gray-500 mb-2">{c.email}</div>

                  {/* Strand pill */}
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Strand:</span>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium inline-block min-w-[80px] text-center"
                      style={{
                        backgroundColor:
                          c.strand === "STEM"
                            ? "#E5EEFF"
                            : c.strand === "ABM"
                            ? "#DAFFE4"
                            : c.strand === "HUMSS"
                            ? "#EDE0FF"
                            : c.strand === "TVL"
                            ? "#FFE49E"
                            : "#F0F0F0",
                        color:
                          c.strand === "STEM"
                            ? "#195FD3"
                            : c.strand === "ABM"
                            ? "#34A853"
                            : c.strand === "HUMSS"
                            ? "#9747FF"
                            : c.strand === "TVL"
                            ? "#FB9724"
                            : "#000000",
                      }}
                    >
                      {c.strand}
                    </span>
                  </div>

                  {/* Last Login */}
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Last Login:</span>
                    <span className="text-gray-500">{c.lastLogin}</span>
                  </div>

                  {/* Status pill */}
                  <div className="flex justify-between text-sm mb-4">
                    <span className="font-medium">Status:</span>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium inline-block min-w-[80px] text-center"
                      style={{
                        backgroundColor: c.status === "Active" ? "#DAFFE4" : "#D9D9D9",
                        color: c.status === "Active" ? "#34A853" : "#1E1E1E",
                      }}
                    >
                      {c.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-4">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button className="text-blue-600 hover:text-blue-800">
                      <Edit className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm text-gray-600">
              <div className="mb-2 sm:mb-0">
                Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredCounselors.length)} of {filteredCounselors.length} entries
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
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
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminCounselors;
