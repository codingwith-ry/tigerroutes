import React from "react";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import About from "./About";
import FeaturesSection from "./FeaturesSection";
import Testimonials from "./Testimonials";
import CTA from "./CTA";
import Footer from "./Footer";
import PropTypes from 'prop-types';
import Mockup from "./Mockup";
import MockupFeatures from "./MockupFeatures";

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
  useEffect(() => {
    document.title = "TigerRoutes - Career Navigator for UST-SHS Students";
  }, []);

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
        <Mockup />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper>
        <FeaturesSection />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper>
        <MockupFeatures />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper>
        <Testimonials />
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

ScrollAnimationWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

export default LandingPage;
