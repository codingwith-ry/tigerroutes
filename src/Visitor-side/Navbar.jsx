import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLoginClick = () => {
    navigate("/login");
    setMenuOpen(false);
  };

  const handleRegisterClick = () => {
    navigate("/register");
    setMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-transparent"
      } font-sfpro`}
    >
      <div className="flex justify-between items-center px-6 py-4">
        <img
          src="/images/04_TigerRoutes_Logo.webp"
          alt="TigerRoutes Logo"
          className="h-8 cursor-pointer"
          onClick={() => {
            navigate("/");
            setMenuOpen(false);
          }}
        />

        {/* Desktop Buttons */}
        <div className="hidden md:flex gap-3">
          <button
            onClick={handleLoginClick}
            className="px-4 py-1 border-2 border-black rounded-full text-sm hover:bg-black hover:text-white transition-colors duration-200"
          >
            Log In
          </button>
          <button
            onClick={handleRegisterClick}
            className="px-4 py-1 bg-yellow-400 text-white rounded-full text-sm"
          >
            Register
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-3xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <HiX /> : <HiMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-white shadow-md transition-all duration-300 overflow-hidden ${
          menuOpen ? "max-h-40" : "max-h-0"
        }`}
      >
        <div className="flex flex-col items-center gap-4 py-4">
          <button
            onClick={handleLoginClick}
            className="w-40 px-4 py-2 border-2 border-black rounded-full text-sm hover:bg-black hover:text-white transition-colors duration-200"
          >
            Log In
          </button>
          <button
            onClick={handleRegisterClick}
            className="w-40 px-4 py-2 bg-yellow-400 text-white rounded-full text-sm"
          >
            Register
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
