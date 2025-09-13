import React from "react";
import UserNavbar from "./UserNavbar";
import { UserCircle2, SquarePen, BookOpen, Brain, FileText } from "lucide-react";
import Footer from "../Visitor-side/Footer";
import { useNavigate } from "react-router-dom";

const AssessmentPage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-[#FFFCED] flex flex-col font-sfpro">
      <UserNavbar />

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        <div className="space-y-6">
          {/* Profile Section */}
          <div
            className="bg-white rounded-lg shadow p-5 border border-black"
            style={{ fontFamily: "SF Pro" }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center">
              {/* Profile Icon */}
              <div className="mr-0 sm:mr-2 mb-2 sm:mb-0">
                <UserCircle2 size={40} stroke="#FB9724" strokeWidth={2} />
              </div>

              {/* Profile Info */}
              <div className="w-full">
                <h2 className="font-semibold pl-0 sm:pl-5 text-base sm:text-lg mb-3 sm:mb-2">
                  Current Profile
                </h2>

                {/* Desktop / Tablet Layout */}
                <div className="hidden sm:block">
                  <div className="grid grid-cols-4 text-sm font-semibold">
                    <span className="pl-5">Name:</span>
                    <span className="pl-4 -ml-2">Email:</span>
                    <span className="pl-20">Contact:</span>
                    <span className="pl-20">Strand:</span>
                  </div>
                  <div className="grid grid-cols-4 text-sm">
                    <span className="pl-5">Juan Dela Cruz</span>
                    <span className="pl-4 -ml-2 break-words">
                      juan.delacruz.shs@ust.edu.ph
                    </span>
                    <span className="pl-20">(0912) 345 6789</span>
                    <span className="pl-20">STEM</span>
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="block sm:hidden space-y-3 text-sm">
                  <div>
                    <span className="font-semibold">Name:</span>
                    <p>Juan Dela Cruz</p>
                  </div>
                  <div>
                    <span className="font-semibold">Email:</span>
                    <p className="break-words">juan.delacruz.shs@ust.edu.ph</p>
                  </div>
                  <div>
                    <span className="font-semibold">Contact:</span>
                    <p>(0912) 345 6789</p>
                  </div>
                  <div>
                    <span className="font-semibold">Strand:</span>
                    <p>STEM</p>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <button
                type="button"
                className="ml-auto mt-3 sm:mt-0 p-1 hover:bg-[#FFF7E6] transition"
              >
                <SquarePen className="w-6 h-6 text-[#FBBF24]" />
              </button>
            </div>
          </div>

          {/* Career Journey Section */}
          <div className="bg-white rounded-lg shadow p-10 border border-gray-300 w-full p-8">
            {/* Section Title */}
            <h2 className="font-bold text-3xl text-gray-800 mb-3 text-center">
              Start Your Career Journey
            </h2>

            {/* Short Description */}
            <p className="text-gray-600 text-base mb-8 text-center max-w-2xl mx-auto">
              Discover your ideal career path through our comprehensive personality
              and interest assessment designed to unlock your potential.
            </p>

{/* Step Progress Indicator */}
<div className="flex justify-center items-center text-sm mb-10">
  <div className="flex items-center space-x-6 text-purple-700">
    <div className="flex items-center space-x-2">
      <UserCircle2 size={18} />
      <span className="font-medium">Overview</span>
    </div>

    <span className="text-gray-400">{">"}</span>

    <div className="flex items-center space-x-2">
      <BookOpen size={18} />
      <span className="font-medium">RIASEC</span>
    </div>

    <span className="text-gray-400">{">"}</span>

    <div className="flex items-center space-x-2">
      <Brain size={18} />
      <span className="font-medium">Big Five</span>
    </div>

    <span className="text-gray-400">{">"}</span>

    <div className="flex items-center space-x-2">
      <FileText size={18} />
      <span className="font-medium">Results</span>
    </div>
  </div>
</div>

            {/* What You’ll Discover */}
            <div className="bg-blue-100 border border-gray-200 rounded-xl p-6 mb-5 text-center">
              <h3 className="text-blue-700 font-semibold text-lg mb-3">
                What You’ll Discover
              </h3>
              <p className="text-blue-700 text-sm leading-relaxed max-w-2xl mx-auto">
                Our assessment will help you understand your personality traits,
                interests, and work preferences. You’ll receive personalized career
                recommendations based on the RIASEC and Big Five models, giving you
                valuable insights into careers that align with who you are and what
                motivates you.
              </p>
            </div>

            {/* Three Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-7">
              <div className="bg-yellow-100 border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
                <h4 className="text-yellow-700 font-semibold text-base mb-2">
                  Scientifically Based
                </h4>
                <p className="text-sm text-yellow-700">
                  Built on the proven RIASEC and Big Five personality theories.
                </p>
              </div>

              <div className="bg-yellow-100 border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
                <h4 className="text-yellow-700 font-semibold text-base mb-2">
                  Personalized Results
                </h4>
                <p className="text-sm text-yellow-700">
                  Get career recommendations tailored to you.
                </p>
              </div>

              <div className="bg-yellow-100 border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
                <h4 className="text-yellow-700 font-semibold text-base mb-2">
                  Quick & Easy
                </h4>
                <p className="text-sm text-yellow-700">
                  Takes only 10–15 minutes to complete.
                </p>
              </div>
            </div>

            {/* CTA Button Centered */}
            <div className="flex justify-center">
              <button
              onClick={() => {
                window.scrollTo(0, 0); // scroll to top
                navigate("../AssessmentRIASEC");
              }}
              className="bg-[#FBBF24] text-white px-6 sm:px-10 md:px-12 py-2 rounded-full font-semibold hover:bg-[#FB9724] shadow-[0_5px_5px_rgba(0,0,0,0.3)] text-sm sm:text-base"
            >
              Begin Assessment
            </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AssessmentPage;
