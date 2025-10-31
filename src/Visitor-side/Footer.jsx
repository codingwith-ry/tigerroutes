import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import CookiesModal from "../Visitor-side/CookiesModal";

const Footer = () => {
  const [isCookiesModalOpen, setIsCookiesModalOpen] = useState(false);


  return (
    <>
      <footer className="bg-[#F6BE1E] text-black px-6 py-12 font-sfpro">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
          {/* Left: Logo + Text */}
          <div className="text-center md:text-left">
            <img 
              src="/images/TIGER ROUTES-BLACK.png"
              alt="TigerRoutes Logo"
              className="h-12 mx-auto md:mx-0"
            />
            <p className="mt-3 text-sm leading-relaxed max-w-xs text-left">
              Your AI Career Navigator for Thomasian Senior High School Students. TigerRoutes helps students discover UST academic programs that fit their skills, interests, and personality through psychometric assessments and personalized recommendations.
            </p>
          </div>

          {/* Center: Subscription Form */}
          <div className="text-center">
            <h4 className="text-base font-semibold mb-3">About TigerRoutes</h4>
            <p className="text-sm leading-relaxed max-w-xs mx-auto mb-3">
              TigerRoutes helps Thomasian Senior High School students discover UST programs that match their interests,
              personality, and academic profile using psychometric assessments and a rule‑based recommendation engine.
            </p>
            <p className="text-sm font-medium">Contact</p>
            <p className="text-sm">tigeroutes.support@ust.edu.ph</p>
          </div>

          {/* Right: QR Code */}
          
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-3">Quick Links</h3>
            <ul className="text-sm space-y-2">
              <li>
                <a
                  href="https://ustet.ust.edu.ph/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black hover:underline"
                >
                  UST Admission
                </a>
              </li>
              <li>
                <a
                  href="https://www.ust.edu.ph/academics/programs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black hover:underline"
                >
                  UST Academic Programs
                </a>
              </li>
              <li>
                <a
                  href="https://myusteportal.ust.edu.ph/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black hover:underline"
                >
                  MyUSTe Portal
                </a>
              </li>
            </ul>
          </div>
        </div>
        {/* Bottom copyright */}
          <div className="border-t border-black mt-10 pt-4 text-center text-xs md:text-sm text-black flex flex-col md:flex-row justify-between items-center gap-2 max-w-7xl mx-auto">
            <p>© 2025 TigerRoutes. All rights reserved.</p>
            <div className="flex gap-4">
              <Link to="/privacy-policy" className="hover:underline">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="hover:underline">
                Terms of Service
              </Link>
              <button 
                onClick={() => setIsCookiesModalOpen(true)}
                className="hover:underline"
              >
                Cookies Settings
              </button>
            </div>
          </div>
      </footer>

      <CookiesModal 
        isOpen={isCookiesModalOpen} 
        onClose={() => setIsCookiesModalOpen(false)} 
      />
    </>
  );
};

export default Footer;
