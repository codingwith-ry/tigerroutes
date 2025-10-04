// src/pages/AssessmentResults.jsx
import React, { useState } from "react";
import { FiDownload, FiStar, FiCheckCircle, FiFileText, FiX } from "react-icons/fi";
import UserNavbar from "./UserNavbar";
import Footer from "../Visitor-side/Footer";

const UserResults = () => {
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleSubmitRating = () => {
    // Add your rating submission logic here
    console.log({ rating, feedback });
    setIsRatingModalOpen(false);
    setRating(0);
    setFeedback('');
  };

  const RatingModal = () => {
    if (!isRatingModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Rate Your Experience</h3>
            <button 
              onClick={() => setIsRatingModalOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">How satisfied are you with your assessment results?</p>
            <div className="flex gap-2 justify-center mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  } hover:text-yellow-400 transition-colors`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your thoughts about the assessment..."
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-300 focus:border-transparent min-h-[100px] resize-none"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsRatingModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitRating}
              disabled={!rating}
              className={`px-6 py-2 rounded-lg font-medium ${
                rating
                  ? 'bg-yellow-400 hover:bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#FFFCED] flex flex-col">
      
        <UserNavbar />

      {/* Page Title */}
      <section className="text-center py-10 mt-12">
        <h2 className="tracking-widest text-2xl font-black text-gray-800">ASSESSMENT RESULTS</h2>
        <p className="tracking-widest text-sm text-gray-500 mt-2">
          YOUR PERSONALIZED CAREER ASSESSMENT ANALYSIS
        </p>
      </section>

      <main className="flex flex-col gap-8 px-6 md:px-16 lg:px-32 pb-16">
        {/* RIASEC Section */}
        <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center mb-2">
                <FiCheckCircle className="text-green-500 w-6 h-6 mr-2" />
                <h3 className="font-semibold text-lg">RIASEC Interest Results</h3>
            </div>
          <p className="text-sm text-gray-500 mb-4">
            Your interests across the six RIASEC dimensions
          </p>

          {[
            { label: "Realistic", value: 25, description: "Hands-on, practical activities" },
            { label: "Investigative", value: 35, description: "Research and analytical thinking" },
            { label: "Artistic", value: 20, description: "Creative and expressive activities" },
            { label: "Social", value: 30, description: "Helping and working with people" },
            { label: "Enterprising", value: 40, description: "Leadership and business activities" },
            { label: "Conventional", value: 15, description: "Organized and structured work" },
          ].map((item, idx) => (
            <div key={idx} className="flex mb-4">
              <div className="w-1 rounded bg-blue-500 mr-3"></div>
              <div className="flex-1">
              <div className="flex justify-between text-sm font-semibold text-gray-600 mb-2">
                <span>{item.label}</span>
                <span className="text-blue-500 font-bold">{item.value}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-blue-500 rounded-full"
                  style={{ width: `${item.value}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{item.description}</p>
            </div>
            </div>
          ))}
        </div>

        {/* Big Five Section */}
        <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center mb-2">
                <FiCheckCircle className="text-green-500 w-6 h-6 mr-2" />
                <h3 className="font-semibold text-lg">Big Five Personality Results</h3>
            </div>
          <p className="text-sm text-gray-500 mb-4">
            Your personality traits based on the Five-Factor Model
          </p>

          {[
            { label: "Openness", value: 75, description: "Creativity and openness to experience" },
            { label: "Conscientiousness", value: 65, description: "Organization and self-discipline" },
            { label: "Extraversion", value: 45, description: "Sociability and assertiveness" },
            { label: "Agreeableness", value: 80, description: "Cooperation and trustworthiness" },
            { label: "Neuroticism", value: 25, description: "Emotional stability (lower is better)" },
          ].map((item, idx) => (
            <div key={idx} className="flex mb-4">
              <div className="w-1 rounded bg-purple-500 mr-3"></div>
              <div className="flex-1">
              <div className="flex justify-between text-sm font-semibold text-gray-600 mb-2">
                <span>{item.label}</span>
                <span className="text-purple-500 font-bold">{item.value}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-purple-500 rounded-full"
                  style={{ width: `${item.value}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{item.description}</p>
            </div>
            </div>
          ))}
        </div>

        {/* Program Recommendations Section */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="flex items-center text-lg font-semibold mb-3">
            <FiFileText className="text-yellow-500 w-6 h-6 mr-2" />
            Program Recommendations
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Based on your assessment results, here are some recommended programs
            and potential career paths:
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                name: "Computer Science",
                match: 92,
                desc: "Students learn how to design algorithms, build software, and solve complex computing problems. The program dives into programming languages, databases, and artificial intelligence. Expect lots of coding, debugging, and project-based learning.",
                why: ["High investigative score", "Strong analytical skills", "Social skills"],
                careers: ["Software Engineer", "Systems Analyst", "Data Specialist"],
              },
              {
                name: "Business Administration",
                match: 85,
                desc: "This program teaches students how to manage and grow businesses through marketing, finance, and strategy. You’ll work on business plans, case studies, and simulations. It’s ideal for future entrepreneurs, managers, and brand strategists.",
                why: ["Leadership potential", "Collaborative mindset", "Strong enterprising traits"],
                careers: ["Project Manager", "Entrepreneur", "Business Analyst"],
              },
              {
                name: "Psychology",
                match: 78,
                desc: "You’ll explore how people think, feel, and behave through scientific theories and research. Students study mental health, personality, and behavior in different settings. Activities include interviews, assessments, and research projects.",
                why: ["Strong enterprising traits", "Leadership qualities", "Social skills"],
                careers: ["Counselor", "Research Psychologist", "HR Specialist"],
              },
              {
                name: "Advertising Arts",
                match: 72,
                desc: "Students develop creative campaigns using visual communication, branding, and digital design tools. The program blends traditional art skills with modern software like Adobe Creative Suite. You’ll build a strong portfolio for careers in advertising and media.",
                why: ["Artistic Inclination", "Creative thinking", "Visual communication"],
                careers: ["Creative Director", "UX Designer", "Brand Designer"],
              },
            ].map((prog, idx) => (
              <div key={idx} className="border p-4 rounded-lg shadow-sm flex flex-col mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-lg flex items-center">
                    <span className="flex items-center justify-center w-6 h-6 bg-yellow-500 text-white font-bold rounded-full mr-3">
                        {idx + 1}
                    </span>
                    {prog.name}
                  </h4>
                  <span className="text-green-600 font-bold">{prog.match}% match</span>
                </div>

                <p className="text-sm text-gray-600 mb-3">{prog.desc}</p>

                <p className="text-sm text-gray-500 mb-2">Why this program fits you:</p>
                <div className="flex flex-wrap gap-2 mb-3">
                    {prog.why.map((reason, i) => (
                        <span key={i} className="bg-blue-100 text-blue-800 font-medium px-3 py-1 rounded-full text-sm">
                            {reason}
                        </span>
                    ))}
                </div>

                <p className="text-sm text-gray-500 mb-2">Potential Career Paths:</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {prog.careers.map((c, i) => (
                    <span
                      key={i}
                      className="bg-green-100 text-green-800 font-medium px-2 py-1 rounded-full"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What's Next Section */}
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between bg-white rounded-2xl shadow p-6">
          <div>
          <h3 className="font-semibold text-lg">What's Next?</h3>
          <p className="text-sm text-gray-500">Download your report and share your feedback!</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setIsRatingModalOpen(true)}
              className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-lg text-blue-700"
            >
              <FiStar className="text-base"/> Rate Experience
            </button>
            <button className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg">
              <FiDownload className="text-base" /> Download Report
            </button>
          </div>
        </div>
      </main>
        <Footer />

      {/* Add the Rating Modal */}
      <RatingModal />
    </div>
  );
};

export default UserResults;
