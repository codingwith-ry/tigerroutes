import React, { useEffect } from "react";
import Navbar from "../Visitor-side/Navbar";

const sections = [
  {
    id: "overview",
    title: "Overview",
    content: (
      <>
        <p className="mb-4 text-gray-700">
          TigerRoutes: AI Career Navigator for Thomasian-SHS Students ("TigerRoutes") is a guidance tool developed to provide personalized college program recommendations and career guidance for senior high school students. This Privacy Policy describes what data we collect, how it is used, and your rights.
        </p>
        <p className="mb-2 text-gray-700 font-medium">System Name</p>
        <p className="mb-4 text-gray-700">TigerRoutes: AI Career Navigator for Thomasian-SHS Students</p>
        <p className="mb-2 text-gray-700 font-medium">Developer</p>
        <p className="mb-4 text-gray-700">Regulacion, Ryan B.</p>
      </>
    ),
  },
  {
    id: "purpose",
    title: "Purpose of Data Collection",
    content: (
      <p className="mb-4 text-gray-700">
        TigerRoutes collects and processes student data solely to deliver personalized college program recommendations and career path guidance. The system analyzes data using a rule-based scoring engine and AI-assisted tools to generate insights aligned with each student’s interests, personality traits, academic performance, and SHS track.
      </p>
    ),
  },
  {
    id: "types-data",
    title: "Types of Data Collected",
    content: (
      <>
        <p className="mb-3 text-gray-700">The system may collect the following categories of data:</p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>
            <strong>Personal Profile Information:</strong> student name, SHS track/strand, current grade level.
          </li>
          <li>
            <strong>Academic Information:</strong> semester/subject grades (e.g., Math, Science, English) and overall general weighted average.
          </li>
          <li>
            <strong>Assessment Results:</strong> RIASEC interest profile and Big Five personality trait scores.
          </li>
          <li>
            <strong>System Interactions:</strong> feedback ratings, exploration logs, and usage metadata.
          </li>
          <li>
            <strong>Counselor Inputs:</strong> comments or insights provided by assigned counselors.
          </li>
        </ul>
        <p className="mt-3 text-sm text-gray-600">
          Note: Sensitive identifiers (student IDs, addresses, contact information, etc.) are not collected or stored unless explicitly authorized.
        </p>
      </>
    ),
  },
  {
    id: "use-ai",
    title: "Use of AI and Automation",
    content: (
      <>
        <p className="mb-3 text-gray-700">
          TigerRoutes uses automated components to enhance guidance:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>
            <strong>Rule-Based Scoring Engine:</strong> computes alignment scores and produces program recommendations.
          </li>
          <li>
            <strong>AI-Assisted Chat/Explanation:</strong> supports users in understanding results and next steps. AI is used to assist, not to replace professional guidance.
          </li>
        </ul>
        <p className="mt-2 text-gray-700">
          Final decisions remain with students and their guidance counselors.
        </p>
      </>
    ),
  },
  {
    id: "storage-protection",
    title: "Data Storage and Protection",
    content: (
      <>
        <p className="mb-3 text-gray-700">
          Student data is stored securely using MySQL in an access-controlled environment. Security measures include encryption in transit (SSL) and restricted access to authorized personnel only.
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Access is limited to authorized development team members and assigned school counselors.</li>
          <li>Data is encrypted in transit and stored on secure servers.</li>
          <li>Administrative and technical safeguards are applied to protect confidentiality and integrity.</li>
        </ul>
      </>
    ),
  },
  {
    id: "retention",
    title: "Data Retention and Archiving",
    content: (
      <>
        <p className="mb-3 text-gray-700">
          Student records are retained for up to four (4) years following account creation for operational and statistical purposes, after which they will be archived. Users may request deletion earlier as described below.
        </p>
      </>
    ),
  },
  {
    id: "user-rights",
    title: "User Rights and Consent",
    content: (
      <>
        <p className="mb-3 text-gray-700">
          TigerRoutes complies with the Data Privacy Act of 2012. Users have the following rights:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Be informed how their data is used.</li>
          <li>Access their personal data and assessment results.</li>
          <li>Request correction of inaccurate data.</li>
          <li>Withdraw consent or request deletion of their data.</li>
        </ul>
        <p className="mt-3 text-gray-700">
          Upon registration and before submitting personal information or assessment results, students are required to provide informed consent.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Sharing and Disclosure",
    content: (
      <>
        <p className="mb-3 text-gray-700">
          TigerRoutes does not sell or trade personal data. Data may be shared only in the following limited circumstances:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Authorized school administrators and guidance counselors for educational purposes.</li>
          <li>Research partners in anonymized and aggregated form.</li>
          <li>Service providers that support platform functionality under confidentiality agreements.</li>
        </ul>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact & Requests",
    content: (
      <>
        <p className="mb-3 text-gray-700">
          To request access, correction, deletion, or to raise privacy concerns, contact:
        </p>
        <p className="font-medium text-gray-900">tigeroutes.support@ust.edu.ph</p>
        <p className="mt-3 text-sm text-gray-600">
          Include your name, student identifier (if applicable), and details of your request. Requests will be processed in accordance with applicable law.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    content: (
      <p className="mb-4 text-gray-700">
        This policy may be updated periodically. The effective date will be updated upon launch. Users will be notified of material changes.
      </p>
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
    <div className="min-h-screen bg-white text-gray-900"  style={{width: '100%'}}>
      <Navbar />
      <header className="relative bg-gradient-to-b from-[#FFCC00] to-white text-black text-center py-12">
        <h1 className="text-4xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-gray-700">Effective Date: November 2025</p>
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
          <svg className="relative block w-full h-12" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1200 120">
            <path d="M321.39 56.44C176.27 65.6 71.27 93.4 0 120h1200V0c-75.47 27.13-147.67 55.73-273.87 65.27C789.44 76.24 666.1 43.51 527.23 48.44 440.39 51.48 378.48 51.49 321.39 56.44z" fill="white"></path>
          </svg>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-6xl py-12 px-6">
        <aside className="md:col-span-1 sticky top-6 self-start">
          <nav>
            <ul className="space-y-4 text-sm font-medium">
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="block border-l-2 border-transparent pl-3 hover:border-[#FFCC00] hover:text-[#FFCC00] transition">
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="md:col-span-3 space-y-10"  style={{width: '100%'}}>
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="prose prose-sm">
              <h2 className="text-2xl font-semibold mb-3 text-[#CC9900]">{section.title}</h2>
              <div>{section.content}</div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
};

export default PrivacyPolicy;