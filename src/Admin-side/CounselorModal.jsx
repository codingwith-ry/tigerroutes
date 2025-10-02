import React, { useState, useEffect } from "react";
import { X, User, Briefcase, Clock, FileText, CheckCircle } from "lucide-react";

const CounselorModal = ({ isOpen, onClose, counselor, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    firstName: "",
    lastName: "",
    strand: "",
    status: "",
    officeHours: "",
    workHours: "",
    about: "",
  });

  useEffect(() => {
    if (counselor) {
      const nameParts = counselor.name.split(" ");
      setFormData({
        title: nameParts[0] || "",
        firstName: nameParts[1] || "",
        lastName: nameParts.slice(-1)[0] || "",
        strand: counselor.strand || "",
        status: counselor.status || "Active",
        officeHours: counselor.officeHours || "",
        workHours: counselor.workHours || "",
        about: counselor.about || "",
      });
    }
  }, [counselor]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedCounselor = {
      ...counselor,
      name: `${formData.title} ${formData.firstName} ${formData.lastName}`,
      strand: formData.strand,
      status: formData.status,
      officeHours: formData.officeHours,
      workHours: formData.workHours,
      about: formData.about,
    };
    onSave(updatedCounselor);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-2xl w-full max-w-[900px] max-h-[90vh] overflow-hidden">
        
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
                <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#FB9724] focus:border-transparent transition-all"
                    placeholder="Enter last name"
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
                <h3 className="text-lg font-semibold text-gray-800">Professional Details</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Profession</label>
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
                    <option>GAS</option>
                    <option>TVL</option>
                    <option>Sports</option>
                    <option>Arts & Design</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
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
                <h3 className="text-lg font-semibold text-gray-800">Schedule</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Office Hours</label>
                  <input
                    type="text"
                    name="officeHours"
                    value={formData.officeHours}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#FB9724] focus:border-transparent transition-all"
                    placeholder="e.g. 9:00 AM - 12:00 PM"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Work Hours</label>
                  <input
                    type="text"
                    name="workHours"
                    value={formData.workHours}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#FB9724] focus:border-transparent transition-all"
                    placeholder="e.g. 1:00 PM - 5:00 PM"
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
                <h3 className="text-lg font-semibold text-gray-800">About</h3>
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
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#FBBC05] text-white rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all font-medium flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Save Changes
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CounselorModal;
