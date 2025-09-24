import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { Search, Edit, Eye, UserPlus, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const AdminCounselors = () => {
  const [entries, setEntries] = useState(10);

  const increment = () => setEntries(prev => prev + 1);
  const decrement = () => setEntries(prev => (prev > 1 ? prev - 1 : 1));

  const counselors = [
    { name: "Dr. John Cruz", email: "john.cruz@school.edu", strand: "STEM", lastLogin: "2025-09-16 08:10", status: "Active" },
    { name: "Dr. Lily Cruz", email: "lily.cruz@school.edu", strand: "ABM", lastLogin: "2025-09-16 06:45", status: "Active" },
    { name: "Ms. Carla Rivera", email: "carla.rivera@school.edu", strand: "HUMSS", lastLogin: "2025-09-15 19:20", status: "Active" },
    { name: "Dr. John Doe", email: "john.doe@school.edu", strand: "TVL", lastLogin: "2025-09-18 08:20", status: "Inactive" },
  ];


  return (
    <div className="flex flex-col md:flex-row w-screen h-screen bg-[#fdfcf8]">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b">
          <div>
            <h1 className="text-2xl sm:text-4xl font-semibold">Manage Counselors</h1>
            <p className="text-sm text-gray-500">Control access. Assign roles. Track activity.</p>
          </div>
          <div className="flex items-center space-x-3 mt-2 sm:mt-0">
            <span className="text-sm text-gray-600">Welcome back, Admin User!</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 flex items-center justify-center font-semibold">
              AU
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-9 overflow-auto">
          {/* Table Container */}
          <div className="bg-white rounded-lg p-6 shadow-[0_2px_6px_rgba(0,0,0,0.3)]">
            {/* Search + Add Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
              <div className="relative w-full sm:w-1/3">
                <input
                  type="text"
                  placeholder="Search counselors..."
                  className="w-full border rounded-md pl-8 pr-3 py-2 text-sm"
                />
                <Search className="absolute left-2 top-2.5 text-gray-400 w-4 h-4" />
              </div>
              <button className="flex items-center bg-[#FBBC05] hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                <UserPlus className="mr-2 w-4 h-4" /> Add Counselor
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-xs border table-fixed">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="w-1/5 text-left py-5 pl-20">COUNSELOR</th>
                    <th className="w-1/5 text-center py-5 pl-4">STRAND</th>
                    <th className="w-1/5 text-center py-5 pl-4">LAST LOGIN</th>
                    <th className="w-1/5 text-center py-5 pl-4">STATUS</th>
                    <th className="w-1/5 text-center py-5 pl-4">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {counselors.map((c, index) => (
                    <tr key={index} className="border-t">
                      <td className="text-left py-5 pl-20">
                        <div className="flex flex-col">
                          <span className="font-medium">{c.name}</span>
                          <span className="text-xs text-[#919191]">{c.email}</span>
                        </div>
                      </td>
                      <td className="text-center py-5 pl-4">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium w-16 inline-block text-center"
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
                      <td className="text-center py-5 pl-4 text-gray-400">{c.lastLogin}</td>
                      <td className="text-center py-5 pl-4">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: c.status === "Active" ? "#DAFFE4" : "#D9D9D9",
                            color: c.status === "Active" ? "#34A853" : "#1E1E1E",
                          }}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="flex justify-center space-x-3 py-5 pl-4">
                        <button className="text-red-500 hover:text-red-700">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-blue-500 hover:text-blue-700">
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination - custom stepper box */}
          <div className="w-full max-w-8xl mx-auto mt-4 flex justify-between items-center text-sm text-[#7E7E7E]">
      
            <div className="flex items-center space-x-3">
              <span>Show</span>

              {/* Stepper box */}
              <div className="relative flex items-center rounded w-14 h-8 border-2 border-[#919191]">
              <span className="w-full pl-4 font-bold">{entries}</span>

                {/* Chevron container */}
                <div className="absolute right-0 flex flex-col h-full justify-center">
                  <button onClick={increment} className="flex justify-center h-2/2 w-6">
                    <ChevronUp className="w-2 h-2" />
                  </button>
                  <button onClick={decrement} className="flex justify-center h-2/2 w-6">
                    <ChevronDown className="w-2 h-2" />
                  </button>
                </div>
              </div>
              <span>entries</span>
              <span className="pl-4">Showing {entries} out of 50 entries</span>
            </div>

            <div className="flex items-center space-x-2 font-bold">
              {/* Left arrow icon */}
              <button className="px-3 py-1 hover:bg-gray-200 rounded">
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page numbers */}
              <button className="px-3 py-1 hover:bg-gray-200 rounded">1</button>
              <button className="px-3 py-1 hover:bg-gray-200 rounded">2</button>
              <button className="px-3 py-1 hover:bg-gray-200 rounded">3</button>
              <button className="px-3 py-1 hover:bg-gray-200 rounded">4</button>
              <button className="px-3 py-1 hover:bg-gray-200 rounded">5</button>

              {/* Right arrow icon */}
              <button className="px-3 py-1 hover:bg-gray-200 rounded">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminCounselors;
