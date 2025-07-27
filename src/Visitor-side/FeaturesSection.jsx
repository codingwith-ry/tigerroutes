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
    icon: "/3D Elements/Recommendations.png"
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
    <section className="bg-[#fefce9] py-8 px-6 font-sfpro">
      <h2 className="text-center text-sm text-gray-500 tracking-widest font-bold">FEATURES</h2>
      <h3 className="text-center text-3xl md:text-4xl font-black mt-2 mb-10">How TigerRoutes Works?</h3>

      <div className="flex flex-col gap-12 max-w-2xl mx-auto">
        {features.map((feat, idx) => (
          <div
            key={idx}
            className={`flex gap-6 items-center ${idx % 2 === 1 ? "flex-row-reverse" : ""}`}
          >
            <img src={feat.icon} alt={feat.title} className="w-40 h-40 flex-shrink-0" />
            <div>
              <h4 className="text-xl font-semibold mb-2">{feat.title}</h4>
              <p className="text-gray-700">{feat.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
