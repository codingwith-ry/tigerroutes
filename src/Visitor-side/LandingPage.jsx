import React from "react";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import About from "./About";
import FeaturesSection from "./FeaturesSection";
import Testimonials from "./Testimonials";
import FloatingChatButton from "./FloatingChatButton";
import CTA from "./CTA";
import Footer from "./Footer";

const ScrollAnimationWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

const LandingPage = () => {
  return (
    <div className="w-full min-h-screen bg-[#fefce9] font-sans">
      <ScrollAnimationWrapper>
        <Navbar />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper>
        <HeroSection />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper>
        <About />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper>
        <FeaturesSection />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper>
        <Testimonials />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper>
        <FloatingChatButton />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper>
        <CTA />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper>
        <Footer />
      </ScrollAnimationWrapper>
    </div>
  );
};

export default LandingPage;
