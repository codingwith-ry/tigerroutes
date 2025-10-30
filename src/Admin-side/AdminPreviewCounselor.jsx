import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { Mail, Phone, MapPin, BookOpen, Clock, Dot, MessageSquareText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const CounselorPreview = () => {
  const navigate = useNavigate();
  const { counselorName } = useParams(); // dynamic name from URL
  const decodedName = decodeURIComponent(counselorName || "");

  const [counselor, setCounselor] = useState(null);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Try to read an ID from sessionStorage and fetch fresh data from backend.
    const storedId = sessionStorage.getItem("selectedCounselorId");
    const stored = sessionStorage.getItem("selectedCounselor");

    let mounted = true;

    const fetchById = async (id) => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`http://localhost:5000/api/counselor/${encodeURIComponent(id)}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('Counselor not found');
            setCounselor(null);
            return;
          }
          throw new Error(`HTTP ${res.status}`);
        }
        const json = await res.json();
        if (mounted) {
          setCounselor(json.data || null);
        }
      } catch (err) {
        console.error('Error fetching counselor by id:', err);
        if (mounted) setError(err.message || 'Network error');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (storedId) {
      // If an ID is present, fetch canonical record from backend
      fetchById(storedId);
      return () => { mounted = false; };
    }

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCounselor(parsed);
        setLoading(false);
        setError(null);
        return () => { mounted = false; };
      } catch (e) {
        console.warn("Invalid JSON in sessionStorage.selectedCounselor", e);
        sessionStorage.removeItem("selectedCounselor");
      }
    }

    // No data available
    setLoading(false);
    setError("No counselor data in sessionStorage");
    return () => { mounted = false; };
  }, [decodedName]);

  // Helper to generate email from name
  const formatEmail = (name) => {
    const parts = name.split(" ");
    const first = parts[1] ? parts[1].toLowerCase() : parts[0].toLowerCase(); // skip title
    const last = parts[parts.length - 1].toLowerCase();
    return `${first}.${last}@school.edu`;
  };

  

  const renderValue = (value, fallback = 'N/A') => (value ? value : fallback);
  // Accept either `officeDetails`/`consultationDetails` (DB names) or `officeLocation`/`consultationHours` (frontend)
  const email = counselor?.email || formatEmail(decodedName);

  return (
    <div className="flex flex-col md:flex-row w-screen h-screen bg-[#fdfcf8]">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader title="Manage Counselors" />

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <div className="bg-white rounded-xl p-6 shadow border border-gray-200">
            {/* Profile Header */}
            <div className="flex items-center gap-5 mb-6">
              <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center text-xl font-bold text-white">
                {decodedName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {counselor?.name || decodedName}
                </h2>
                <p className="text-gray-500 flex items-center gap-1">
                  {counselor?.role || "Counselor"} <Dot className="w-4 h-4" /> Guidance & Counseling
                </p>
              </div>
            </div>

            {/* Grid: Contact + About */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Contact Information
                </h3>
                <ul className="space-y-4 text-sm">
                  <li className="flex items-start gap-2">
                    <Mail className="w-6 h-6 mt-2 text-gray-400" />
                    <div className="flex flex-col">
                      <span className="font-normal">Email:</span>
                      <span className="font-bold">{email}</span>
                    </div>
                  </li>
                  {/* <li className="flex items-start gap-2">
                    <Phone className="w-6 h-6 mt-2 text-gray-400" />
                    <div className="flex flex-col">
                      <span className="font-normal">Phone:</span>
                      <span className="font-bold">+63 917 555 0123</span>
                    </div>
                  </li> */}
                  <li className="flex items-start gap-2">
                    <MapPin className="w-6 h-6 mt-2 text-gray-400" />
                    <div className="flex flex-col">
                      <span className="font-normal">Office:</span>
                          <span className="font-bold">{renderValue(counselor?.officeDetails, '—')}</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="w-6 h-6 mt-2 text-gray-400" />
                    <div className="flex flex-col">
                      <span className="font-normal">Consultation Hours:</span>
                          <span className="font-bold">{renderValue(counselor?.consultationDetails, '—')}</span>
                    </div>
                  </li>
                </ul>
              </div>

              {/* About */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">About</h3>
                <p className="text-gray-600 text-sm text-justify max-w-[450px] leading-relaxed">
                  {renderValue(counselor?.about, 'No description available.')}
                </p>
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">
                    Profession Details
                  </h3>
                  <div className="flex items-start gap-2 text-sm">
                    <BookOpen className="w-6 h-6 mt-2 text-gray-400" />
                    <div className="flex flex-col">
                      <span className="font-normal">Strand Specialization:</span>
                          <span className="font-bold">{renderValue(counselor?.strand, 'N/A')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Comments */}
          <div className="bg-white rounded-xl p-6 shadow border border-gray-200 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Recent Comments</h3>
              <span className="text-sm text-gray-500">Total: 2 comments</span>
            </div>

            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquareText className="w-5 h-5 text-gray-400" />
                    <span className="text-sm">STU-0001</span>
                  </div>
                  <span className="text-xs text-gray-400">2025-09-27 14:30</span>
                </div>
                <p className="text-gray-700 text-sm text-justify max-w-[1000px] leading-relaxed">
                  With high Investigative and Realistic scores, student fits well in engineering or
                  computer-related fields. BS Computer Engineering or Electronics Engineering may
                  provide the challenge and structure they enjoy. Suggested exploring robotics or
                  AI-focused orgs.
                </p>
              </div>

              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquareText className="w-5 h-5 text-gray-400" />
                    <span className="text-sm">STU-0026</span>
                  </div>
                  <span className="text-xs text-gray-400">2025-09-27 11:20</span>
                </div>
                <p className="text-gray-700 text-sm text-justify max-w-[1000px] leading-relaxed">
                  Student showed a clear interest in problem-solving and digital technology. Based
                  on the assessment, BS Computer Science or Information Technology aligns well with
                  their top traits. Recommended joining STEM programs or coding workshops to enhance
                  readiness.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CounselorPreview;
