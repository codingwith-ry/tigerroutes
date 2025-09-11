import React from "react";
import AdminSidebar from "./AdminSidebar";

const AdminCounselors = () => {
    return (
    <div className="flex flex-col md:flex-row w-screen h-screen bg-[#fdfcf8]">
        <AdminSidebar />

        {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b">
          <h1 className="text-2xl sm:text-4xl font-semibold mb-2 sm:mb-0">Manage Counselors</h1>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">Welcome back, Admin User!</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 flex items-center justify-center">AU</div>
          </div>
        </header>
        </div>
    </div>
    );
};

export default AdminCounselors;