import React from "react";

const CTA = () => {
  return (
    <section className="relative w-full min-h-[80vh] flex items-center justify-center text-center text-white bg-cover bg-center" style={{ backgroundImage: "url('/images/frassati.jpg')" }}>
      <div className="absolute inset-0 bg-black opacity-40" />
      <div className="relative z-10 px-4">
        <h1 className="text-4xl md:text-5xl font-bold">
          Ready to Explore <br />
          <span className="text-[#F6BE1E]">Your Future?</span>
        </h1>
        <button className="mt-6 bg-[#F6BE1E] text-white font-semibold py-2 px-6 rounded-full hover:scale-105 transition-transform">
          Get Started
        </button>
      </div>
    </section>
  );
};

export default CTA;
