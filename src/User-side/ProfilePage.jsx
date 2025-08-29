import React from "react";
import UserNavbar from "./UserNavbar";
import Footer from "../Visitor-side/Footer";

const ProfilePage = () => {
  return (
    <div className="w-full min-h-screen bg-[#FFFCED] flex flex-col font-sfpro">
      <UserNavbar />

    <main className="w-full max-w-4xl mx-auto mt-24 mb-14 border border-black rounded-lg">        
        <div className="bg-[#FB9724] text-white rounded-t-lg p-4 shadow-md">
            <h2 className="font-semibold text-lg sm:text-xl flex items-center gap-4">
            <img 
                src="3D Elements/cap.png" 
                alt="icon" 
                className="w-8 h-8 object-contain" 
            />
            Academic Profile
            </h2> 
            <p className="text-sm opacity-90">
                Complete your academic information and track your progress
            </p>
        </div>

        {/* Form */}
        <form className="bg-white border border-gray-200 rounded-b-lg shadow-md p-6 space-y-8">
        {/* Personal Information */}
        <div className="bg-[#FFF9F3] rounded-lg p-5 shadow-sm space-y-4">
            <h3 className="flex items-center space-x-4 text-lg font-semibold text-gray-700">
            <img src="3D Elements/profile2.png" alt="icon" className="w-6 h-6" />
            <span>Personal Information</span>
            </h3>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
                </label>
                <input
                type="text"
                placeholder="Enter first name"
                className="w-full border border-gray-400 rounded-lg p-2 focus:ring-2 focus:ring-[#FB9724] font-normal"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                type="text"
                placeholder="Enter last name"
                className="w-full border border-gray-400 rounded-lg p-2 focus:ring-2 focus:ring-[#FB9724] font-normal"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                type="email"
                placeholder="Enter email address"
                className="w-full border border-gray-400 rounded-lg p-2 focus:ring-2 focus:ring-[#FB9724] font-normal"
                />
            </div>  
        </div>


        {/* Academic Information */}
        <div className="bg-[#FFF9F3] rounded-lg p-5 shadow-sm space-y-4">
            <h3 className="flex items-center space-x-4 text-lg font-semibold text-gray-700">
            <img src="3D Elements/academic.png" alt="icon" className="w-6 h-6" />
            <span>Academic Information</span>
            </h3>

            <div>   
                <label className="block text-sm font-medium text-gray-700 mb-1">Strand</label>
                    <select defaultValue=""className="w-full border border-gray-400 rounded-lg p-2 focus:ring-2 focus:ring-[#FB9724] text-gray-400">
                    <option value="" disabled hidden>Select Strand</option>
                    <option className="text-gray-700">Science, Technology, Engineering, and Mathematics (STEM)</option>
                    <option className="text-gray-700">Accountancy and Business Management Strand (ABM)</option>
                    <option className="text-gray-700">Humanities and Social Sciences Strand (HUMSS)</option>
                    <option className="text-gray-700">General Academic Strand - Health-Allied (GAS)</option>
                    <option className="text-gray-700">Music, Arts, and Design</option>
                    <option className="text-gray-700">Physical Education and Sports Track</option>
                </select>
            </div>


            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Track</label>
                <select defaultValue=""className="w-full border border-gray-400 rounded-lg p-2 focus:ring-2 focus:ring-[#FB9724] text-gray-400">
                <option value="" disabled hidden>Select Track</option>
                <option className="text-gray-700">Pre-Computer Science</option>
                <option className="text-gray-700">Engineering</option>
                <option className="text-gray-700">Medical</option>
                </select>
            </div>


            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year Level</label>
                <select defaultValue="" className="w-full border border-gray-400 rounded-lg p-2 focus:ring-2 focus:ring-[#FB9724] text-gray-400">
                    <option value="" disabled hidden>Select Year</option>
                    <option className="text-gray-700">Grade 11</option>
                    <option className="text-gray-700">Grade 12</option>
                    </select>
            </div>


            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School Year</label>
                <input type="text" placeholder="e.g., 2024-2025" className="w-full border border-gray-400 rounded-lg p-2 focus:ring-2 focus:ring-[#FB9724]" />
            </div>

        </div>


        {/* Semester Grades */}
            <div className="bg-[#FFF9F3] rounded-lg p-5 shadow-sm space-y-4">
            <h3 className="flex items-center space-x-4 text-lg font-semibold text-gray-700">
                <img src="3D Elements/grades.png" alt="icon" className="w-6 h-6" />
                <span>Semester Grades</span>
            </h3>

            {/* General Average */}
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-600">General Average</label>
                <input
                type="text"
                placeholder="e.g., 1.750"
                className="w-full border border-gray-400 rounded-lg p-2 focus:ring-2 focus:ring-[#FB9724]"
                />
            </div>

            {/* Mathematics */}
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-600">Mathematics</label>
                <input
                type="text"
                placeholder="e.g., 95"
                className="w-full border border-gray-400 rounded-lg p-2 focus:ring-2 focus:ring-[#FB9724]"
                />
            </div>

            {/* Science */}
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-600">Science</label>
                <input
                type="text"
                placeholder="e.g., 95"
                className="w-full border border-gray-400 rounded-lg p-2 focus:ring-2 focus:ring-[#FB9724]"
                />
            </div>

            {/* English */}
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-600">English</label>
                <input
                type="text"
                placeholder="e.g., 95"
                className="w-full border border-gray-400 rounded-lg p-2 focus:ring-2 focus:ring-[#FB9724]"
                />
            </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4">
            <button
                type="button"
                className="px-10 py-2 text-sm rounded-md border border-black hover:bg-gray-100"
            >
                Back
            </button>

            <button
                type="submit"
                className="px-6 py-2 text-sm bg-[#FBBF24] text-white rounded-md shadow-md"
            >
                Save Profile
            </button>
            </div>
        </form>
    </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
