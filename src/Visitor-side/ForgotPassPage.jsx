import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleContinue = () => {
    // Handle sending the password reset email here
    console.log("Reset link sent to:", email);
    // Optionally show confirmation or navigate
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#fefce9] flex flex-col items-center justify-center relative">
      {/* Logo top-left */}
      <img
        src="/images/TIGER ROUTES.png"
        alt="Tiger Routes Logo"
        className="absolute top-6 left-6 w-36"
      />

      {/* Main content */}
      <div className="text-center px-6 py-10 max-w-md w-full">
        {/* Icon */}
        <img
          src="/3D Elements/Forgot.png"
          alt="Forgot Password Icon"
          className="mx-auto mb-6 w-32 h-32"
        />

        {/* Title */}
        <h2 className="text-2xl font-semibold text-black mb-2">
          Forgot your password?
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Enter your email so that we can send you a password reset link
        </p>

        {/* Email input */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-4"
        />

        {/* Continue button */}
        <button
          onClick={handleContinue}
          className="w-full bg-gradient-to-b from-yellow-400 to-yellow-500 text-white font-medium py-3 rounded-full shadow-md hover:brightness-105 transition duration-200"
        >
          Continue
        </button>

        {/* Back to login */}
        <div className="mt-4">
          <button
            onClick={handleBackToLogin}
            className="text-sm text-yellow-600 hover:underline"
          >
            Back to Log in
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
