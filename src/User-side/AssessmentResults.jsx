// src/pages/AssessmentResults.jsx
import React from "react";
import { useState, useEffect } from "react";
import { FiDownload, FiStar, FiCheckCircle, FiFileText } from "react-icons/fi";
import UserNavbar from "./UserNavbar";
import Footer from "../Visitor-side/Footer";
import { useParams } from "react-router-dom";

const AssessmentResults = () => {
    const [riasecResults, setRiasecResults] = useState(null);
    const [bigFiveResults, setBigFiveResults] = useState(null);
    const {assessmentId} = useParams();

    useEffect(() => {
        document.title = 'Assessment | Results';
        const storedRiasec = localStorage.getItem('riasecResults');
        const storedBigFive = localStorage.getItem('bigFiveResults');

        if (storedRiasec) {
            setRiasecResults(JSON.parse(storedRiasec));
        }
        if (storedBigFive) {
            setBigFiveResults(JSON.parse(storedBigFive));
        }

        const assessmentDetails = fetch('http://localhost:5000/api/assessment/assessmentDetails', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            body:JSON.stringify({
                assessmentId: assessmentId
            })
        }).then(response => response.json())
        .then(data => {
             
        });

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

                    <h4 className="text-lg font-semibold mb-3">Track-Aligned Programs</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                        {
                            name: "Computer Science",
                            match: 92,
                            desc: "Students learn how to design algorithms, build software, and solve complex computing problems. The program dives into programming languages, databases, and artificial intelligence. Expect lots of coding, debugging, and project-based learning.",
                            why: ["High investigative score", "Strong analytical skills", "Social skills"],
                            careers: ["Software Engineer", "Systems Analyst", "Data Specialist"],
                        },
                        {
                            name: "Business Administration",
                            match: 85,
                            desc: "This program teaches students how to manage and grow businesses through marketing, finance, and strategy. You’ll work on business plans, case studies, and simulations. It’s ideal for future entrepreneurs, managers, and brand strategists.",
                            why: ["Leadership potential", "Collaborative mindset", "Strong enterprising traits"],
                            careers: ["Project Manager", "Entrepreneur", "Business Analyst"],
                        },
                        {
                            name: "Psychology",
                            match: 78,
                            desc: "You’ll explore how people think, feel, and behave through scientific theories and research. Students study mental health, personality, and behavior in different settings. Activities include interviews, assessments, and research projects.",
                            why: ["Strong enterprising traits", "Leadership qualities", "Social skills"],
                            careers: ["Counselor", "Research Psychologist", "HR Specialist"],
                        },
                        {
                            name: "Advertising Arts",
                            match: 72,
                            desc: "Students develop creative campaigns using visual communication, branding, and digital design tools. The program blends traditional art skills with modern software like Adobe Creative Suite. You’ll build a strong portfolio for careers in advertising and media.",
                            why: ["Artistic Inclination", "Creative thinking", "Visual communication"],
                            careers: ["Creative Director", "UX Designer", "Brand Designer"],
                        },
                        ].map((prog, idx) => (
                        <div key={idx} className="border p-4 rounded-lg shadow-sm flex flex-col mb-4">
                            <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-lg flex items-center">
                                <span className="flex items-center justify-center w-6 h-6 bg-yellow-500 text-white font-bold rounded-full mr-3">
                                    {idx + 1}
                                </span>
                                {prog.name}
                            </h4>
                            <span className="text-green-600 font-bold">{prog.match}% match</span>
                            </div>

                            <p className="text-sm text-gray-600 mb-3">{prog.desc}</p>

                            <p className="text-sm text-gray-500 mb-2">Why this program fits you:</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {prog.why.map((reason, i) => (
                                    <span key={i} className="bg-blue-100 text-blue-800 font-medium px-3 py-1 rounded-full text-sm">
                                        {reason}
                                    </span>
                                ))}
                            </div>

                            <p className="text-sm text-gray-500 mb-2">Potential Career Paths:</p>
                            <div className="flex flex-wrap gap-2 text-xs">
                            {prog.careers.map((c, i) => (
                                <span
                                key={i}
                                className="bg-green-100 text-green-800 font-medium px-2 py-1 rounded-full"
                                >
                                {c}
                                </span>
                            ))}
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AssessmentResults;
