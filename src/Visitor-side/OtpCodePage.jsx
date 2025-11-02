import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";


const OtpCodePage = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const email = sessionStorage.getItem('resetEmail');

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^[0-9]?$/.test(value)) return; // only allow digits
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input automatically
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

const handleResend = () => {
  Swal.fire({
    icon: "success",
    title: "OTP Sent",
    text: "A new OTP has been sent to your email address.",
    confirmButtonText: "OK",
    customClass: {
      popup: "rounded-xl", // <- Rounded corners for the alert box
      confirmButton:
        "bg-yellow-400 text-white px-4 py-2 rounded-md hover:bg-yellow-500",
    },
    buttonsStyling: false,
  });
};

  const handleBackToLogin = () => {
    navigate("/login");
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  const enteredCode = otp.join("");

  if (enteredCode.length === 6) {
    try {
      const res = await fetch("http://localhost:5000/api/verify-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: enteredCode }),
      });
      const data = await res.json();

     if (data.success) {
    Swal.fire({
      icon: "success",
      title: "OTP Verified!",
      text: "You may now reset your password.",
      timer: 2000, // 2 seconds
      showConfirmButton: false,
      customClass: {
        popup: "rounded-xl",
      },
      willClose: () => {
        navigate("/reset-password");
      },
    });
  } else {
        Swal.fire({
          icon: "error",
          title: "Invalid OTP",
          text:
            data.error ||
            "The OTP you entered is incorrect. Please try again.",
          confirmButtonText: "OK",
          customClass: {
            popup: "rounded-xl",
            confirmButton:
              "bg-yellow-400 text-white px-4 py-2 rounded-md hover:bg-yellow-500",
          },
          buttonsStyling: false,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
        confirmButtonText: "OK",
        customClass: {
          popup: "rounded-xl",
          confirmButton:
            "bg-yellow-400 text-white px-4 py-2 rounded-md hover:bg-yellow-500",
        },
        buttonsStyling: false,
      });
    }
  } else {
    Swal.fire({
      icon: "warning",
      title: "Incomplete OTP",
      text: "Please enter the complete 6-digit OTP.",
      confirmButtonText: "OK",
      customClass: {
        popup: "rounded-xl",
        confirmButton:
          "bg-yellow-400 text-white px-4 py-2 rounded-md hover:bg-yellow-500",
      },
      buttonsStyling: false,
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
        onClick={() => navigate("/")}
      />

      <div className="w-full max-w-sm space-y-6">
        {/* Icon and Heading */}
        <div className="text-center text-sm mt-1">
          <img
            src="/3D Elements/Reset.png"
            alt="Reset Icon"
            className="mx-auto w-60 h-60 mb-1"
          />
          <h1 className="text-3xl md:text-4xl font-medium leading-tight text-black tracking-tight">
            Reset password
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            We sent a code to your email<br />
          <span className="text-gray-400 font-semibold">example@gmail.com</span>
          </p>
        </div>

        {/* OTP Inputs */}
        <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-6">
          <div className="flex space-x-2 justify-center">
            {otp.map((digit, index) => (
            <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                className={`w-12 h-14 text-2xl text-center rounded-md bg-[#FFF6D4] focus:outline-none transition 
                ${digit ? "border-yellow-300 focus:ring-2 focus:ring-yellow-400" : "border-gray-300"}`}
                style={{ borderWidth: "1px" }}
            />
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-400 text-white py-3 rounded-full font-semibold hover:bg-yellow-500 transition"
          >
            Continue
          </button>

          <div className="text-sm text-center text-gray-500">
            Didn’t receive the email?{" "}
            <span
              onClick={handleResend}
              className="text-yellow-500 font-semibold cursor-pointer hover:underline"
            >
              Click to resend
            </span>
          </div>

          <div className="text-center text-sm mt-4 p-4">
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

export default OtpCodePage;
