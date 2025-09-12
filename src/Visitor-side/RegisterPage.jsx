import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Swal from 'sweetalert2';
import { useEffect } from "react"; 



const RegisterPage = () => {

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword:''
  });

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleLogin = () => {
    navigate("/login");
  };


const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData({
    ...formData,
    [name]: value
  });

  if (name === 'email') {
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    setEmailError(emailRegex.test(value) ? '' : 'Please enter a valid email address.');
  }

  if (name === 'password' || name === 'confirmPassword') {
    setPasswordError(
      name === 'password' && value !== formData.confirmPassword && formData.confirmPassword
        ? 'Passwords do not match.'
        : name === 'confirmPassword' && value !== formData.password && formData.password
        ? 'Passwords do not match.'
        : ''
    )
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();   

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
    Swal.fire({
      icon: 'error',
      title: 'Name fields required',
      text: 'Please enter both your first and last name.',
    });
    return;
  }

    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match.');
      Swal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: 'Please ensure both password fields match.',
      })
      return;
    }else {
      setPasswordError('');
    }

    if (emailError || passwordError) {
      return;
    }

       const first = formData.firstName.trim();
    const last = formData.lastName.trim();
    const fullName = first + ' ' + last;
    const emailTrimmed = formData.email.trim();
    const payload = {
      name: fullName,
      email: emailTrimmed,
      password: formData.password
    }

    try{
      const res = await fetch ('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful!',
          text: 'You can now log in.',
        });
        navigate('/login');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: data.error || 'An error occurred.',
        });
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
    console.log("Login submitted:", formData);
    // After successful login, you might want to navigate somewhere
    // navigate("/dashboard");

  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: "64875843215-fujh9oveth87r16ir4qvu7psoc098j0h.apps.googleusercontent.com",
        callback: handleGoogleResponse,
      });
      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInDiv"),
        { theme: "outline",  size: "large"}
      );
    }
  }, []);

  function handleGoogleResponse(response) {
    // Decode JWT to get user info
    const jwt = response.credential;
    const base64Url = jwt.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      const user = JSON.parse(jsonPayload);
      const { email, name } = user;

      //Send to backend for registration/login
      fetch('http://localhost:5000/api/google-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            Swal.fire({
              icon: 'success',
              title: data.isNew ? 'Account Created!' : 'Welcome Back!',
              text: "Logged in as " + email,
            });
            handleLogin();
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Google Sign-In Failed',
              text: data.error || 'An error occurred.',
            });
          }
        });
  }
  

  return (
    <div className="w-full min-h-screen bg-[#FFFCED] flex items-center justify-center px-4 font-sfpro relative">
      <img
        src="/images/TIGER ROUTES.png"
        alt="TigerRoutes Logo"
        className="absolute top-5 left-6 h-8 cursor-pointer"
        onClick={handleBackToHome}
      />

      <div className="w-full max-w-sm space-y-6">
        <div className="mt-8 mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-medium leading-tight text-black tracking-tight">
            Create an account
          </h1>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Add Name input field */}
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 rounded-full border border-gray-300 bg-transparent placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F6BE1E]"
          />

          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 rounded-full border border-gray-300 bg-transparent placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F6BE1E]"
          />

          {/* Existing email input */}
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 rounded-full border border-gray-300 bg-transparent placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F6BE1E]"
          />
        {emailError && (
          <div style={{ color: 'red', fontSize: '0.9em', marginTop: '4px' }}>
            {emailError}
          </div>
        )}          
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
            {passwordError && (
              <div style={{ color: 'red', fontSize: '0.9em', marginTop: '4px' }}>
                {passwordError}
              </div>
            )}
            <span 
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-4 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </span>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
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
          
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              id="privacyConsent"
              required
              className="mt-1 accent-[#F6BE1E] w-4 h-4"
            />
            <label htmlFor="privacyConsent" className="leading-snug">
              I have read and accepted to the{" "}
              <a
                href="/privacy"
                className="underline hover:text-[#F6BE1E] transition-colors"
              >
                Privacy Policy
              </a>{" "}
              and{" "}
              <a 
                href="/terms"
                className="underline hover:text-[#F6BE1E] transition-colors"
              >
                Terms of Service
              </a>
              .
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-[#F6BE1E] text-white py-3 rounded-full font-semibold hover:bg-yellow-400 transition"
            id="register-button"
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
            id="googleSignInDiv"
          >
            <FcGoogle size={20} />
            <span className="text-sm font-medium text-gray-700">Continue with Google</span>
          </button>

          {/* Sign up */}
          <div className="text-center text-sm text-gray-700">
            Already have an account?{" "}
            <span 
              onClick={handleLogin}
              className="text-[#F6BE1E] font-semibold hover:underline cursor-pointer"
            >
              Log in
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;