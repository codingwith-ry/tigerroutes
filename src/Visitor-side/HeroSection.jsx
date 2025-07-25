import React from "react";

const HeroSection = () => {
  return (
    <div className="relative h-screen bg-cover bg-center" style={{ backgroundImage: "url('/images/UST.jpg')" }}>
        <div 
            className="absolute inset-0 z-0" 
            style={{
                background: "linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(255,221,51,0.3) 100%)",
                opacity: 1
            }}
        />
      <div className="absolute inset-0 bg-black/50 z-10" />
      <div className="relative z-20 flex flex-col justify-center items-center h-full text-white text-center px-6">
        <h1 className="text-5xl md:text-7xl font-bold leading-tight">
          Navigate Your <br />
          <span className="text-yellow-400">Perfect Career Path</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg md:text-xl">
          Navigate your future with confidence. TigerRoutes uses advanced AI to analyze your
          personality, interests, and academic strengths, providing personalized college
          program recommendations tailored specifically for UST students.
        </p>
        <button className="mt-6 px-6 py-3 bg-yellow-400 text-white rounded-full text-lg">
          Get Started
        </button>

        {/* Stat Highlights */}
        <div className="flex flex-wrap justify-center gap-8 mt-12 text-lg font-semibold">
          <div className="text-center">
            <p>50+</p>
            <p className="text-sm">UST PROGRAMS</p>
          </div>
          <div className="text-center">
            <p>AI</p>
            <p className="text-sm">POWERED MATCHING</p>
          </div>
          <div className="text-center">
            <p>100%</p>
            <p className="text-sm">PERSONALIZED</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
