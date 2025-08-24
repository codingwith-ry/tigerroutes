import React from "react";
import { FiBarChart2, FiAlertCircle, FiChevronRight, FiFileText } from "react-icons/fi";
import { GiBrain } from "react-icons/gi";
import { useNavigate } from "react-router-dom";
import UserNavbar from "./UserNavbar"; 
import Footer from "../Visitor-side/Footer";

const UserHomepage = () => {
    const navigate = useNavigate();
    
  return (
     <div className="w-full min-h-screen bg-[#FFFCED] flex flex-col font-sfpro">

    <UserNavbar />

      {/* Main Content */}
      <main className="flex-grow px-6 md:px-12 py-6 space-y-6 mt-24">

        {/* Welcome + Analytics */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Welcome */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-3xl font-black">
              Welcome back, <span className="text-yellow-600">Juan!</span>
            </h2>
            <p className="mt-2 text-gray-700">
              Let’s continue your career discovery journey.
            </p>
            <h3 className="mt-4 font-bold">Complete your career assessment</h3>
            <p className="text-gray-600 text-sm">
              Take our comprehensive Big Five & RIASEC assessment to discover
              your ideal UST college programs.
            </p>
            <button className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-full text-white sm:text-md font-sfpro font-semibold hover:bg-yellow-500 transition hover:scale-105 transition-transform">
              Start Assessment
            </button>
          </div>

          {/* Analytics */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FiBarChart2 /> Analytics Overview
            </h3>
            <div className="space-y-4">
              {/* Row */}
              <div>
                <p className="flex justify-between text-sm">
                  <span>Total Assessment Completed</span>
                  <span className="font-semibold">4</span>
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-yellow-500 h-2 rounded-full w-3/4"></div>
                </div>
              </div>

              <div>
                <p className="flex justify-between text-sm">
                  <span>Average Satisfaction</span>
                  <span className="font-semibold">3.0</span>
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-yellow-500 h-2 rounded-full w-1/2"></div>
                </div>
              </div>

              <div>
                <p className="flex justify-between text-sm">
                  <span>Average Satisfaction</span>
                  <span className="font-semibold">2</span>
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-yellow-500 h-2 rounded-full w-1/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Complete Profile Banner */}
        <div className="bg-yellow-100 p-6 rounded-xl shadow flex flex-col md:flex-row items-center justify-between">
          <div>
            <h3 className="font-bold flex items-center gap-2 text-yellow-700">
              <FiAlertCircle /> Complete Your Profile
            </h3>
            <p className="text-sm text-yellow-700">
              Please complete your academic profile to get personalized
              recommendations.
            </p>
          </div>
          <button className="mt-4 md:mt-0 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow transition hover:scale-105 duration-200">
            Complete Profile
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow space-y-4">
      <h3 className="font-bold text-lg">Quick Actions</h3>
      <div className="flex flex-col gap-4">

        {/* Take Assessments */}
        <div
          onClick={() => navigate("/assessment")}
          className="flex items-center justify-between p-4 bg-blue-100 rounded-lg cursor-pointer hover:bg-blue-200 transition duration-200"
        >
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="text-blue-600 text-2xl">
              <GiBrain />
            </div>
            {/* Text */}
            <div>
              <h4 className="font-semibold text-blue-700">Take Assessments</h4>
              <p className="text-sm text-blue-600">
                Discover your interests and personality
              </p>
            </div>
          </div>
          {/* Chevron */}
          <div className="text-blue-600 text-xl">
            <FiChevronRight />
          </div>
        </div>

        {/* View Results */}
        <div
          onClick={() => navigate("/results")}
          className="flex items-center justify-between p-4 bg-green-100 rounded-lg cursor-pointer hover:bg-green-200 transition duration-200"
        >
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="text-green-600 text-2xl">
              <FiFileText />
            </div>
            {/* Text */}
            <div>
              <h4 className="font-semibold text-green-700">View Results</h4>
              <p className="text-sm text-green-600">
                Review your assessment history
              </p>
            </div>
          </div>
          {/* Chevron */}
          <div className="text-green-600 text-xl">
            <FiChevronRight />
          </div>
        </div>

      </div>
    </div>

      </main>

      <Footer />
    </div>
  );
};

export default UserHomepage;
