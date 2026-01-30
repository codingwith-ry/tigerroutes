// src/pages/AssessmentResults.jsx
import React from "react";
import { useAuth } from "../utils/AuthContext";
import { useState, useEffect } from "react";
import { FiDownload, FiStar, FiCheckCircle, FiFileText, FiX, FiGift, FiInfo, FiAlertTriangle } from "react-icons/fi";
import { BsBriefcase, BsPerson } from "react-icons/bs";
import { FaUserTie, FaEnvelope } from "react-icons/fa";
import { UserCircle2, SquarePen } from "lucide-react";
import UserNavbar from "./UserNavbar";
import Footer from "../Visitor-side/Footer";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import generatePDF from "./generatePDF";
import PropTypes from "prop-types";

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
        onClose();
    };

    const handleClose = () => {
        // Reset state when closing
        setRating(0);
        setHoverRating(0);
        setFeedback('');
        onClose();
    };

    // Check if form is valid (both rating and feedback are provided)
    const isFormValid = rating > 0 && feedback.trim().length > 0;

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
                        placeholder="Provide your feedback, for counselors to assess your satisfaction."
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-300 focus:border-transparent min-h-[100px] resize-none"
                        required
                    />
                    {feedback.trim().length === 0 && (
                        <p className="text-red-500 text-sm mt-1">Please provide feedback before submitting</p>
                    )}
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
                        disabled={!isFormValid}
                        className={`px-6 py-2 rounded-lg font-medium ${
                            isFormValid
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

const TopTraitsSection = ({ riasec, bigFive }) => {
    const getTopThree = (obj) =>
        Object.entries(obj || {})
            .filter(([k]) => !/id$/i.test(k)) // ignore ID fields
            .map(([trait, value]) => ({ trait, value: Number(value || 0) }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 3);

    const riasecShort = {
        realistic: "Individuals with strong Realistic traits enjoy hands-on activities, working with tools, machines, and physical environments. They prefer practical tasks, outdoor work, mechanics, engineering, operating equipment, or building things. They often value measurable results, physical activity, and real-world problem solving over abstract theories or social interaction.",
        
        investigative: "Investigative individuals are analytical, curious, and enjoy exploring ideas through research, experimentation, and critical thinking. They like tasks involving science, technology, mathematics, and problem-solving. They value logic, accuracy, and understanding how things work. They often prefer independent work that requires deep thought and discovery.",
        
        artistic: "Artistic individuals thrive in creative, expressive, and flexible environments. They enjoy tasks involving imagination, design, writing, music, performance, or the visual arts. They prefer unstructured tasks that allow originality, emotional expression, and innovation. They value beauty, aesthetics, and the freedom to break conventions.",
        
        social: "People high in Social traits enjoy helping, teaching, guiding, counseling, and collaborating with others. They excel in empathetic communication, teamwork, and community-oriented work. They prefer roles where they can support, inspire, or care for people. They value human connection, service, and positive interpersonal relationships.",
        
        enterprising: "Enterprising individuals are persuasive, influential, and motivated by leadership roles. They enjoy initiating projects, managing teams, taking risks, and driving business or organizational success. They excel in entrepreneurship, sales, marketing, public speaking, and strategic decision-making. They value achievement, influence, and competitive environments.",
        
        conventional: "Conventional individuals are organized, detail-oriented, and thrive in structured environments. They enjoy tasks that involve planning, data management, documentation, processes, and systems. They excel in administrative work, accounting, information organization, and ensuring operational efficiency. They value accuracy, order, and reliability."
    };

    const bigFiveShort = {
        openness: "Openness reflects creativity, imagination, intellectual curiosity, and a willingness to explore new ideas and experiences. Individuals high in Openness enjoy learning, innovation, art, diverse cultures, and abstract thinking. They tend to be flexible, original, and comfortable with change and unconventional concepts.",
        
        conscientiousness: "Conscientiousness represents discipline, organization, responsibility, and strong work ethic. People high in this trait are reliable, goal-oriented, careful with details, and good at planning. They value order, structure, and achievement, often excelling in tasks that require persistence, focus, and time management.",
        
        extraversion: "Extraversion describes sociability, energy, assertiveness, and enthusiasm in social settings. Extroverted individuals enjoy interacting with people, leading conversations, participating in group activities, and staying active. They gain energy from social engagement and are often expressive, outgoing, and action-oriented.",
        
        agreeableness: "Agreeableness reflects empathy, kindness, trust, and a cooperative attitude. Individuals high in this trait enjoy helping others, building harmonious relationships, and avoiding conflict. They tend to be supportive, compassionate, patient, and considerate, valuing fairness and collaboration over competition.",
        
        neuroticism: "Neuroticism represents emotional sensitivity, vulnerability to stress, and tendency to experience emotions like anxiety, worry, or mood shifts. People higher in this trait may react more strongly to challenges or pressure. While they may be more cautious or reflective, they benefit from supportive environments and clear emotional grounding."
    };


    const riasecTop = getTopThree(riasec);
    const bigFiveTop = getTopThree(bigFive);

    return (
        <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow border border-blue-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <BsBriefcase className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-bold text-lg text-gray-800">Top 3 RIASEC Traits</h4>
                </div>
                <ul className="space-y-4">
                    {riasecTop.map((t, idx) => (
                        <li key={t.trait} className="group">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                        {idx + 1}
                                    </span>
                                    <div className="font-semibold text-gray-800 capitalize">{t.trait}</div>
                                </div>
                                <div className="text-blue-600 font-bold text-lg">{t.value}%</div>
                            </div>
                            <div className="text-xs text-gray-600 ml-8 mb-2">{riasecShort[t.trait] || ''}</div>
                            <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden ml-8" style={{ width: 'calc(100% - 2rem)' }}>
                                <div 
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${t.value}%` }}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="bg-white rounded-2xl shadow border border-purple-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <BsPerson className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-bold text-lg text-gray-800">Top 3 Big Five Traits</h4>
                </div>
                <ul className="space-y-4">
                    {bigFiveTop.map((t, idx) => (
                        <li key={t.trait} className="group">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                        {idx + 1}
                                    </span>
                                    <div className="font-semibold text-gray-800 capitalize">{t.trait}</div>
                                </div>
                                <div className="text-purple-600 font-bold text-lg">{t.value}%</div>
                            </div>
                            <div className="text-xs text-gray-600 ml-8 mb-2">{bigFiveShort[t.trait] || ''}</div>
                            <div className="w-full bg-purple-100 rounded-full h-2 overflow-hidden ml-8" style={{ width: 'calc(100% - 2rem)' }}>
                                <div 
                                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${t.value}%` }}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const AssessmentResults = () => {
    const { user, loading: authLoading } = useAuth();
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
            confirmButtonColor: '#FACC15',
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${process.env.REACT_APP_API_URL}/api/assessment/submitRating`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(ratingData)
                })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Thank You!',
                            text: 'Your rating has been submitted successfully.',
                            confirmButtonColor: '#FACC15',
                        }).then(() => {
                            // reload the page after user closes the success modal
                            window.location.reload();
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Submission Failed',
                            text: data.message || 'There was an error submitting your rating. Please try again later.',
                        });
                    }
                })
                .catch(() => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Submission Failed',
                        text: 'There was an error submitting your rating. Please try again later.',
                    });
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
        
        if (!authLoading && user) {
            fetchAssessmentDetails();
        }
    }, [authLoading]);

    const fetchAssessmentDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/assessment/assessmentDetails`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assessmentID: assessmentId, studentAccountId: user.studentAccount_ID })
            });
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

    const sortedTrackAligned = (programRecommendations?.track_aligned || [])
     .slice()
     .sort((a, b) => {
       const aScore = parseFloat(a?.recommendation?.alignmentScore) || 0;
       const bScore = parseFloat(b?.recommendation?.alignmentScore) || 0;
       return bScore - aScore; // descending
     });

   const sortedCrossTrack = (programRecommendations?.cross_track || [])
     .slice()
     .sort((a, b) => {
       const aScore = parseFloat(a?.recommendation?.alignmentScore) || 0;
       const bScore = parseFloat(b?.recommendation?.alignmentScore) || 0;
       return bScore - aScore;
    });

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
                    className="bg-white rounded-lg shadow p-5 border"
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
                            <p className="pl-5 mt-3 text-gray-500">As of {new Date(assessmentProfile.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.</p>
                            </div>
                        </div>
                        
                        </div>

                        {/* Mobile Layout */}
                        <div className="block sm:hidden space-y-3 text-sm">
                            <div>
                                <span className="font-semibold">Name:</span>
                                <p className="mt-1">{assessmentProfile?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="font-semibold">Email:</span>
                                <p className="break-words mt-1">{assessmentProfile?.email || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="font-semibold">Grade Level:</span>
                                <p className="mt-1">{assessmentProfile?.gradeLevel || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="font-semibold">Strand:</span>
                                <p className="mt-1">{assessmentProfile?.strandName || assessmentProfile?.strand || 'N/A'}</p>
                            </div>

                            {/* Grades block */}
                            <div className="pt-3 border-t border-gray-200">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="font-semibold">Math Grade:</span>
                                        <p className="mt-1">{formatGrade(assessmentProfile?.mathGrade)}</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold">Science Grade:</span>
                                        <p className="mt-1">{formatGrade(assessmentProfile?.scienceGrade)}</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold">English Grade:</span>
                                        <p className="mt-1">{formatGrade(assessmentProfile?.englishGrade)}</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold">Average Grade:</span>
                                        <p className="mt-1">{formatGrade(assessmentProfile?.genAverageGrade)}</p>
                                    </div>
                                </div>

                                <p className="mt-3 text-gray-500 text-xs">
                                    As of {assessmentProfile?.date ? new Date(assessmentProfile.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : 'N/A'}.
                                </p>
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

                <TopTraitsSection riasec={riasec} bigFive={bigFive} />

                {/* Program Recommendations Section */}
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex items-start justify-between text-center">
                        <h3 className="flex items-center text-lg font-semibold mb-3">
                            <FiFileText className="text-yellow-500 w-6 h-6 mr-2" />
                            Program Recommendations
                        </h3>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="inline-block w-3 h-3 bg-green-600 rounded-full" />
                                <span>High alignment (≥ 80%)</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="inline-block w-3 h-3 bg-yellow-600 rounded-full" />
                                <span>Moderate alignment (60–79%)</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="inline-block w-3 h-3 bg-red-600 rounded-full" />
                                <span>Low alignment (&lt; 60%)</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 mb-4">
                        Based on your assessment results, here are some recommended programs
                        and potential career paths:
                    </p>

                    {/* Track-Aligned Programs */}
                    {programRecommendations?.track_aligned && programRecommendations.track_aligned.length > 0 && (
                        <>
                            <h4 className="text-lg font-semibold mb-3">Track-Aligned Programs</h4>
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                {sortedTrackAligned.map((program, idx) => (
                                    <ProgramCard 
                                        key={program.recommendation.recommendation_ID || idx}
                                        program={program}
                                        index={idx}
                                        type="track_aligned"l
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {/* Cross-Track Programs */}
                    {programRecommendations?.cross_track && programRecommendations.cross_track.length > 0 && (
                        <>
                            <h4 className="text-lg font-semibold mb-3">Cross-Track Programs</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
                                {sortedCrossTrack.map((program, idx) => (
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
                            <p className="text-sm mt-2">This can happen if the scorer service is unavailable or returned no matches.</p>
                            <div className="mt-4">
                                <p className="text-sm text-gray-500">If you need recommendations regenerated please contact an administrator.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Congratulatory Section */}
                <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 rounded-xl shadow-lg p-8 border-2 border-yellow-200">
                    {/* Celebration Icon */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 shadow-lg">
                            <FiGift size={36} className="text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            Congratulations on Completing Your Assessment!
                        </h3>
                        <p className="text-gray-600 text-base">
                            You&rsquo;ve taken an important step in discovering your career path
                        </p>
                    </div>

                    {/* Main Message */}
                    <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
                        <div className="space-y-4 text-gray-700">
                            <p className="text-base leading-relaxed">
                                You&rsquo;ve successfully completed your career assessment and received personalized program recommendations based on your unique interests, personality traits, and academic background. This is a significant milestone in your journey toward finding the right college program at UST.
                            </p>
                            
                            <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <div className="flex-shrink-0 mt-1">
                                    <FiInfo className="text-2xl text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 mt-1 mb-2">Next Steps: Seek Professional Guidance</h4>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        While these recommendations provide valuable insights, we strongly encourage you to schedule a consultation with your <a className="hover:underline" href="https://www.ust.edu.ph/senior-high-school/" target='_blank' rel="noreferrer"><strong>guidance counselor</strong></a> to discuss your results in detail. They can help you understand your assessment better and guide you through the decision-making process.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-lg border border-amber-200">
                                <div className="flex-shrink-0 mt-1">
                                    <FiAlertTriangle className="text-2xl text-yellow-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 mt-1 mb-2">Important Reminder</h4>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        TigerRoutes is a <strong>recommendation system</strong> designed to provide guidance based on psychometric assessments and academic data. These recommendations should not be your sole basis for decision-making. Your final choice should combine:
                                    </p>
                                    <ul className="mt-2 space-y-1 text-sm text-gray-700 ml-4">
                                        <li className="flex items-start gap-2">
                                            <span className="text-yellow-600 font-bold">•</span>
                                            <span>Professional advice from guidance counselors and career advisors</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-yellow-600 font-bold">•</span>
                                            <span>Your personal interests, values, and long-term goals</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-yellow-600 font-bold">•</span>
                                            <span>Family considerations and practical circumstances</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-yellow-600 font-bold">•</span>
                                            <span>Further research about the programs and career paths</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Message */}
                    <div className="mt-6 text-center">
                        <p className="text-md font-bold text-gray-600 italic">
                            Remember: The right program is the one that aligns with your passions, strengths, and future aspirations. Trust your journey! 🌟
                        </p>
                    </div>
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
                        <h3 className="font-semibold text-lg mb-3">Counselor&rsquo;s Response</h3>
                        {assessmentData.counselorNotes ? (
                            <div className="div">
                            <div className="flex-1">
                                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-t-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                {/* Counselor Information */}
                                <div className="flex flex-col">
                                    <span className="text-md font-bold text-white flex items-center gap-3">
                                        <FaUserTie className="text-md" />
                                        {assessmentData.counselorNotes.counselorName || 'Counselor Name'}
                                    </span>

                                    <span className="text-sm text-white flex items-center gap-3">
                                        <FaEnvelope className="text-md" />
                                        {assessmentData.counselorNotes.email || 'Counselor Email'}
                                    </span>
                                </div>

                                {/* Consultation Details Button */}
                                <div className="flex sm:flex-col">
                                    <button
                                        onClick={() => {
                                            const officeDetails = assessmentData.counselorNotes.officeDetails || 'No office details available.';
                                            const consultationSchedule = assessmentData.counselorNotes.consultationDetails || ['No schedule available.'];

                                            Swal.fire({
                                                html: `
                                                    <div class="text-left space-y-5 mt-5">
                                                        <!-- Office Details Card -->
                                                        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow duration-300">
                                                            <div class="flex items-start gap-3 mb-3">
                                                                <div class="bg-blue-500 p-2 rounded-lg shadow-md">
                                                                    <i class="fas fa-building text-white text-lg"></i>
                                                                </div>
                                                                <div class="flex-1">
                                                                    <p class="font-bold text-blue-700 text-lg mb-2">Office Details</p>
                                                                    <div class="bg-white rounded-lg p-3 shadow-sm">
                                                                        <p class="text-gray-700 leading-relaxed">${officeDetails}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <!-- Consultation Schedule Card -->
                                                        <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-l-4 border-purple-500 shadow-sm hover:shadow-md transition-shadow duration-300">
                                                            <div class="flex items-start gap-3 mb-3">
                                                                <div class="bg-purple-500 p-2 rounded-lg shadow-md">
                                                                    <i class="fas fa-calendar-alt text-white text-lg"></i>
                                                                </div>
                                                                <div class="flex-1">
                                                                    <p class="font-bold text-purple-700 text-lg mb-3">Consultation Schedule</p>
                                                                    <ul class="space-y-2">
                                                                        <li class="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 border border-purple-100">
                                                                            <div class="bg-purple-100 p-2 rounded-full">
                                                                                <i class="fas fa-clock text-purple-600 text-sm"></i>
                                                                            </div>
                                                                            <span class="text-gray-700 font-medium">${consultationSchedule}</span>
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <!-- Info Banner -->
                                                        <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200 flex items-start gap-3">
                                                            <i class="fas fa-info-circle text-green-600 text-xl mt-0.5"></i>
                                                            <p class="text-sm text-gray-700">
                                                                <span class="font-semibold text-green-700">Note:</span> Please arrive 5 minutes early for your consultation appointment.
                                                            </p>
                                                        </div>
                                                    </div>
                                                `,
                                                showCloseButton: true,
                                                confirmButtonText: `
                                                    <span class="flex items-center gap-2">
                                                        <span class="font-semibold">Got it!</span>
                                                    </span>
                                                `,
                                                confirmButtonColor: '#3b82f6',
                                                width: '600px',
                                                padding: '2rem',
                                                customClass: {
                                                    popup: 'rounded-2xl shadow-2xl border border-gray-100',
                                                    title: 'text-gray-800',
                                                    htmlContainer: 'text-gray-600',
                                                    confirmButton: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200',
                                                    closeButton: 'text-gray-400 hover:text-gray-600 transition-colors duration-200'
                                                },
                                                backdrop: `
                                                    rgba(0,0,0,0.4)
                                                    url("/images/nyan-cat.gif")
                                                    left top
                                                    no-repeat
                                                `
                                            });
                                        }}
                                        className="bg-white text-blue-600 font-medium px-4 py-2 rounded-lg shadow hover:bg-blue-100 transition-all duration-300"
                                    >
                                        Consultation Details
                                    </button>
                                </div>
                            </div>
                                
                                <div className="">
                                    <p className="text-sm text-gray-700 bg-blue-50 p-4 rounded-b-lg border border-blue-200">
                                    {assessmentData.counselorNotes.counselorNotes || 'No notes provided by the counselor.'}
                                    <div className="space-y-2 mt-2">
                                        <div className="flex items-center gap-2 text-gray-700">
                                        <span className='text-xs'>On {new Date(assessmentData.counselorNotes.date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        })}</span>
                                        </div>
                                    </div>
                                    </p>
                                    <span className="text-xs text-gray-500 mt-2 block">
                                        Please schedule an appointment with your counselor for any further questions or clarifications.
                                    </span>
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
                        <h3 className="font-semibold text-lg">What&rsquo;s Next?</h3>
                        <p className="text-sm text-gray-500">Share your feedback and donwload your results!</p>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setIsRatingModalOpen(true)}
                            className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-lg text-blue-700"
                        >
                            <FiStar className="text-base"/> Rate Experience
                        </button>

                        {/* Disabled download with hover tooltip explaining requirement */}
                        <div className="relative group">
                            <button
                                onClick={handleDownload}
                                disabled={true}
                                aria-disabled="true"
                                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-gray-400 cursor-not-allowed text-white opacity-90"
                            >
                                <FiDownload className="text-base" />
                                Download Results
                            </button>

                            <div className="pointer-events-none absolute bottom-full right-0 mb-2 w-64 hidden group-hover:block z-50">
                                <div className="bg-gray-800 text-white text-xs rounded py-2 px-3 shadow">
                                    Please submit your rating and feedback before downloading your results.
                                </div>
                            </div>
                        </div>
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
                <a 
                    href={programDetails?.programUSTlink || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="font-semibold text-lg flex items-center group"
                >
                    <span 
                        className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 text-[11px] sm:text-xs ${
                            type === 'track_aligned' ? 'bg-green-500' : 'bg-blue-500'
                        } text-white font-bold rounded-full mr-2 sm:mr-3 flex-shrink-0 leading-none`}
                    >
                        {index + 1}
                    </span>
                    <span 
                        className="relative text-gray-800 group-hover:text-blue-500 transition-colors duration-300"
                    >
                        {programDetails?.programName || 'Unknown Program'}
                        <span 
                            className="absolute left-0 bottom-0 w-0 h-[2px] bg-blue-500 transition-all duration-300 group-hover:w-full"
                        />
                    </span>
                </a>
                 <span className={`font-bold ${
                     alignmentScore >= 80 ? 'text-green-600' : 
                     alignmentScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                 }`}>
                     {alignmentScore}% match
                 </span>
             </div>

            {/* College Information */}
            {collegeDetails?.collegeName && (
                <div className="mb-3 flex flex-wrap gap-2">
                    <a 
                        href={collegeDetails?.collegeUSTlink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap transition-all duration-300 transform hover:bg-gray-200 hover:scale-105 hover:shadow-md"
                    >
                        {collegeDetails.collegeName}
                    </a>
                     {type === 'track_aligned' && (
                        <span className="bg-green-100 text-green-800 font-medium px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap">
                             Track Aligned
                         </span>
                     )}
                     {type === 'cross_track' && (
                        <span className="bg-blue-100 text-blue-800 font-medium px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap">
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

RatingModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    assessmentId: PropTypes.string.isRequired
};

TopTraitsSection.propTypes = {
    riasec: PropTypes.object,
    bigFive: PropTypes.object
};

ProgramCard.propTypes = {
    program: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired
};


export default AssessmentResults;

