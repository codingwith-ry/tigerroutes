import React from "react";

const features = [
  {
    title: "Take Comprehensive Assessment",
    description:
      "TigerRoutes uses AI to analyze your personality, interests, and academic strengths to provide personalized program recommendations.",
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
      "Receive your top 10 UST program recommendations - 5 aligned with your current track and 5 cross-track options that surprise you.",
    icon: "/3D Elements/Recommendations.png"
  },
  {
    title: "Explore Your Future",
    description:
      "Dive deep into career paths, job prospects, required certifications, and get guidance from UST counselors.",
    icon: "/3D Elements/Explore.png",
  },
];

const FeaturesSection = () => {
  return (
    <section className="bg-[#fefce9] py-16 px-6">
      <h2 className="text-center text-sm text-gray-500 tracking-widest font-medium">FEATURES</h2>
      <h3 className="text-center text-3xl md:text-4xl font-bold mt-2 mb-10">How TigerRoutes Works?</h3>

      <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {features.map((feat, idx) => (
          <div key={idx} className="flex gap-6 items-start">
            <img src={feat.icon} alt={feat.title} className="w-16 h-16" />
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
