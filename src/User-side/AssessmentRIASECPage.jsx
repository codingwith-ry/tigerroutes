import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserNavbar from "./UserNavbar";
import Footer from "../Visitor-side/Footer";
import { BookOpen, Brain, FileText } from "lucide-react";
import Swal from "sweetalert2";
import { nav } from "framer-motion/client";
import { useAuth } from "../utils/AuthContext";

const AssessmentRIASECPage = () => {
  // State management for navigation and assessment data
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep] = useState("RIASEC");
  const [questions, setQuestions] = useState([]);
  const [choices, setChoices] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [scores, setScores] = useState({
    R: 0, // Realistic
    I: 0, // Investigative
    A: 0, // Artistic
    S: 0, // Social
    E: 0, // Enterprising
    C: 0, // Conventional
  });

  /**
   * Set page title on component mount
   */
  useEffect(() => {
    document.title = "Assessment | RIASEC";
    
    // Cleanup: restore default title on unmount
    return () => {
      document.title = "Default Title";
    };
  }, []);

  /**
   * Load RIASEC questions and choices from JSON file
   */
  useEffect(() => {
    fetch("/RIASEC&BigFive/RIASEC.json")
      .then((response) => response.json())
      .then((data) => {
        setQuestions(data.questions);
        setChoices(data.choices);
      })
      .catch((error) => console.error("Error loading questions:", error));
  }, []);

  /**
   * Load saved progress from localStorage on component mount
   */
  useEffect(() => {
    const savedAnswers = localStorage.getItem("riasecAnswers");
    const savedProgress = localStorage.getItem("riasecProgress");
    
    if (savedAnswers && savedProgress) {
      try {
        const parsedAnswers = JSON.parse(savedAnswers);
        const parsedProgress = JSON.parse(savedProgress);
        
        setAnswers(parsedAnswers);
        setCurrentQuestionIndex(parsedProgress == questions.length ? questions.length - 1 : parsedProgress);
        
        // Recalculate scores based on loaded answers
        const newScores = calculateScores(parsedAnswers);
        setScores(newScores);
      } catch (error) {
        console.error("Error loading saved progress:", error);
      }
    }
  }, [questions]);

  /**
   * Warn user about unsaved changes before leaving the page
   */
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  });

  /**
   * Calculate RIASEC trait scores based on user answers
   * @param {Object} newAnswers - User's answers indexed by question number
   * @returns {Object} Calculated scores for each RIASEC trait (0-100%)
   */
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

    // Convert to percentage scores
    Object.keys(traitScores).forEach((trait) => {
      if (traitCounts[trait] > 0) {
        traitScores[trait] = Math.round(
          (traitScores[trait] / traitCounts[trait]) * 100
        );
      }
    });

    return traitScores;
  };

  /**
   * Handle user selecting an answer for the current question
   * @param {number} value - The answer value (1 for "Like", 2 for "Dislike")
   */
    const handleAnswer = (value) => {
      const newAnswers = {
        ...answers,
        [currentQuestionIndex]: value,
      };
      setAnswers(newAnswers);
      setHasUnsavedChanges(true);

      // Recalculate scores with new answer
      const newScores = calculateScores(newAnswers);
      setScores(newScores);

    // Auto-advance to next question if not at the end
      if (currentQuestionIndex < questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIndex((prev) => prev + 1);
      });
    }
  };

  /**
   * Navigate to the previous question
   */
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  /**
   * Navigate to the next question
   */
  const handleNext = () => {
    if (currentQuestionIndex <= questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  /**
   * Save assessment progress to database via API
   */
  const handleSaveProgress = async () => {
    try {
      const assessmentId = localStorage.getItem("currentAssessmentId");
      const studentAccountId = user?.studentAccount_ID;

      if (!studentAccountId) {
        Swal.fire({
          title: "Error",
          text: "Student account information not found. Please log in again.",
          icon: "error",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600",
          },
          buttonsStyling: false,
        });
        return;
      }


      // Prepare data to send to API
      const progressData = {
        studentAccount_ID: parseInt(studentAccountId),
        assessmentID: assessmentId,
        riasec_responses: answers,
        riasec_progress: answers ? Object.keys(answers).length : 0,
        bigfive_responses: null,
        bigfive_progress: 0,
      };

      // Call API to save progress
      fetch("http://localhost:5000/api/assessment/post-PendingAssessment", {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(progressData),
      })
      .then(response => {
        // Parse response body as JSON
        return response.json().then(result => {
          // Attach status for error handling outside json()
          return { ok: response.ok, status: response.status, body: result };
        });
      })
      .then(({ ok, body }) => {
        if (!ok) {
          throw new Error(body.message || "Failed to save progress");
        }

        setHasUnsavedChanges(false);
        localStorage.removeItem("riasec_temp_answers");
        localStorage.removeItem("riasec_temp_progress");

        Swal.fire({
          title: "Success!",
          text: body.message,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          navigate("/assessment"); // Change to your desired route
        });
      })
      .catch(error => {
        console.error("Error saving progress:", error);
        Swal.fire({
          title: "Error",
          text: error.message || "There was an error saving your progress. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600",
          },
          buttonsStyling: false,
        });
      });
    } catch (error) {
      console.error("Error preparing save data:", error);
    }
  };


  /**
   * Handle cancel button - confirm before leaving if there are unsaved changes
   */
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      Swal.fire({
        title: "Unsaved Changes",
        text: "You have unsaved changes. Do you want to save before leaving?",
        icon: "warning",
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: "Save & Leave",
        denyButtonText: "Leave Without Saving",
        cancelButtonText: "Stay",
        reverseButtons: true,
        customClass: {
          popup: "rounded-xl",
          confirmButton: "bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 ml-2",
          denyButton: "bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 ml-2",
          cancelButton: "bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400",
        },
        buttonsStyling: false,
      }).then((result) => {
        if (result.isConfirmed) {
          // Save progress and then navigate
          handleSaveProgress().then(() => {
            navigate("/user-dashboard"); // Change to your desired route
          });
        } else if (result.isDenied) {
          // Leave without saving
          setHasUnsavedChanges(false);
          localStorage.removeItem("riasec_temp_answers");
          localStorage.removeItem("riasec_temp_progress");
          navigate("/user-dashboard"); // Change to your desired route
        }
        // If cancelled, do nothing (stay on page)
      });
    } else {
      // No unsaved changes, navigate directly
      navigate("/user-dashboard"); // Change to your desired route
    }
  };

  /**
   * Handle test completion and navigate to Big Five assessment
   * @param {Object} finalScores - Final calculated RIASEC scores
   */
  const handleTestComplete = (finalScores) => {
    const riasecResults = {
      Realistic: Math.round(finalScores.R),
      Investigative: Math.round(finalScores.I),
      Artistic: Math.round(finalScores.A),
      Social: Math.round(finalScores.S),
      Enterprising: Math.round(finalScores.E),
      Conventional: Math.round(finalScores.C),
    };

    // Save final results to localStorage
    localStorage.setItem("riasecAnswers", JSON.stringify(answers));
    localStorage.setItem("riasecResults", JSON.stringify(riasecResults));
    
    // Clear temporary progress data
    localStorage.removeItem("riasec_temp_answers");
    localStorage.removeItem("riasec_temp_progress");
    setHasUnsavedChanges(false);

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
        confirmButton: "bg-yellow-400 text-white px-4 py-2 rounded-md hover:bg-yellow-500 ml-2",
        cancelButton: "bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 mr-2",
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        handleBigFiveTest();
      }
    });
  };

  /**
   * Navigate to Big Five assessment page
   */
  const handleBigFiveTest = () => {
    navigate('/assessmentBigFive/' + localStorage.getItem('currentAssessmentId'));
  };

  /**
   * Check if all questions have been answered
   * @returns {boolean} True if all questions answered, false otherwise
   */
  const areAllQuestionsAnswered = () => {
    return Object.keys(answers).length === questions.length;
  };

  /**
   * Get CSS class for step indicator based on active step
   * @param {string} step - Step name to check
   * @returns {string} CSS class string
   */
  const getStepClass = (step) =>
    activeStep === step ? "text-[#FB9724]" : "text-gray-600";

  /**
   * Get icon color for step indicator based on active step
   * @param {string} step - Step name to check
   * @returns {string} Color value
   */
  const getIconColor = (step) =>
    activeStep === step ? "#FB9724" : "currentColor";

  return (
    <div className="w-full min-h-screen bg-[#FFFCED] flex flex-col font-sfpro">
      <UserNavbar />

      <div className="flex flex-col items-center justify-start flex-1 mt-20 mb-20 px-4">
        <h1 className="text-3xl font-extrabold text-black mb-4 text-center tracking-[0.3em]">
          THE RIASEC TEST
        </h1>

        {/* Test Instructions Card */}
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

        {/* Main Assessment Card */}
        <div className="bg-white rounded-lg shadow border border-black w-full max-w-3xl p-6">
          {/* Progress Steps Indicator */}
          <div className="flex justify-between items-center text-sm mb-6">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-1 ${getStepClass("RIASEC")}`}>
                <BookOpen size={16} color={getIconColor("RIASEC")} />
                <span className="font-medium">RIASEC</span>
              </div>

              <span className="text-gray-400">{">"}</span>

              <div className={`flex items-center space-x-1 ${getStepClass("Big Five")}`}>
                <Brain size={16} color={getIconColor("Big Five")} />
                <span className="font-medium">Big Five</span>
              </div>

              <span className="text-gray-400">{">"}</span>

              <div className={`flex items-center space-x-1 ${getStepClass("Results")}`}>
                <FileText size={16} color={getIconColor("Results")} />
                <span className="font-medium">Results</span>
              </div>
            </div>

            {/* Question Counter */}
            <span className="font-medium text-gray-700">
              {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>

          {/* Question Display */}
          <h2 className="text-center text-2xl font-semibold mb-2 mt-12">
            {questions[currentQuestionIndex]?.question || "Loading..."}
          </h2>

          {/* Answer Choices */}
          <div className="flex flex-col space-y-2 items-center">
            {choices.map((label, idx) => (
              <button
                key={idx}
                className={`w-60 text-black font-medium rounded-full shadow border-2 transition py-2
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

          {/* Navigation Buttons */}
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
                  currentQuestionIndex > questions.length - 1
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
        <hr className="m-2"/>

          {/* Save Progress and Cancel Buttons */}
          <div className="w-full max-w-3xl flex justify-end">
            <button
              className="text-sm font-medium bg-gray-400 text-white px-6 py-2 rounded-full hover:bg-gray-600 transition-colors"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              className="text-sm font-medium bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors ml-2"
              onClick={handleSaveProgress}
              disabled={Object.keys(answers).length === 0}
            >
              Save Progress
            </button>
          </div>
      </div>
      <Footer />
    </div>
  );
};

export default AssessmentRIASECPage;
