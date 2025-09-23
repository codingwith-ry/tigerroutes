import React, { useEffect } from "react";
import Navbar from "../Visitor-side/Navbar";

const sections = [
  {
    id: "types-info",
    title: "Types of Information We Collect",
    content: (
      <>
        <p className="mb-4 text-gray-700 font-sfpro">
          We collect different types of personal and non-personal information to provide better guidance, improve user experience, and enhance TigerRoutes services.
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 font-sfpro">
          <li>Personal details such as name, email, and contact information</li>
          <li>Academic background and Senior High School track</li>
          <li>Psychometric results (RIASEC, Big Five, etc.)</li>
          <li>Usage data when interacting with our platform</li>
        </ul>
      </>
    ),
  },
  {
    id: "auto-info",
    title: "Information Collected Automatically",
    content: (
      <>
        <p className="mb-4 text-gray-700 font-sfpro">
          When you use TigerRoutes, we may automatically collect technical data such as:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 font-sfpro">
          <li>IP address and browser type</li>
          <li>Device information and operating system</li>
          <li>Pages visited, time spent, and interaction logs</li>
        </ul>
      </>
    ),
  },
  {
    id: "how-use",
    title: "How We Use Your Information",
    content: (
      <>
        <p className="mb-4 text-gray-700 font-sfpro">
          Information collected is used to provide personalized program recommendations, improve our AI models, and support research purposes. Specifically, we use it to:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 font-sfpro">
          <li>Generate career and program matches tailored to students</li>
          <li>Enhance system performance and reliability</li>
          <li>Provide counselors with accurate insights</li>
        </ul>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Information We Share",
    content: (
      <>
        <p className="mb-4 text-gray-700 font-sfpro">
          We do not sell or trade personal data. Information may only be shared with:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 font-sfpro">
          <li>Authorized school administrators and counselors</li>
          <li>Research partners (in anonymized and aggregated form)</li>
          <li>Service providers ensuring platform functionality</li>
        </ul>
      </>
    ),
  },
  {
    id: "student-privacy",
    title: "Student Privacy",
    content: (
      <p className="mb-4 text-gray-700 font-sfpro">
        Protecting students’ privacy is a top priority. Only data relevant to career guidance is collected, and strict measures are enforced to ensure security and confidentiality.
      </p>
    ),
  },
  {
    id: "your-choices",
    title: "Your Privacy Choices",
    content: (
      <p className="mb-4 text-gray-700 font-sfpro">
        Students may request access, correction, or deletion of their personal information by contacting the TigerRoutes team.
      </p>
    ),
  },
  {
    id: "data-security",
    title: "Data Security",
    content: (
      <p className="mb-4 text-gray-700 font-sfpro">
        We implement strong security practices including encryption, secure servers, and limited data access to protect your information.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact Us",
    content: (
      <>
        <p className="mb-4 text-gray-700 font-sfpro">
          If you have any questions about this Privacy Policy, please contact us at:
        </p>
        <p className="text-gray-900 font-medium">tigeroutes.support@ust.edu.ph</p>
      </>
    ),
  },
];

const PrivacyPolicy = () => {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sfpro">
      {/* Hero Header */}
      <Navbar />
      <header className="relative bg-gradient-to-b from-[#FFCC00] to-white text-black text-center py-16">
        <h1 className="text-4xl font-bold font-sfpro">Privacy Policy</h1>
        <p className="mt-2 text-gray-700 font-sfpro">Effective Date: September 2025</p>
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
          <svg
            className="relative block w-full h-16"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            viewBox="0 0 1200 120"
          >
            <path
              d="M321.39 56.44C176.27 65.6 71.27 93.4 0 120h1200V0c-75.47 27.13-147.67 55.73-273.87 65.27C789.44 76.24 666.1 43.51 527.23 48.44 440.39 51.48 378.48 51.49 321.39 56.44z"
              fill="white"
            ></path>
          </svg>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12 font-sfpro">
        {/* Sidebar */}
        <aside className="md:col-span-1 sticky top-6 self-start">
          <nav>
            <ul className="space-y-4 text-sm font-medium font-sfpro">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="block border-l-2 border-transparent pl-3 hover:border-[#FFCC00] hover:text-[#FFCC00] transition"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Sections */}
        <main className="md:col-span-3 space-y-16 font-sfpro">
          {sections.map((section) => (
            <section key={section.id} id={section.id}>
              <h2 className="text-2xl font-semibold mb-4 text-[#CC9900] font-sfpro">{section.title}</h2>
              {section.content}
            </section>
          ))}
        </main>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
