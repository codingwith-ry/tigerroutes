import React from "react";
import UserNavbar from "./UserNavbar";
import Footer from "../Visitor-side/Footer";
import { User } from "lucide-react";
import { GraduationCap } from "lucide-react";
import { BookOpenText } from "lucide-react"; // Import open-book icon
import { Star } from "lucide-react"; // Import open-book icon
import { useEffect } from "react"; 
import { useState } from "react";



const ProfilePage = () => {
    const [strands, setStrands] = useState([]);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [selectedStrand, setSelectedStrand] = useState('');
    const [yearLevel, setYearLevel] = useState('');
    const [schoolYear, setSchoolYear] = useState('');
    const [generalAverage, setGeneralAverage] = useState('');
    const [mathGrade, setMathGrade] = useState('');
    const [scienceGrade, setScienceGrade] = useState('');
    const [englishGrade, setEnglishGrade] = useState('');


    //Using session storage value for email as it doesn't need to be edited.
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    const storedEmail = storedUser?.email || '';
    const [email] = useState(storedEmail);

    useEffect(() => {
        fetchStrands();
        fetchUserData();
    }, []);

    function fetchStrands() {
        fetch('http://localhost:5000/api/strands')
        .then(res => res.json())
        .then(data => setStrands(data));
    }

    function fetchUserData() {
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (user && user.studentAccount_ID) {
            // Change from /api/student/ to /api/student-profile/
            fetch(`http://localhost:5000/api/student-profile/${user.studentAccount_ID}`)
            .then(res => res.json())
            .then(data => {
                if(data.name) {
                    const nameParts = data.name.trim().split(' ');
                    setFirstName(nameParts.slice(0, -1).join(' '));
                    setLastName(nameParts.slice(-1)[0]);
                }
                
                // Populate existing profile data
                if (data.strand_ID) {
                    setSelectedStrand(data.strand_ID.toString());
                }
                if (data.gradeLevel) {
                    setYearLevel(data.gradeLevel === 11 ? 'Grade 11' : data.gradeLevel === 12 ? 'Grade 12' : '');
                }
                
                // Populate existing grades data
                if (data.genAverageGrade !== null && data.genAverageGrade !== undefined) {
                    setGeneralAverage(data.genAverageGrade.toString());
                }
                if (data.mathGrade !== null && data.mathGrade !== undefined) {
                    setMathGrade(data.mathGrade.toString());
                }
                if (data.scienceGrade !== null && data.scienceGrade !== undefined) {
                    setScienceGrade(data.scienceGrade.toString());
                }
                if (data.englishGrade !== null && data.englishGrade !== undefined) {
                    setEnglishGrade(data.englishGrade.toString());
                }
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
            });
        }
    }

    // PUT request for the whole form.
    function handleSaveProfile(e) {
        e.preventDefault();
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (!user || !user.studentAccount_ID) return;

        const profileData = {
            firstName,
            lastName,
            strand_ID: selectedStrand,
            gradeLevel: yearLevel === 'Grade 11' ? 11 : yearLevel === 'Grade 12' ? 12 : null,
            schoolYear,
            generalAverage,
            mathGrade,
            scienceGrade,
            englishGrade
        };

        fetch(`http://localhost:5000/api/student-profile/${user.studentAccount_ID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
        })
        .then(res => res.json())
        .then(data => {
            if(data.success) {
                const user = JSON.parse(sessionStorage.getItem('user'));
                user.name = firstName + ' ' + lastName;
                sessionStorage.setItem('user', JSON.stringify(user));
                alert('Profile updated successfully');
            } else {
                alert('Failed to update profile: ' + (data.error || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to update profile.');
        });
    }

  return (
    <div className="w-full min-h-screen bg-[#FFFCED] flex flex-col font-sfpro">
      <UserNavbar />

    <main className="w-full max-w-4xl mx-auto mt-24 mb-14 border border-black rounded-lg">        
        <div className="bg-[#FB9724] text-white rounded-t-lg p-4 shadow-md">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 text-white">
            <GraduationCap className="w-8 h-8 text-white" />
            Academic Profile
            </h2> 
            <p className="text-sm opacity-90">
                Complete your academic information and track your progress
            </p>
        </div>

        {/* Form */}
        <form className="bg-white border border-gray-200 rounded-b-lg shadow-md p-6 space-y-8"
        onSubmit={handleSaveProfile}
        >
        {/* Personal Information */}
        <div className="bg-[#FFF9F3] rounded-lg p-5 shadow-sm space-y-4">
            <h3 className="flex items-center space-x-4 text-lg font-semibold text-gray-700">
            <User className="w-6 h-6 text-[#FB9724]" />
            <span>Personal Information</span>
            </h3>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
                </label>
                <input
                type="text"
                placeholder="Enter first name"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                readOnly
                tabIndex={-1} //just remove the readOnly, tabIndex, and style if you want it to be editable again.
                style={{ pointerEvents: "none", backgroundColor: "#f3f4f6", color: "#6b7280" }}                                
                className="w-full border border-gray-400 rounded-lg p-2 focus:ring-2 focus:ring-[#FB9724] font-normal"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Enter last name"
                readOnly
                tabIndex={-1} //just remove the readOnly, tabIndex, and style if you want it to be editable again.
                style={{ pointerEvents: "none", backgroundColor: "#f3f4f6", color: "#6b7280" }}                
                className="w-full border border-gray-400 rounded-lg p-2 focus:ring-2 focus:ring-[#FB9724] font-normal"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                type="email"
                placeholder="Enter email address"
                value={email}
                readOnly
                tabIndex={-1}
                style={{ pointerEvents: "none", backgroundColor: "#f3f4f6", color: "#6b7280" }}
                className="w-full border border-gray-400 rounded-lg p-2 focus:ring-2 focus:ring-[#FB9724] font-normal"
                />
            </div>  
        </div>


        {/* Academic Information */}
        <div className="bg-[#FFF9F3] rounded-lg p-5 shadow-sm space-y-4">
            <h3 className="flex items-center space-x-4 text-lg font-semibold text-gray-700">
          <BookOpenText className="w-6 h-6 text-[#FB9724]" />
            <span>Academic Information</span>
            </h3>

            <div>   
                <label className="block text-sm font-medium text-gray-700 mb-1" id="strand">Strand/Track</label>
        <select 
            value={selectedStrand}
            onChange={e => setSelectedStrand(e.target.value)}
            className="w-full border border-gray-400 rounded-lg p-2 focus:ring-2 focus:ring-[#FB9724] text-gray-700">
                    <option value="" disabled hidden>Select Strand</option>
                    {strands.map(strand => (
                        <option key={strand.strand_ID} className="text-gray-700" value={strand.strand_ID}>
                            {strand.strandName}
                        </option>
                    ))}
                </select>
            </div>


            {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Track</label>
                <select defaultValue=""className="w-full border border-gray-400 rounded-lg p-2 focus:ring-2 focus:ring-[#FB9724] text-gray-400">
                <option value="" disabled hidden>Select Track</option>
                <option className="text-gray-700">Pre-Computer Science</option>
                <option className="text-gray-700">Engineering</option>
                <option className="text-gray-700">Medical</option>
                </select>
            </div> */}


            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year Level</label>
            <select 
                value={yearLevel}
                onChange={e => setYearLevel(e.target.value)}
                className="w-full border border-gray-400 rounded-lg p-2 focus:ring-2 focus:ring-[#FB9724] text-gray-700">
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
          <Star className="w-6 h-6 text-[#FB9724]" />
                <span>Semester Grades</span>
            </h3>

            {/* General Average */}
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-600">General Average</label>
                <input
                type="text"
                placeholder="e.g., 1.750"
                value={generalAverage}
                onChange={e => setGeneralAverage(e.target.value)}
                className="w-full border border-gray-400 rounded-lg p-2 focus:ring-2 focus:ring-[#FB9724]"
                />
            </div>

            {/* Mathematics */}
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-600">Mathematics</label>
                <input
                type="text"
                placeholder="e.g., 95"
                value={mathGrade}
                onChange={e => setMathGrade(e.target.value)}
                className="w-full border border-gray-400 rounded-lg p-2 focus:ring-2 focus:ring-[#FB9724]"
                />
            </div>

            {/* Science */}
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-600">Science</label>
                <input
                type="text"
                placeholder="e.g., 95"
                value={scienceGrade}
                onChange={e => setScienceGrade(e.target.value)}
                className="w-full border border-gray-400 rounded-lg p-2 focus:ring-2 focus:ring-[#FB9724]"
                />
            </div>

            {/* English */}
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-600">English</label>
                <input
                type="text"
                placeholder="e.g., 95"
                value={englishGrade}
                onChange={e => setEnglishGrade(e.target.value)}
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
