// src/pages/AssessmentResults.jsx
import React from "react";
import { useState, useEffect } from "react";
import { FiDownload, FiStar, FiCheckCircle, FiFileText } from "react-icons/fi";
import UserNavbar from "./UserNavbar";
import Footer from "../Visitor-side/Footer";

const AssessmentResults = () => {
    const [riasecResults, setRiasecResults] = useState(null);
    const [bigFiveResults, setBigFiveResults] = useState(null);

    useEffect(() => {
        // Fetch results from localStorage
        const storedRiasec = localStorage.getItem('riasecResults');
        const storedBigFive = localStorage.getItem('bigFiveResults');

        if (storedRiasec) {
            setRiasecResults(JSON.parse(storedRiasec));
        }
        if (storedBigFive) {
            setBigFiveResults(JSON.parse(storedBigFive));
        }
    }, []);

    // RIASEC descriptions
    const riasecDescriptions = {
        Realistic: "Hands-on, practical activities",
        Investigative: "Research and analytical thinking",
        Artistic: "Creative and expressive activities",
        Social: "Helping and working with people",
        Enterprising: "Leadership and business activities",
        Conventional: "Organized and structured work"
    };

    // Big Five descriptions
    const bigFiveDescriptions = {
        Openness: "Creativity and openness to experience",
        Conscientiousness: "Organization and self-discipline",
        Extraversion: "Sociability and assertiveness",
        Agreeableness: "Cooperation and trustworthiness",
        Neuroticism: "Emotional stability (lower is better)"
    };

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
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex items-center mb-2">
                        <FiCheckCircle className="text-green-500 w-6 h-6 mr-2" />
                        <h3 className="font-semibold text-lg">RIASEC Interest Results</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                        Your interests across the six RIASEC dimensions
                    </p>

                    {riasecResults && Object.entries(riasecResults).map(([trait, value], idx) => (
                        <div key={idx} className="flex mb-4">
                            <div className="w-1 rounded bg-blue-500 mr-3"></div>
                            <div className="flex-1">
                                <div className="flex justify-between text-sm font-semibold text-gray-600 mb-2">
                                    <span>{trait}</span>
                                    <span className="text-blue-500 font-bold">{value}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-200 rounded-full">
                                    <div
                                        className="h-2 bg-blue-500 rounded-full"
                                        style={{ width: `${value}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{riasecDescriptions[trait]}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Big Five Section */}
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex items-center mb-2">
                        <FiCheckCircle className="text-green-500 w-6 h-6 mr-2" />
                        <h3 className="font-semibold text-lg">Big Five Personality Results</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                        Your personality traits based on the Five-Factor Model
                    </p>

                    {bigFiveResults && Object.entries(bigFiveResults).map(([trait, value], idx) => (
                        <div key={idx} className="flex mb-4">
                            <div className="w-1 rounded bg-purple-500 mr-3"></div>
                            <div className="flex-1">
                                <div className="flex justify-between text-sm font-semibold text-gray-600 mb-2">
                                    <span>{trait}</span>
                                    <span className="text-purple-500 font-bold">{value}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-200 rounded-full">
                                    <div
                                        className="h-2 bg-purple-500 rounded-full"
                                        style={{ width: `${value}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{bigFiveDescriptions[trait]}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
                <Footer />
        </div>
    );
};

export default AssessmentResults;
