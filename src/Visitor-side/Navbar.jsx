import React, { useEffect, useState } from "react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-transparent"
      } font-sfpro`}
    >
      <div className="flex justify-between items-center px-6 py-4">
        <img src="/images/TIGER ROUTES.png" alt="TigerRoutes Logo" className="h-8" />
        <div className="flex gap-3">
          <button className="px-4 py-1 border-2 border-black rounded-full text-sm">Log In</button>
          <button className="px-4 py-1 bg-yellow-400 text-white rounded-full text-sm">Register</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
