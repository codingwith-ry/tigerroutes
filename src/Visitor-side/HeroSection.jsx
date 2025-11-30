import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { animate } from "framer-motion";
import PropTypes from "prop-types";

const NumberCounter = ({ end = 0, duration = 1.6, suffix = "" }) => {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  // observe when the element enters the viewport and start once
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.45 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // animate only after it becomes visible
  useEffect(() => {
    if (!started) return;
    const controls = animate(0, end, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(v) {
        setValue(Math.floor(v));
      },
    });
    return () => controls.stop();
  }, [started, end, duration]);

  return (
    <p ref={ref} className="font-black text-yellow-400 text-4xl sm:text-5xl md:text-6xl">
      {value}
      {suffix}
    </p>
  );
};

const HeroSection = () => {
  const getStarted = () => {
    navigate("/register");
  };
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[80vh] h-screen max-h-[1200px] bg-cover bg-center" style={{ backgroundImage: "url('/images/UST.webp')" }}>
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(255,221,51,0.3) 100%)",
          opacity: 1,
        }}
      />
      <div className="absolute inset-0 bg-black/50 z-10" />
      <div className="relative z-20 flex flex-col justify-center items-center h-full text-white text-center px-4 sm:px-6">
        <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-7xl font-black leading-tight">
          Navigate Your <br />
          <span className="text-yellow-400">Perfect Career Path</span>
        </h1>
        <p className="mt-4 max-w-xs xs:max-w-md sm:max-w-xl md:max-w-2xl font-sfpro text-base xs:text-lg md:text-xl">
          Navigate your future with confidence. TigerRoutes uses a refined scoring engine to analyze your
          personality, interests, and academic strengths, providing personalized college
          program recommendations tailored specifically for UST students.
        </p>
        <button 
          onClick={getStarted} 
          className="mt-6 px-5 py-2.5 sm:px-6 sm:py-3 bg-yellow-400 text-white rounded-full text-base sm:text-lg font-sfpro font-semibold hover:bg-yellow-500 transition hover:scale-105 transition-transform"
          >
            Get Started
        </button>

        {/* Stat Highlights */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-8 sm:gap-12 mt-10 sm:mt-12 text-lg sm:text-xl font-medium font-sfpro w-full items-center">
          <div className="text-center min-w-[120px]">
            <NumberCounter end={40} suffix="+" />
            <p className="text-base sm:text-lg md:text-xl">UST PROGRAMS</p>
          </div>
          <div className="text-center min-w-[120px]">
            <p className="font-black text-yellow-400 text-4xl sm:text-5xl md:text-6xl">SCORE</p>
            <p className="text-base sm:text-lg md:text-xl">Driven-Matching</p>
          </div>
          <div className="text-center min-w-[120px]">
            <NumberCounter end={100} suffix="%" />
            <p className="text-base sm:text-lg md:text-xl">PERSONALIZED</p>
          </div>
        </div>
      </div>
    </div>
  );
};

NumberCounter.propTypes = {
  end: PropTypes.number,
  duration: PropTypes.number,
  suffix: PropTypes.string,
};

export default HeroSection;