import React, { useEffect } from "react";

const sections = [
  {
    id: "introduction",
    title: "Introduction",
    content: (
      <p className="mb-4 text-gray-700">
        Welcome to TigerRoutes. By accessing or using our services, you agree to
        comply with these Terms of Service. Please read them carefully before
        using our platform.
      </p>
    ),
  },
  {
    id: "eligibility",
    title: "Eligibility",
    content: (
      <p className="mb-4 text-gray-700">
        TigerRoutes is intended for senior high school students, counselors, and
        administrators of the University of Santo Tomas community. By using our
        services, you confirm that you are eligible under applicable laws and
        authorized by your institution to use the platform.
      </p>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable Use",
    content: (
      <ul className="list-disc list-inside space-y-2 text-gray-700">
        <li>Do not misuse or exploit the platform for unauthorized purposes.</li>
        <li>
          Do not attempt to disrupt service operation, hack, or gain unauthorized
          access to accounts or systems.
        </li>
        <li>
          Use the platform responsibly and only for educational or guidance-related
          purposes.
        </li>
      </ul>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property",
    content: (
      <p className="mb-4 text-gray-700">
        All content, branding, and materials provided by TigerRoutes are the
        intellectual property of the University of Santo Tomas and its authorized
        partners. Unauthorized reproduction, distribution, or modification is
        prohibited without prior consent.
      </p>
    ),
  },
  {
    id: "limitation",
    title: "Limitation of Liability",
    content: (
      <p className="mb-4 text-gray-700">
        TigerRoutes is provided “as is” without any warranties. While we strive to
        ensure accuracy and availability, we are not liable for any damages
        resulting from the use or inability to use the service.
      </p>
    ),
  },
  {
    id: "termination",
    title: "Termination",
    content: (
      <p className="mb-4 text-gray-700">
        We reserve the right to suspend or terminate accounts that violate these
        Terms of Service or engage in activities that may harm the platform,
        community, or institution.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to Terms",
    content: (
      <p className="mb-4 text-gray-700">
        These Terms of Service may be updated from time to time. Continued use of
        the platform after updates constitutes acceptance of the revised terms.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact Us",
    content: (
      <>
        <p className="mb-4 text-gray-700">
          If you have any questions about these Terms of Service, please contact
          us at:
        </p>
        <p className="text-gray-900 font-medium">tigeroutes.support@ust.edu.ph</p>
      </>
    ),
  },
];

const TermsOfService = () => {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero Header */}
      <header className="relative bg-gradient-to-b from-[#FFCC00] to-white text-black text-center py-16">
        <h1 className="text-4xl font-bold">Terms of Service</h1>
        <p className="mt-2 text-gray-700">Effective Date: September 2025</p>
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
      <div className="container mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Sidebar */}
        <aside className="md:col-span-1 sticky top-6 self-start">
          <nav>
            <ul className="space-y-4 text-sm font-medium">
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

        {/* Content */}
        <main className="md:col-span-3 space-y-16">
          {sections.map((section) => (
            <section key={section.id} id={section.id}>
              <h2 className="text-2xl font-semibold mb-4 text-[#CC9900]">
                {section.title}
              </h2>
              {section.content}
            </section>
          ))}
        </main>
      </div>
    </div>
  );
};

export default TermsOfService;
