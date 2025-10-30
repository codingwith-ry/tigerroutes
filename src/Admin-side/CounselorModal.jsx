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

const CounselorModal = ({ isOpen, onClose, counselor, onSave, onDelete, isSaving = false }) => {
  const [formData, setFormData] = useState({
    title: "",
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
        title: "",
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
        const resp = await fetch(`${base}/api/counselor/${encodeURIComponent(id)}`);
        if (!resp.ok) {
          // fallback to using the provided counselor prop if fetch fails
          console.warn('Failed to fetch counselor from API, using provided prop');
          if (!aborted && counselor) {
            const nameParts = counselor.name ? counselor.name.split(' ') : [];
            setFormData({
              title: nameParts[0] || '',
              firstName: nameParts[1] || '',
              lastName: nameParts.slice(-1)[0] || '',
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
        // Normalize status: DB stores numeric 1/0, UI expects 'Active'/'Inactive'
        const statusVal = (data.status === 1 || data.status === '1' || data.status === 'Active') ? 'Active' : 'Inactive';

        setFormData({
          title: nameParts[0] || '',
          firstName: nameParts[1] || '',
          lastName: nameParts.slice(-1)[0] || '',
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
            setFormData({
              title: nameParts[0] || '',
              firstName: nameParts[1] || '',
              lastName: nameParts.slice(-1)[0] || '',
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
      setFormData({
        title: nameParts[0] || '',
        firstName: nameParts[1] || '',
        lastName: nameParts.slice(-1)[0] || '',
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

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   const updatedCounselor = {
  //     ...counselor,
  //     name: `${formData.title} ${formData.firstName} ${formData.lastName}`.trim(),
  //     strand: formData.strand,
  //     status: formData.status,
  //     officeHours: formData.officeHours,
  //     workHours: formData.workHours,
  //     about: formData.about,
  //   };
  //   onSave(updatedCounselor);
  // };

  const handleSubmit = (e) => {
    e.preventDefault();

    const counselorData = {
      id: counselor?.staffAccount_ID || null,
      name: `${formData.title} ${formData.firstName} ${formData.lastName}`.trim(),
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

    onSave(counselorData);
  };

  const handleConfirmDelete = (e) => {
    e.preventDefault();

    if (!confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Password Required",
        text: "Please enter your password to confirm.",
        confirmButtonColor: "#FB9724",
      });
      return;
    }

    // Example validation (replace with real password check)
    const correctPassword = "admin123";
    if (confirmPassword !== correctPassword) {
      Swal.fire({
        icon: "error",
        title: "Incorrect Password!",
        text: "Please try again.",
        confirmButtonColor: "#FB9724",
      });
      return;
    }

    // Delete counselor
    onDelete(counselor, confirmPassword);

    // Close modal + reset
    setConfirmPassword("");
    setShowConfirmDelete(false);
    onClose();

    // Show success alert (no button, auto close 5s)
    Swal.fire({
      icon: "success",
      title: "Successfully Deleted!",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
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
            <div className="bg-[#FBBC05] px-6 py-5 relative">
              <div className="absolute inset-0 bg-black opacity-5"></div>
              <h2 className="text-2xl font-bold text-white relative z-10 flex items-center gap-2">
                <User className="w-6 h-6" />
                {counselor ? "Edit Counselor Profile" : "Add Counselor"}
              </h2>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 transition-all z-10"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] overscroll-behavior-contain">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Personal Info */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-orange-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FB9724] to-[#FBBC05] flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Personal Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Title
                      </label>
                      <select
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#FB9724] focus:border-transparent bg-white text-gray-700 transition-all"
                      >
                        <option value="">Select</option>
                        <option>Mr.</option>
                        <option>Ms.</option>
                        <option>Mrs.</option>
                        <option>Dr.</option>
                        <option>Prof.</option>
                        <option>Engr.</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#FB9724] focus:border-transparent transition-all"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#FB9724] focus:border-transparent transition-all"
                        placeholder="Enter last name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#FB9724] focus:border-transparent transition-all"
                        placeholder="e.g. first.last@school.edu"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Details */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-orange-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FB9724] to-[#FBBC05] flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Professional Details
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Profession
                      </label>
                      <select
                        name="strand"
                        value={formData.strand}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#FB9724] focus:border-transparent text-gray-700 bg-white transition-all"
                      >
                        <option value="">Select Profession</option>
                        <option>STEM</option>
                        <option>ABM</option>
                        <option>HUMSS</option>
                        <option>Health-Allied</option>
                        {/* <option>GAS</option>
                        <option>TVL</option>
                        <option>Sports</option>
                        <option>Arts & Design</option> */}
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
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#FB9724] focus:border-transparent text-gray-700 bg-white transition-all"
                      >
                        <option>Active</option>
                        <option>Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Schedule */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-orange-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FB9724] to-[#FBBC05] flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Schedule
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Office Location
                      </label>
                      <input
                        type="text"
                        name="officeLocation"
                        value={formData.officeLocation}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#FB9724] focus:border-transparent transition-all"
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
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#FB9724] focus:border-transparent transition-all"
                        placeholder="e.g. Mon & Wed 2:00 PM - 4:00 PM"
                      />
                    </div>
                  </div>
                </div>

                {/* About */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-orange-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FB9724] to-[#FBBC05] flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      About
                    </h3>
                  </div>
                  <textarea
                    name="about"
                    rows="4"
                    value={formData.about}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#FB9724] focus:border-transparent resize-none transition-all"
                    placeholder="Enter about information"
                  ></textarea>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-2">
                  {counselor && (
                    <button
                      type="button"
                      onClick={() => setShowConfirmDelete(true)}
                      className="px-5 py-2.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all flex items-center gap-2 font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                    className={`px-6 py-2.5 bg-[#FBBC05] text-white rounded-lg shadow-md transition-all font-medium flex items-center gap-2 ${isSaving ? 'opacity-60 cursor-not-allowed hover:shadow-none hover:scale-100' : 'hover:shadow-lg hover:scale-105'}`}
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
                className="fixed inset-0 flex items-center justify-center z-50"
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
                    type="password"
                    placeholder="Enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#FB9724] focus:border-transparent transition-all mb-4"
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowConfirmDelete(false)}
                      className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-700 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
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
