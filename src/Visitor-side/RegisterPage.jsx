import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleSignUp = () => {
    // Navigate to register page when you create it
    // navigate("/register");
    console.log("Navigate to register page");
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login submitted:", formData);
    // After successful login, you might want to navigate somewhere
    // navigate("/dashboard");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-[#FFFCED] flex items-center justify-center px-4 font-sfpro relative">
      {/* Back button */}
      <button
        onClick={handleBackToHome}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        <span className="text-sm">Back</span>
      </button>

      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-left">
          <h1 className="text-2xl font-bold leading-tight text-black tracking-tight">
            Welcome back
          </h1>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 rounded-full border border-gray-300 bg-transparent placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F6BE1E]"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-full border border-gray-300 bg-transparent placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F6BE1E]"
            />
            <span 
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-4 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <div className="text-sm text-[#F6BE1E] font-semibold cursor-pointer hover:underline">
            Forgot Password?
          </div>

          <button
            type="submit"
            className="w-full bg-[#F6BE1E] text-white py-3 rounded-full font-semibold hover:bg-yellow-400 transition"
          >
            Continue
          </button>

          {/* OR Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-grow h-px bg-gray-300" />
            <span className="text-sm font-medium text-gray-400">OR</span>
            <div className="flex-grow h-px bg-gray-300" />
          </div>

          {/* Google Login */}
          <button
            type="button"
            className="w-full border border-gray-300 py-3 rounded-full flex items-center justify-center gap-2 hover:bg-gray-50 transition"
          >
            <FcGoogle size={20} />
            <span className="text-sm font-medium text-gray-700">Continue with Google</span>
          </button>

          {/* Sign up */}
          <div className="text-center text-sm text-gray-700">
            Don't have an account?{" "}
            <span 
              onClick={handleSignUp}
              className="text-[#F6BE1E] font-semibold hover:underline cursor-pointer"
            >
              Sign Up
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;