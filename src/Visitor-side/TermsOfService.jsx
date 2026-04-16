import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../Visitor-side/Navbar";
import UserNavbar from "../User-side/UserNavbar";
import { useAuth } from "../utils/AuthContext";


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
    id: "data-retention-assessment-policy",
    title: "Data Retention and Assessment Policy",
    content: (
      <>
        <p className="mb-4 text-gray-700">
          Student records are retained for up to four (4) years following account
          creation for operational and statistical purposes, after which they will
          be archived. Users may request deletion of their data prior to this
          period, subject to applicable policies and procedures.
        </p>
        <p className="mb-4 text-gray-700">
          Pending assessments may only be completed within thirty (30) days from
          the initial date of assessment. If the assessment is not completed within
          this period, all data related to the pending assessment will be
          automatically deleted from the system. This policy ensures that all
          assessment data remains current, accurate, and relevant.
        </p>
      </>
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
        <p className="text-gray-900 font-medium">tigerroutes.contact@gmail.com</p>
      </>
    ),
  },
];

const TermsOfService = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  
  useEffect(() => {
    if (!authLoading && user) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }

    // Determine how Privacy Policy was accessed
    if (location.state) {
      // Hide navbar only if from assessment, otherwise show
      setShowNavbar(!location.state.fromAssessment);
    }

    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, [location.state, authLoading, user]);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    document.title = "Terms of Service | TigerRoutes";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {showNavbar ? (loggedIn ? <UserNavbar /> : <Navbar />) : null}
      
      {/* HEADER */}
      <header className="relative bg-yellow-300 text-black text-center py-16 pb-28">
        <h1 className="text-4xl font-black mt-3">Terms of Service</h1>
        <p className="mt-2 text-gray-700">Effective Date: November 2025</p>

        {/* Curve at the bottom */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg
            className="
            relative block w-full
            h-12              /* mobile height */
            sm:h-16           /* small screens */
            md:h-20           /* medium screens */
            lg:h-24           /* large desktops */
            scale-y-[-1]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              fill="#ffffff"
              d="M0,256L80,224C160,192,320,128,480,96C640,64,800,64,960,101.3C1120,139,1280,213,1360,250.7L1440,288L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
            />
          </svg>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Mobile: horizontal, scrollable nav above content */}
        <div className="md:hidden mb-6 px-4">
          <nav>
            <ul className="flex gap-3 overflow-x-auto whitespace-nowrap no-scrollbar py-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="inline-block px-3 py-2 rounded-md text-sm text-gray-700 bg-gray-100 hover:bg-[#FFCC00] hover:text-white transition"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Desktop aside (hidden on small screens) */}
        <aside className="hidden md:block md:col-span-1 sticky top-6 self-start">
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
