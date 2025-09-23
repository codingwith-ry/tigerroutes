import React, { useState } from "react";
import { Calendar, Star, TrendingUp, ClipboardList, MessageSquareText, Award } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import { useParams } from "react-router-dom";

const AdminStudentProfile = () => {
  const { id } = useParams(); // This gets the id from the URL
  const [activeTab, setActiveTab] = useState("assessment");

  // Student mock data
  const student = {
    id: "STU-0001",
    yearLevel: "Grade 12",
    strand: "Science, Technology, Engineering, and Mathematics (STEM)",
    track: "Pre-Computer Science",
    schoolYear: "2024-2025",
    status: "Active",
    generalAverage: 91,
    grades: {
      math: 89,
      science: 92,
      english: 95,
    },
    alignment: 92,
    riasec: {
      realistic: 25,
      investigate: 35,
      artistic: 20,
      social: 30,
      enterprising: 40,
      conventional: 15,
    },
    bigFive: {
      openness: 75,
      conscientiousness: 65,
      extraversion: 45,
      agreeableness: 80,
      neuroticism: 25,
    },
  };

  const [studentFeedback] = useState({
    rating: 4,
    date: new Date(),
    comment: "Great session! Very helpful guidance.",
  });

  const [counselorNotes] = useState([
    {
      author: "Counselor Smith",
      date: new Date(),
      comment: "Student shows strong aptitude for STEM subjects.",
    },
    {
      author: "Counselor Doe",
      date: new Date(),
      comment: "Recommended exploring computer science internships.",
    }
  ]);

  // Update the ProgressBar component to use the colorMap
  const ProgressBar = ({ label, value, description, color = "blue" }) => {
    const colorMap = {
      blue: "bg-blue-500",
      purple: "bg-purple-500",
    };

    return (
      <div className="mb-4">
        <div className="flex justify-between text-sm font-medium text-gray-700">
          <span>{label}</span>
          <span>{value}%</span>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
          <div
            className={`${colorMap[color]} h-2 rounded-full transition-all`}
            style={{ width: `${value}%` }}
          ></div>
        </div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row w-screen h-screen bg-[#fdfcf8]">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-start sm:items-center p-6 border-b">
          <h1 className="text-2xl font-semibold">Student Profile</h1>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              Welcome back, Admin User!
            </span>
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-medium">
              AU
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Student Info Card */}
          <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg mr-4">
                {student.id.split("-")[1]}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {student.id}
                </h2>
                <p className="text-sm text-gray-500">ID: 202123456</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
              <ClipboardList className="w-5 h-5 text-orange-500" />
              Academic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-sm text-gray-700">
              <p>
                <span className="font-semibold">Year Level:</span>{" "}
                {student.yearLevel}
              </p>
              <p>
                <span className="font-semibold">Strand:</span> {student.strand}
              </p>
              <p>
                <span className="font-semibold">Track:</span> {student.track}
              </p>
              <p>
                <span className="font-semibold">School Year:</span>{" "}
                {student.schoolYear}
              </p>
              <p>
                <span className="font-semibold">Status:</span>{" "}
                <span className="text-green-600 font-semibold">
                  {student.status}
                </span>
              </p>
            </div>

            <h3 className="text-lg font-semibold flex items-center gap-2 mt-5 mb-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Semester Grade
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 text-sm">
              <p>
                <span className="font-semibold">General Average:</span>{" "}
                {student.generalAverage}
              </p>
              <p>
                <span className="font-semibold">Mathematics:</span>{" "}
                {student.grades.math}
              </p>
              <p>
                <span className="font-semibold">Science:</span>{" "}
                {student.grades.science}
              </p>
              <p>
                <span className="font-semibold">English:</span>{" "}
                {student.grades.english}
              </p>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-700">
                  Overall Alignment
                </span>
              </div>
              <span className="font-bold text-blue-600">
                {student.alignment}% Strand Match
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow border border-gray-200">
            <div className="flex border-b">
              <button
                className={`px-6 py-3 text-sm font-medium flex items-center gap-2 ${
                  activeTab === "assessment"
                    ? "text-orange-600 border-b-2 border-orange-500"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("assessment")}
              >
                <Award className="w-4 h-4" />
                Assessment Results
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium flex items-center gap-2 ${
                  activeTab === "notes"
                    ? "text-orange-600 border-b-2 border-orange-500"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("notes")}
              >
                <MessageSquareText className="w-4 h-4" />
                Counselor Notes
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "assessment" ? (
                <div>
                  {/* RIASEC Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">
                      RIASEC Interest Results
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(student.riasec).map(([key, value]) => (
                        <div key={key} className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium capitalize">{key}</span>
                            </div>
                            <span className="text-sm font-medium">{value}%</span>
                          </div>
                          <div className="w-full bg-gray-200 h-2 rounded-full">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Big Five Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Big Five Personality Results
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(student.bigFive).map(([key, value]) => (
                        <div key={key} className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium capitalize">{key}</span>
                            </div>
                            <span className="text-sm font-medium">{value}%</span>
                          </div>
                          <div className="w-full bg-gray-200 h-2 rounded-full">
                            <div
                              className="bg-purple-500 h-2 rounded-full transition-all"
                              style={{ width: `${value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Counselor Notes</h3>
                  {studentFeedback ? (
                    <>
                      {/* Student’s Feedback */}
                      <div className="bg-blue-50 p-4 rounded-lg mb-4 border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1 text-yellow-500">
                            {Array.from({ length: studentFeedback.rating }, (_, i) => (
                              <svg
                                key={i}
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            <span className="font-semibold text-gray-700">
                              {studentFeedback.rating}/5
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(studentFeedback.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 italic">
                          {studentFeedback.comment}
                        </p>
                      </div>

                      {/* Reply box */}
                      <div className="mb-6">
                        <textarea
                          rows={3}
                          placeholder="Enter your reply here..."
                          className="w-full border rounded-lg p-2 text-sm focus:ring focus:ring-blue-300"
                        />
                        <div className="flex justify-end mt-2">
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
                            Reply Comment
                          </button>
                        </div>
                      </div>

                      {/* Counselor Notes */}
                      {counselorNotes && counselorNotes.length > 0 ? (
                        <div className="space-y-4">
                          {counselorNotes.map((note, index) => (
                            <div
                              key={index}
                              className="border rounded-lg p-4 bg-gray-50 shadow-sm"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                  <MessageSquareText className="w-4 h-4 text-gray-500" />
                                  <p className="font-semibold text-sm">{note.author}</p>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {new Date(note.date).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{note.comment}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">
                          No counselor notes yet. Add your first observation ✍️
                        </p>
                      )}
                    </>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 italic">
                        No notes available yet. Counselors can add observations and
                        recommendations here.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminStudentProfile;
