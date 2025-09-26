import React from "react";
import AdminSidebar from "./AdminSidebar";
import { Mail, Phone, MapPin, BookOpen, Clock, ChevronRight, Dot, MessageSquareText } from "lucide-react";

const CounselorPreview = () => {
  return (
    <div className="flex flex-col md:flex-row w-screen h-screen bg-[#fdfcf8]">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b">
          <div>
            <h1 className="text-2xl sm:text-4xl font-semibold">Manage Counselors</h1>
                <p className="text-sm text-gray-400 flex items-center gap-1">
                Counselors <ChevronRight className="w-4 h-4" /> 
                <span className="font-semibold text-gray-600">Dr. John Cruz</span>
                </p>
            </div>
          <div className="flex items-center space-x-3 mt-2 sm:mt-0">
            <span className="text-sm text-gray-600">Welcome back, Admin User!</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 flex items-center justify-center font-semibold">
              AU
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <div className="bg-white rounded-xl p-6 shadow border border-gray-200">
            {/* Profile Header */}
            <div className="flex items-center gap-5 mb-6">
              <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center text-xl font-bold text-white">
                DJC
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Dr. John Cruz</h2>

                <p className="text-gray-500 flex items-center gap-1">
                Counselor <Dot className="w-4 h-4" /> Guidance &amp; Counseling
                </p>
              </div>
            </div>

            {/* Grid: Contact + About */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Contact Information</h3>
                <ul className="space-y-4 text-sm">
                    <li className="flex items-start gap-2">
                        <Mail className="w-6 h-6 mt-2 text-gray-400" />
                        <div className="flex flex-col">
                        <span className="font-normal">Email:</span>
                        <span className="font-bold">john.cruz@school.edu</span>
                        </div>
                    </li>
                    <li className="flex items-start gap-2">
                        <Phone className="w-6 h-6 mt-2 text-gray-400" />
                        <div className="flex flex-col">
                        <span className="font-normal">Phone:</span>
                        <span className="font-bold">+63 917 555 0123</span>
                        </div>
                    </li>
                    <li className="flex items-start gap-2">
                        <MapPin className="w-6 h-6 mt-2 text-gray-400" />
                        <div className="flex flex-col">
                        <span className="font-normal">Office:</span>
                        <span className="font-bold">Room 205, Admin Building</span>
                        </div>
                    </li>
                    <li className="flex items-start gap-2">
                        <Clock className="w-6 h-6 mt-2 text-gray-400" />
                        <div className="flex flex-col">
                            <span className="font-normal">Work Hours:</span>
                            <span className="font-bold">Monday–Friday, 8:00 AM – 5:00 PM</span>
                        </div>
                    </li>
                </ul>
              </div>

              {/* About */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">About</h3>
                    <p className="text-gray-600 text-sm text-justify max-w-[450px] leading-relaxed">
                    Experienced guidance counselor with 8+ years in student development and career
                    guidance. Specializes in STEM pathway counseling and college preparation.
                    </p>
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">Profession Details</h3>
                    <div className="flex items-start gap-2 text-sm">
                    <BookOpen className="w-6 h-6 mt-2 text-gray-400" />
                        <div className="flex flex-col">
                            <span className="font-normal">Strand Specialization:</span>
                            <span className="font-bold">STEM</span>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Comments */}
          <div className="bg-white rounded-xl p-6 shadow border border-gray-200 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Recent Comments</h3>
              <span className="text-sm text-gray-500">Total: 2 comments</span>
            </div>

            <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                        <div className="flex items-center gap-2">
                            <MessageSquareText className="w-5 h-5 text-gray-400" />
                            <span className="text-sm">STU-0001</span>
                        </div>
                        <span className="text-xs text-gray-400">2025-09-27 14:30</span>
                    </div>
                    <p className="text-gray-700 text-sm text-justify max-w-[1000px] leading-relaxed">
                    With high Investigative and Realistic scores, student fits well in engineering or
                    computer-related fields. BS Computer Engineering or Electronics Engineering may
                    provide the challenge and structure they enjoy. Suggested exploring robotics or
                    AI-focused orgs.
                    </p>
                </div>

                <div className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                        <div className="flex items-center gap-2">
                            <MessageSquareText className="w-5 h-5 text-gray-400" />
                            <span className="text-sm">STU-0026</span>
                        </div>
                        <span className="text-xs text-gray-400">2025-09-27 11:20</span>
                    </div>
                    <p className="text-gray-700 text-sm text-justify max-w-[1000px] leading-relaxed">
                    Student showed a clear interest in problem-solving and digital technology. Based 
                    on the assessment, BS Computer Science or Information Technology aligns well with 
                    their top traits. Recommended joining STEM programs or coding workshops to enhance 
                    readiness.
                    </p>
                </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CounselorPreview;
