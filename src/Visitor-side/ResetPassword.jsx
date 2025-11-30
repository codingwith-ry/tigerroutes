import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Swal from "sweetalert2";

const ResetPasswordPage = () => {
  useEffect(() => {
    document.title = "Reset Password | TigerRoutes";
  }, []);
  
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordLengthError, setPasswordLengthError] = useState("");
  const email = sessionStorage.getItem("resetEmail");

  const handleBackToLogin = () => {
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Empty fields
    if (!password || !confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill in both password fields before continuing.",
        confirmButtonText: "OK",
        customClass: {
          popup: "rounded-xl",
          confirmButton:
            "bg-yellow-400 text-white px-4 py-2 rounded-md hover:bg-yellow-500",
        },
        buttonsStyling: false,
      });
      return;
    }

    // Password mismatch
    if (password !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Passwords Do Not Match",
        text: "Please make sure both passwords are the same.",
        confirmButtonText: "OK",
        customClass: {
          popup: "rounded-xl",
          confirmButton:
            "bg-yellow-400 text-white px-4 py-2 rounded-md hover:bg-yellow-500",
        },
        buttonsStyling: false,
      });
      return;
    }

    // enforce minimum password length
    if (!password || password.length < 8) {
      setPasswordLengthError('Password must be at least 8 characters.');
      Swal.fire({ icon: 'error', title: 'Weak Password', text: 'Password must be at least 8 characters.' });
      return;
    } else {
      setPasswordLengthError('');
    }

    // Submit new password and wait for server confirmation before showing success
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data && data.success) {
        await Swal.fire({
          icon: "success",
          title: "Password Reset Successful!",
          text: "You can now log in with your new password.",
          confirmButtonText: "OK",
          customClass: {
            popup: "rounded-xl",
            confirmButton:
              "bg-yellow-400 text-white px-4 py-2 rounded-md hover:bg-yellow-500",
          },
          buttonsStyling: false,
        });
        navigate("/"); // landing page
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: (data && data.error) || "Password reset failed.",
          confirmButtonText: "OK",
          customClass: {
            popup: "rounded-xl",
            confirmButton:
              "bg-yellow-400 text-white px-4 py-2 rounded-md hover:bg-yellow-500",
          },
          buttonsStyling: false,
        });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'Server error' });
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FEFCE9] flex items-center justify-center px-4 font-sfpro relative">
      {/* Logo top-left */}
      <img
        src="/images/04_TigerRoutes_Logo.webp"
        alt="TigerRoutes Logo"
        className="absolute top-5 left-6 h-8 cursor-pointer"
        onClick={() => navigate("/")}
      />

      <div className="w-full max-w-sm space-y-6">
        {/* Heading and Icon */}
        <div className="text-center text-sm mt-1">
          <img
            src="/3D Elements/Reset.webp"
            alt="Reset Icon"
            className="mx-auto w-60 h-60 mb-1"
          />
          <h1 className="text-3xl md:text-4xl font-medium leading-tight text-black tracking-tight">
            Reset password
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Please kindly set your new password
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              value={password}
              onChange={(e) => {
                const v = e.target.value;
                setPassword(v);
                if (v && v.length < 8) setPasswordLengthError('Password must be at least 8 characters.');
                else setPasswordLengthError('');
              }}
              className="w-full px-4 py-3 rounded-full border border-gray-300 bg-transparent placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 pr-12"
            />
            {passwordLengthError && (
              <div style={{ color: 'red', fontSize: '0.9em', marginTop: '4px' }}>{passwordLengthError}</div>
            )}
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400"
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </span>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-full border border-gray-300 bg-transparent placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 pr-12"
            />
            <span
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400"
            >
              {showConfirm ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </span>
          </div>

          {/* Continue Button */}
          <button
            type="submit"
            className="w-full bg-yellow-400 text-white py-3 rounded-full font-semibold hover:bg-yellow-500 transition"
          >
            Continue
          </button>

          {/* Back to Login */}
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

export default ResetPasswordPage;
