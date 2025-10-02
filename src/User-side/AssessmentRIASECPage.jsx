import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserNavbar from "./UserNavbar";
import Footer from "../Visitor-side/Footer";
import { BookOpen, Brain, FileText } from "lucide-react";
import Swal from "sweetalert2";

const AssessmentRIASECPage = () => {
  useEffect(() => {
    document.title = "Assessment | RIASEC"; // text shown on the browser tab
    // set current assessment ID in local storage

    // optional: cleanup or restore old title
    return () => {
      document.title = "Default Title";
    };
  }, []);

  const navigate = useNavigate();

  const handleBigFiveTest = () => {
    navigate('/assessmentBigFive/' + localStorage.getItem('currentAssessmentId'));
  };

  const [activeStep] = useState("RIASEC");
  const [questions, setQuestions] = useState([]);
  const [choices, setChoices] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [scores, setScores] = useState({
    R: 0, // Realistic
    I: 0, // Investigative
    A: 0, // Artistic
    S: 0, // Social
    E: 0, // Enterprising
    C: 0, // Conventional
  });

  const calculateScores = (newAnswers) => {
    const traitScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    const traitCounts = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

    questions.forEach((question, index) => {
      const answer = newAnswers[index];
      if (answer !== undefined) {
        const trait = question.trait;
        if (answer === 1) {
          traitScores[trait] += 1;
        }
        traitCounts[trait]++;
      }
    });

    Object.keys(traitScores).forEach((trait) => {
      if (traitCounts[trait] > 0) {
        traitScores[trait] = Math.round(
          (traitScores[trait] / traitCounts[trait]) * 100
        );
      }
    });

    return traitScores;
  };

  useEffect(() => {
    fetch("/RIASEC&BigFive/RIASEC.json")
      .then((response) => response.json())
      .then((data) => {
        setQuestions(data.questions);
        setChoices(data.choices);
      })
      .catch((error) => console.error("Error loading questions:", error));
  }, []);

  const handleAnswer = (value) => {
    const newAnswers = {
      ...answers,
      [currentQuestionIndex]: value,
    };
    setAnswers(newAnswers);

    const newScores = calculateScores(newAnswers);
    setScores(newScores);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleTestComplete = (finalScores) => {
    const riasecResults = {
      Realistic: Math.round(finalScores.R),
      Investigative: Math.round(finalScores.I),
      Artistic: Math.round(finalScores.A),
      Social: Math.round(finalScores.S),
      Enterprising: Math.round(finalScores.E),
      Conventional: Math.round(finalScores.C),
    };

    localStorage.setItem("riasecAnswers", JSON.stringify(answers));
    localStorage.setItem("riasecResults", JSON.stringify(riasecResults));

    Swal.fire({
      title: "Congratulations!",
      text: "You are done answering the RIASEC section. Are you sure you want to proceed to Big Five?",
      icon: "success",
      showCancelButton: true,
      cancelButtonText: "Cancel",
      confirmButtonText: "Proceed",
      reverseButtons: true,
      customClass: {
        popup: "rounded-xl",
        title: "text-green-500 font-bold",
        confirmButton:
          "bg-yellow-400 text-white px-4 py-2 rounded-md hover:bg-yellow-500 ml-2",
        cancelButton:
          "bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 mr-2",
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        handleBigFiveTest();
      }
    });
  };

  const areAllQuestionsAnswered = () => {
    return Object.keys(answers).length === questions.length;
  };

  const getStepClass = (step) =>
    activeStep === step ? "text-[#FB9724]" : "text-gray-600";

  const getIconColor = (step) =>
    activeStep === step ? "#FB9724" : "currentColor";

  return (
    <div className="w-full min-h-screen bg-[#FFFCED] flex flex-col font-sfpro">
      <UserNavbar />

      <div className="flex flex-col items-center justify-start flex-1 mt-20 mb-20 px-4">
        <h1 className="text-3xl font-extrabold text-black mb-4 text-center tracking-[0.3em]">
          THE RIASEC TEST
        </h1>

        <div
          className="rounded-lg shadow border border-gray-300 w-full max-w-3xl p-6 mb-6"
          style={{ backgroundColor: "#E5EEFF" }}
        >
          <h2 className="font-semibold mb-2" style={{ color: "#195FD3" }}>
            Test Instructions
          </h2>
          <p className="text-sm" style={{ color: "#4285F4" }}>
            The test consists of questions about different activities that you will 
            rate as either "Like" or "Dislike" based on your preferences. Your honest 
            responses will help identify your career interests. The test will take 
            approximately five to ten minutes to complete.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow border border-black w-full max-w-3xl p-6">
          <div className="flex justify-between items-center text-sm mb-6">
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center space-x-1 ${getStepClass(
                  "RIASEC"
                )}`}
              >
                <BookOpen size={16} color={getIconColor("RIASEC")} />
                <span className="font-medium">RIASEC</span>
              </div>

              <span className="text-gray-400">{">"}</span>

              <div
                className={`flex items-center space-x-1 ${getStepClass(
                  "Big Five"
                )}`}
              >
                <Brain size={16} color={getIconColor("Big Five")} />
                <span className="font-medium">Big Five</span>
              </div>

              <span className="text-gray-400">{">"}</span>

              <div
                className={`flex items-center space-x-1 ${getStepClass(
                  "Results"
                )}`}
              >
                <FileText size={16} color={getIconColor("Results")} />
                <span className="font-medium">Results</span>
              </div>
            </div>

            <span className="font-medium text-gray-700">
              {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>

          <h2 className="text-center text-2xl font-semibold mb-2 mt-12">
            {questions[currentQuestionIndex]?.question || "Loading..."}
          </h2>

          <div className="flex flex-col space-y-2 items-center">
            {choices.map((label, idx) => (
              <button
                key={idx}
                className={`w-60 text-black font-medium rounded-full shadow border-2 transition
                  ${
                    answers[currentQuestionIndex] === idx + 1
                      ? "bg-[#FFD96A] border-[#FB9724]"
                      : "bg-[#FFE49E] border-[#FB9724] hover:bg-[#FFD96A]"
                  }`}
                onClick={() => handleAnswer(idx + 1)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-10 flex justify-between">
            <button
              className={`text-sm font-medium ${
                currentQuestionIndex === 0 ? "invisible" : ""
              }`}
              onClick={handleBack}
            >
              <span className="text-[#FBBF24]">{"<"}</span>{" "}
              <span className="ml-2 text-[#FBBF24] underline decoration-2 underline-offset-2">
                Back
              </span>
            </button>

            {areAllQuestionsAnswered() &&
            currentQuestionIndex === questions.length - 1 ? (
              <button
                className="text-sm font-medium bg-[#FB9724] text-white px-6 py-2 rounded-full hover:bg-[#FBBF24] transition-colors"
                onClick={() => handleTestComplete(scores)}
              >
                Finish RIASEC
              </button>
            ) : (
              <button
                className={`text-sm font-medium ${
                  !answers[currentQuestionIndex] ||
                  currentQuestionIndex === questions.length - 1
                    ? "invisible"
                    : ""
                }`}
                onClick={handleNext}
              >
                <span className="mr-2 text-[#FBBF24] underline decoration-2 underline-offset-2">
                  Next
                </span>
                <span className="text-[#FBBF24]">{">"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AssessmentRIASECPage;
