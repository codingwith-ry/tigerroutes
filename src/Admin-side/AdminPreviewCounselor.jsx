import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { Mail, MapPin, BookOpen, Clock, Dot, MessageSquareText } from "lucide-react";
import { useParams } from "react-router-dom";
/* eslint-disable react/prop-types */

const CounselorPreview = () => {
  const { counselorName } = useParams(); // dynamic name from URL
  const decodedName = decodeURIComponent(counselorName || "");

  const [counselor, setCounselor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentComments, setRecentComments] = useState([]);

  useEffect(() => {
    // Try to read an ID from sessionStorage and fetch fresh data from backend.
    const storedId = sessionStorage.getItem("selectedCounselorId");
    const stored = sessionStorage.getItem("selectedCounselor");

    let mounted = true;

    const fetchById = async (id) => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/counselor/${encodeURIComponent(id)}`, { credentials: 'include' });
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

  // load recent comments for this counselor (by staffAccount_ID)
  useEffect(() => {
    const storedId = sessionStorage.getItem('selectedCounselorId');
    const counselorId = counselor?.staffAccount_ID || storedId;
    if (!counselorId) return;

    let mounted = true;
    async function loadComments() {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/counselor/${encodeURIComponent(counselorId)}/notes`, { credentials: 'include' });
        const body = await res.json();
        if (!mounted) return;
        if (body && body.success) {
          setRecentComments(body.data || []);
        }
      } catch (err) {
        console.error('Error loading counselor comments:', err);
      }
    }

    loadComments();
    return () => { mounted = false; };
  }, [counselor]);

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

    //Create a static HTML page that resembles an admin dashboard profile view for a counselor. Include a sidebar and a top header. Show the counselor’s initials as an avatar, full name, role, and department. Display a two-column section with contact information (email, office, consultation hours) on the left and an about section with a description and strand specialization on the right. Below that, show a "Recent Comments" section listing comment cards with student ID, assessment ID, timestamp, and counselor notes. Style the page with TailwindCSS including rounded corners, shadows, spacing, and responsive layout.

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
            {loading && <div className="p-4 text-center text-gray-600">Loading counselor...</div>}
            {error && <div className="p-4 text-center text-red-600">{error}</div>}
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
              <span className="text-sm text-gray-500">Total: {recentComments.length} comments</span>
            </div>

            <div className="space-y-4">
              {recentComments.length === 0 ? (
                <div className="text-sm text-gray-500">No recent comments.</div>
              ) : recentComments.map((note) => (
                <div key={note.counselorNote_ID} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                      <div className="flex items-center gap-2">
                      <MessageSquareText className="w-5 h-5 text-gray-400" />
                      <span className="text-sm">
                        {note.studentAccountId ? `STU-${String(note.studentAccountId).padStart(4, '0')} | Assessment-${note.studentAssessment_ID}` : `Assessment-${note.studentAssessment_ID}`}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{note.date ? new Date(String(note.date).endsWith('Z') ? note.date : `${note.date}Z`).toLocaleString('en-PH', { timeZone: 'Asia/Manila' }) : ''}</span>
                  </div>
                  <p className="text-gray-700 text-sm text-justify max-w-[1000px] leading-relaxed">
                    {note.counselorNotes}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CounselorPreview;
