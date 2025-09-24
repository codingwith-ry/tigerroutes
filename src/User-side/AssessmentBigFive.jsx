import React, { use } from "react";
import { useNavigate } from "react-router-dom";
import UserNavbar from "./UserNavbar";
import Footer from "../Visitor-side/Footer";

const AssessmentBigFive = () => {
  // Navigation to Big Five Test Page
  const navigate = useNavigate();

  const handleBigFiveTest = () => {
    navigate('/assessment/test/BigFive');
  }
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

          {/* Big Five Test */}
          <div className="bg-white rounded-lg shadow p-6 sm:p-10 md:p-12 border border-black">
            <h2 className="font-semibold text-xl sm:text-2xl px-2 sm:px-6 md:px-10">
              What is the Big Five Personality Test?
            </h2>
            <p className="text-sm sm:text-base mt-2 px-2 sm:px-6 md:px-10 text-justify">
              The Big Five personality test, also known as the OCEAN personality
              test, is based on the Big Five model that defines human personality
              as the combination of 5 personality traits or factors – Openness,
              Conscientiousness, Agreeableness, Extraversion and Neuroticism
              (making the acronym – OCEAN).
            </p>
            <p className="text-sm sm:text-base mt-6 px-2 sm:px-6 md:px-10 text-justify">
              Your personality shapes how you handle stress, build relationships,
              make decisions, and move through the world. Many people turn to the
              Big Five personality trait theory to better understand these
              patterns and make more intentional choices in their lives.
            </p>
            <div className="flex justify-center mt-5">
              <button onclick={handleBigFiveTest} className="mt-4 bg-[#FBBF24] text-white px-6 sm:px-10 md:px-12 py-2 rounded-full font-semibold hover:bg-[#FB9724] shadow-[0_5px_5px_rgba(0,0,0,0.3)] text-sm sm:text-base">
                Take the Test
              </button>
            </div>
            <p className="mt-4 text-center text-[9px] sm:text-[10px] font-medium">
              *The Big Five model was developed by Lewis <br /> Goldberg, as well
              as psychologists Robert <br /> McCrae and Paul Costa.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AssessmentBigFive;
