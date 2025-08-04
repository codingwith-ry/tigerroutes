import React from "react";

const About = () => {
  return (
    <section className="bg-[#fff9e6] text-[#1e1e1e] py-20 px-6 font-sfpro">
      <div className="max-w-6xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12">
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-[#ea9d2d]">
            About <span className="text-[#4278c5]">TigerRoutes</span>
          </h2>
          <p className="text-base sm:text-lg text-[#333] leading-relaxed mb-4">
            <strong>TigerRoutes</strong> is your personalized college decision companion built specifically for Thomasian Senior High School students. Combining AI-powered assessments with real academic and career data, it helps you discover the best-fit UST programs based on your personality, interests, and strengths.
          </p>
          <p className="text-base sm:text-lg text-[#333] leading-relaxed mb-6">
            Whether you're still undecided or just want more clarity, TigerRoutes gives you confidence and direction. Our goal is simple: to help you take the next step toward a fulfilling and informed college journey—no guesswork, just data-backed insights.
          </p>
          <ul className="space-y-3 text-base text-[#1e1e1e]">
            <li className="flex items-start gap-2">
              <span className="text-[#5fafbe] font-bold">✔</span> Backed by RIASEC and Big Five assessments
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#5fafbe] font-bold">✔</span> Customized for UST SHS students
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#5fafbe] font-bold">✔</span> Rule-based AI + psychometrics = smart career matching
            </li>
          </ul>
        </div>

        <div className="w-full lg:w-1/2">
          <img
            src="/3D Elements/Tiger-Exploring.png"
            alt="TigerRoutes Illustration"
            className="w-full max-w-md mx-auto"
          />
        </div>
      </div>
    </section>
  );
};

export default About;
