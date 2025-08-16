import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";



const AssessmentPage = () => {
  return (
    <div className="w-full min-h-screen bg-[#FFFCED] flex flex-col font-sfpro">

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow max-w-4xl mx-auto px-4 py-8 mt-16">
        {/* Page Title */}

        <h1 className="sf-pro text-center text-gray-500 text-xl font-bold tracking-wide uppercase">
          Assessment Test
        </h1>
        
        <p
          className="text-center text-black italic text-4xl mb-8"
          style={{ fontFamily: 'Norican' }}
        >
          What Kind Career Could Be Right For Me?
        </p>

      <div className="space-y-6">
        
      <div className="bg-white rounded-lg shadow p-5 border border-black" style={{ fontFamily: 'SF Pro' }}>        
        <div className="flex items-center">
          <div className="mr-2">
            <img 
              src="3D Elements/ProfileIcon.png" 
              alt="Profile Icon" 
              className="h-10 w-10"
            />
          </div>
          <div>
          <h2 className="font-semibold pl-5">Current Profile</h2>
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
              <span className="pl-4 -ml-2">juan.delacruz.shs@ust.edu.ph</span>
              <span className="pl-20">(0912) 345 6789</span>
              <span className="pl-20">STEM</span>
            </div>
          </div>
          <button type="button" className="ml-auto hover:opacity-80">
            <img src="3D Elements/EditIcon.png" alt="Edit" className="w-5 h-5" />
          </button>
        </div>
      </div>

        {/* RIASEC Test */}
        <div className="bg-white rounded-lg shadow p-12 border border-black">
          <h2 className="font-semibold text-2xl px-10">What is the RIASEC Test?</h2>
          <p className="text-base mt-2 px-10 text-justify">
            RIASEC stands for 6 characteristics: Realistic, Investigative, Artistic, 
            Social, Enterprising, and Conventional. The RIASEC test asks questions 
            about your aspirations, activities, skills, and interests in different 
            jobs to help you discover careers and fields of study that are likely to 
            satisfy you.
          </p>
          <p className="text-base mt-6 px-10 text-justify">
            Your personality shapes how you handle stress, build relationships,
            make decisions, and move through the world. Many people turn to the 
            Big Five personality trait theory to better understand these patterns 
            and make more intentional choices in their lives.
          </p>
          <div className="flex justify-center mt-5">
            <button className="mt-4 bg-[#FBBF24] text-white px-12 py-2 rounded-full font-semibold hover:bg-[#FB9724] shadow-[0_5px_5px_rgba(0,0,0,0.3)]">
              Take the Test
            </button>
          </div>  
          <p className="mt-4 text-center text-[10px] font-medium">
            *The RIASEC system was developed by Dr. <br /> John L. Holland, an academic psychologist.
          </p>    
        </div>


            {/* Big Five Personality Test */}
          <div className="bg-white rounded-lg shadow p-12 border border-black">
            <h2 className="font-semibold text-2xl px-10">What is the Big Five Personality Test?</h2>
            <p className="text-base mt-2 px-10 text-justify">
          The Big Five personality test, also known as the OCEAN personality 
          test, is based on the Big Five model that defines human personality 
          as the combination of 5 personality traits or factors – Openness, 
          Conscientiousness, Agreeableness, Extraversion and Neuroticism 
          (making the acronym – OCEAN).
            </p>
            <p className="text-base mt-6 px-10 text-justify">
          Your personality shapes how you handle stress, build relationships,
          make decisions, and move through the world. Many people turn to the 
          Big Five personality trait theory to better understand these patterns 
          and make more intentional choices in their lives.
            </p>
            <div className="flex justify-center mt-5">
              <button className="mt-4 bg-[#FBBF24] text-white px-12 py-2 rounded-full font-semibold hover:bg-[#FB9724] shadow-[0_5px_5px_rgba(0,0,0,0.3)]">
                Take the Test
              </button>
            </div>
            <p className="mt-4 text-center text-[10px] font-medium">
              *The Big Five model was developed by Lewis <br/> 
              Goldberg, as well as psychologists Robert<br/>
              McCrae and Paul Costa.            
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
