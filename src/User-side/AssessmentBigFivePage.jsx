import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserNavbar from "./UserNavbar";
import Footer from "../Visitor-side/Footer";
import { BookOpen, Brain, FileText } from "lucide-react";
import Swal from "sweetalert2";
import { useAuth } from "../utils/AuthContext";

const AssessmentBigFivePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep] = useState("Big Five");
  const [questions, setQuestions] = useState([]);
  const [choices, setChoices] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [scores, setScores] = useState({
    "Extraversion": 0,
    "Agreeableness": 0,
    "Conscientiousness": 0,
    "Neuroticism": 0,
    "Openness": 0
  });

  /**
   * Set page title on component mount
   */
  useEffect(() => {
    document.title = "Assessment | Big Five";
    
    // Cleanup: restore default title on unmount
    return () => {
      document.title = "Default Title";
    };
  }, []);

  /**
   * Load Big Five questions and choices from JSON file
   */
  useEffect(() => {
    fetch('/RIASEC&BigFive/BFI2S.json')
      .then(response => response.json())
      .then(data => {
        setQuestions(data.questions);
        setChoices(data.choices);
      })
      .catch(error => console.error('Error loading questions:', error));
  }, []);

  /**
   * Load saved progress from localStorage on component mount
   */
  useEffect(() => {
    const savedAnswers = localStorage.getItem("bigFiveAnswers");
    const savedProgress = localStorage.getItem("bigFiveProgress");
    
    if (savedAnswers && savedProgress) {
      try {
        const parsedAnswers = JSON.parse(savedAnswers);
        const parsedProgress = JSON.parse(savedProgress);
        
        setAnswers(parsedAnswers);
        if(parsedProgress < questions.length) {
          setCurrentQuestionIndex(parsedProgress);
        }else{
          setCurrentQuestionIndex(questions.length - 1);
        }
        
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
   * Calculate Big Five domain scores based on user answers
   * @param {Object} newAnswers - User's answers indexed by question number
   * @returns {Object} Calculated scores for each Big Five domain
   */
  const calculateScores = (newAnswers) => {
    const domainScores = {
      "Extraversion": 0,
      "Agreeableness": 0,
      "Conscientiousness": 0,
      "Neuroticism": 0,
      "Openness": 0
    };
    const domainCounts = { ...domainScores };

    questions.forEach((question, index) => {
      const answer = newAnswers[index];
      if (answer !== undefined) {
        const domain = question.domain;
        let score = answer;
        
        // Reverse score if question is reversed
        if (question.reversed) {
          score = 6 - score; // Reverse 1-5 to 5-1
        }
        
        domainScores[domain] += score;
        domainCounts[domain]++;
      }
    });

    // Calculate average for each domain
    Object.keys(domainScores).forEach(domain => {
      if (domainCounts[domain] > 0) {
        domainScores[domain] = Math.round((domainScores[domain] / domainCounts[domain]) * 20);
      }
    });

    return domainScores;
  };

  /**
   * Handle user selecting an answer for the current question
   * @param {number} value - The answer value (1-5)
   */
  const handleAnswer = (value) => {
    const newAnswers = {
      ...answers,
      [currentQuestionIndex]: value
    };
    setAnswers(newAnswers);
    if(localStorage.getItem("bigFiveAnswers") !== JSON.stringify(newAnswers)){
        setHasUnsavedChanges(true);
      } else {
        setHasUnsavedChanges(false);
      }
    
    // Recalculate scores with new answer
    const newScores = calculateScores(newAnswers);
    setScores(newScores);
    
    // Auto-advance to next question if not at the end
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  /**
   * Navigate to the previous question
   */
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  /**
   * Navigate to the next question
   */
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
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
        await Swal.fire({
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

      const riasecAnswers = localStorage.getItem("riasecAnswers");
      const riasecProgress = localStorage.getItem("riasecProgress");

      const progressData = {
        studentAccount_ID: parseInt(studentAccountId),
        assessmentID: assessmentId,
        riasec_responses: riasecAnswers ? JSON.parse(riasecAnswers) : null,
        riasec_progress: riasecProgress ? JSON.parse(riasecProgress) : 0,
        bigfive_responses: answers,
        bigfive_progress: answers ? Object.keys(answers).length : 0,
      };

      setIsSavingProgress(true);

      const res = await fetch("http://localhost:5000/api/assessment/post-PendingAssessment", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(progressData),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Failed to save progress");

      setHasUnsavedChanges(false);

      await Swal.fire({
        title: "Success!",
        text: body.message,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error saving progress:", error);
      await Swal.fire({
        title: "Error",
        text: error.message || "There was an error saving your progress. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600",
        },
        buttonsStyling: false,
      });
    } finally {
      setIsSavingProgress(false);
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
      }).then(async (result) => {
        if (result.isConfirmed) {
          // Save progress and then navigate
          handleSaveProgress().then(() => {
            navigate("/assessment"); // Change to your desired route
          });
        } else if (result.isDenied) {
          // Leave without saving
          setHasUnsavedChanges(false);
          localStorage.removeItem("bigfive_temp_answers");
          localStorage.removeItem("bigfive_temp_progress");
          navigate("/assessment"); // Change to your desired route
        }
      });
    } else {
      // No unsaved changes, navigate directly
      navigate("/assessment"); // Change to your desired route
    }
  };

  /**
   * Handle test completion and save final results
   * @param {Object} finalScores - Final calculated Big Five scores
   */
  const handleTestComplete = (finalScores) => {
    const bigFiveResults = {
      Openness: finalScores.Openness,
      Conscientiousness: finalScores.Conscientiousness,
      Extraversion: finalScores.Extraversion,
      Agreeableness: finalScores.Agreeableness,
      Neuroticism: finalScores.Neuroticism
    };

    // Save final results to localStorage
    localStorage.setItem("bigFiveAnswers", JSON.stringify(answers));
    localStorage.setItem("bigFiveResults", JSON.stringify(bigFiveResults));
    
    // Clear temporary progress data
    localStorage.removeItem("bigfive_temp_answers");
    localStorage.removeItem("bigfive_temp_progress");
    setHasUnsavedChanges(false);
  };

  /**
   * Submit results to backend and navigate to results page
   */
  const handleResults = async () => {
    try{
      let riasecResults = localStorage.getItem("riasecResults");
      
      if (!riasecResults) {
        // Calculate RIASEC results from stored answers
        const riasecAnswers = localStorage.getItem("riasecAnswers");
        if (riasecAnswers) {
          // You need to load RIASEC questions to calculate results
          const riasecQuestionsResponse = await fetch("/RIASEC&BigFive/RIASEC.json");
          const riasecData = await riasecQuestionsResponse.json();
          
          const answers = JSON.parse(riasecAnswers);
          const traitScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
          const traitCounts = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

          riasecData.questions.forEach((question, index) => {
            const answer = answers[index];
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

          riasecResults = {
            Realistic: Math.round(traitScores.R),
            Investigative: Math.round(traitScores.I),
            Artistic: Math.round(traitScores.A),
            Social: Math.round(traitScores.S),
            Enterprising: Math.round(traitScores.E),
            Conventional: Math.round(traitScores.C),
          };
          
          // Store the calculated results for future use
          localStorage.setItem("riasecResults", JSON.stringify(riasecResults));
        } else {
          throw new Error("No RIASEC data found");
        }
      } else {
        riasecResults = JSON.parse(riasecResults);
      }
    } catch (error) {
      console.error("Error calculating RIASEC results:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'There was an error calculating your RIASEC results. Please try again.'
      });
      return;
    }

    fetch('http://localhost:5000/api/assessment/complete/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        studentAssessment_ID: localStorage.getItem('currentAssessmentId'),
        studentAccount_ID: user?.studentAccount_ID,
        riasecResults: JSON.parse(localStorage.getItem('riasecResults')),
        bigFiveResults: JSON.parse(localStorage.getItem('bigFiveResults'))
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log('Success:', data.programRecommendations);
        navigate('/assessment/results/'+ localStorage.getItem('currentAssessmentId'));
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'There was an error saving your results. Please try again.'
        });
      }
      
      
      fetch('http://localhost:5000/api/assessment/delete-PendingAssessment/', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pendingAssessment_ID: localStorage.getItem('currentAssessmentId'),
          studentAccount_ID: user?.studentAccount_ID
        })
      })
      .then(response => response.json())
      .then(data => {
        if (!data.success) {
          console.error('Error deleting pending assessment:', data.message);
        } 
      });

      // Clean up pending assessment entry
      localStorage.removeItem('currentAssessmentId');
      localStorage.removeItem('riasecAnswers');
      localStorage.removeItem('bigFiveAnswers');
      localStorage.removeItem('riasecProgress');
      localStorage.removeItem('bigFiveProgress');
      localStorage.removeItem('riasecResults');
      localStorage.removeItem('bigFiveResults');
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  /**
   * Show completion alert and proceed to results
   */
  const showCompletionAlert = (scores, handleTestComplete, handleResults) => {
    Swal.fire({
      title: "Congratulations!",
      text: "You are done answering the Big Five section. Are you sure you want to view your results?",
      icon: "success",
      showCancelButton: true,
      cancelButtonText: "Cancel",
      confirmButtonText: "View Results",
      reverseButtons: true,
      customClass: {
        popup: "rounded-xl",
        title: "text-green-500 font-bold",
        cancelButton: "bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 mr-2 w-32",
        confirmButton: "bg-yellow-400 text-white px-4 py-2 rounded-md hover:bg-yellow-500 ml-2 w-32",
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        handleTestComplete(scores);
        handleResults();
      }
    });
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
          THE BIG FIVE TEST
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
            Rate each statement according to how well it describes you. 
            Base your ratings on how you really are, not how you would like to be.
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
            {choices?.map((choice, idx) => (
              <button
                key={idx}
                className={`w-60 text-black font-medium rounded-full shadow border-2 transition py-2
                  ${answers[currentQuestionIndex] === choice.value
                    ? 'bg-[#FFD96A] border-[#FB9724]' 
                    : 'bg-[#FFE49E] border-[#FB9724] hover:bg-[#FFD96A]'}`}
                onClick={() => handleAnswer(choice.value)}
              >
                {choice.choice}
              </button>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-10 flex justify-between">
            <button 
              className={`text-sm font-medium ${currentQuestionIndex === 0 ? 'invisible' : ''}`}
              onClick={handleBack}
            >
              <span className="text-[#FBBF24]">{"<"}</span>{" "}
              <span className="ml-2 text-[#FBBF24] underline decoration-2 underline-offset-2">
                Back
              </span>
            </button>

            {areAllQuestionsAnswered() && currentQuestionIndex === questions.length - 1 ? (
              <button 
                className="text-sm font-medium bg-[#FB9724] text-white px-6 py-2 rounded-full hover:bg-[#FBBF24] transition-colors"
                onClick={() => showCompletionAlert(scores, handleTestComplete, handleResults)}
              >
                View Results
              </button>
            ) : (
              <button 
                className={`text-sm font-medium ${
                  !answers[currentQuestionIndex] || currentQuestionIndex === questions.length - 1 
                    ? 'invisible' 
                    : ''
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
              className={`text-sm font-medium text-white px-6 py-2 rounded-full transition-colors ml-2 ${
                 isSavingProgress || Object.keys(answers).length === 0 || !hasUnsavedChanges
                   ? "bg-gray-400 cursor-not-allowed"
                   : "bg-green-500 hover:bg-green-700"
              }`}
              onClick={handleSaveProgress}
              disabled={isSavingProgress || Object.keys(answers).length === 0 || !hasUnsavedChanges}
              aria-busy={isSavingProgress}
            >

              {isSavingProgress ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block" />
                  Saving...
                </span>
              ) : (
                "Save Progress"
              )}
            </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AssessmentBigFivePage;