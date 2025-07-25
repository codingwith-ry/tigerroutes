import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#F6BE1E] text-black px-6 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
        {/* Left: Logo + Text */}
        <div>
          <h2 className="text-2xl font-bold">TIGER<br />ROUTES</h2>
          <p className="mt-2 text-sm leading-relaxed max-w-xs">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>

        {/* Center: Subscription Form */}
        <div className="text-center md:text-left">
          <h3 className="text-lg font-semibold mb-2">Be Informed. Subscribe.</h3>
          <form className="flex items-center bg-white rounded-full overflow-hidden shadow-md max-w-sm mx-auto md:mx-0">
            <input
              type="email"
              placeholder="Your Email:"
              className="flex-grow px-4 py-2 outline-none text-black"
            />
            <button type="submit" className="bg-[#F6BE1E] px-4 py-2">
              ➜
            </button>
          </form>
        </div>

        {/* Right: QR Code */}
        <div className="text-center md:text-right">
          <h4 className="text-base font-semibold mb-2">Send us your feedback</h4>
          <img
            src="/assets/qr-feedback.png" // make sure this QR code image is in `public/assets/`
            alt="Feedback QR"
            className="w-24 h-24 mx-auto md:mx-0 border-4 border-black rounded-lg"
          />
        </div>
      </div>

      {/* Bottom copyright */}
      <div className="text-center text-sm mt-10 text-white bg-black py-2 rounded-t-md">
        © Copyright 2025. TigerRoutes. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
