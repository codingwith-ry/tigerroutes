import React, { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import UserNavbar from "./UserNavbar";
import Footer from "../Visitor-side/Footer";
import { BookOpen, Brain, FileText } from "lucide-react";
import Swal from "sweetalert2";


const AssessmentBigFivePage = () => {
    useEffect(() => {
        document.title = "Assessment | Big Five";
        return () => {
        document.title = "Default Title";
        };
    }, []);
  const navigate = useNavigate();

  const handleResults = () => {
    fetch('/api/assessment/complete/' + localStorage.getItem('currentAssessmentId'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        riasecResults: JSON.parse(localStorage.getItem('riasecResults')),
        bigFiveResults: JSON.parse(localStorage.getItem('bigFiveResults'))
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        navigate('/assessment/results/' + localStorage.getItem('currentAssessmentId'));
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'There was an error saving your results. Please try again.'
        });
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  const [activeStep] = useState("Big Five");
  const [questions, setQuestions] = useState([]);
  const [choices, setChoices] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [scores, setScores] = useState({
    "Extraversion": 0,
    "Agreeableness": 0,
    "Conscientiousness": 0,
    "Negative Emotionality": 0,
    "Open-Mindedness": 0
  });

  const calculateScores = (newAnswers) => {
    const domainScores = {
      "Extraversion": 0,
      "Agreeableness": 0,
      "Conscientiousness": 0,
      "Negative Emotionality": 0,
      "Open-Mindedness": 0
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

  useEffect(() => {
    fetch('/RIASEC&BigFive/BFI2S.json')
      .then(response => response.json())
      .then(data => {
        setQuestions(data.questions);
        setChoices(data.choices);
      })
      .catch(error => console.error('Error loading questions:', error));
  }, []);

  const handleAnswer = (value) => {
    const newAnswers = {
      ...answers,
      [currentQuestionIndex]: value
    };
    setAnswers(newAnswers);
    
    const newScores = calculateScores(newAnswers);
    setScores(newScores);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleTestComplete = (finalScores) => {
    const bigFiveResults = {
      Openness: finalScores["Open-Mindedness"],
      Conscientiousness: finalScores.Conscientiousness,
      Extraversion: finalScores.Extraversion,
      Agreeableness: finalScores.Agreeableness,
      Neuroticism: finalScores["Negative Emotionality"]
    };

    localStorage.setItem('bigFiveAnswers', JSON.stringify(answers));
    localStorage.setItem('bigFiveResults', JSON.stringify(bigFiveResults));
  };

  const areAllQuestionsAnswered = () => {
    return Object.keys(answers).length === questions.length;
  };

  const getStepClass = (step) =>
    activeStep === step ? "text-[#FB9724]" : "text-gray-600";

  const getIconColor = (step) =>
    activeStep === step ? "#FB9724" : "currentColor";

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
        cancelButton:
          "bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 mr-2 w-32",
        confirmButton:
          "bg-yellow-400 text-white px-4 py-2 rounded-md hover:bg-yellow-500 ml-2 w-32",
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        handleTestComplete(scores);
        handleResults();
      }
    });
  };


  return (
    <div className="w-full min-h-screen bg-[#FFFCED] flex flex-col font-sfpro">
      <UserNavbar />

      <div className="flex flex-col items-center justify-start flex-1 mt-20 mb-20 px-4">
        <h1 className="text-3xl font-extrabold text-black mb-4 text-center tracking-[0.3em]">
          THE BIG FIVE TEST
        </h1>

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

        <div className="bg-white rounded-lg shadow border border-black w-full max-w-3xl p-6">
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

            <span className="font-medium text-gray-700">
              {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>

          <h2 className="text-center text-2xl font-semibold mb-2 mt-12">
            {questions[currentQuestionIndex]?.question || "Loading..."}
          </h2>

          <div className="flex flex-col space-y-2 items-center">
            {choices?.map((choice, idx) => (
              <button
                key={idx}
                className={`w-60 text-black font-medium rounded-full shadow border-2 transition
                  ${answers[currentQuestionIndex] === choice.value
                    ? 'bg-[#FFD96A] border-[#FB9724]' 
                    : 'bg-[#FFE49E] border-[#FB9724] hover:bg-[#FFD96A]'}`}
                onClick={() => handleAnswer(choice.value)}
              >
                {choice.choice}
              </button>
            ))}
          </div>

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
      </div>
      <Footer />
    </div>
  );
};

export default AssessmentBigFivePage;