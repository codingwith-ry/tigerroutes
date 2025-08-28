import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import { FiChevronDown } from "react-icons/fi";

const UserNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const profileRef = useRef(null); // Ref for desktop dropdown
  const mobileProfileRef = useRef(null); // Ref for mobile dropdown

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target) &&
        mobileProfileRef.current &&
        !mobileProfileRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-transparent"
      } font-sfpro`}
    >
      <div className="flex justify-between items-center px-6 py-4">
        <img
          src="/images/TIGER ROUTES.png"
          alt="TigerRoutes Logo"
          className="h-8 cursor-pointer"
          onClick={() => navigate("/")}
        />

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-4 items-center">
          {["/home", "/assessment", "/results"].map((path, idx) => (
            <button
              key={idx}
              onClick={() => navigate(path)}
              className={`px-4 py-1 text-sm transition-colors duration-200 rounded-full ${
                isActive(path) ? "bg-yellow-500 text-white" : "hover:text-yellow-500"
              }`}
            >
              {path.replace("/", "").charAt(0).toUpperCase() + path.slice(2)}
            </button>
          ))}

          {/* Desktop Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              className="flex items-center gap-2 px-3 py-1 rounded-full hover:bg-gray-100 transition"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center">
                JD
              </div>
              <span className="text-sm">Juan Dela Cruz</span>
              <FiChevronDown className="text-gray-600" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md py-2 z-50">
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => navigate("/profile-page")}
                >
                  Profile
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => navigate("/settings")}
                >
                  Settings
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => console.log("Logged out")}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <HiX /> : <HiMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="flex flex-col py-4">
            {["/home", "/assessment", "/results"].map((path, idx) => (
              <button
                key={idx}
                onClick={() => {
                  navigate(path);
                  setIsMenuOpen(false);
                }}
                className={`px-6 py-3 text-left text-sm transition-colors duration-200 ${
                  isActive(path) ? "bg-yellow-500 text-white" : "hover:bg-yellow-50"
                }`}
              >
                {path.replace("/", "").charAt(0).toUpperCase() + path.slice(2)}
              </button>
            ))}

            {/* Mobile Profile Dropdown */}
            <div className="relative mt-2" ref={mobileProfileRef}>
              <button
                className="flex items-center gap-2 px-6 py-3 w-full rounded-full hover:bg-gray-100 transition"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center">
                  JD
                </div>
                <span className="text-sm">Juan Dela Cruz</span>
                <FiChevronDown className="text-gray-600" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-6 mt-2 w-40 bg-white shadow-lg rounded-md py-2 z-50">
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => {
                      navigate("/profile");
                      setIsMenuOpen(false);
                    }}
                  >
                    Profile
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => {
                      navigate("/settings");
                      setIsMenuOpen(false);
                    }}
                  >
                    Settings
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => {
                      console.log("Logged out");
                      setIsMenuOpen(false);
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default UserNavbar;
