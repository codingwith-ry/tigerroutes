import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

const LoginPage = () => {
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
    navigate("/register");
  };

const handleForgotPassword = () => {
  navigate("/forgot-password");
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
    <div className="w-full min-h-screen bg-[#FFFCED] flex items-center justify-center px-4 font-sfpro relative">
      <img
        src="/images/TIGER ROUTES.png"
        alt="TigerRoutes Logo"
        className="absolute top-5 left-6 h-8 cursor-pointer"
        onClick={handleBackToHome}
      />

      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="mt-8 mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-medium leading-tight text-black tracking-tight">
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
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </span>
          </div>
          
          <div 
            onClick={handleForgotPassword}
            className="text-sm text-[#F6BE1E] font-semibold cursor-pointer hover:underline text-right">
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

        <div className="mt-6 text-center text-xs text-gray-500">
          <a href="/terms" className="hover:underline hover:text-[#F6BE1E]">
            Terms of Use
          </a>
        <span className="mx-2">|</span>
          <a href="/privacy" className="hover:underline hover:text-[#F6BE1E]">
            Privacy Policy
             </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;