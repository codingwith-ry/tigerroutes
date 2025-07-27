import React from "react";

const CTA = () => {
  return (
    <section 
        className="relative w-full h-[40vh] min-h-[20vh] flex items-center justify-center text-center text-white bg-cover bg-center font-sfpro" 
        style={{ backgroundImage: "url('/images/frassati.jpg')" }}>
      <div className="absolute inset-0 bg-black opacity-40" />
      <div className="relative z-10 px-4">
        <h1 className="text-4xl md:text-5xl font-black">
          Ready to Explore <br />
          <span className="text-[#F6BE1E]">Your Future?</span>
        </h1>
        <button className="mt-6 px-6 py-3 bg-yellow-400 text-white rounded-full text-lg font-semibold hover:bg-yellow-500 transition hover:scale-105 transition-transform">
          Get Started
        </button>
      </div>
    </section>
  );
};

export default CTA;
