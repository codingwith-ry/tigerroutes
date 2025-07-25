import React from "react";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import FloatingChatButton from "./FloatingChatButton";
import CTA from "./CTA";
import Footer from "./Footer";

const LandingPage = () => {
  return (
    <div className="w-full min-h-screen bg-[#fefce9] font-sans">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <FloatingChatButton />
      <CTA />
      <Footer />
    </div>
  );
};

export default LandingPage;
