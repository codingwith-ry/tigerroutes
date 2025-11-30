import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { Search, Edit, Eye, UserPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CounselorModal from "./CounselorModal";
import Swal from "sweetalert2";
import { fetchStaffProfile } from '../utils/staffProfile';

/* eslint-disable react/prop-types */


const AdminCounselors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [counselors, setCounselors] = useState([
  //   { name: "Dr. John Cruz", strand: "STEM", lastLogin: "2025-09-16 08:10", status: "Active" },
  //   { name: "Dr. Lily Cruz", strand: "ABM", lastLogin: "2025-09-16 06:45", status: "Active" },
  // { name: "Ms. Carla Rivera", strand: "HUMSS", lastLogin: "2025-09-15 19:20", status: "Active" },
  //   { name: "Dr. John Doe", strand: "TVL", lastLogin: "2025-09-18 08:20", status: "Inactive" },
  ]);

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
          lastLogin: c.lastLogin, 
          status: c.status === 1 ? 'Active' : 'Inactive',
          email: c.email,
          about: c.about,
          officeLocation: c.officeDetails,
          consultationHours: c.consultationDetails
        })));
      }
    }catch(error){
      console.error('Error fetching counselors:', error);
    }
  };

  const navigate = useNavigate();
  const itemsPerPage = 10;

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

  return (
    <div className="flex flex-col md:flex-row w-screen h-screen bg-[#fdfcf8]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Manage Counselors" />
        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 shadow border border-gray-200">
            {/* Search + Add */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-2 sm:space-y-0">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search counselors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring focus:ring-yellow-300 focus:border-transparent focus:outline-none"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              <button
                onClick={() => { setSelectedCounselor(null); setIsModalOpen(true); }}
                className="flex items-center bg-[#FBBC05] hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <UserPlus className="mr-2 w-4 h-4" /> Add Counselor
              </button>
            </div>

            {/* Table */}
            <div className="hidden sm:block overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="w-2/6 px-6 py-4 text-left">COUNSELOR</th>
                    <th className="w-1/6 px-6 py-4 text-center">STRAND</th>
                    <th className="w-1/6 px-6 py-4 text-center">LAST LOGIN</th>
                    <th className="w-1/6 px-6 py-4 text-center">STATUS</th>
                    <th className="w-1/6 px-6 py-4 text-center">Password</th>
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
                                  // Save only the staffAccount_ID in sessionStorage for preview fetch
                                  try {
                                    const id = c.staffAccount_ID || c.id || '';
                                    sessionStorage.setItem('selectedCounselorId', String(id));
                                  } catch (e) {
                                    console.warn('Could not write sessionStorage', e);
                                  }
                                  navigate(`/admin/preview/${encodeURIComponent(c.name)}`);
                                }}
                              >
                                {c.name}
                              </span>
                              <span className="text-sm text-gray-500">{c.email}</span>
                            </div>
                          </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium inline-block min-w-[80px]"
                          style={{
                            backgroundColor:
                              c.strand === "STEM" ? "#E5EEFF" :
                              c.strand === "ABM" ? "#DAFFE4" :
                              c.strand === "HUMSS" ? "#EDE0FF" :
                              c.strand === "TVL" ? "#FFE49E" : "#F0F0F0",
                            color:
                              c.strand === "STEM" ? "#195FD3" :
                              c.strand === "ABM" ? "#34A853" :
                              c.strand === "HUMSS" ? "#9747FF" :
                              c.strand === "TVL" ? "#FB9724" : "#000000",
                          }}
                        >
                          {c.strand}
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
                            // Reveal password flow: prompt admin for their password, verify, then show counselor password and offer to remind
                              try {
                              const staffUser = await fetchStaffProfile();
                              let adminEmail = staffUser && (staffUser.email || staffUser.emailAddress) ? (staffUser.email || staffUser.emailAddress) : null;

                              const { value: adminPassword } = await Swal.fire({
                                title: `Confirm Admin Password`,
                                input: 'password',
                                inputLabel: 'Enter your admin password to reveal the counselor password',
                                inputPlaceholder: 'Your password',
                                showCancelButton: true,
                                confirmButtonText: 'Verify',
                                confirmButtonColor: '#FB9724'
                              });

                              if (!adminPassword) return;

                              if (!adminEmail) {
                                const { value: emailInput } = await Swal.fire({
                                  title: 'Enter admin email',
                                  input: 'email',
                                  inputLabel: 'Admin email',
                                  inputPlaceholder: 'you@school.edu',
                                  showCancelButton: true,
                                  confirmButtonText: 'Continue',
                                  confirmButtonColor: '#FB9724'
                                });
                                if (!emailInput) return;
                                adminEmail = emailInput;
                              }

                              const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
                              const resp = await fetch(`${base}/api/admin/counselor/reveal`, {
                                method: 'POST',
                                credentials: 'include',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ adminEmail, adminPassword, counselorId: c.staffAccount_ID || c.id })
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
                                html: `<div style="font-family: Inter, system-ui; font-size: 16px;">Password: <b>${password}</b></div>`,
                                showCancelButton: true,
                                showDenyButton: true,
                                confirmButtonText: 'Remind via Email',
                                denyButtonText: 'Change password',
                                cancelButtonText: 'Close',
                                confirmButtonColor: '#FB9724',
                                denyButtonColor: '#d33'
                              });

                              if (remind.isConfirmed) {
                                // Trigger sending the counselor password email via admin endpoint
                                const mailResp = await fetch(`${base}/api/admin/counselor/send-password`, {
                                  method: 'POST',
                                  credentials: 'include',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ adminEmail, adminPassword, counselorId: c.staffAccount_ID || c.id })
                                });
                                const mailData = await mailResp.json();
                                if (mailResp.ok && mailData.success) {
                                  Swal.fire({ icon: 'success', title: 'Password Sent', text: 'Counselor password has been emailed.', confirmButtonColor: '#FB9724' });
                                } else {
                                  Swal.fire({ icon: 'error', title: 'Send Failed', text: mailData.message || 'Failed to send email.', confirmButtonColor: '#FB9724' });
                                }
                              } else if (remind.isDenied) {
                                // Admin chose to change the counselor's password
                                try {
                                  const changeResp = await fetch(`${base}/api/admin/counselor/change-password`, {
                                    method: 'POST',
                                    credentials: 'include',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ adminEmail, adminPassword, counselorId: c.staffAccount_ID || c.id })
                                  });
                                  const changeData = await changeResp.json();
                                  if (changeResp.ok && changeData.success) {
                                    const newPw = changeData.data && changeData.data.newPassword ? changeData.data.newPassword : null;
                                    if (newPw) {
                                      const show = await Swal.fire({
                                        title: 'Password Changed',
                                        html: `<div style="font-family: Inter, system-ui; font-size: 16px;">New Password: <b>${newPw}</b></div>`,
                                        showCancelButton: true,
                                        confirmButtonText: 'Email new password',
                                        cancelButtonText: 'Close',
                                        confirmButtonColor: '#FB9724'
                                      });
                                      if (show.isConfirmed) {
                                        // send the new password via email
                                        const mailResp2 = await fetch(`${base}/api/admin/counselor/send-password`, {
                                          method: 'POST',
                                          credentials: 'include',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ adminEmail, adminPassword, counselorId: c.staffAccount_ID || c.id })
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
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          Reveal
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-4">
                          <button className="text-blue-600 hover:text-blue-800" onClick={() => {
                              try {
                                const id = c.staffAccount_ID || c.id || '';
                                sessionStorage.setItem('selectedCounselorId', String(id));
                              } catch (e) {
                                console.warn('Could not write sessionStorage', e);
                              }
                              navigate(`/admin/preview/${encodeURIComponent(c.name)}`);
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

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm text-gray-600">
              <div className="mb-2 sm:mb-0">
                Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredCounselors.length)} of {filteredCounselors.length} entries
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 border rounded ${currentPage === i + 1 ? "bg-yellow-200 font-bold" : ""}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
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
            // onSave={(updated) => {
            //   setCounselors(prev => prev.map(c => c.name === (selectedCounselor?.name || "") ? updated : c));
            //   setIsModalOpen(false);
            //   setSelectedCounselor(null);
            // }}
            isSaving={isSaving}
            onSave={async (counselorData) => {
              if (isSaving) return;
              setIsSaving(true);
              try {
                // Validate required fields
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

                // Show loading state
                Swal.fire({
                  title: counselorData.id ? 'Updating counselor...' : 'Adding counselor...',
                  allowOutsideClick: false,
                  allowEscapeKey: false,
                  didOpen: async () => {
                    Swal.showLoading();
                    
                    const startTime = Date.now();
                    const minLoadTime = 1500; // Minimum 1.5 seconds display time
                    
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
                      
                      // Calculate remaining wait time
                      const elapsedTime = Date.now() - startTime;
                      const remainingWait = Math.max(0, minLoadTime - elapsedTime);
                      
                      // Wait for minimum load time to complete
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
                            title: 'Counselor Created Successfully!',
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
                            title: counselorData.id ? 'Counselor Updated!' : 'Counselor Added!',
                            text: 'Changes have been saved successfully',
                            timer: 2000,
                            timerProgressBar: true,
                            confirmButtonColor: '#FB9724'
                          });
                        }
                      } else {
                        // Handle API error response
                        Swal.fire({
                          icon: 'error',
                          title: 'Operation Failed',
                          text: result.message || 'An error occurred while saving the counselor',
                          confirmButtonColor: '#FB9724'
                        });
                      }
                    } catch (error) {
                      console.error('Error saving counselor:', error);
                      
                      // Ensure minimum loading time even on error
                      const elapsedTime = Date.now() - startTime;
                      const remainingWait = Math.max(0, minLoadTime - elapsedTime);
                      if (remainingWait > 0) {
                        await new Promise(resolve => setTimeout(resolve, remainingWait));
                      }
                      
                      Swal.fire({
                        icon: 'error',
                        title: 'Network Error',
                        text: 'Failed to connect to the server. Please check your connection and try again.',
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
                  text: 'An unexpected error occurred. Please try again.',
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
