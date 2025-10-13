import React, { useState } from "react";
import {
  Calendar,
  Star,
  TrendingUp,
  ClipboardList,
  MessageSquareText,
  Award,
  User,
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { useParams } from "react-router-dom";

const AdminStudentProfile = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("assessment");

  const student = {
    id: "STU-0001",
    name: "Juan Dela Cruz",
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

  const [counselorNotes, setCounselorNotes] = useState([
    {
      author: "Counselor Smith",
      date: new Date(),
      comment: "Student shows strong aptitude for STEM subjects.",
    },
    {
      author: "Counselor Doe",
      date: new Date(),
      comment: "Recommended exploring computer science internships.",
    },
  ]);

  const [newNote, setNewNote] = useState('');

  const handleAddNote = () => {
    if (newNote.trim()) {
      setCounselorNotes([...counselorNotes, {
        author: "Counselor Admin",
        date: new Date(),
        comment: newNote.trim(),
      }]);
      setNewNote('');
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-screen h-screen bg-[#fdfcf8]">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Student Profile" />

        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* ===== Student Dashboard Card ===== */}
          <div className="bg-gradient-to-r from-orange-100 via-yellow-50 to-white rounded-2xl shadow border border-gray-200 p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Avatar */}
            <div className="w-24 h-24 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold text-2xl">
              <User className="w-10 h-10" />
            </div>

            {/* Student Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
              <p className="text-sm text-gray-500 mb-2">{student.id}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm">
                <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full border border-orange-200">
                  {student.yearLevel}
                </span>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                  {student.strand}
                </span>
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
                  {student.status}
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-col gap-2 text-center md:text-right">
              <p className="text-sm text-gray-600">Overall Alignment</p>
              <p className="text-3xl font-bold text-orange-600">{student.alignment}%</p>
              <p className="text-xs text-gray-500">Strand Match</p>
            </div>
          </div>

          {/* ===== Academic Information ===== */}
          <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
            {/* Academic Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <ClipboardList className="w-5 h-5 text-orange-500" />
                Academic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Track</p>
                  <p className="text-sm font-medium">{student.track}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">School Year</p>
                  <p className="text-sm font-medium">{student.schoolYear}</p>
                </div>
              </div>
            </div>

            {/* Semester Grades */}
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-500" />
                Semester Grades
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                  <p className="text-xs text-orange-600 mb-1">General Average</p>
                  <p className="text-xl font-bold text-orange-700">{student.generalAverage}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Mathematics</p>
                  <p className="text-lg font-semibold">{student.grades.math}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Science</p>
                  <p className="text-lg font-semibold">{student.grades.science}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">English</p>
                  <p className="text-lg font-semibold">{student.grades.english}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ===== Tabs Section ===== */}
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

            <div className="p-6">
              {activeTab === "assessment" ? (
                <div className="space-y-10">
                  {/* RIASEC Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">RIASEC Interest Results</h3>
                    <div className="space-y-3">
                      {Object.entries(student.riasec).map(([key, value]) => (
                        <div key={key}>
                          <div className="flex justify-between text-sm font-medium">
                            <span className="capitalize">{key}</span>
                            <span>{value}%</span>
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
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">Big Five Personality Results</h3>
                    <div className="space-y-3">
                      {Object.entries(student.bigFive).map(([key, value]) => (
                        <div key={key}>
                          <div className="flex justify-between text-sm font-medium">
                            <span className="capitalize">{key}</span>
                            <span>{value}%</span>
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

                  {/* Program Recommendations Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-orange-500" />
                      Program Recommendations & Career Paths
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Academic programs that align with your interests and personality
                    </p>

                    {[
                      {
                        id: 1,
                        name: "Computer Science",
                        match: 92,
                        reasons: [
                          "High investigative score",
                          "Strong analytical thinking",
                          "Social skills",
                        ],
                        paths: [
                          "Software Engineer",
                          "AI Researcher",
                          "Systems Analyst",
                          "Data Scientist",
                        ],
                        icon: <Star className="w-5 h-5 text-green-500" />,
                        accent: "bg-green-500",
                      },
                      {
                        id: 2,
                        name: "Business Administration",
                        match: 85,
                        reasons: [
                          "Strong enterprising traits",
                          "Leadership qualities",
                          "Social skills",
                        ],
                        paths: [
                          "Marketing Manager",
                          "Entrepreneur",
                          "Business Analyst",
                          "Project Manager",
                        ],
                        icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
                        accent: "bg-blue-500",
                      },
                      {
                        id: 3,
                        name: "Psychology",
                        match: 78,
                        reasons: [
                          "Strong enterprising traits",
                          "Leadership qualities",
                          "Social skills",
                        ],
                        paths: [
                          "Clinical Psychologist",
                          "Counselor",
                          "Research Psychologist",
                          "HR Specialist",
                        ],
                        icon: <MessageSquareText className="w-5 h-5 text-yellow-500" />,
                        accent: "bg-yellow-500",
                      },
                      {
                        id: 4,
                        name: "Advertising Arts",
                        match: 72,
                        reasons: [
                          "Artistic inclination",
                          "Creative thinking",
                          "Visual communication",
                        ],
                        paths: [
                          "Creative Director",
                          "UI/UX Designer",
                          "Brand Designer",
                          "Graphic Designer",
                        ],
                        icon: <ClipboardList className="w-5 h-5 text-purple-500" />,
                        accent: "bg-purple-500",
                      },
                      {
                        id: 5,
                        name: "Information Technology",
                        match: 67,
                        reasons: ["Hands-on learner", "Systems & data driven", "Practical skills"],
                        paths: ["IT Specialist", "Network Administrator", "Web Developer"],
                        icon: <Award className="w-5 h-5 text-orange-500" />,
                        accent: "bg-orange-500",
                      },
                    ].map((program) => (
                      <div
                        key={program.id}
                        className="mb-5 border border-gray-200 rounded-lg p-5 hover:shadow-md transition"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${program.accent} bg-opacity-10`}
                            >
                              {program.icon}
                            </div>
                            <h4 className="font-semibold text-gray-800 text-base">
                              {program.id}. {program.name}
                            </h4>
                          </div>

                          <div className="text-sm font-semibold">
                            <span
                              className={`${
                                program.match >= 90
                                  ? "text-green-600"
                                  : program.match >= 80
                                  ? "text-blue-600"
                                  : program.match >= 70
                                  ? "text-yellow-600"
                                  : "text-gray-600"
                              }`}
                            >
                              {program.match}%
                            </span>{" "}
                            <span className="text-gray-500 font-normal">match</span>
                          </div>
                        </div>

                        <div className="text-xs text-gray-600 mb-2">
                          <span className="font-semibold text-gray-700">
                            Why this program fits you:
                          </span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {program.reasons.map((reason, i) => (
                              <span
                                key={i}
                                className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs border border-blue-200"
                              >
                                {reason}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="text-xs text-gray-600 mt-3">
                          <span className="font-semibold text-gray-700">
                            Potential career paths:
                          </span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {program.paths.map((path, i) => (
                              <span
                                key={i}
                                className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs border border-green-200"
                              >
                                {path}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Counselor Notes - Twitter-like Thread
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Counselor Notes</h3>

                  {studentFeedback ? (
                    <div className="space-y-4">
                      {/* Student’s Feedback - Root Comment */}
                      <div className="flex space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-gray-900 text-sm">{student.name}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(studentFeedback.date).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1 text-yellow-500">
                                {Array.from({ length: studentFeedback.rating }, (_, i) => (
                                  <Star key={i} className="w-4 h-4 fill-current" />
                                ))}
                                <span className="text-xs font-medium text-gray-700 ml-1">
                                  {studentFeedback.rating}/5
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700">{studentFeedback.comment}</p>
                          </div>
                        </div>
                      </div>

                      {/* Counselor Notes - Replies */}
                      {counselorNotes && counselorNotes.length > 0 ? (
                        <div className="ml-13 space-y-3">
                          {counselorNotes.map((note, index) => (
                            <div key={index} className="flex space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                                  {note.author.split(' ').map(n => n[0]).join('')}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="bg-white rounded-lg p-3 border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-gray-900 text-sm">{note.author}</span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(note.date).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700">{note.comment}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {/* Reply Box */}
                      <div className="ml-13 mt-4">
                        <div className="flex space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                              A
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <textarea
                                rows={2}
                                placeholder="Add a counselor note..."
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                className="w-full bg-transparent text-sm resize-none focus:outline-none placeholder-gray-500"
                              />
                              <div className="flex justify-end mt-2">
                                <button
                                  onClick={handleAddNote}
                                  className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium hover:bg-blue-600 transition-colors"
                                >
                                  Reply
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquareText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-sm text-gray-500">
                        No notes available yet. Counselors can add observations and recommendations here.
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
