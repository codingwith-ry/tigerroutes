import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom"; // Add this import

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate(); // Add navigation hook

  // Add form handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resp = await fetch('http://localhost:5000/api/staff-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // using username as the email field
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const data = await resp.json();

      if (data.success && data.user) {
        // Persist staff info for role-based UI
        sessionStorage.setItem('staffUser', JSON.stringify(data.user));
        navigate('/admin/dashboard');
      } else {
        alert(data.error || 'Invalid email or password');
      }
    } catch (err) {
      alert('Login failed, Please try again.');
    }
  };

  // Add input handler
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full font-sfpro bg-[#fffbe9] text-gray-900">
     <div className="hidden lg:flex w-1/2 items-center justify-center px-6 py-12 relative bg-cover bg-center" style={{ backgroundImage: "url('/images/VectorBg.png')" }}>
        <div className="max-w-md text-white w-full font-sfpro">
          <h1 className="text-4xl md:text-5xl font-black mb-4 font-sfpro">
            Welcome back!
          </h1>
          <p className="text-2xl leading-snug mb-8 font-sfpro">
            Empowering future Thomasians,<br /> one route at a time.
          </p>
          <p className="text-xs absolute bottom-4 left-0 right-0 text-center text-white/70 font-sfpro">
            © 2025 TigerRoutes. All Rights Reserved.
          </p>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center px-4 sm:px-8 py-10 bg-white h-full">
        <div className="w-full max-w-md space-y-9 font-sfpro">
          <div className="flex justify-center">
            <img
              src="/images/TIGER ROUTES.png"
              alt="TigerRoutes Logo"
              className="w-32 sm:w-40"
            />
          </div>
          <div className="text-center space-y-1 font-sfpro">
            <h2 className="text-2xl font-semibold font-sfpro">Log in</h2>
            <p className="text-sm text-gray-500 font-sfpro">
              Please login to view your dashboard
            </p>
          </div>

          <form className="space-y-4 font-sfpro" onSubmit={handleSubmit}>
            <input
              type="text"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-full border bg-white border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc562] font-sfpro"
              autoComplete="username"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-full border bg-white border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#fbc562] font-sfpro"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            <div className="text-sm text-[#F6BE1E] font-semibold cursor-pointer hover:underline text-right">
              <a href="#">Forgot Password?</a>
            </div>
            <button
              type="submit"
              className="w-full bg-[#ea9d2d] hover:bg-[#fbc562] text-white font-semibold py-3 rounded-full transition font-sfpro"
            >
              Login to Dashboard
            </button>
          </form>

          <p className="text-xs text-center text-gray-500 font-sfpro">
            By signing in you accept all our terms and conditions,<br />
            privacy policy and cookie policy.
          </p>
        </div>
      </div>

      <div className="block lg:hidden absolute bottom-2 w-full text-center text-xs text-gray-400 font-sfpro">
        © 2025 TigerRoutes. All Rights Reserved.
      </div>
    </div>
  );
};

export default AdminLogin;
