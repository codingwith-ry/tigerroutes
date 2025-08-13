import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";



const AssessmentPage = () => {
  return (
    <div className="w-full min-h-screen bg-[#FFFCED] flex flex-col font-sfpro">

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow max-w-4xl mx-auto px-4 py-8">
        {/* Page Title */}

        <h1 className="sf-pro text-center text-gray-500 text-1xl md:text-1xl font-bold tracking-wide uppercase">
          Assessment Test
        </h1>
        
        <p
          className="text-center text-black italic text-2xl md:text-3xl mb-8"
          style={{ fontFamily: 'Norican' }}
        >
          What Kind Career Could Be Right For Me?
        </p>

        {/* Current Profile */}
        <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between mb-6">
          <div>
            <p className="font-semibold">Current Profile</p>
            <p className="text-sm text-gray-600">Juan Dela Cruz</p>
            <p className="text-sm text-gray-600">
              juan.delacruz@school.edu.ph
            </p>
          </div>
          <div className="text-sm text-gray-600">
            <p>Strand: STEM</p>
          </div>
        </div>

        {/* Test Cards */}
        <div className="space-y-6">
          {/* RIASEC Test */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold text-lg">What is the RIASEC Test?</h2>
            <p className="text-sm text-gray-600 mt-2">
              RIASEC stands for the characteristics Realistic, Investigative,
              Artistic, Social, Enterprising, and Conventional. The RIASEC test
              asks questions about your aspirations, activities, skills, and
              interests to help you discover career and field of study areas
              that may be a good fit for you.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Your personality shapes how you handle stress, build relationships,
              make decisions, and tackle unpredictable challenges. Taking the
              RIASEC Personality Test may help you better understand these
              patterns and make more intentional choices in real life.
            </p>
            <button className="mt-4 bg-yellow-400 text-white px-6 py-2 rounded-full font-semibold hover:bg-yellow-500">
              Take the Test
            </button>
          </div>

          {/* Big Five Personality Test */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold text-lg">
              What is the Big Five Personality Test?
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              The Big Five personality traits, also known as the OCEAN
              personality test, is based on five broad and stable factors
              that determine personality: Openness, Conscientiousness,
              Extraversion, Agreeableness, and Neuroticism.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Your personality shapes how you handle stress, build relationships,
              make decisions, and tackle unpredictable challenges. Taking the
              Big Five Personality Test may help you better understand these
              patterns and make more intentional choices in real life.
            </p>
            <button className="mt-4 bg-yellow-400 text-white px-6 py-2 rounded-full font-semibold hover:bg-yellow-500">
              Take the Test
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AssessmentPage;
