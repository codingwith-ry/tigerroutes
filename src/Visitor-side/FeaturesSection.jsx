import React from "react";

const features = [
  {
    title: "Take Comprehensive Assessment",
    description:
      "Navigate your future with confidence. TigerRoutes uses advanced AI to analyze your personality, interests, and academic strengths, providing personalized college program recommendations tailored specifically for UST students.",
    icon: "/3D Elements/Assessments.png",
  },
  {
    title: "AI-Powered Analysis",
    description:
      "Our AI model processes your responses using our proprietary algorithm that weighs RIASEC (40%), Big Five (30%), academics (20%), and track (10%).",
    icon: "/3D Elements/AI.png",
  },
  {
    title: "Get Personalized Recommendations",
    description:
      "Receive your top 10 UST program recommendations - 5 aligned with your current track and 5 cross-track options that might surprise you with perfect matches.",
    icon: "/3D Elements/Recommendations.png",
  },
  {
    title: "Explore Your Future",
    description:
      "Dive deep into career pathways, job prospects, required certifications, and get guidance from UST counselors. Export your results and start your journey!",
    icon: "/3D Elements/Explore.png",
  },
];

const FeaturesSection = () => {
  return (
    <section className="bg-[#fefce9] py-16 px-8 md:px-16 font-sfpro">
      <h2 className="text-center text-base text-gray-600 tracking-widest font-bold mb-2">FEATURES</h2>
      <h3 className="text-center text-4xl md:text-5xl font-extrabold mb-14 leading-tight">How TigerRoutes Works?</h3>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-20">
        {features.map((feat, idx) => (
          <div
            key={idx}
            className="flex flex-col md:flex-row items-start gap-8"
          >
            <img src={feat.icon} alt={feat.title} className="w-48 h-48 object-contain" />
            <div className="flex-1">
              <h4 className="text-2xl font-semibold mb-3">{feat.title}</h4>
              <p className="text-lg text-gray-700 leading-relaxed">{feat.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
