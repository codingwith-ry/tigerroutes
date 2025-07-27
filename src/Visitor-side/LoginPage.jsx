import React from "react";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  return (
    <div className="min-h-screen bg-[#FFFCED] flex items-center justify-center px-4 font-sfpro">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-left">
          <h1 className="text-2xl font-bold leading-tight text-black tracking-tight">
            Welcome back
          </h1>
        </div>

        {/* Form */}
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            className="w-full px-4 py-3 rounded-full border border-gray-300 bg-transparent placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F6BE1E]"
          />
          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-full border border-gray-300 bg-transparent placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F6BE1E]"
            />
            <span className="absolute inset-y-0 right-4 flex items-center cursor-pointer text-gray-400">
              👁️ {/* Replace with proper icon toggle */}
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
            Don’t have an account?{" "}
            <span className="text-[#F6BE1E] font-semibold hover:underline cursor-pointer">
              Sign Up
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
