import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Footer = () => {
  return (
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
          <h3 className="text-2xl font-semibold mb-3">Be Informed. Subscribe.</h3>
          <form className="flex items-center justify-center md:justify-start bg-white rounded-full shadow max-w-md mx-auto md:mx-0 overflow-hidden">
            <input
              type="email"
              placeholder="Your Email"
              className="flex-grow px-5 py-4 text-black text-base outline-none"
            />
            <button
              type="submit"
              aria-label="Subscribe"
              className="bg-[#F6BE1E] text-white w-11 h-11 flex items-center justify-center rounded-full hover:bg-yellow-500 transition-all mr-1.5"
            >
              <ArrowRight className="text-white" size={22} strokeWidth={3} />
            </button>
          </form>
        </div>

        {/* Right: QR Code */}
        <div className="text-center">
          <h4 className="text-base font-semibold mb-3">Send us your feedback</h4>
          <img
            src="/assets/qr-feedback.png"
            alt="Feedback QR code"
            className="w-24 h-24 mx-auto md:ml-auto border-4 border-black rounded-lg"
          />
        </div>
      </div>

      {/* Bottom copyright */}
      <div className="border-t border-black mt-10 pt-4 text-center text-xs md:text-sm text-black flex flex-col md:flex-row justify-between items-center gap-2 max-w-7xl mx-auto">
        <p>© 2025 TigerRoutes. All rights reserved.</p>
        <div className="flex gap-4">
          <Link to="/privacy-policy" className="hover:underline">Privacy Policy</Link>
          <Link to="/terms-of-service" className="hover:underline">Terms of Service</Link>
          <Link to="/cookies-settings" className="hover:underline">Cookies Settings</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
