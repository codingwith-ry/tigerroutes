import React from "react";

const features = [
  {
    title: "Take the Comprehensive Assessment",
    description:
      "Start your journey with a guided assessment designed to measure your interests, personality traits, academic strengths, and SHS track alignment. Every question is crafted to help you understand yourself better and make clearer academic decisions.",
    icon: "/3D Elements/Assessments.webp",
  },
  {
    title: "Structured Scoring & Evaluation",
    description:
      "TigerRoutes uses a refined, rule-based scoring framework built around RIASEC, the Big Five, your academic performance, and your SHS track. Each factor contributes a specific percentage, ensuring recommendations are consistent, fair, and grounded in research-based criteria.",
    icon: "/3D Elements/AI.webp",
  },
  {
    title: "Personalized Program Recommendations",
    description:
      "After completing the assessment, you'll receive a curated list of the top UST programs that match your profile. This includes both track-aligned options and cross-track opportunities—giving you a wider perspective on where your strengths could thrive.",
    icon: "/3D Elements/Recommendations.webp",
  },
  {
    title: "Explore Your Path Ahead",
    description:
      "Learn more about potential careers, required skills, industry outlook, and available pathways for each recommended program. You can also get guidance through our built-in chatbot for FAQs, support, and next steps. Export your results and move closer to your future.",
    icon: "/3D Elements/Explore.webp",
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
