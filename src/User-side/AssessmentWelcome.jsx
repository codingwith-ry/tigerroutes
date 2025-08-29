import React from "react";
import UserNavbar from "./UserNavbar";
import { UserCircle2 } from "lucide-react";
import { SquarePen } from 'lucide-react';
import Footer from "../Visitor-side/Footer";

const AssessmentPage = () => {
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
          {/* Profile Section */}
  <div
    className="bg-white rounded-lg shadow p-5 border border-black"
    style={{ fontFamily: "SF Pro" }}
  >
  <div className="flex flex-col sm:flex-row items-start sm:items-center">
    {/* Profile Icon */}
<div className="mr-0 sm:mr-2 mb-2 sm:mb-0">
                <UserCircle2
                  size={40}
                  stroke="#FB9724" // kulay ng outline
                  strokeWidth={2}
                />
              </div>

    {/* Profile Info */}
    <div className="w-full">
      <h2 className="font-semibold pl-0 sm:pl-5 text-base sm:text-lg mb-3 sm:mb-2">
        Current Profile
      </h2>

      {/* Desktop / Tablet Layout */}
      <div className="hidden sm:block">
        {/* Labels Row */}
        <div className="grid grid-cols-4 text-sm font-semibold">
          <span className="pl-5">Name:</span>
          <span className="pl-4 -ml-2">Email:</span>
          <span className="pl-20">Contact:</span>
          <span className="pl-20">Strand:</span>
        </div>
        {/* Values Row */}
        <div className="grid grid-cols-4 text-sm">
          <span className="pl-5">Juan Dela Cruz</span>
          <span className="pl-4 -ml-2 break-words">juan.delacruz.shs@ust.edu.ph</span>
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
              <button className="mt-4 bg-[#FBBF24] text-white px-6 sm:px-10 md:px-12 py-2 rounded-full font-semibold hover:bg-[#FB9724] shadow-[0_5px_5px_rgba(0,0,0,0.3)] text-sm sm:text-base">
                Take the Test
              </button>
            </div>
            <p className="mt-4 text-center text-[9px] sm:text-[10px] font-medium">
              *The RIASEC system was developed by Dr. <br /> John L. Holland, an
              academic psychologist.
            </p>
          </div>

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
              <button className="mt-4 bg-[#FBBF24] text-white px-6 sm:px-10 md:px-12 py-2 rounded-full font-semibold hover:bg-[#FB9724] shadow-[0_5px_5px_rgba(0,0,0,0.3)] text-sm sm:text-base">
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

export default AssessmentPage;
