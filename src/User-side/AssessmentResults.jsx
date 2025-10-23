// src/pages/AssessmentResults.jsx
import React from "react";
import { useState, useEffect } from "react";
import { FiDownload, FiStar, FiCheckCircle, FiFileText, FiX } from "react-icons/fi";
import { UserCircle2, SquarePen } from "lucide-react";
import UserNavbar from "./UserNavbar";
import Footer from "../Visitor-side/Footer";
import { useParams } from "react-router-dom";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';



const AssessmentResults = () => {
    const [userData, setUserData] = useState(null);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    
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

    const generatePDF = async () => {
        try {
            const downloadBtn = document.querySelector('.download-btn');
            if (downloadBtn) {
                downloadBtn.disabled = true;
                downloadBtn.innerHTML = 'Generating PDF...';
            }

            // Create a new container for PDF content
            const pdfContainer = document.createElement('div');
            pdfContainer.className = 'pdf-container bg-white p-8 max-w-4xl mx-auto';
            pdfContainer.style.width = '794px'; // A4 width in pixels
            pdfContainer.style.minHeight = '1123px'; // A4 height in pixels
            pdfContainer.style.fontFamily = 'Arial, sans-serif';

            // Add PDF content
            pdfContainer.innerHTML = `
                <div class="pdf-content">
                    <!-- Header -->
                    <div class="text-center mb-8 border-b-2 border-blue-500 pb-4">
                        <h1 class="text-3xl font-bold text-blue-600 mb-2">ASSESSMENT RESULTS</h1>
                        <p class="text-gray-600 text-lg">Career Guidance Assessment Report</p>
                        <div class="flex justify-center gap-8 mt-4 text-sm text-gray-500">
                            <span>Assessment ID: ${assessmentId}</span>
                            <span>Date: ${new Date().toLocaleDateString()}</span>
                        </div>
                    </div>

                    <!-- RIASEC Results -->
                    ${riasec ? `
                    <div class="mb-8">
                        <h2 class="text-xl font-bold text-blue-700 mb-4 flex items-center">
                            <div class="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            RIASEC Interest Profile
                        </h2>
                        <div class="bg-gray-50 rounded-lg p-4">
                            ${Object.entries(riasec)
                                .filter(([trait]) => trait !== 'riasecResult_ID')
                                .map(([trait, value]) => `
                                <div class="mb-3">
                                    <div class="flex justify-between items-center mb-1">
                                        <span class="font-semibold text-gray-700 capitalize">${trait}</span>
                                        <span class="text-blue-600 font-bold">${value}%</span>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-3">
                                        <div class="bg-blue-500 h-3 rounded-full" style="width: ${value}%"></div>
                                    </div>
                                    <p class="text-xs text-gray-500 mt-1">${riasecDescriptions[trait] || 'No description available'}</p>
                                </div>
                                `).join('')}
                        </div>
                    </div>
                    ` : ''}

                    <!-- Big Five Results -->
                    ${bigFive ? `
                    <div class="mb-8">
                        <h2 class="text-xl font-bold text-purple-700 mb-4 flex items-center">
                            <div class="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                            Big Five Personality Traits
                        </h2>
                        <div class="bg-gray-50 rounded-lg p-4">
                            ${Object.entries(bigFive)
                                .filter(([trait]) => trait !== 'bigFiveResult_ID')
                                .map(([trait, value]) => `
                                <div class="mb-3">
                                    <div class="flex justify-between items-center mb-1">
                                        <span class="font-semibold text-gray-700 capitalize">${trait}</span>
                                        <span class="text-purple-600 font-bold">${value}%</span>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-3">
                                        <div class="bg-purple-500 h-3 rounded-full" style="width: ${value}%"></div>
                                    </div>
                                    <p class="text-xs text-gray-500 mt-1">${bigFiveDescriptions[trait] || 'No description available'}</p>
                                </div>
                                `).join('')}
                        </div>
                    </div>
                    ` : ''}

                    <!-- Program Recommendations -->
                    ${programRecommendations && (programRecommendations.track_aligned?.length > 0 || programRecommendations.cross_track?.length > 0) ? `
                    <div class="mb-8">
                        <h2 class="text-xl font-bold text-green-700 mb-4 flex items-center">
                            <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            Program Recommendations
                        </h2>

                        <!-- Track Aligned Programs -->
                        ${programRecommendations.track_aligned?.length > 0 ? `
                        <div class="mb-6">
                            <h3 class="text-lg font-semibold text-green-600 mb-3">Track-Aligned Programs</h3>
                            <div class="space-y-4">
                                ${programRecommendations.track_aligned.map((program, index) => {
                                    const programName = program.programDetails?.programName || 'Unknown Program';
                                    const collegeName = program.collegeDetails?.collegeName;
                                    const alignmentScore = parseFloat(program.recommendation.alignmentScore) || 0;
                                    const breakdown = program.recommendation.breakdown || {};
                                    
                                    return `
                                    <div class="border border-green-200 rounded-lg p-4 bg-green-50">
                                        <div class="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 class="font-bold text-gray-800 text-lg">${index + 1}. ${programName}</h4>
                                                ${collegeName ? `<p class="text-sm text-gray-600">${collegeName}</p>` : ''}
                                            </div>
                                            <span class="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold">
                                                ${alignmentScore}% Match
                                            </span>
                                        </div>
                                        
                                        <!-- Breakdown Scores -->
                                        <div class="grid grid-cols-2 gap-2 mt-3 mb-3">
                                            ${breakdown.Track ? `
                                            <div class="text-center">
                                                <div class="text-xs text-gray-500">Track</div>
                                                <div class="font-bold text-green-600">${breakdown.Track}%</div>
                                            </div>
                                            ` : ''}
                                            ${breakdown.RIASEC ? `
                                            <div class="text-center">
                                                <div class="text-xs text-gray-500">RIASEC</div>
                                                <div class="font-bold text-blue-600">${breakdown.RIASEC}%</div>
                                            </div>
                                            ` : ''}
                                            ${breakdown.BigFive ? `
                                            <div class="text-center">
                                                <div class="text-xs text-gray-500">Big Five</div>
                                                <div class="font-bold text-purple-600">${breakdown.BigFive}%</div>
                                            </div>
                                            ` : ''}
                                            ${breakdown.Academic ? `
                                            <div class="text-center">
                                                <div class="text-xs text-gray-500">Academic</div>
                                                <div class="font-bold text-orange-600">${breakdown.Academic}%</div>
                                            </div>
                                            ` : ''}
                                        </div>

                                        <!-- Career Paths -->
                                        ${program.programDetails?.careerPaths ? `
                                        <div class="mt-2">
                                            <p class="text-sm font-semibold text-gray-600 mb-1">Potential Career Paths:</p>
                                            <div class="flex flex-wrap gap-1">
                                                ${(() => {
                                                    try {
                                                        const careers = typeof program.programDetails.careerPaths === 'string' 
                                                            ? JSON.parse(program.programDetails.careerPaths) 
                                                            : program.programDetails.careerPaths;
                                                        
                                                        if (Array.isArray(careers)) {
                                                            return careers.slice(0, 3).map(career => 
                                                                `<span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">${career}</span>`
                                                            ).join('');
                                                        }
                                                        return `<span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">${program.programDetails.careerPaths}</span>`;
                                                    } catch (error) {
                                                        return `<span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Career data available</span>`;
                                                    }
                                                })()}
                                            </div>
                                        </div>
                                        ` : ''}
                                    </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                        ` : ''}

                        <!-- Cross Track Programs -->
                        ${programRecommendations.cross_track?.length > 0 ? `
                        <div class="mb-6">
                            <h3 class="text-lg font-semibold text-blue-600 mb-3">Cross-Track Programs</h3>
                            <div class="space-y-4">
                                ${programRecommendations.cross_track.map((program, index) => {
                                    const programName = program.programDetails?.programName || 'Unknown Program';
                                    const collegeName = program.collegeDetails?.collegeName;
                                    const alignmentScore = parseFloat(program.recommendation.alignmentScore) || 0;
                                    const breakdown = program.recommendation.breakdown || {};
                                    
                                    return `
                                    <div class="border border-blue-200 rounded-lg p-4 bg-blue-50">
                                        <div class="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 class="font-bold text-gray-800 text-lg">${index + 1}. ${programName}</h4>
                                                ${collegeName ? `<p class="text-sm text-gray-600">${collegeName}</p>` : ''}
                                            </div>
                                            <span class="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-bold">
                                                ${alignmentScore}% Match
                                            </span>
                                        </div>
                                        
                                        <!-- Breakdown Scores -->
                                        <div class="grid grid-cols-2 gap-2 mt-3 mb-3">
                                            ${breakdown.Track ? `
                                            <div class="text-center">
                                                <div class="text-xs text-gray-500">Track</div>
                                                <div class="font-bold text-green-600">${breakdown.Track}%</div>
                                            </div>
                                            ` : ''}
                                            ${breakdown.RIASEC ? `
                                            <div class="text-center">
                                                <div class="text-xs text-gray-500">RIASEC</div>
                                                <div class="font-bold text-blue-600">${breakdown.RIASEC}%</div>
                                            </div>
                                            ` : ''}
                                            ${breakdown.BigFive ? `
                                            <div class="text-center">
                                                <div class="text-xs text-gray-500">Big Five</div>
                                                <div class="font-bold text-purple-600">${breakdown.BigFive}%</div>
                                            </div>
                                            ` : ''}
                                            ${breakdown.Academic ? `
                                            <div class="text-center">
                                                <div class="text-xs text-gray-500">Academic</div>
                                                <div class="font-bold text-orange-600">${breakdown.Academic}%</div>
                                            </div>
                                            ` : ''}
                                        </div>

                                        <!-- Career Paths -->
                                        ${program.programDetails?.careerPaths ? `
                                        <div class="mt-2">
                                            <p class="text-sm font-semibold text-gray-600 mb-1">Potential Career Paths:</p>
                                            <div class="flex flex-wrap gap-1">
                                                ${(() => {
                                                    try {
                                                        const careers = typeof program.programDetails.careerPaths === 'string' 
                                                            ? JSON.parse(program.programDetails.careerPaths) 
                                                            : program.programDetails.careerPaths;
                                                        
                                                        if (Array.isArray(careers)) {
                                                            return careers.slice(0, 3).map(career => 
                                                                `<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">${career}</span>`
                                                            ).join('');
                                                        }
                                                        return `<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">${program.programDetails.careerPaths}</span>`;
                                                    } catch (error) {
                                                        return `<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Career data available</span>`;
                                                    }
                                                })()}
                                            </div>
                                        </div>
                                        ` : ''}
                                    </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                        ` : ''}
                    </div>
                    ` : ''}

                    <!-- Footer -->
                    <div class="mt-12 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
                        <p>Generated by Career Guidance System • ${new Date().toLocaleDateString()}</p>
                        <p class="mt-1">Confidential Assessment Report - For Personal Use Only</p>
                    </div>
                </div>
            `;

            // Append to body temporarily
            document.body.appendChild(pdfContainer);

            // Generate PDF
            const canvas = await html2canvas(pdfContainer, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                width: pdfContainer.scrollWidth,
                height: pdfContainer.scrollHeight
            });

            // Remove the temporary container
            document.body.removeChild(pdfContainer);

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`career-assessment-${assessmentId}.pdf`);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        } finally {
            // Reset button state
            const downloadBtn = document.querySelector('.download-btn');
            if (downloadBtn) {
                downloadBtn.disabled = false;
                downloadBtn.innerHTML = '<FiDownload className="text-base" /> Download Results';
            }
        }
    };

    // Alternative simpler PDF generation (text-based)
    const generateTextPDF = () => {
        const pdf = new jsPDF();
        
        // Add title
        pdf.setFontSize(20);
        pdf.text('ASSESSMENT RESULTS', 105, 15, { align: 'center' });
        pdf.setFontSize(12);
        pdf.text('YOUR PERSONALIZED CAREER ASSESSMENT ANALYSIS', 105, 22, { align: 'center' });
        
        let yPosition = 40;

        // Add RIASEC Results
        if (riasec) {
            pdf.setFontSize(16);
            pdf.text('RIASEC INTEREST RESULTS', 20, yPosition);
            yPosition += 10;
            
            pdf.setFontSize(10);
            Object.entries(riasec).forEach(([trait, value]) => {
                if (trait !== 'riasecResult_ID' && yPosition < 280) {
                    pdf.text(`${trait.charAt(0).toUpperCase() + trait.slice(1)}: ${value}%`, 20, yPosition);
                    yPosition += 7;
                }
            });
            yPosition += 10;
        }

        // Add Big Five Results
        if (bigFive) {
            if (yPosition > 270) {
                pdf.addPage();
                yPosition = 20;
            }
            
            pdf.setFontSize(16);
            pdf.text('BIG FIVE PERSONALITY RESULTS', 20, yPosition);
            yPosition += 10;
            
            pdf.setFontSize(10);
            Object.entries(bigFive).forEach(([trait, value]) => {
                if (trait !== 'bigFiveResult_ID' && yPosition < 280) {
                    pdf.text(`${trait.charAt(0).toUpperCase() + trait.slice(1)}: ${value}%`, 20, yPosition);
                    yPosition += 7;
                }
            });
            yPosition += 10;
        }

        // Add Program Recommendations
        if (programRecommendations && (programRecommendations.track_aligned?.length > 0 || programRecommendations.cross_track?.length > 0)) {
            if (yPosition > 250) {
                pdf.addPage();
                yPosition = 20;
            }
            
            pdf.setFontSize(16);
            pdf.text('PROGRAM RECOMMENDATIONS', 20, yPosition);
            yPosition += 10;
            
            pdf.setFontSize(12);
            
            // Track Aligned Programs
            if (programRecommendations.track_aligned?.length > 0) {
                pdf.text('Track-Aligned Programs:', 20, yPosition);
                yPosition += 8;
                
                pdf.setFontSize(10);
                programRecommendations.track_aligned.forEach((program, index) => {
                    if (yPosition > 270) {
                        pdf.addPage();
                        yPosition = 20;
                    }
                    
                    const programName = program.programDetails?.programName || 'Unknown Program';
                    const alignmentScore = parseFloat(program.recommendation.alignmentScore) || 0;
                    
                    pdf.text(`${index + 1}. ${programName} (${alignmentScore}% match)`, 25, yPosition);
                    yPosition += 5;
                    
                    if (program.collegeDetails?.collegeName) {
                        pdf.text(`   College: ${program.collegeDetails.collegeName}`, 25, yPosition);
                        yPosition += 5;
                    }
                    yPosition += 3;
                });
                yPosition += 5;
            }

            // Cross Track Programs
            if (programRecommendations.cross_track?.length > 0) {
                if (yPosition > 250) {
                    pdf.addPage();
                    yPosition = 20;
                }
                
                pdf.setFontSize(12);
                pdf.text('Cross-Track Programs:', 20, yPosition);
                yPosition += 8;
                
                pdf.setFontSize(10);
                programRecommendations.cross_track.forEach((program, index) => {
                    if (yPosition > 270) {
                        pdf.addPage();
                        yPosition = 20;
                    }
                    
                    const programName = program.programDetails?.programName || 'Unknown Program';
                    const alignmentScore = parseFloat(program.recommendation.alignmentScore) || 0;
                    
                    pdf.text(`${index + 1}. ${programName} (${alignmentScore}% match)`, 25, yPosition);
                    yPosition += 5;
                    
                    if (program.collegeDetails?.collegeName) {
                        pdf.text(`   College: ${program.collegeDetails.collegeName}`, 25, yPosition);
                        yPosition += 5;
                    }
                    yPosition += 3;
                });
            }
        }

        // Add footer
        const pageCount = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.text(`Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`, 105, 287, { align: 'center' });
        }

        pdf.save(`assessment-results-${assessmentId}.pdf`);
    };

    const formatGrade = (grade) => {
        return grade !== null && grade !== undefined ? grade : 'N/A';
    };

    
    const handleDownload = async () => {
        setIsGeneratingPDF(true);
        try {
            generatePDF();
        } catch (error) {
            console.error('PDF generation failed:', error);
        } finally {
            setIsGeneratingPDF(false);
        }
    };

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
            </main>
            <Footer />
            <RatingModal />
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

            