// src/pages/AssessmentResults.jsx
import React from "react";
import { useState, useEffect } from "react";
import { FiDownload, FiStar, FiCheckCircle, FiFileText } from "react-icons/fi";
import UserNavbar from "./UserNavbar";
import Footer from "../Visitor-side/Footer";
import { useParams } from "react-router-dom";

const AssessmentResults = () => {
    const [assessmentData, setAssessmentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { assessmentId } = useParams();

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

    const { riasec, bigFive, programRecommendations } = assessmentData;

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
            </main>
            <Footer />
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

            