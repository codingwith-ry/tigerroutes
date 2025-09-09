import React, { useState } from "react";
import UserNavbar from "./UserNavbar";
import Footer from "../Visitor-side/Footer";
import { BookOpen, Brain, FileText } from "lucide-react";

const AssessmentPage = () => {
  const [activeStep] = useState("RIASEC");

  const getStepClass = (step) =>
    activeStep === step ? "text-[#FB9724]" : "text-gray-600";

  const getIconColor = (step) =>
    activeStep === step ? "#FB9724" : "currentColor";

  return (
    <div className="w-full min-h-screen bg-[#FFFCED] flex flex-col font-sfpro">
      <UserNavbar />

      <div className="flex flex-col items-center justify-start flex-1 mt-20 mb-20 px-4">
        <h1 className="text-3xl font-extrabold text-black mb-4 text-center tracking-[0.3em]">
          THE RIASEC TEST
        </h1>

        <div
          className="rounded-lg shadow border border-gray-300 w-full max-w-3xl p-6 mb-6"
          style={{ backgroundColor: "#E5EEFF" }}
        >
          <h2 className="font-semibold mb-2" style={{ color: "#195FD3" }}>
            Test Instructions
          </h2>
          <p className="text-sm" style={{ color: "#4285F4" }}>
            The test consists of 48 tasks that you will have to rate by how much
            you would enjoy performing each on a scale of (1) dislike (2)
            slightly dislike (3) neither (4) slightly enjoy (5) enjoy. The test
            will take most five to ten minutes to complete.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow border border-black w-full max-w-3xl p-6">
          <div className="flex justify-between items-center text-sm mb-6">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-1 ${getStepClass("RIASEC")}`}>
                <BookOpen size={16} color={getIconColor("RIASEC")} />
                <span className="font-medium">RIASEC</span>
              </div>

              <span className="text-gray-400">{">"}</span>

              <div className={`flex items-center space-x-1 ${getStepClass("Big Five")}`}>
                <Brain size={16} color={getIconColor("Big Five")} />
                <span className="font-medium">Big Five</span>
              </div>

              <span className="text-gray-400">{">"}</span>

              <div className={`flex items-center space-x-1 ${getStepClass("Results")}`}>
                <FileText size={16} color={getIconColor("Results")} />
                <span className="font-medium">Results</span>
              </div>
            </div>

            <span className="font-medium text-gray-700">2 of 48</span>
          </div>

          <h2 className="text-center text-2xl font-semibold mb-2 mt-12">
            I like to work on cars
          </h2>

        <div className="flex flex-col space-y-2 items-center">
        {["Dislike", "Slightly Dislike", "Neither", "Slightly Enjoy", "Enjoy"].map(
            (label, idx) => (
          <button
          key={idx}
          className="w-60 bg-[#FFE49E] text-black font-medium rounded-full shadow border-2 border-[#FB9724] hover:bg-[#FFD96A] transition"
          >
          {label}
        </button>
            )
        )}
        </div>

<div className="mt-10">
  <button className="text-sm font-medium">
    <span className="text-[#FBBF24]">{"<"}</span>{" "}
    <span className="ml-2 text-[#FBBF24] underline decoration-2 underline-offset-2">
      Back
    </span>  </button>
</div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AssessmentPage;
