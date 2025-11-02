// src/pages/AssessmentResults.jsx
import React from "react";
import { useState, useEffect } from "react";
import { FiDownload, FiStar, FiCheckCircle, FiFileText, FiX } from "react-icons/fi";
import { UserCircle2, SquarePen } from "lucide-react";
import UserNavbar from "./UserNavbar";
import Footer from "../Visitor-side/Footer";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import generatePDF from "./generatePDF";

const RatingModal = ({ isOpen, onClose, onSubmit, assessmentId }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const textareaRef = React.useRef(null);

    useEffect(() => {
        if (isOpen && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [isOpen]);

    const handleSubmit = () => {
        onSubmit({
            assessmentId,
            rating,
            feedback
        });
        // Reset state after submission
        setRating(0);
        setHoverRating(0);
        setFeedback('');
    };

    const handleClose = () => {
        // Reset state when closing
        setRating(0);
        setHoverRating(0);
        setFeedback('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div
                className="bg-white rounded-xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Rate Your Experience</h3>
                    <button 
                        type="button"
                        onClick={handleClose}
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
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className={`text-2xl ${
                                    star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'
                                } hover:text-yellow-400 transition-colors`}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                    <textarea
                        ref={textareaRef}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Share your thoughts about the assessment..."
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-300 focus:border-transparent min-h-[100px] resize-none"
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
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



const AssessmentResults = () => {
    const [userData, setUserData] = useState(null);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    const [assessmentData, setAssessmentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { assessmentId } = useParams();

    
    const handleSubmitRating = (ratingData) => {
        Swal.fire({
            icon: 'question',
            title: 'Submit Rating',
            text: 'Are you sure you want to submit your rating?',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
        }).then((result) => {
            if (result.isConfirmed) {
                fetch('http://localhost:5000/api/assessment/submitRating', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(ratingData)
                }).then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Thank You!',
                            text: 'Your rating has been submitted successfully.',
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Submission Failed',
                            text: data.message || 'There was an error submitting your rating. Please try again later.',
                        });
                    }
                });
            }
        });
    };

    

    const formatGrade = (grade) => {
        return grade !== null && grade !== undefined ? grade : 'N/A';
    };

    
    const handleDownload = async () => {
        setIsGeneratingPDF(true);
        try {
            await generatePDF(assessmentData);
        } catch (error) {
            console.error('PDF generation failed:', error);
            Swal.fire({
                icon: 'error',
                title: 'PDF Generation Failed',
                text: 'There was an error generating your PDF. Please try again.',
            });
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    useEffect(() => {
        document.title = 'Assessment | Results';
        fetchAssessmentDetails();
    }, [assessmentId]);

    const fetchAssessmentDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/assessment/assessmentDetails?assessmentID=${assessmentId}`);
            const data = await response.json();
            
            if (data.success) {
                setAssessmentData(data.data);
            } else {
                setError(data.message || 'Failed to fetch assessment details');
            }
        } catch (err) {
            setError('Error fetching assessment details: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // RIASEC descriptions
    const riasecDescriptions = {
        realistic: "Hands-on, practical activities",
        investigative: "Research and analytical thinking",
        artistic: "Creative and expressive activities",
        social: "Helping and working with people",
        enterprising: "Leadership and business activities",
        conventional: "Organized and structured work"
    };

    // Big Five descriptions
    const bigFiveDescriptions = {
        openness: "Creativity and openness to experience",
        conscientiousness: "Organization and self-discipline",
        extraversion: "Sociability and assertiveness",
        agreeableness: "Cooperation and trustworthiness",
        neuroticism: "Emotional stability (lower is better)"
    };

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-[#FFFCED] flex flex-col">
                <UserNavbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading assessment results...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen w-full bg-[#FFFCED] flex flex-col">
                <UserNavbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-red-500">
                        <p className="text-lg font-semibold">Error loading results</p>
                        <p className="mt-2">{error}</p>
                        <button 
                            onClick={fetchAssessmentDetails}
                            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!assessmentData) {
        return (
            <div className="min-h-screen w-full bg-[#FFFCED] flex flex-col">
                <UserNavbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                        <p className="text-lg">No assessment data found</p>
                    </div>
                </div>
            </div>
        );
    }

    const { assessmentProfile, riasec, bigFive, programRecommendations } = assessmentData;

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

            <main id="assessment-results-content" className="flex flex-col gap-8 px-6 md:px-16 lg:px-32 pb-16">
                {/* Profile Section */}
                <div
                    className="bg-white rounded-lg shadow p-5 border border-black"
                    style={{ fontFamily: "SF Pro" }}
                >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center">
                    
                    

                    {/* Profile Info */}
                    <div className="w-full">
                        {/* Profile Icon */}
                        <div className="flex items-center mb-3 pl-5">
                        <div className="mr-2">
                            <UserCircle2 size={40} stroke="#FB9724" strokeWidth={2} />
                        </div>
                        <h2 className="font-semibold py-2 pl-0 text-base sm:text-lg">
                            Student Profile
                        </h2>
                        </div>

                        {/* Desktop / Tablet Layout */}
                        <div className="hidden sm:block">
                        <div className="grid grid-cols-4 text-sm font-semibold mb-2">
                            <span className="pl-5">Name:</span>
                            <span className="pl-4">Email:</span>
                            <span className="pl-4">Grade Level:</span>
                            <span className="pl-4">Strand:</span>
                        </div>

                        <div className="grid grid-cols-4 text-sm">
                            <span className="pl-5">{assessmentProfile?.name || 'N/A'}</span>
                            <span className="pl-4 break-words">
                            {assessmentProfile?.email || 'N/A'}
                            </span>
                            <span className="pl-4">{assessmentProfile?.gradeLevel || 'N/A'}</span>
                            <span className="pl-4">{assessmentProfile?.strandName || 'N/A'}</span>
                            
                        </div>
                        
                        {/* Grades Section */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-4 text-sm font-semibold mb-2">
                            <span className="pl-5">Math Grade:</span>
                            <span className="pl-4">Science Grade:</span>
                            <span className="pl-4">English Grade:</span>
                            <span className="pl-4">Average Grade:</span>
                            </div>
                            <div className="grid grid-cols-4 text-sm">
                            <span className="pl-5">{formatGrade(assessmentProfile?.mathGrade)}</span>
                            <span className="pl-4">{formatGrade(assessmentProfile?.scienceGrade)}</span>
                            <span className="pl-4">{formatGrade(assessmentProfile?.englishGrade)}</span>
                            <span className="pl-4">{formatGrade(assessmentProfile?.genAverageGrade)}</span>
                            <p class="pl-5 mt-3 text-gray-500">As of {new Date(assessmentProfile.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.</p>
                            </div>
                        </div>
                        
                        </div>

                        {/* Mobile Layout */}
                        <div className="block sm:hidden space-y-3 text-sm">
                        <div>
                            <span className="font-semibold">Name:</span>
                            <p>{userData?.name || 'N/A'}</p>
                        </div>
                        <div>
                            <span className="font-semibold">Email:</span>
                            <p className="break-words">{userData?.email || 'N/A'}</p>
                        </div>
                        <div>
                            <span className="font-semibold">Grade Level:</span>
                            <p>{userData?.gradeLevel || 'N/A'}</p>
                        </div>
                        <div>
                            <span className="font-semibold">Strand:</span>
                            <p>{userData?.strand || 'N/A'}</p>
                        </div>
                        <div>
                            <span className="font-semibold">Math Grade:</span>
                            <p>{formatGrade(userData?.mathGrade)}</p>
                        </div>
                        <div>
                            <span className="font-semibold">Science Grade:</span>
                            <p>{formatGrade(userData?.scienceGrade)}</p>
                        </div>
                        <div>
                            <span className="font-semibold">English Grade:</span>
                            <p>{formatGrade(userData?.englishGrade)}</p>
                        </div>
                        <div>
                            <span className="font-semibold">Average Grade:</span>
                            <p>{formatGrade(userData?.genAverageGrade)}</p>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                {/* RIASEC Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {riasec && (
                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center mb-2">
                            <FiCheckCircle className="text-green-500 w-6 h-6 mr-2" />
                            <h3 className="font-semibold text-lg">RIASEC Interest Results</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            Your interests across the six RIASEC dimensions
                        </p>

                        {Object.entries(riasec).map(([trait, value], idx) => (
                            trait !== 'riasecResult_ID' && (
                                <div key={idx} className="flex mb-4">
                                    <div className="w-1 rounded bg-blue-500 mr-3"></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-sm font-semibold text-gray-600 mb-2">
                                            <span className='capitalize'>{trait}</span>
                                            <span className="text-blue-500 font-bold">{value}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-200 rounded-full">
                                            <div
                                                className="h-2 bg-blue-500 rounded-full"
                                                style={{ width: `${value}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{riasecDescriptions[trait] || 'No description available'}</p>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                )}

                {/* Big Five Section */}
                {bigFive && (
                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center mb-2">
                            <FiCheckCircle className="text-green-500 w-6 h-6 mr-2" />
                            <h3 className="font-semibold text-lg">Big Five Personality Results</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            Your personality traits based on the Five-Factor Model
                        </p>

                        {Object.entries(bigFive).map(([trait, value], idx) => (
                            trait !== 'bigFiveResult_ID' && (
                                <div key={idx} className="flex mb-4">
                                    <div className="w-1 rounded bg-purple-500 mr-3"></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-sm font-semibold text-gray-600 mb-2">
                                            <span className='capitalize'>{trait}</span>
                                            <span className="text-purple-500 font-bold">{value}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-200 rounded-full">
                                            <div
                                                className="h-2 bg-purple-500 rounded-full"
                                                style={{ width: `${value}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{bigFiveDescriptions[trait] || 'No description available'}</p>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                )}
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

                    {/* Track-Aligned Programs */}
                    {programRecommendations?.track_aligned && programRecommendations.track_aligned.length > 0 && (
                        <>
                            <h4 className="text-lg font-semibold mb-3">Track-Aligned Programs</h4>
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                {programRecommendations.track_aligned.map((program, idx) => (
                                    <ProgramCard 
                                        key={program.recommendation.recommendation_ID || idx}
                                        program={program}
                                        index={idx}
                                        type="track_aligned"
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {/* Cross-Track Programs */}
                    {programRecommendations?.cross_track && programRecommendations.cross_track.length > 0 && (
                        <>
                            <h4 className="text-lg font-semibold mb-3">Cross-Track Programs</h4>
                            <div className="grid md:grid-cols-2 gap-6">
                                {programRecommendations.cross_track.map((program, idx) => (
                                    <ProgramCard 
                                        key={program.recommendation.recommendation_ID || idx}
                                        program={program}
                                        index={idx}
                                        type="cross_track"
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {/* No Recommendations Message */}
                    {(!programRecommendations?.track_aligned || programRecommendations.track_aligned.length === 0) &&
                     (!programRecommendations?.cross_track || programRecommendations.cross_track.length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                            <p>No program recommendations available at this time.</p>
                        </div>
                    )}
                </div>
                {assessmentData?.rating || assessmentData?.feedback ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column - Student Feedback & Download */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="font-semibold text-lg mb-3">Your Feedback</h3>
                        <div className="space-y-4">
                            <div>
                            <p className="text-sm text-gray-500 mb-2">Satisfaction Rating</p>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                <span 
                                    key={star}
                                    className={`text-2xl ${star <= assessmentData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                >
                                    ★
                                </span>
                                ))}
                            </div>
                            </div>
                            {assessmentData.feedback && (
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Your Comments</p>
                                <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                {assessmentData.feedback}
                                </p>
                            </div>
                            )}
                        </div>
                        </div>
                    </div>

                    {/* Right Column - Counselor Response */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="font-semibold text-lg mb-3">Counselor's Response</h3>
                        {assessmentData.counselorNotes ? (
                            <div className="bg-blue-50 p-5 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <SquarePen className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-sm">{assessmentData.counselorNotes.counselorName}</p>
                                            <p className="text-sm text-gray-400">{assessmentData.counselorNotes.counselorEmail}</p>
                                            <span className="text-xs text-gray-500">
                                                {new Date(assessmentData.counselorNotes.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 bg-white p-4 rounded-lg border border-blue-100">
                                            {assessmentData.counselorNotes.counselorNotes}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-5 rounded-lg text-center">
                                <div className="flex flex-col items-center gap-3">
                                    <SquarePen className="w-8 h-8 text-gray-400" />
                                    <div>
                                        <p className="text-gray-600 font-medium mb-1">Pending Counselor Review</p>
                                        <p className="text-sm text-gray-500">
                                            Your assessment is being reviewed by our guidance counselors. 
                                            Check back later for personalized feedback.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>


                    {/* Download Button */}
                        <div className="flex">
                        <button 
                            onClick={handleDownload}
                            disabled={isGeneratingPDF}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                            isGeneratingPDF 
                                ? 'bg-gray-400 cursor-not-allowed text-white' 
                                : 'bg-yellow-400 hover:bg-yellow-500 text-white'
                            }`}
                        >
                            {isGeneratingPDF ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Generating PDF...
                            </>
                            ) : (
                            <>
                                <FiDownload className="text-base" />
                                Download Results
                            </>
                            )}
                        </button>
                        </div>
                </div>
                
            ) : (
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
                        <button 
                            onClick={handleDownload}
                            disabled={isGeneratingPDF}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                isGeneratingPDF 
                                    ? 'bg-gray-400 cursor-not-allowed text-white' 
                                    : 'bg-yellow-400 hover:bg-yellow-500 text-white'
                            }`}
                        >
                            {isGeneratingPDF ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Generating PDF...
                                </>
                            ) : (
                                <>
                                    <FiDownload className="text-base" />
                                    Download Results
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
            </main>
            <Footer />
            <RatingModal 
                isOpen={isRatingModalOpen}
                onClose={() => setIsRatingModalOpen(false)}
                onSubmit={handleSubmitRating}
                assessmentId={assessmentId}
            />
        </div>
    );
};

// Separate component for program cards
const ProgramCard = ({ program, index, type }) => {
    const { recommendation, programDetails, collegeDetails } = program;
    const alignmentScore = parseFloat(recommendation.alignmentScore) || 0;

    // Get breakdown scores from the nested breakdown object
    const breakdownScores = recommendation.breakdown || {
        Track: 0,
        RIASEC: 0,
        BigFive: 0,
        Academic: 0
    };

    // Breakdown items with colors
    const breakdownItems = [
        { label: "Track", score: breakdownScores.Track, color: "bg-green-500" },
        { label: "RIASEC", score: breakdownScores.RIASEC, color: "bg-blue-500" },
        { label: "Big Five", score: breakdownScores.BigFive, color: "bg-purple-500" },
        { label: "Academic", score: breakdownScores.Academic, color: "bg-orange-500" }
    ];

    return (
        <div className="border p-4 rounded-lg shadow-sm flex flex-col mb-4">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-lg flex items-center">
                    <span className={`flex items-center justify-center w-6 h-6 ${
                        type === 'track_aligned' ? 'bg-green-500' : 'bg-blue-500'
                    } text-white font-bold rounded-full mr-3`}>
                        {index + 1}
                    </span>
                    {programDetails?.programName || 'Unknown Program'}
                </h4>
                <span className={`font-bold ${
                    alignmentScore >= 80 ? 'text-green-600' : 
                    alignmentScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                    {alignmentScore}% match
                </span>
            </div>

            {/* College Information */}
            {collegeDetails?.collegeName && (
                <div className="mb-3">
                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full me-3">
                        {collegeDetails.collegeName}
                    </span>
                    {type === 'track_aligned' && (
                        <span className="bg-green-100 text-green-800 font-medium px-3 py-1 rounded-full text-sm">
                            Track Aligned
                        </span>
                    )}
                    {type === 'cross_track' && (
                        <span className="bg-blue-100 text-blue-800 font-medium px-3 py-1 rounded-full text-sm">
                            Cross Track
                        </span>
                    )}
                </div>
            )}

            {/* Program Description */}
            {programDetails?.programDescription && (
                <>
                    <p className="text-sm text-gray-500 mb-2">Program Details:</p>
                    <p className="text-sm text-gray-600 mb-3">{programDetails.programDescription}</p>
                </>
            )}

            {/* Breakdown Section - Grid Layout */}
            <div className="mb-4">
                <p className="text-sm text-gray-500 mb-3">Alignment Breakdown:</p>
                <div className="grid grid-cols-2 gap-3">
                    {breakdownItems.map((item, idx) => (
                        <div key={idx} className="bg-gray-50 p-2 rounded-lg">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-gray-700">{item.label}</span>
                                <span className="text-xs font-bold text-gray-800">{item.score}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full">
                                <div
                                    className={`h-1.5 rounded-full ${item.color}`}
                                    style={{ width: `${item.score}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <p className="text-sm text-gray-500 mb-2">Potential Career Paths:</p>
                <div className="flex flex-wrap gap-2 text-xs">
                    {programDetails?.careerPaths ? (
                        (() => {
                            try {
                                // Parse JSON if it's a string
                                const careers = typeof programDetails.careerPaths === 'string' 
                                    ? JSON.parse(programDetails.careerPaths) 
                                    : programDetails.careerPaths;
                                
                                // Handle array of career strings
                                if (Array.isArray(careers)) {
                                    return careers.slice(0, 4).map((career, careerIdx) => (
                                        <span 
                                            key={careerIdx}
                                            className="bg-green-100 text-green-800 font-medium px-2 py-1 rounded-full"
                                        >
                                            {career}
                                        </span>
                                    ));
                                }
                            } catch (error) {
                                console.error('Error parsing careerPaths:', error);
                            }
                            
                            // Fallback
                            return (
                                <span className="bg-green-100 text-green-800 font-medium px-2 py-1 rounded-full">
                                    {String(programDetails.careerPaths)}
                                </span>
                            );
                        })()
                    ) : (
                        // Fallback if no careerPaths data
                        <>
                            <span className="bg-green-100 text-green-800 font-medium px-2 py-1 rounded-full">
                                Career data not available
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};



export default AssessmentResults;

            