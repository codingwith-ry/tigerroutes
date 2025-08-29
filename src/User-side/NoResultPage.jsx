import React from "react";
import UserNavbar from "./UserNavbar";
import Footer from "../Visitor-side/Footer";
import { useNavigate } from "react-router-dom";


const NoResultsPage = () => {
const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-[#FFFCED] flex flex-col font-sfpro">
      <UserNavbar />

      <main className="flex-grow w-full px-4 sm:px-6 lg:px-12 py-8 mt-16">
        {/* Box - mas malapad */}
        <div className="bg-white rounded-lg shadow p-12 border border-black w-full max-w-[1100px] mx-auto mt-8">
          {/* Title inside box, left side, black */}
          <h1 className="sf-pro text-left text-black text-xl sm:text-2xl md:text-3xl font-bold tracking-wide mb-6">
            Previous Assessment Results
          </h1>

          <div className="text-center">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <img
                src="3D Elements/chart.png"
                alt="No Results"
                className="h-20 w-20 opacity-80"
              />
            </div>

            {/* Message */}
            <h2 className="text-lg font-semibold">No Assessments Yet</h2>
            <p className="text-gray-400 text-sm mt-2">
              Take your first assessment to see result here.
            </p>

            {/* Button */}
            <div className="mt-6">
                            <button
                onClick={() => navigate("/assessment")} // 🔑 direct route
                className="bg-[#FBBF24] text-white px-10 py-3 rounded-full font-semibold hover:bg-[#FB9724] shadow-[0_5px_5px_rgba(0,0,0,0.3)]"
              >
                Take Assessment
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NoResultsPage;
