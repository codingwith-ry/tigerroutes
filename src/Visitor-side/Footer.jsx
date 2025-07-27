import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#F6BE1E] text-black px-6 py-12 font-sfpro">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
        {/* Left: Logo + Text */}
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-extrabold leading-tight">
            TIGER<br />ROUTES
          </h2>
          <p className="mt-3 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>

        {/* Center: Subscription Form */}
        <div className="text-center md:text-left">
          <h3 className="text-lg font-semibold mb-3">Be Informed. Subscribe.</h3>
          <form className="flex items-center justify-center md:justify-start bg-white rounded-full overflow-hidden shadow max-w-sm mx-auto md:mx-0">
            <input
              type="email"
              placeholder="Your Email"
              className="flex-grow px-4 py-2 text-black text-sm outline-none"
            />
            <button
              type="submit"
              aria-label="Subscribe"
              className="bg-black text-white px-5 py-2 text-sm font-semibold hover:bg-gray-900 transition-all"
            >
              ➜
            </button>
          </form>
        </div>

        {/* Right: QR Code */}
        <div className="text-center md:text-right">
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
