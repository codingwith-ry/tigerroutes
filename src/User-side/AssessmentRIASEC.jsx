import React from "react";
import { useNavigate } from "react-router-dom";
import UserNavbar from "./UserNavbar";
import Footer from "../Visitor-side/Footer";

const AssessmentRIASEC = () => {
  const navigate = useNavigate();

  const handleStartTest = () => {
    navigate('/assessment/test/RIASEC');
  };

  return (
    <div className="w-full min-h-screen bg-[#FFFCED] flex flex-col font-sfpro">
      <UserNavbar />

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        <h1 className="sf-pro text-center text-gray-500 text-lg sm:text-xl md:text-2xl font-bold tracking-wide uppercase">
          Assessment Test
        </h1>

        <p
          className="text-center text-black italic text-2xl sm:text-3xl md:text-4xl mb-8"
          style={{ fontFamily: "Norican" }}
        >
          What Kind Career Could Be Right For Me?
        </p>

        <div className="space-y-6">
  
          {/* RIASEC Test */}
          <div className="bg-white rounded-lg shadow p-6 sm:p-10 md:p-12 border border-black">
            <h2 className="font-semibold text-xl sm:text-2xl px-2 sm:px-6 md:px-10">
              What is the RIASEC Test?
            </h2>
            <p className="text-sm sm:text-base mt-2 px-2 sm:px-6 md:px-10 text-justify">
              RIASEC stands for 6 characteristics: Realistic, Investigative,
              Artistic, Social, Enterprising, and Conventional. The RIASEC test
              asks questions about your aspirations, activities, skills, and
              interests in different jobs to help you discover careers and
              fields of study that are likely to satisfy you.
            </p>
            <p className="text-sm sm:text-base mt-6 px-2 sm:px-6 md:px-10 text-justify">
              Your personality shapes how you handle stress, build relationships,
              make decisions, and move through the world. Many people turn to
              the Big Five personality trait theory to better understand these
              patterns and make more intentional choices in their lives.
            </p>
            <div className="flex justify-center mt-5">
              <button onClick={handleStartTest} className="mt-4 bg-[#FBBF24] text-white px-6 sm:px-10 md:px-12 py-2 rounded-full font-semibold hover:bg-[#FB9724] shadow-[0_5px_5px_rgba(0,0,0,0.3)] text-sm sm:text-base">
                Take the Test
              </button>
            </div>
            <p className="mt-4 text-center text-[9px] sm:text-[10px] font-medium">
              *The RIASEC system was developed by Dr. <br /> John L. Holland, an
              academic psychologist.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AssessmentRIASEC;
