import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
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
  };

  const handleRegisterClick = () => {
    // You can add register route later
    // navigate("/register");
    console.log("Navigate to register page");
  };

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
        <div className="flex gap-3">
          <button 
            onClick={handleLoginClick}
            className="px-4 py-1 border-2 border-black rounded-full text-sm hover:bg-black hover:text-white transition-colors duration-200"
          >
            Log In
          </button>
            <button 
             onClick={handleLoginClick} 
             className="px-4 py-1 bg-yellow-400 text-white rounded-full text-sm"
             >
            Register
          </button>
          
        </div>
      </div>
    </nav>
  );
};

export default Navbar;