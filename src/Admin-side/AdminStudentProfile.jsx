import React, { useState, useEffect } from "react";
import {
  Calendar,
  Star,
  TrendingUp,
  MessageSquareText,
  Award,
  User,
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { useParams } from "react-router-dom";
import { fetchStaffProfile } from '../utils/staffProfile';

const AdminStudentProfile = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("assessment");

  // API-sourced state
  const [assessmentData, setAssessmentData] = useState(null);
  const [programRecommendations, setProgramRecommendations] = useState({ track_aligned: [], cross_track: [] });

  // Load assessment details using either the URL param or sessionStorage
  useEffect(() => {
    const assessmentId = id || sessionStorage.getItem('selectedAssessmentId');
    if (!assessmentId) return;

    let cancelled = false;
    async function loadDetails() {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/assessment/assessmentDetails?assessmentID=${encodeURIComponent(assessmentId)}`, { credentials: 'include' });
        const payload = await res.json();
        if (cancelled) return;
        if (!payload || !payload.success) {
          console.log(payload?.message || 'Failed to load assessment details');
          setAssessmentData(null);
          setStudentFeedback(null);
        } else {
          setAssessmentData(payload.data || null);
          // populate studentFeedback from server fields (rating, feedback)
          const rating = payload.data && typeof payload.data.rating !== 'undefined' ? payload.data.rating : null;
          const feedbackText = payload.data && typeof payload.data.feedback !== 'undefined' ? payload.data.feedback : null;
          if ((rating !== null && rating !== undefined) || (feedbackText && String(feedbackText).trim() !== '')) {
            setStudentFeedback({
              rating: rating || 0,
              date: payload.data && payload.data.assessmentProfile && payload.data.assessmentProfile.date ? new Date(payload.data.assessmentProfile.date) : new Date(),
              comment: feedbackText || ''
            });
          } else {
            setStudentFeedback(null);
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error loading assessment details', err);
        }
      } finally {
        if (!cancelled) 
          console.log('Finished loading assessment details');
      }
    }

    loadDetails();
    return () => { cancelled = true; };
  }, [id]);

  // Fetch program recommendations separately from adminassessmentRoutes
  useEffect(() => {
    document.title = "Admin Dashboard | Student Profile";
    const assessmentId = id || sessionStorage.getItem('selectedAssessmentId');
    if (!assessmentId) return;

    let cancelled = false;
    async function loadPrograms() {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/assessment/${encodeURIComponent(assessmentId)}/programs`, { credentials: 'include' });
        const body = await res.json();
        if (cancelled) return;
        if (body && body.success) {
          setProgramRecommendations(body.data || { track_aligned: [], cross_track: [] });
        } else {
          setProgramRecommendations({ track_aligned: [], cross_track: [] });
        }
      } catch (err) {
        if (!cancelled) console.error('Error loading program recommendations', err);
        if (!cancelled) setProgramRecommendations({ track_aligned: [], cross_track: [] });
      }
    }

    loadPrograms();
    return () => { cancelled = true; };
  }, [id]);

  // derive student fields per requested mapping
  const studentAccountId = assessmentData?.assessmentProfile?.studentAccount_ID || sessionStorage.getItem('selectedStudentAccountId') || assessmentData?.assessmentProfile?.studentAccountId || null;

  const student = {
    id: studentAccountId ? `STU-${studentAccountId}` : 'N/A',
    name: assessmentData?.assessmentProfile?.name || 'Student Name',
  yearLevel: assessmentData?.assessmentProfile?.gradeLevel ? `Grade ${assessmentData.assessmentProfile.gradeLevel}` : 'N/A',
    strand: assessmentData?.assessmentProfile?.strandName || 'N/A',
    status: 'Active',
    generalAverage: assessmentData?.assessmentProfile?.genAverageGrade || 0,
    grades: {
      math: assessmentData?.assessmentProfile?.mathGrade || 0,
      science: assessmentData?.assessmentProfile?.scienceGrade || 0,
      english: assessmentData?.assessmentProfile?.englishGrade || 0,
    },
    alignment: (() => {
      const track = (programRecommendations && programRecommendations.track_aligned) || [];
      if (!track || track.length === 0) return null;
      const avg = track.reduce((s, p) => s + (p.alignment_score || 0), 0) / track.length;
      return Math.round(avg);
    })(),
    riasec: assessmentData?.riasec || {},
    bigFive: assessmentData?.bigFive || {},
  };

  // Student feedback comes from the assessment record (tbl_studentassessments.feedback and rating)
  // If absent, set to null and disable counselor commenting
  const [studentFeedback, setStudentFeedback] = useState(null);

  const [counselorNotes, setCounselorNotes] = useState([]);

  const [newNote, setNewNote] = useState('');

  // Local cached staff profile (fetched from server via JWT cookie)
  const [staffUserProfile, setStaffUserProfile] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const p = await fetchStaffProfile();
      if (mounted) setStaffUserProfile(p || null);
    })();
    return () => { mounted = false; };
  }, []);

  // fetch counselor notes for the current assessment
  useEffect(() => {
    const assessmentId = id || sessionStorage.getItem('selectedAssessmentId');
    if (!assessmentId) return;

    let cancelled = false;
    async function loadNotes() {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/assessment/${encodeURIComponent(assessmentId)}/notes`, { credentials: 'include' });
        const body = await res.json();
        if (cancelled) return;
        if (body && body.success) {
          // map server rows to UI-friendly shape
          const notes = (body.data || []).map(n => ({
            id: n.counselorNote_ID,
            staffAccount_ID: n.staffAccount_ID,
            author: n.counselorName || 'Counselor',
            email: n.counselorEmail || null,
            date: n.date ? new Date(n.date) : new Date(),
            // convert edited_date (TIMESTAMP or ISO string) to JS Date if present
            editedDate: n.edited_date ? (typeof n.edited_date === 'number' ? new Date(Number(n.edited_date) * 1000) : new Date(n.edited_date)) : null,
            comment: n.counselorNotes || ''
          }));
          setCounselorNotes(notes);
        }
      } catch (err) {
        console.error('Error loading counselor notes', err);
      }
    }

    loadNotes();
    return () => { cancelled = true; };
  }, [id]);

  const handleAddNote = async () => {
    const assessmentId = id || sessionStorage.getItem('selectedAssessmentId');
    if (!assessmentId) return Swal.fire('Missing', 'Assessment ID missing', 'error');
    if (!newNote.trim()) return Swal.fire('Empty note', 'Please enter a note before replying.', 'warning');

    // Enforce single counselor note per assessment
    if (counselorNotes && counselorNotes.length > 0) {
      return Swal.fire('One note only', 'A counselor note already exists for this assessment. Delete the existing note before adding a new one.', 'info');
    }

    // determine current staff user from sessionStorage
  let staffUser = staffUserProfile;
  if (!staffUser) {
    staffUser = await fetchStaffProfile();
    if (staffUser) setStaffUserProfile(staffUser);
  }
  const staffAccount_ID = staffUser?.staffAccount_ID || staffUser?.staffAccountId || staffUser?.staffAccountID || staffUser?.id;
    if (!staffAccount_ID) return Swal.fire('Not signed in', 'Staff account not found. Please login again.', 'error');

    const confirm = await Swal.fire({
      title: 'Add counselor note?',
      text: 'Are you sure you want to add this note?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, add it',
      cancelButtonText: 'Cancel'
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/assessment/${encodeURIComponent(assessmentId)}/notes`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffAccount_ID, counselorNotes: newNote.trim() })
      });
      const body = await res.json();
      if (body && body.success) {
        // reload notes
        setNewNote('');
        const refresh = await fetch(`${process.env.REACT_APP_API_URL}/api/assessment/${encodeURIComponent(assessmentId)}/notes`, { credentials: 'include' });
        const refreshed = await refresh.json();
        if (refreshed && refreshed.success) {
          const notes = (refreshed.data || []).map(n => ({
            id: n.counselorNote_ID,
            staffAccount_ID: n.staffAccount_ID,
            author: n.counselorName || 'Counselor',
            email: n.counselorEmail || null,
            date: n.date ? new Date(n.date) : new Date(),
            editedDate: n.edited_date ? (typeof n.edited_date === 'number' ? new Date(Number(n.edited_date) * 1000) : new Date(n.edited_date)) : null,
            comment: n.counselorNotes || ''
          }));
          setCounselorNotes(notes);
        }
        await Swal.fire('Saved', 'Counselor note added', 'success');
      } else {
        Swal.fire('Error', body?.message || 'Failed to save note', 'error');
      }
    } catch (err) {
      console.error('Error saving counselor note', err);
      Swal.fire('Error', 'Failed to save note', 'error');
    }
  };

  // delete a note if current staff user is the owner
  const handleDeleteNote = async (noteId, noteStaffId) => {
  const assessmentId = id || sessionStorage.getItem('selectedAssessmentId');
  if (!assessmentId) return Swal.fire('Missing', 'Assessment ID missing', 'error');

  let staffUser = staffUserProfile;
  if (!staffUser) {
    staffUser = await fetchStaffProfile();
    if (staffUser) setStaffUserProfile(staffUser);
  }
  const staffAccount_ID = staffUser?.staffAccount_ID || staffUser?.staffAccountId || staffUser?.staffAccountID || staffUser?.id;
  if (!staffAccount_ID) return Swal.fire('Not signed in', 'Staff account not found. Please login again.', 'error');

    if (String(staffAccount_ID) !== String(noteStaffId)) {
      return Swal.fire('Unauthorized', 'You are not authorized to delete this note', 'error');
    }

    const confirmed = await Swal.fire({
      title: 'Delete this note?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    });
    if (!confirmed.isConfirmed) return;

    try {
      const url = `${process.env.REACT_APP_API_URL}/api/admin/assessment/${encodeURIComponent(assessmentId)}/notes/${encodeURIComponent(noteId)}?staffAccount_ID=${encodeURIComponent(staffAccount_ID)}`;
      const res = await fetch(url, { method: 'DELETE', credentials: 'include' });
      const body = await res.json();
      if (body && body.success) {
        // remove from local state
        setCounselorNotes((prev) => prev.filter(n => String(n.id) !== String(noteId)));
        await Swal.fire('Deleted', 'Counselor note deleted', 'success');
      } else {
        Swal.fire('Error', body?.message || 'Failed to delete note', 'error');
      }
    } catch (err) {
      console.error('Error deleting counselor note', err);
      Swal.fire('Error', 'Failed to delete note', 'error');
    }
  };

  // Inline edit state and handlers
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const handleStartEdit = (note) => {
    setEditingNoteId(note.id);
    setEditingText(note.comment || '');
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingText('');
  };

  const handleSaveEdit = async (noteId, noteStaffId) => {
  const assessmentId = id || sessionStorage.getItem('selectedAssessmentId');
  if (!assessmentId) return Swal.fire('Missing', 'Assessment ID missing', 'error');

  let staffUser = staffUserProfile;
  if (!staffUser) {
    staffUser = await fetchStaffProfile();
    if (staffUser) setStaffUserProfile(staffUser);
  }
  const staffAccount_ID = staffUser?.staffAccount_ID || staffUser?.staffAccountId || staffUser?.staffAccountID || staffUser?.id;
  if (!staffAccount_ID) return Swal.fire('Not signed in', 'Staff account not found. Please login again.', 'error');

    if (String(staffAccount_ID) !== String(noteStaffId)) return Swal.fire('Unauthorized', 'You are not authorized to edit this note', 'error');

    const confirmed = await Swal.fire({
      title: 'Save changes?',
      text: 'Do you want to save your changes to this note?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel'
    });
    if (!confirmed.isConfirmed) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/assessment/${encodeURIComponent(assessmentId)}/notes/${encodeURIComponent(noteId)}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffAccount_ID, counselorNotes: editingText.trim() })
      });
      const body = await res.json();
      if (body && body.success) {
        const ed = body.data && body.data.edited_date ? body.data.edited_date : null;
        const editedDateObj = ed ? (typeof ed === 'number' ? new Date(Number(ed) * 1000) : new Date(ed)) : null;
        setCounselorNotes(prev => prev.map(n => n.id === noteId ? { ...n, comment: editingText.trim(), editedDate: editedDateObj || n.editedDate } : n));
        setEditingNoteId(null);
        setEditingText('');
        await Swal.fire('Saved', 'Note updated', 'success');
      } else {
        Swal.fire('Error', body?.message || 'Failed to save edit', 'error');
      }
    } catch (err) {
      console.error('Error editing counselor note', err);
      Swal.fire('Error', 'Failed to save edit', 'error');
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-screen h-screen bg-[#fdfcf8]">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Student Profile" />

        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* ===== Student Dashboard Card ===== */}
          <div className="bg-gradient-to-r from-orange-100 via-yellow-50 to-white rounded-2xl shadow border border-gray-200 p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Avatar */}
            <div className="w-24 h-24 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold text-2xl">
              <User className="w-10 h-10" />
            </div>

            {/* Student Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
              <p className="text-sm text-gray-500 mb-2">{student.id}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm">
                <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full border border-orange-200">
                  {student.yearLevel}
                </span>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                  {student.strand}
                </span>
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
                  {student.status}
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-col gap-2 text-center md:text-right">
              <p className="text-sm text-gray-600">Overall Alignment</p>
              <p className="text-3xl font-bold text-orange-600">{student.alignment}%</p>
              <p className="text-xs text-gray-500">Strand Match</p>
            </div>
          </div>

          {/* Semester Grades (simplified - academic information removed) */}
          <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-500" />
                Semester Grades
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                  <p className="text-xs text-orange-600 mb-1">General Average</p>
                  <p className="text-xl font-bold text-orange-700">{student.generalAverage}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Mathematics</p>
                  <p className="text-lg font-semibold">{student.grades.math}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Science</p>
                  <p className="text-lg font-semibold">{student.grades.science}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">English</p>
                  <p className="text-lg font-semibold">{student.grades.english}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ===== Tabs Section ===== */}
          <div className="bg-white rounded-xl shadow border border-gray-200">
            <div className="flex border-b">
              <button
                className={`px-6 py-3 text-sm font-medium flex items-center gap-2 ${
                  activeTab === "assessment"
                    ? "text-orange-600 border-b-2 border-orange-500"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("assessment")}
              >
                <Award className="w-4 h-4" />
                Assessment Results
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium flex items-center gap-2 ${
                  activeTab === "notes"
                    ? "text-orange-600 border-b-2 border-orange-500"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("notes")}
              >
                <MessageSquareText className="w-4 h-4" />
                Counselor Notes
              </button>
            </div>

            <div className="p-6">
              {activeTab === "assessment" ? (
                <div className="space-y-10">
                  {/* RIASEC Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">RIASEC Interest Results</h3>
                    <div className="space-y-3">
                      {Object.entries(student.riasec)
                        .filter(([key]) => !/id$/i.test(key) && !/id/i.test(key))
                        .map(([key, value]) => (
                        <div key={key}>
                          <div className="flex justify-between text-sm font-medium">
                            <span className="capitalize">{key}</span>
                            <span>{value}%</span>
                          </div>
                          <div className="w-full bg-gray-200 h-2 rounded-full">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Big Five Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">Big Five Personality Results</h3>
                    <div className="space-y-3">
                      {Object.entries(student.bigFive)
                        .filter(([key]) => !/id$/i.test(key) && !/id/i.test(key))
                        .map(([key, value]) => (
                        <div key={key}>
                          <div className="flex justify-between text-sm font-medium">
                            <span className="capitalize">{key}</span>
                            <span>{value}%</span>
                          </div>
                          <div className="w-full bg-gray-200 h-2 rounded-full">
                            <div
                              className="bg-purple-500 h-2 rounded-full transition-all"
                              style={{ width: `${value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Program Recommendations Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-orange-500" />
                      Program Recommendations & Career Paths
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Academic programs that align with your interests and personality
                    </p>

                    {/* Use programRecommendations fetched from /api/assessment/:id/programs */}
                    {(!programRecommendations || ((programRecommendations.track_aligned || []).length === 0 && (programRecommendations.cross_track || []).length === 0)) ? (
                      <div className="text-sm text-gray-500">No program recommendations available.</div>
                    ) : (
                      <div className="space-y-6">
                        {programRecommendations.track_aligned && programRecommendations.track_aligned.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Top track-aligned programs</h4>
                            {programRecommendations.track_aligned.map((p, idx) => (
                              <div key={`track-${p.recommendationId || idx}`} className="mb-5 border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
                                <div className="flex justify-between items-center mb-2">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-green-100 text-green-700`}>
                                      <Star className="w-4 h-4" />
                                    </div>
                                    <h4 className="font-semibold text-gray-800 text-base">{p.programName}</h4>
                                  </div>
                                  <div className="text-sm font-semibold">
                                    <span className={`${(p.alignment_score || 0) >= 90 ? 'text-green-600' : (p.alignment_score || 0) >= 80 ? 'text-blue-600' : (p.alignment_score || 0) >= 70 ? 'text-yellow-600' : 'text-gray-600'}`}>{p.alignment_score || 0}%</span>
                                    <span className="text-gray-500 font-normal"> match</span>
                                  </div>
                                </div>
                                {p.programDescription && <div className="text-xs text-gray-600 mb-2">{p.programDescription}</div>}
                                {p.careerPaths && Array.isArray(p.careerPaths) && (
                                  <div className="text-xs text-gray-600 mt-3">
                                    <span className="font-semibold text-gray-700">Potential career paths:</span>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {p.careerPaths.map((path, i) => (
                                        <span key={i} className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs border border-green-200">{path}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {programRecommendations.cross_track && programRecommendations.cross_track.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Cross-track programs</h4>
                            {programRecommendations.cross_track.map((p, idx) => (
                              <div key={`cross-${p.recommendationId || idx}`} className="mb-5 border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
                                <div className="flex justify-between items-center mb-2">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-700`}>
                                      <TrendingUp className="w-4 h-4" />
                                    </div>
                                    <h4 className="font-semibold text-gray-800 text-base">{p.programName}</h4>
                                  </div>
                                  <div className="text-sm font-semibold">
                                    <span className={`${(p.alignment_score || 0) >= 90 ? 'text-green-600' : (p.alignment_score || 0) >= 80 ? 'text-blue-600' : (p.alignment_score || 0) >= 70 ? 'text-yellow-600' : 'text-gray-600'}`}>{p.alignment_score || 0}%</span>
                                    <span className="text-gray-500 font-normal"> match</span>
                                  </div>
                                </div>
                                {p.programDescription && <div className="text-xs text-gray-600 mb-2">{p.programDescription}</div>}
                                {p.careerPaths && Array.isArray(p.careerPaths) && (
                                  <div className="text-xs text-gray-600 mt-3">
                                    <span className="font-semibold text-gray-700">Potential career paths:</span>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {p.careerPaths.map((path, i) => (
                                        <span key={i} className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs border border-green-200">{path}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Counselor Notes - Twitter-like Thread
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Student Feedback</h3>

                  <div className="space-y-4">
                    {/* Student’s Feedback - Root Comment (if present) */}
                    {studentFeedback ? (
                      <div className="flex space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-gray-900 text-sm">{student.name}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(String(studentFeedback.date).endsWith('Z') ? studentFeedback.date : `${studentFeedback.date}Z`).toLocaleDateString('en-PH', { timeZone: 'Asia/Manila' })}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1 text-yellow-500">
                                {Array.from({ length: studentFeedback.rating }, (_, i) => (
                                  <Star key={i} className="w-4 h-4 fill-current" />
                                ))}
                                <span className="text-xs font-medium text-gray-700 ml-1">
                                  {studentFeedback.rating}/5
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700">{studentFeedback.comment}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No student feedback recorded for this assessment.</div>
                    )}

                    <h3 className="text-lg font-semibold mb-4">Counselor Notes</h3>

                    {/* Counselor Notes - Replies (always show existing notes) */}
                    {counselorNotes && counselorNotes.length > 0 ? (
                      <div className="ml-13 space-y-3">
                        {counselorNotes.map((note, index) => (
                          <div key={index} className="flex space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                                {note.author.split(' ').map(n => n[0]).join('')}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="bg-white rounded-lg p-3 border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-semibold text-gray-900 text-sm">{note.author}</span>
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs text-gray-500">{new Date(note.date).toLocaleString()}</span>
                                      {note.editedDate ? (
                                        <span className="text-xs text-gray-400">· edited {note.editedDate.toLocaleString()}</span>
                                      ) : null}
                                      {/* show Edit/Delete buttons only for the owner */}
                                        {(() => {
                                        const staffUser = staffUserProfile;
                                        const staffAccount_ID = staffUser ? (staffUser.staffAccount_ID || staffUser.staffAccountId || staffUser.staffAccountID || staffUser.id) : null;
                                        if (staffAccount_ID && String(staffAccount_ID) === String(note.staffAccount_ID)) {
                                          return (
                                            <>
                                              {editingNoteId === note.id ? (
                                                <>
                                                  <button onClick={() => handleSaveEdit(note.id, note.staffAccount_ID)} className="text-xs text-blue-600 hover:underline">Save</button>
                                                  <button onClick={handleCancelEdit} className="text-xs text-gray-500 ml-2 hover:underline">Cancel</button>
                                                </>
                                              ) : (
                                                <>
                                                  <button onClick={() => handleStartEdit(note)} className="text-xs text-blue-600 hover:underline">Edit</button>
                                                  <button onClick={() => handleDeleteNote(note.id, note.staffAccount_ID)} className="text-xs text-red-500 ml-2 hover:underline">Delete</button>
                                                </>
                                              )}
                                            </>
                                          );
                                        }
                                        return null;
                                      })()}
                                    </div>
                                </div>
                                {editingNoteId === note.id ? (
                                  <div>
                                    <textarea rows={3} value={editingText} onChange={(e) => setEditingText(e.target.value)} className="w-full text-sm border rounded p-2" />
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-700">{note.comment}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {/* Reply Box: only enabled if studentFeedback exists */}
                    <div className="ml-13 mt-4">
                      <div className="flex space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                            A
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            {studentFeedback ? (
                              counselorNotes && counselorNotes.length > 0 ? (
                                <div className="text-sm text-gray-500 py-4">
                                  <div className="mb-2">A counselor note already exists for this assessment.</div>
                                  <div className="text-xs text-gray-500">Delete the existing note to add a new one.</div>
                                </div>
                              ) : (
                                <>
                                  <textarea
                                    rows={2}
                                    placeholder="Add a counselor note..."
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    className="w-full bg-transparent text-sm resize-none focus:outline-none placeholder-gray-500"
                                  />
                                  <div className="flex justify-end mt-2">
                                    <button
                                      onClick={handleAddNote}
                                      className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium hover:bg-blue-600 transition-colors"
                                    >
                                      Reply
                                    </button>
                                  </div>
                                </>
                              )
                            ) : (
                              <div className="text-sm text-gray-500 py-6 text-center">This assessment has no student feedback. Counselor commenting is disabled until feedback is provided.</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminStudentProfile;
