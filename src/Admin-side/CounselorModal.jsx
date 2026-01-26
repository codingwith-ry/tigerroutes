import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import {
  X,
  User,
  Briefcase,
  Clock,
  FileText,
  CheckCircle,
  Trash2,
  Lock,
} from "lucide-react";
import { fetchStaffProfile } from '../utils/staffProfile';

/* eslint-disable react/prop-types */

const CounselorModal = ({ isOpen, onClose, counselor, onSave, onDelete, isSaving = false }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    strand: "",
    status: "Active",
    officeLocation: "",
    consultationHours: "",
    about: "",
  });

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  // Reset or populate the form depending on mode (add/edit).
  // When editing, fetch the canonical record from the backend by staffAccount_ID
  // so we always present the latest DB values instead of relying on a possibly stale prop.
  useEffect(() => {
    let aborted = false;

    const populateEmpty = () => {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        strand: "",
        status: "Active",
        officeLocation: "",
        consultationHours: "",
        about: "",
      });
    };

    const fetchAndPopulate = async (id) => {
      try {
        const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
          const resp = await fetch(`${base}/api/admin/counselor/${encodeURIComponent(id)}`, { credentials: 'include' });
        if (!resp.ok) {
          // fallback to using the provided counselor prop if fetch fails
          console.warn('Failed to fetch counselor from API, using provided prop');
          if (!aborted && counselor) {
            const nameParts = counselor.name ? counselor.name.split(' ') : [];
            const first = nameParts[0] || '';
            const last = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
            setFormData({
              firstName: first,
              lastName: last,
              email: counselor.email || '',
              strand: counselor.strand || '',
              status: counselor.status || 'Active',
              officeLocation: counselor.officeLocation || counselor.officeHours || '',
              consultationHours: counselor.consultationHours || counselor.workHours || '',
              about: counselor.about || '',
            });
          }
          return;
        }

        const payload = await resp.json();
        if (!payload || !payload.success || !payload.data) {
          console.warn('API returned no data for counselor id', id);
          if (!aborted) populateEmpty();
          return;
        }

        const data = payload.data;

        if (aborted) return;

        const nameParts = data.name ? data.name.split(' ') : [];
        const first = nameParts[0] || '';
        const last = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        // Normalize status: DB stores numeric 1/0, UI expects 'Active'/'Inactive'
        const statusVal = (data.status === 1 || data.status === '1' || data.status === 'Active') ? 'Active' : 'Inactive';

        setFormData({
          firstName: first,
          lastName: last,
          email: data.email || '',
          strand: data.strand || '',
          status: statusVal,
          officeLocation: data.officeDetails || data.officeLocation || '',
          consultationHours: data.consultationDetails || data.consultationHours || '',
          about: data.about || '',
        });
      } catch (err) {
        console.error('Error fetching counselor details:', err);
        if (!aborted) {
          if (counselor) {
            const nameParts = counselor.name ? counselor.name.split(' ') : [];
            const first = nameParts[0] || '';
            const last = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
            setFormData({
              firstName: first,
              lastName: last,
              email: counselor.email || '',
              strand: counselor.strand || '',
              status: counselor.status || 'Active',
              officeLocation: counselor.officeLocation || counselor.officeHours || '',
              consultationHours: counselor.consultationHours || counselor.workHours || '',
              about: counselor.about || '',
            });
          } else {
            populateEmpty();
          }
        }
      }
    };

    if (!isOpen) return;

    if (counselor && counselor.staffAccount_ID) {
      fetchAndPopulate(counselor.staffAccount_ID);
    } else if (counselor) {
      // No id available; fall back to using the prop values
      const nameParts = counselor.name ? counselor.name.split(' ') : [];
      const first = nameParts[0] || '';
      const last = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      setFormData({
        firstName: first,
        lastName: last,
        email: counselor.email || '',
        strand: counselor.strand || '',
        status: counselor.status || 'Active',
        officeLocation: counselor.officeLocation || counselor.officeHours || '',
        consultationHours: counselor.consultationHours || counselor.workHours || '',
        about: counselor.about || '',
      });
    } else {
      populateEmpty();
    }

    return () => {
      aborted = true;
    };
  }, [counselor, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // (old inline submit implementation removed - kept handleSubmit below)

  const handleSubmit = async (e) => {
    e.preventDefault();

    const counselorData = {
      id: counselor?.staffAccount_ID || null,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email && formData.email.trim() !== ''
        ? formData.email.trim()
        : `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}@school.edu`,
      strand: formData.strand,
      status: formData.status,
      // map frontend fields to backend names
      officeLocation: formData.officeLocation,
      consultationHours: formData.consultationHours,
      about: formData.about,
    };

    // Attach acting admin/staff id by fetching profile
    try {
      const staffUser = await fetchStaffProfile();
      if (staffUser && (staffUser.staffAccount_ID || staffUser.id)) {
        counselorData.adminStaffAccountId = staffUser.staffAccount_ID || staffUser.id;
      }
    } catch (e) {
      // ignore
    }

    onSave(counselorData);
  };

  const handleConfirmDelete = async (e) => {
    e.preventDefault();

    if (!confirmPassword) {
      // Focus the inline password field instead of opening a global SweetAlert overlay
      const el = document.getElementById('confirm-password-input');
      if (el) {
        el.focus();
        // briefly add a visual pulse to draw attention
        el.classList.add('ring-2', 'ring-red-300');
        setTimeout(() => el.classList.remove('ring-2', 'ring-red-300'), 700);
      }
      return;
    }

    // Ensure we have an authenticated staff profile (JWT cookie should be present)
    let staffUser = null;
    try {
      staffUser = await fetchStaffProfile();
    } catch (err) {
      staffUser = null;
    }

    if (!staffUser || !staffUser.staffAccount_ID) {
      Swal.fire({ icon: 'error', title: 'Not authenticated', text: 'No logged-in staff user found. Please login again.', confirmButtonColor: '#FB9724' });
      return;
    }

        const doDelete = async () => {
      try {
        const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        // Send only the counselor id; server will use JWT cookie to identify the admin
            // Send only the counselor id and the admin password; server verifies password against logged-in staff JWT
            const resp = await fetch(`${base}/api/admin/counselor/delete`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: counselor?.staffAccount_ID, adminPassword: confirmPassword })
            });
        const result = await resp.json();
        if (!resp.ok || !result.success) {
          Swal.fire({ icon: 'error', title: 'Delete Failed', text: result.message || 'Invalid credentials or server error', confirmButtonColor: '#FB9724' });
          return;
        }

        // Notify parent to refresh list
        if (typeof onDelete === 'function') onDelete(counselor);

        // Close modal + reset
        setConfirmPassword('');
        setShowConfirmDelete(false);
        onClose();

        Swal.fire({ icon: 'success', title: 'Successfully Deleted!', showConfirmButton: false, timer: 2000, timerProgressBar: true });
      } catch (err) {
        console.error('Error calling delete API:', err);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Server error while attempting to delete', confirmButtonColor: '#FB9724' });
      }
    };

    doDelete();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 120, damping: 12 }}
            className="relative bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-2xl w-full max-w-[900px] max-h-[90vh] overflow-hidden z-10"
          >
            {/* Header */}
            <div className="bg-[#FBBC05] px-4 sm:px-6 py-4 sm:py-5 relative">
              <div className="absolute inset-0 bg-black opacity-5"></div>
              <h2 className="text-xl sm:text-2xl font-bold text-white relative z-10 flex items-center gap-2">
                <User className="w-5 h-5 sm:w-6 sm:h-6" />
                {counselor ? "Edit Counselor Profile" : "Add Counselor"}
              </h2>
              <button
                onClick={onClose}
                className="absolute top-3 sm:top-4 right-3 sm:right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 transition-all z-10"
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Form */}
            <div className="overflow-y-auto max-h-[calc(90vh-70px)] sm:max-h-[calc(90vh-80px)] overscroll-behavior-contain">
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Personal Info */}
                <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-orange-100">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#FB9724] to-[#FBBC05] flex items-center justify-center">
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                      Personal Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm sm:text-base focus:ring-2 focus:ring-[#FB9724] focus:border-transparent transition-all"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm sm:text-base focus:ring-2 focus:ring-[#FB9724] focus:border-transparent transition-all"
                        placeholder="Enter last name"
                      />
                    </div>
                    <div className="sm:col-span-1 lg:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm sm:text-base focus:ring-2 focus:ring-[#FB9724] focus:border-transparent transition-all"
                        placeholder="e.g. first.last@school.edu"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Details */}
                <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-orange-100">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#FB9724] to-[#FBBC05] flex items-center justify-center">
                      <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                      Professional Details
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Profession
                      </label>
                      <select
                        name="strand"
                        value={formData.strand}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm sm:text-base focus:ring-2 focus:ring-[#FB9724] focus:border-transparent text-gray-700 bg-white transition-all"
                      >
                        <option value="">Select Profession</option>
                        <option>STEM</option>
                        <option>ABM</option>
                        <option>HUMSS</option>
                        <option>Health-Allied</option>
                        <option>Music, Arts, and Design</option>
                        <option>Physical Education and Sports</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm sm:text-base focus:ring-2 focus:ring-[#FB9724] focus:border-transparent text-gray-700 bg-white transition-all"
                      >
                        <option>Active</option>
                        <option>Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Schedule */}
                <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-orange-100">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#FB9724] to-[#FBBC05] flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                      Schedule
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Office Location
                      </label>
                      <input
                        type="text"
                        name="officeLocation"
                        value={formData.officeLocation}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm sm:text-base focus:ring-2 focus:ring-[#FB9724] focus:border-transparent transition-all"
                        placeholder="e.g. Room 204 / Building A"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Consultation Hours
                      </label>
                      <input
                        type="text"
                        name="consultationHours"
                        value={formData.consultationHours}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm sm:text-base focus:ring-2 focus:ring-[#FB9724] focus:border-transparent transition-all"
                        placeholder="e.g. Mon & Wed 2:00 PM - 4:00 PM"
                      />
                    </div>
                  </div>
                </div>

                {/* About */}
                <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-orange-100">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#FB9724] to-[#FBBC05] flex items-center justify-center">
                      <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                      About
                    </h3>
                  </div>
                  <textarea
                    name="about"
                    rows="4"
                    value={formData.about}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm sm:text-base focus:ring-2 focus:ring-[#FB9724] focus:border-transparent resize-none transition-all"
                    placeholder="Enter about information"
                  ></textarea>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-center pt-2 gap-4 sm:gap-0">
                  {counselor && (
                    <button
                      type="button"
                      onClick={() => setShowConfirmDelete(true)}
                      className="w-full sm:w-auto px-5 py-2.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all flex items-center justify-center gap-2 font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full sm:w-auto px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                    className={`w-full sm:w-auto px-6 py-2.5 bg-[#FBBC05] text-white rounded-lg shadow-md transition-all font-medium flex items-center justify-center gap-2 ${isSaving ? 'opacity-60 cursor-not-allowed hover:shadow-none hover:scale-100' : 'hover:shadow-lg hover:scale-105'}`}
                    >
                      <CheckCircle className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Confirm Delete Modal */}
          <AnimatePresence>
            {showConfirmDelete && (
              <motion.div
                className="fixed inset-0 flex items-center justify-center z-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div
                  className="absolute inset-0 bg-black bg-opacity-50"
                  onClick={() => setShowConfirmDelete(false)}
                ></div>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="relative bg-white rounded-xl p-6 shadow-2xl w-full max-w-md z-10"
                >
                  <h3 className="text-xl font-semibold mb-3 text-gray-800 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-[#FBBC05]" />
                    Confirm Deletion
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Enter your password to confirm the deletion of{" "}
                    <span className="font-semibold">{counselor?.name}</span>.
                  </p>
                  <input
                    id="confirm-password-input"
                    name="confirmPassword"
                    type="password"
                    placeholder="Enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#FB9724] focus:border-transparent transition-all mb-4"
                  />
                  <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <button
                      onClick={() => setShowConfirmDelete(false)}
                      className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-700 transition-all w-full sm:w-auto"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all w-full sm:w-auto"
                    >
                      Confirm Delete
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CounselorModal;