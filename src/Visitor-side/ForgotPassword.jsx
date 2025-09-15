import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const ForgotPassPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  sessionStorage.setItem('resetEmail', email);

  try {
    const res = await fetch("http://localhost:5000/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (data.success) {
      Swal.fire({
        icon: "info",
        title: "Check your email",
        text: "If your email is registered, you will receive a password reset link.",
      });
      navigate("/otp");
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: data.error || "Something went wrong,",
      });
    }
  } catch ( error ) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message || "Something went wrong.",
    });
  }
};


  return (
    <div className="w-full min-h-screen bg-[#FEFCE9] flex items-center justify-center px-4 font-sfpro relative">
      {/* Logo top-left */}
      <img
        src="/images/TIGER ROUTES.png"
        alt="TigerRoutes Logo"
        className="absolute top-5 left-6 h-8 cursor-pointer"
        onClick={handleBackToHome}
      />

      <div className="w-full max-w-sm space-y-6">
        {/* Heading */}
<div className="text-center text-sm mt-1">
             <img
            src="/3D Elements/Forgot.png"
            alt="Forgot Icon"
            className="mx-auto w-60 h-60 mb-1"
          />
          <h1 className="text-3xl md:text-4xl font-medium leading-tight text-black tracking-tight">
            Forgot your Password?
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Enter your email so that we can <br />
            send you a password reset link
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-full border border-gray-300 bg-transparent placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          <button
            type="submit"
            className="w-full bg-yellow-400 text-white py-3 rounded-full font-semibold hover:bg-yellow-500 transition"
          >
            Continue
          </button>

        <div className="text-center text-sm mt-10 p-4">
            <span
              onClick={handleBackToLogin}
              className="text-yellow-400 font-semibold cursor-pointer hover:underline"
            >
              Back to Log in
            </span>
          </div>
        </form>

      </div>
    </div>
  );
};

export default ForgotPassPage;