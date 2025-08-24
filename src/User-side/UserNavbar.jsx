import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi"; // Import icons

const UserNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // gives the current path

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Helper function to check if a route is active
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
        <div className="hidden md:flex gap-4">
          <button 
            onClick={() => navigate("/home")} 
            className={`px-4 py-1 text-sm transition-colors duration-200 rounded-full ${
              isActive("/home") ? "bg-yellow-500 text-white" : "hover:text-yellow-500"
            }`}
          >
            Home
          </button>
          <button 
            onClick={() => navigate("/assessment")} 
            className={`px-4 py-1 text-sm transition-colors duration-200 rounded-full ${
              isActive("/assessment") ? "bg-yellow-500 text-white" : "hover:text-yellow-500"
            }`}
          >
            Assessment
          </button>
          <button 
            onClick={() => navigate("/results")} 
            className={`px-4 py-1 text-sm transition-colors duration-200 rounded-full ${
              isActive("/results") ? "bg-yellow-500 text-white" : "hover:text-yellow-500"
            }`}
          >
            Results
          </button>
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
            <button 
              onClick={() => {
                navigate("/home");
                setIsMenuOpen(false);
              }} 
              className={`px-6 py-3 text-left text-sm transition-colors duration-200 ${
                isActive("/home") ? "bg-yellow-500 text-white" : "hover:bg-yellow-50"
              }`}
            >
              Home
            </button>
            <button 
              onClick={() => {
                navigate("/assessment");
                setIsMenuOpen(false);
              }} 
              className={`px-6 py-3 text-left text-sm transition-colors duration-200 ${
                isActive("/assessment") ? "bg-yellow-500 text-white" : "hover:bg-yellow-50"
              }`}
            >
              Assessment
            </button>
            <button 
              onClick={() => {
                navigate("/results");
                setIsMenuOpen(false);
              }} 
              className={`px-6 py-3 text-left text-sm transition-colors duration-200 ${
                isActive("/results") ? "bg-yellow-500 text-white" : "hover:bg-yellow-50"
              }`}
            >
              Results
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default UserNavbar;
