import React from "react";
import UserNavbar from "./UserNavbar";
import Footer from "../Visitor-side/Footer";
import { User, GraduationCap, BookOpenText, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../utils/AuthContext";
import Swal from "sweetalert2";

const ProfilePage = () => {
    const [strands, setStrands] = useState([]);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [selectedStrand, setSelectedStrand] = useState('');
    const [yearLevel, setYearLevel] = useState('');
    const [generalAverage, setGeneralAverage] = useState('');
    const [mathGrade, setMathGrade] = useState('');
    const [scienceGrade, setScienceGrade] = useState('');
    const [englishGrade, setEnglishGrade] = useState('');

    // Loading and error states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isSaving, setIsSaving] = useState(false);

    // validation state
    const [errors, setErrors] = useState({
        selectedStrand: null,
        yearLevel: null,
        generalAverage: null,
        mathGrade: null,
        scienceGrade: null,
        englishGrade: null
    });

    const { user, setUser, loading: authLoading } = useAuth();
    const storedEmail = user?.email || '';
    const [email] = useState(storedEmail);

    useEffect(() => {
        document.title = "TigerRoutes | Profile";
        const initializeData = async () => {
            try {
                setLoading(true);
                setError(null);
                await Promise.all([
                    fetchStrands(),
                    fetchUserData()
                ]);
            } catch (err) {
                setError('Failed to load profile data');
                console.error('Error initializing data:', err);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            initializeData();
        }
    }, [authLoading]);

    function fetchStrands() {
        return fetch(`${process.env.REACT_APP_API_URL}/api/strands`, { credentials: 'include' })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch strands');
                return res.json();
            })
            .then(data => setStrands(data))
            .catch(error => {
                console.error('Error fetching strands:', error);
                throw error;
            });
    }

    function fetchUserData() {
        const localUser = user;
        if (!localUser || !localUser.studentAccount_ID) {
            throw new Error('User not authenticated');
        }

        return fetch(`${process.env.REACT_APP_API_URL}/api/student-profile/${localUser.studentAccount_ID}`, { credentials: 'include' })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch user data');
                return res.json();
            })
            .then(data => {
                if (data.name) {
                    const nameParts = data.name.trim().split(' ');
                    setFirstName(nameParts.slice(0, -1).join(' '));
                    setLastName(nameParts.slice(-1)[0]);
                }

                if (data.strand_ID) {
                    setSelectedStrand(data.strand_ID.toString());
                }
                if (data.gradeLevel) {
                    setYearLevel(data.gradeLevel === 11 ? 'Grade 11' : data.gradeLevel === 12 ? 'Grade 12' : '');
                }

                if (data.genAverageGrade !== null && data.genAverageGrade !== undefined) {
                    setGeneralAverage(String(data.genAverageGrade).slice(0, 2));
                }
                if (data.mathGrade !== null && data.mathGrade !== undefined) {
                    setMathGrade(String(data.mathGrade).slice(0, 2));
                }
                if (data.scienceGrade !== null && data.scienceGrade !== undefined) {
                    setScienceGrade(String(data.scienceGrade).slice(0, 2));
                }
                if (data.englishGrade !== null && data.englishGrade !== undefined) {
                    setEnglishGrade(String(data.englishGrade).slice(0, 2));
                }
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
                throw error;
            });
    }

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen w-full bg-[#FFFCED] flex flex-col">
                <UserNavbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading your profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen w-full bg-[#FFFCED] flex flex-col">
                <UserNavbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-red-500">
                        <p className="text-lg font-semibold">Error loading Profile</p>
                        <p className="mt-2">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // sanitize input to digits only and limit to 2 characters
    const sanitizeTwoDigits = (val) => {
        if (!val && val !== '') return '';
        const digits = String(val).replace(/\D/g, '').slice(0, 2);
        return digits;
    };

    // generic handler for grade fields
    const handleGradeChange = (setter, fieldName) => (e) => {
        const value = sanitizeTwoDigits(e.target.value);
        setter(value);

        // validation: allow empty (not typed yet) but if present must be 1-2 digits (0-99)
        if (value === '') {
            setErrors(prev => ({ ...prev, [fieldName]: 'This field is required' }));
        } else {
            // optional: ensure numeric range 0-100
            const n = Number(value);
            if (Number.isNaN(n) || n < 0 || n > 100) {
                setErrors(prev => ({ ...prev, [fieldName]: 'Enter a number between 0 and 99' }));
            } else {
                setErrors(prev => ({ ...prev, [fieldName]: null }));
            }
        }
    };

    // basic form validation before submit
    const validateForm = () => {
        const newErrors = {};
        newErrors.selectedStrand = selectedStrand ? null : 'Strand/Track is required';
        newErrors.yearLevel = yearLevel ? null : 'Year level is required';
        newErrors.generalAverage = generalAverage ? null : 'General Average is required';
        newErrors.mathGrade = mathGrade ? null : 'Mathematics grade is required';
        newErrors.scienceGrade = scienceGrade ? null : 'Science grade is required';
        newErrors.englishGrade = englishGrade ? null : 'English grade is required';

        setErrors(newErrors);
        return Object.values(newErrors).every(v => v === null);
    };

    // PUT request for the whole form.
    function handleSaveProfile(e) {
        e.preventDefault();
        const localUser = user;
        if (!localUser || !localUser.studentAccount_ID) return;

        if (!validateForm()) {
            return;
        }

        const profileData = {
            firstName,
            lastName,
            strand_ID: selectedStrand,
            gradeLevel: yearLevel === 'Grade 11' ? 11 : yearLevel === 'Grade 12' ? 12 : null,
            genAverageGrade: generalAverage,
            mathGrade,
            scienceGrade,
            englishGrade
        };

        setIsSaving(true);
        fetch(`${process.env.REACT_APP_API_URL}/api/student-profile/${user.studentAccount_ID}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const updatedUser = { ...localUser, name: firstName + ' ' + lastName };
                    setUser(updatedUser);
                    Swal.fire({
                        icon: 'success',
                        title: 'Profile updated',
                        text: 'Your profile was saved successfully.',
                        timer: 1800,
                        showConfirmButton: false,
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Save failed',
                        text: data.error || 'Failed to update profile.',
                    });
                }
                setIsSaving(false);
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Save failed',
                    text: 'An unexpected error occurred while saving your profile.',
                });
                setIsSaving(false);
            });
    }

    return (
        
//Create a student academic profile page UI using React and Tailwind CSS with sections for personal information, academic details, and semester grades.


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
                                tabIndex={-1}
                                aria-readonly="true"
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
                                tabIndex={-1}
                                aria-readonly="true"
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
                                aria-readonly="true"
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
                                onChange={e => {
                                    setSelectedStrand(e.target.value);
                                    setErrors(prev => ({ ...prev, selectedStrand: null }));
                                }}
                                className="w-full border border-gray-400 rounded-lg p-2 focus:ring-2 focus:ring-[#FB9724] text-gray-700">
                                <option value="" disabled hidden>Select Strand</option>
                                {strands.map(strand => (
                                    <option key={strand.strand_ID} className="text-gray-700" value={strand.strand_ID}>
                                        {strand.strandName}
                                    </option>
                                ))}
                            </select>
                            {errors.selectedStrand && <p className="text-xs text-red-600 mt-1">{errors.selectedStrand}</p>}
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Year Level</label>
                            <select
                                value={yearLevel}
                                onChange={e => {
                                    setYearLevel(e.target.value);
                                    setErrors(prev => ({ ...prev, yearLevel: null }));
                                }}
                                className="w-full border border-gray-400 rounded-lg p-2 focus:ring-2 focus:ring-[#FB9724] text-gray-700">
                                <option value="" disabled hidden>Select Year</option>
                                <option className="text-gray-700">Grade 11</option>
                                <option className="text-gray-700">Grade 12</option>
                            </select>
                            {errors.yearLevel && <p className="text-xs text-red-600 mt-1">{errors.yearLevel}</p>}
                        </div>
                    </div>


                    {/* Semester Grades */}
                    <div className="bg-[#FFF9F3] rounded-lg p-5 shadow-sm space-y-4">
                        <h3 className="flex items-center space-x-4 text-lg font-semibold text-gray-700">
                            <Star className="w-6 h-6 text-[#FB9724]" />
                            <span>Semester Grades</span>
                        </h3>
                        {/* Section explaining the grade guidelines for Grade 11 and 12 Students */}

                        <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-700 p-4 mb-4" role="alert">
                            <p className="font-bold">Grade Input Guidelines</p>
                            <p className="text-sm">
                                For Grade 11 Students: Please use your Grade 10 final grades as a reference for input.
                            </p>
                            <p className="text-sm">
                                For Grade 12 Students: Please input your final grades of your Grade 11 semester, formatted based on the <a className="hover:underline" href='https://drive.google.com/file/d/1CLinN_cFoKkGyozd-_7ZWISqlecnUDvb/view' target='_blank' rel="noopener noreferrer"><b>USTET Guidelines</b></a>.
                            </p>
                        </div>

                        {/* General Average */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-600">General Average</label>
                            <input
                                type="text"
                                placeholder="e.g., 90"
                                value={generalAverage}
                                onChange={handleGradeChange(setGeneralAverage, 'generalAverage')}
                                inputMode="numeric"
                                maxLength={2}
                                pattern="\d{1,2}"
                                className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#FB9724] ${errors.generalAverage ? 'border-red-500' : 'border-gray-400'}`}
                            />
                            {errors.generalAverage && <p className="text-xs text-red-600 mt-1">{errors.generalAverage}</p>}
                        </div>

                        {/* Mathematics */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-600">Mathematics</label>
                            <input
                                type="text"
                                placeholder="e.g., 95"
                                value={mathGrade}
                                onChange={handleGradeChange(setMathGrade, 'mathGrade')}
                                inputMode="numeric"
                                maxLength={2}
                                pattern="\d{1,2}"
                                className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#FB9724] ${errors.mathGrade ? 'border-red-500' : 'border-gray-400'}`}
                            />
                            {errors.mathGrade && <p className="text-xs text-red-600 mt-1">{errors.mathGrade}</p>}
                        </div>

                        {/* Science */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-600">Science</label>
                            <input
                                type="text"
                                placeholder="e.g., 95"
                                value={scienceGrade}
                                onChange={handleGradeChange(setScienceGrade, 'scienceGrade')}
                                inputMode="numeric"
                                maxLength={2}
                                pattern="\d{1,2}"
                                className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#FB9724] ${errors.scienceGrade ? 'border-red-500' : 'border-gray-400'}`}
                            />
                            {errors.scienceGrade && <p className="text-xs text-red-600 mt-1">{errors.scienceGrade}</p>}
                        </div>

                        {/* English */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-600">English</label>
                            <input
                                type="text"
                                placeholder="e.g., 95"
                                value={englishGrade}
                                onChange={handleGradeChange(setEnglishGrade, 'englishGrade')}
                                inputMode="numeric"
                                maxLength={2}
                                pattern="\d{1,2}"
                                className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#FB9724] ${errors.englishGrade ? 'border-red-500' : 'border-gray-400'}`}
                            />
                            {errors.englishGrade && <p className="text-xs text-red-600 mt-1">{errors.englishGrade}</p>}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-4">
                        <button
                            type="submit"
                            disabled={isSaving || Object.values(errors).some(Boolean)}
                            aria-busy={isSaving}
                            className={`px-6 py-2 text-sm rounded-md shadow-md transition-colors ${
                                isSaving || Object.values(errors).some(Boolean)
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-[#FBBF24] hover:bg-yellow-500 text-white'
                            }`}
                        >
                            {isSaving ? (
                               <span className="flex items-center gap-2">
                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block" />
                                    Saving...
                               </span>
                            ) : (
                                'Save Profile'
                           )}
                        </button>
                    </div>
                </form>
            </main>

            <Footer />
        </div>
    );
};

export default ProfilePage;