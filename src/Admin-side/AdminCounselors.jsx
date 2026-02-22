import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { Search, Edit, Eye, UserPlus, ChevronLeft, ChevronRight, Mail, Calendar, User, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CounselorModal from "./CounselorModal";
import Swal from "sweetalert2";
import { fetchStaffProfile } from '../utils/staffProfile';
import { formatDisplayName } from "../utils/nameFormat";

/* eslint-disable react/prop-types */


const AdminCounselors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const getStrandColors = (strand) => {
    let bgColor = "bg-gray-100";
    let textColor = "text-gray-500";
    if (strand === "STEM") { bgColor = "bg-yellow-100"; textColor = "text-yellow-500"; }
    else if (strand === "ABM") { bgColor = "bg-green-100"; textColor = "text-green-500"; }
    else if (strand === "HUMSS") { bgColor = "bg-blue-100"; textColor = "text-blue-500"; }
    else if (strand === "TVL") { bgColor = "bg-orange-100"; textColor = "text-orange-500"; }
    else if (strand.includes("Health-Allied")) { bgColor = "bg-red-100"; textColor = "text-red-500"; }
    else if (strand.includes("Music, Arts, and Design")) { bgColor = "bg-purple-100"; textColor = "text-purple-500"; }
    else if (strand.includes("Physical Education and Sports")) { bgColor = "bg-pink-100"; textColor = "text-pink-500"; }
    return { bgColor, textColor };
  };

  const getStrandAcronym = (strand) => {
    if (strand === "STEM") return "STEM";
    if (strand === "ABM") return "ABM";
    if (strand === "HUMSS") return "HUMSS";
    if (strand === "TVL") return "TVL";
    if (strand.includes("Health-Allied")) return "HA";
    if (strand.includes("Music, Arts, and Design")) return "MAD";
    if (strand.includes("Physical Education and Sports")) return "PES";
    return strand; // fallback
  };


  const [counselors, setCounselors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    document.title = "Admin Dashboard | Manage Counselors";
    fetchCounselors();
  }, []);

  const fetchCounselors = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/counselors`, { credentials: 'include' });
      const result = await response.json();
        if (result.success) {
        setCounselors(result.data.map(c => ({
          staffAccount_ID: c.staffAccount_ID,
          name: c.name,
          strand: c.strand || 'N/A',
          // Format lastLogin (ISO/UTC) into Philippines time for display
          lastLogin: formatToManilaTime(c.lastLogin),
          status: c.status === 1 ? 'Active' : 'Inactive',
          email: c.email,
          about: c.about,
          officeLocation: c.officeDetails,
          consultationHours: c.consultationDetails
        })));
        setLoading(false);
      } else {
        setError('Failed to load counselors');
        setLoading(false);
      }
    }catch(error){
      console.error('Error fetching counselors:', error);
      setError('Failed to load counselors');
      setLoading(false);
    }
  };

  const navigate = useNavigate();
  const itemsPerPage = 10;

  // Helper: format any datetime value from the database into an inclusive human-readable string
  // (the raw DB timestamp is assumed UTC/ISO; we display it as-is without extra timezone shifts)
  const formatToManilaTime = (value) => {
    if (!value) return '—';

    const d = new Date(value);
    if (isNaN(d.getTime())) return '—';

    // treat epoch zero as 'no login'
    if (d.getTime() === 0) return '—';

    const datePart = d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    const timePart = d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    return `${datePart} at ${timePart}`;
  };

  // Generate email from name
  const formatEmail = (name) => {
    const parts = name.split(" ");
    const first = parts[1] ? parts[1].toLowerCase() : parts[0].toLowerCase();
    const last = parts[parts.length - 1].toLowerCase();
    return `${first}.${last}@ust.edu.ph`;
  };

  const counselorsWithEmail = counselors.map((c) => ({
    ...c,
    email: c.email || formatEmail(c.name),
  }));

  const filteredCounselors = counselorsWithEmail.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.strand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCounselors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCounselors = filteredCounselors.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#FFFCED] flex">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Preparing for manage counselors...</p>
          </div>
        </div>
      </div>
    );
  }

  if (previewLoading) {
    return (
      <div className="min-h-screen w-full bg-[#FFFCED] flex">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Preparing for counselor preview...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-[#FFFCED] flex">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-red-500">
            <p className="text-lg font-semibold">Error loading manage counselors</p>
            <p className="mt-2">{error}</p>
            <button 
              onClick={() => { window.location.reload(); }}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    
//Create a static HTML page using TailwindCSS that add  a top header with the page title "Manage Counselors" and an admin avatar. Include a search bar and an "Add Counselor" button above the table. The table should have columns: Counselor (name and email), Strand (color-coded badge), Last Login, Status (Active/Inactive badge), Password (Reveal button), and Actions (view/edit icons) with sample rows. Add pagination below the table with previous/next buttons and page numbers. Style everything with TailwindCSS, including hover effects, rounded corners, shadows, and responsive layout for mobile. Make it visually resemble a functional dashboard but keep it static HTML only.


    <div className="flex flex-col md:flex-row w-screen h-screen bg-[#fdfcf8]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Manage Counselors" />
        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow border border-gray-200">
            {/* Search + Add */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-2 sm:space-y-0">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search counselors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring focus:ring-yellow-300 focus:border-transparent focus:outline-none text-sm sm:text-base"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              <button
                onClick={() => { setSelectedCounselor(null); setIsModalOpen(true); }}
                className="flex items-center bg-[#FBBC05] hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto justify-center"
              >
                <UserPlus className="mr-2 w-4 h-4" /> Add Counselor
              </button>
            </div>

            {/* Desktop Table - Hidden on mobile */}
            <div className="hidden sm:block overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="w-2/6 px-6 py-4 text-left">COUNSELOR</th>
                    <th className="w-1/6 px-6 py-4 text-center">STRAND</th>
                    <th className="w-1/6 px-6 py-4 text-center">LAST LOGIN</th>
                    <th className="w-1/6 px-6 py-4 text-center">STATUS</th>
                    <th className="w-1/6 px-6 py-4 text-center">PASSWORD</th>
                    <th className="w-1/6 px-6 py-4 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentCounselors.map((c, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span
                            className="font-medium text-gray-900 cursor-pointer hover:underline"
                            onClick={() => {
                              setPreviewLoading(true);
                              setTimeout(() => {
                                try {
                                  const id = c.staffAccount_ID || c.id || '';
                                  sessionStorage.setItem('selectedCounselorId', String(id));
                                } catch (e) {
                                  console.warn('Could not write sessionStorage', e);
                                }
                                navigate(`/admin/preview/${encodeURIComponent(c.name)}`);
                              }, 1000);
                            }}
                          >
                            {formatDisplayName(c.name) || c.name}
                          </span>
                          <span className="text-sm text-gray-500">{c.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium inline-block min-w-[80px] ${getStrandColors(c.strand).bgColor} ${getStrandColors(c.strand).textColor}`}
                        >
                          {getStrandAcronym(c.strand)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-500">{c.lastLogin}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium inline-block min-w-[80px]"
                          style={{
                            backgroundColor: c.status === "Active" ? "#DAFFE4" : "#D9D9D9",
                            color: c.status === "Active" ? "#34A853" : "#1E1E1E",
                          }}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={async () => {
                            try {
                              const staffUser = await fetchStaffProfile();
                              let adminEmail = staffUser && (staffUser.email || staffUser.emailAddress) ? (staffUser.email || staffUser.emailAddress) : null;

                              const { value: formData } = await Swal.fire({
                                title: 'Verify Your Identity',
                                html: `
                                  <div style="text-align: left; font-size: 14px;">
                                    ${!adminEmail ? `
                                      <div style="margin-bottom: 15px;">
                                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Supervisor Email</label>
                                        <input type="email" id="supervisorEmail" placeholder="your.email@school.edu" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
                                      </div>
                                    ` : ''}
                                    <div style="margin-bottom: 15px;">
                                      <label style="display: block; margin-bottom: 5px; font-weight: 500;">Admin Password</label>
                                      <input type="password" id="adminPassword" placeholder="Enter your password" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
                                    </div>
                                  </div>
                                `,
                                showCancelButton: true,
                                confirmButtonText: 'Verify',
                                confirmButtonColor: '#FB9724',
                                preConfirm: () => {
                                  const password = document.getElementById('adminPassword').value;
                                  const email = adminEmail || document.getElementById('supervisorEmail')?.value;
                                  
                                  if (!password) {
                                    Swal.showValidationMessage('Admin password is required');
                                    return false;
                                  }
                                  if (!email) {
                                    Swal.showValidationMessage('Email is required');
                                    return false;
                                  }
                                  return { password, email };
                                }
                              });

                              if (!formData) return;

                              const { password: adminPassword, email: finalEmail } = formData;

                              const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
                              const resp = await fetch(`${base}/api/admin/counselor/reveal`, {
                                method: 'POST',
                                credentials: 'include',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ adminEmail: finalEmail, adminPassword, counselorId: c.staffAccount_ID || c.id })
                              });
                              const data = await resp.json();
                              if (!resp.ok || !data.success) {
                                Swal.fire({ icon: 'error', title: 'Unauthorized', text: data.message || 'Invalid admin credentials', confirmButtonColor: '#FB9724' });
                                return;
                              }

                              const password = data.data && data.data.password ? data.data.password : null;
                              if (!password) {
                                Swal.fire({ icon: 'error', title: 'No password found', confirmButtonColor: '#FB9724' });
                                return;
                              }

                              const remind = await Swal.fire({
                                title: `Counselor Password for ${data.data.name}`,
                                html: `<div style="font-family: Inter, system-ui; font-size: 16px;">Password has been securely retrieved. You can email it to the counselor or change it.</div>`,
                                showCancelButton: true,
                                showDenyButton: true,
                                confirmButtonText: 'Email Password',
                                denyButtonText: 'Change Password',
                                cancelButtonText: 'Close',
                                confirmButtonColor: '#FB9724',
                                denyButtonColor: '#d33'
                              });

                              if (remind.isConfirmed) {
                                const mailResp = await fetch(`${base}/api/admin/counselor/send-password`, {
                                  method: 'POST',
                                  credentials: 'include',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ adminEmail: finalEmail, adminPassword, counselorId: c.staffAccount_ID || c.id })
                                });
                                const mailData = await mailResp.json();
                                if (mailResp.ok && mailData.success) {
                                  Swal.fire({ icon: 'success', title: 'Password Sent', text: 'Counselor password has been emailed.', confirmButtonColor: '#FB9724' });
                                } else {
                                  Swal.fire({ icon: 'error', title: 'Send Failed', text: mailData.message || 'Failed to send email.', confirmButtonColor: '#FB9724' });
                                }
                              } else if (remind.isDenied) {
                                try {
                                  const changeResp = await fetch(`${base}/api/admin/counselor/change-password`, {
                                    method: 'POST',
                                    credentials: 'include',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ adminEmail: finalEmail, adminPassword, counselorId: c.staffAccount_ID || c.id })
                                  });
                                  const changeData = await changeResp.json();
                                  if (changeResp.ok && changeData.success) {
                                    const newPw = changeData.data && changeData.data.newPassword ? changeData.data.newPassword : null;
                                    if (newPw) {
                                      const show = await Swal.fire({
                                        title: 'Password Changed',
                                      html: `<div style="font-family: Inter, system-ui; font-size: 16px;">A new password has been generated. You can email it to the counselor.</div>`,
                                      showCancelButton: true,
                                      confirmButtonText: 'Email New Password',
                                        cancelButtonText: 'Close',
                                        confirmButtonColor: '#FB9724'
                                      });
                                      if (show.isConfirmed) {
                                        const mailResp2 = await fetch(`${base}/api/admin/counselor/send-password`, {
                                          method: 'POST',
                                          credentials: 'include',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ adminEmail: finalEmail, adminPassword, counselorId: c.staffAccount_ID || c.id })
                                        });
                                        const mailData2 = await mailResp2.json();
                                        if (mailResp2.ok && mailData2.success) {
                                          Swal.fire({ icon: 'success', title: 'Password Sent', text: 'New password has been emailed.', confirmButtonColor: '#FB9724' });
                                        } else {
                                          Swal.fire({ icon: 'error', title: 'Send Failed', text: mailData2.message || 'Failed to send email.', confirmButtonColor: '#FB9724' });
                                        }
                                      }
                                    } else {
                                      Swal.fire({ icon: 'error', title: 'No password returned', confirmButtonColor: '#FB9724' });
                                    }
                                  } else {
                                    Swal.fire({ icon: 'error', title: 'Change Failed', text: changeData.message || 'Failed to change password', confirmButtonColor: '#FB9724' });
                                  }
                                } catch (err) {
                                  console.error('Change password error', err);
                                  Swal.fire({ icon: 'error', title: 'Error', text: 'An error occurred while changing password', confirmButtonColor: '#FB9724' });
                                }
                              }
                            } catch (err) {
                              console.error('Reveal password error', err);
                              Swal.fire({ icon: 'error', title: 'Error', text: 'An error occurred while revealing password', confirmButtonColor: '#FB9724' });
                            }
                          }}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                        >
                          Manage
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-4">
                          <button className="text-blue-600 hover:text-blue-800" onClick={() => {
                            setPreviewLoading(true);
                            setTimeout(() => {
                              try {
                                const id = c.staffAccount_ID || c.id || '';
                                sessionStorage.setItem('selectedCounselorId', String(id));
                              } catch (e) {
                                console.warn('Could not write sessionStorage', e);
                              }
                              navigate(`/admin/preview/${encodeURIComponent(c.name)}`);
                            }, 1000);
                          }}>
                            <Eye className="w-5 h-5" />
                          </button>
                          <button className="text-blue-600 hover:text-blue-800" onClick={() => { setSelectedCounselor(c); setIsModalOpen(true); }}>
                            <Edit className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards - Shown on mobile, hidden on desktop */}
            <div className="sm:hidden space-y-4">
              {currentCounselors.map((c, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  {/* Header with name and actions */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{c.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <Mail className="w-3 h-3 mr-1" />
                        {c.email}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          setPreviewLoading(true);
                          setTimeout(() => {
                            try {
                              const id = c.staffAccount_ID || c.id || '';
                              sessionStorage.setItem('selectedCounselorId', String(id));
                            } catch (e) {
                              console.warn('Could not write sessionStorage', e);
                            }
                            navigate(`/admin/preview/${encodeURIComponent(c.name)}`);
                          }, 1000);
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => { setSelectedCounselor(c); setIsModalOpen(true); }}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-gray-500">Strand</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStrandColors(c.strand).bgColor} ${getStrandColors(c.strand).textColor}`}>
                          {getStrandAcronym(c.strand)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                        <Calendar className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-gray-500">Last Login</p>
                        <p className="font-medium">{c.lastLogin}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                        <Shield className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-gray-500">Status</p>
                        <span 
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: c.status === "Active" ? "#DAFFE4" : "#D9D9D9",
                            color: c.status === "Active" ? "#34A853" : "#1E1E1E",
                          }}
                        >
                          {c.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-500">Password</p>
                        <button
                          onClick={async () => {
                            try {
                              const staffUser = await fetchStaffProfile();
                              let adminEmail = staffUser && (staffUser.email || staffUser.emailAddress) ? (staffUser.email || staffUser.emailAddress) : null;

                              const { value: formData } = await Swal.fire({
                                title: 'Verify Your Identity',
                                html: `
                                  <div style="text-align: left; font-size: 14px;">
                                    ${!adminEmail ? `
                                      <div style="margin-bottom: 15px;">
                                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Supervisor Email</label>
                                        <input type="email" id="supervisorEmail" placeholder="your.email@school.edu" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
                                      </div>
                                    ` : ''}
                                    <div style="margin-bottom: 15px;">
                                      <label style="display: block; margin-bottom: 5px; font-weight: 500;">Admin Password</label>
                                      <input type="password" id="adminPassword" placeholder="Enter your password" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
                                    </div>
                                  </div>
                                `,
                                showCancelButton: true,
                                confirmButtonText: 'Verify',
                                confirmButtonColor: '#FB9724',
                                preConfirm: () => {
                                  const password = document.getElementById('adminPassword').value;
                                  const email = adminEmail || document.getElementById('supervisorEmail')?.value;
                                  
                                  if (!password) {
                                    Swal.showValidationMessage('Admin password is required');
                                    return false;
                                  }
                                  if (!email) {
                                    Swal.showValidationMessage('Email is required');
                                    return false;
                                  }
                                  return { password, email };
                                }
                              });

                              if (!formData) return;

                              const { password: adminPassword, email: finalEmail } = formData;

                              const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
                              const resp = await fetch(`${base}/api/admin/counselor/reveal`, {
                                method: 'POST',
                                credentials: 'include',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ adminEmail: finalEmail, adminPassword, counselorId: c.staffAccount_ID || c.id })
                              });
                              const data = await resp.json();
                              if (!resp.ok || !data.success) {
                                Swal.fire({ icon: 'error', title: 'Unauthorized', text: data.message || 'Invalid admin credentials', confirmButtonColor: '#FB9724' });
                                return;
                              }

                              const password = data.data && data.data.password ? data.data.password : null;
                              if (!password) {
                                Swal.fire({ icon: 'error', title: 'No password found', confirmButtonColor: '#FB9724' });
                                return;
                              }

                              const remind = await Swal.fire({
                                title: `Counselor Password`,
                                html: `<div style="font-family: Inter, system-ui; font-size: 14px;">
                                  <p>For: <b>${data.data.name}</b></p>
                                  <p class="mt-2">Password has been securely retrieved. You can email it to the counselor or change it.</p>
                                </div>`,
                                showCancelButton: true,
                                showDenyButton: true,
                                confirmButtonText: 'Email Password',
                                denyButtonText: 'Change',
                                cancelButtonText: 'Close',
                                confirmButtonColor: '#FB9724',
                                denyButtonColor: '#d33'
                              });

                              if (remind.isConfirmed) {
                                const mailResp = await fetch(`${base}/api/admin/counselor/send-password`, {
                                  method: 'POST',
                                  credentials: 'include',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ adminEmail: finalEmail, adminPassword, counselorId: c.staffAccount_ID || c.id })
                                });
                                const mailData = await mailResp.json();
                                if (mailResp.ok && mailData.success) {
                                  Swal.fire({ icon: 'success', title: 'Sent', text: 'Password emailed.', confirmButtonColor: '#FB9724' });
                                } else {
                                  Swal.fire({ icon: 'error', title: 'Failed', text: mailData.message || 'Failed to send.', confirmButtonColor: '#FB9724' });
                                }
                              } else if (remind.isDenied) {
                                try {
                                  const changeResp = await fetch(`${base}/api/admin/counselor/change-password`, {
                                    method: 'POST',
                                    credentials: 'include',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ adminEmail: finalEmail, adminPassword, counselorId: c.staffAccount_ID || c.id })
                                  });
                                  const changeData = await changeResp.json();
                                  if (changeResp.ok && changeData.success) {
                                    const newPw = changeData.data && changeData.data.newPassword ? changeData.data.newPassword : null;
                                    if (newPw) {
                                      const show = await Swal.fire({
                                        title: 'Password Changed',
                                        html: `<div style="font-family: Inter, system-ui; font-size: 14px;">A new password has been generated. You can email it to the counselor.</div>`,
                                        showCancelButton: true,
                                        confirmButtonText: 'Email',
                                        cancelButtonText: 'Close',
                                        confirmButtonColor: '#FB9724'
                                      });
                                      if (show.isConfirmed) {
                                        const mailResp2 = await fetch(`${base}/api/admin/counselor/send-password`, {
                                          method: 'POST',
                                          credentials: 'include',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ adminEmail: finalEmail, adminPassword, counselorId: c.staffAccount_ID || c.id })
                                        });
                                        const mailData2 = await mailResp2.json();
                                        if (mailResp2.ok && mailData2.success) {
                                          Swal.fire({ icon: 'success', title: 'Sent', text: 'New password emailed.', confirmButtonColor: '#FB9724' });
                                        } else {
                                          Swal.fire({ icon: 'error', title: 'Failed', text: mailData2.message || 'Failed to send.', confirmButtonColor: '#FB9724' });
                                        }
                                      }
                                    }
                                  }
                                } catch (err) {
                                  Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to change password', confirmButtonColor: '#FB9724' });
                                }
                              }
                            } catch (err) {
                              Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to reveal password', confirmButtonColor: '#FB9724' });
                            }
                          }}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs mt-1"
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm text-gray-600">
              <div className="mb-2 sm:mb-0">
                Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredCounselors.length)} of {filteredCounselors.length} entries
              </div>
              <div className="flex space-x-1 overflow-x-auto py-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50 min-w-[40px]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 border rounded min-w-[40px] ${currentPage === i + 1 ? "bg-yellow-200 font-bold" : ""}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50 min-w-[40px]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Modal */}
          <CounselorModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            counselor={selectedCounselor}
            isSaving={isSaving}
            onSave={async (counselorData) => {
              if (isSaving) return;
              setIsSaving(true);
              try {
                if (!counselorData.name || !counselorData.name.trim()) {
                  Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'Counselor name is required',
                    confirmButtonColor: '#FB9724'
                  });
                  setIsSaving(false);
                  return;
                }

                if (!counselorData.strand || counselorData.strand === 'N/A') {
                  Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'Please select a strand',
                    confirmButtonColor: '#FB9724'
                  });
                  setIsSaving(false);
                  return;
                }

                Swal.fire({
                  title: counselorData.id ? 'Updating...' : 'Adding...',
                  allowOutsideClick: false,
                  allowEscapeKey: false,
                  didOpen: async () => {
                    Swal.showLoading();
                    
                    const startTime = Date.now();
                    const minLoadTime = 1500;
                    
                    try {
                      const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
                      let response;
                      
                      if (counselorData.id) {
                        response = await fetch(`${base}/api/admin/counselor/${encodeURIComponent(counselorData.id)}`, {
                          method: 'PUT',
                          credentials: 'include',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(counselorData)
                        });
                      } else {
                        response = await fetch(`${base}/api/admin/counselor/add`, {
                          method: 'POST',
                          credentials: 'include',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(counselorData)
                        });
                      }

                      const result = await response.json();
                      
                      const elapsedTime = Date.now() - startTime;
                      const remainingWait = Math.max(0, minLoadTime - elapsedTime);
                      
                      if (remainingWait > 0) {
                        await new Promise(resolve => setTimeout(resolve, remainingWait));
                      }

                      if (result.success) {
                        await fetchCounselors();
                        setIsModalOpen(false);
                        setSelectedCounselor(null);

                        if (result.data && result.data.password) {
                          const pw = result.data.password;
                          Swal.fire({
                            icon: 'success',
                            title: 'Counselor Created!',
                            html: `<div class="text-left">
                              <p>Password for <b>${result.data.name}</b>:</p>
                              <div style="margin-top:12px; padding: 10px; background-color: #f0f0f0; border-radius: 4px;">
                                <code style="font-size:16px; font-weight: bold; word-break: break-all;">${pw}</code>
                              </div>
                              <p style="margin-top: 12px; font-size: 12px; color: #666;">Click copy button to copy password</p>
                            </div>`,
                            showCancelButton: true,
                            confirmButtonText: 'Copy Password',
                            cancelButtonText: 'Close',
                            confirmButtonColor: '#FB9724',
                            willClose: async (result) => {
                              if (result.isConfirmed) {
                                try {
                                  await navigator.clipboard.writeText(pw);
                                  Swal.fire({
                                    icon: 'success',
                                    title: 'Copied!',
                                    text: 'Password copied to clipboard',
                                    timer: 1500,
                                    timerProgressBar: true,
                                    confirmButtonColor: '#FB9724'
                                  });
                                } catch (e) {
                                  Swal.fire({
                                    icon: 'warning',
                                    title: 'Copy Failed',
                                    text: 'Please copy manually: ' + pw,
                                    confirmButtonColor: '#FB9724'
                                  });
                                }
                              }
                            }
                          });
                        } else {
                          Swal.fire({
                            icon: 'success',
                            title: counselorData.id ? 'Updated!' : 'Added!',
                            text: 'Changes saved successfully',
                            timer: 2000,
                            timerProgressBar: true,
                            confirmButtonColor: '#FB9724'
                          });
                        }
                      } else {
                        Swal.fire({
                          icon: 'error',
                          title: 'Operation Failed',
                          text: result.message || 'An error occurred while saving',
                          confirmButtonColor: '#FB9724'
                        });
                      }
                    } catch (error) {
                      console.error('Error saving counselor:', error);
                      
                      const elapsedTime = Date.now() - startTime;
                      const remainingWait = Math.max(0, minLoadTime - elapsedTime);
                      if (remainingWait > 0) {
                        await new Promise(resolve => setTimeout(resolve, remainingWait));
                      }
                      
                      Swal.fire({
                        icon: 'error',
                        title: 'Network Error',
                        text: 'Failed to connect to the server.',
                        confirmButtonColor: '#FB9724'
                      });
                    } finally {
                      setIsSaving(false);
                    }
                  }
                });
              } catch (error) {
                console.error('Error in onSave handler:', error);
                Swal.fire({
                  icon: 'error',
                  title: 'Unexpected Error',
                  text: 'An unexpected error occurred.',
                  confirmButtonColor: '#FB9724'
                });
                setIsSaving(false);
              }
            }}
            onDelete={(counselor) => {
              setCounselors((prev) => prev.filter((c) => c.name !== counselor.name));
              Swal.fire({
                icon: "success",
                title: "Successfully Deleted!",
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
              });
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default AdminCounselors;