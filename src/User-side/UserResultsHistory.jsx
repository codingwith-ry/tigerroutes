import React from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiFileText, FiMessageCircle, FiCalendar } from "react-icons/fi";
import UserNavbar from "./UserNavbar";
import Footer from "../Visitor-side/Footer";

const UserResultsHistory = () => {
  const navigate = useNavigate();

  // Mock Data
  const stats = {
    totalAssessments: 4,
    avgSatisfaction: 3.0, // out of 5
    counselorReplies: 2,
  };

  const assessments = [
    {
      date: "07/07/2025",
      day: "Monday",
      status: "Completed",
      satisfaction: 5,
      reply: "No reply",
    },
    {
      date: "06/27/2025",
      day: "Friday",
      status: "Completed",
      satisfaction: 2,
      reply: {
        counselor: "Dr. John Doe",
        date: "2025-06-30",
        isNew: true,
      },
    },
    {
      date: "05/26/2025",
      day: "Monday",
      status: "Completed",
      satisfaction: 1,
      reply: {
        counselor: "Dr. John Doe",
        date: "2025-05-28",
      },
    },
    {
      date: "05/26/2025",
      day: "Monday",
      status: "Completed",
      satisfaction: 4,
      reply: "No reply",
    },
  ];

  // Reusable ProgressCircle wrapper
  const ProgressCircle = ({ value, max, color, children }) => {
    const radius = 32;
    const strokeWidth = 14;
    const circumference = 2 * Math.PI * radius;
    const progress = (value / max) * circumference;

    return (
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* Rotated SVG for progress */}
        <div className="absolute inset-0 transform -rotate-90">
          <svg width="100" height="100">
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="#e5e7eb"
              strokeWidth={strokeWidth}
              fill="none"
            />
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              strokeLinecap="round"
            />
          </svg>
        </div>
        {/* Centered icon/text (not rotated) */}
        {children}
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#FFFCED] flex flex-col font-sfpro">
      <UserNavbar />
      <div className="flex-grow px-6 md:px-12 py-6 space-y-6 mt-24">
        <h2 className="text-3xl font-black mb-6">Previous Assessment Results</h2>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Assessments */}
          <div className="bg-white p-6 rounded-xl shadow flex items-center justify-between border border-black">
            <div>
              <p className="text-gray-600 text-sm">Total Assessments</p>
              <h3 className="text-4xl font-extrabold">{stats.totalAssessments}</h3>
            </div>
            <ProgressCircle value={stats.totalAssessments} max={5} color="#3b82f6">
              <FiFileText className="text-blue-500 text-2xl" />
            </ProgressCircle>
          </div>

          {/* Average Satisfaction */}
          <div className="bg-white p-6 rounded-xl shadow flex items-center justify-between border border-black">
            <div>
              <p className="text-gray-600 text-sm">Average Satisfaction</p>
              <h3 className="text-4xl font-extrabold">{stats.avgSatisfaction}</h3>
            </div>
            <ProgressCircle value={stats.avgSatisfaction} max={5} color="#facc15">
              <span className="text-yellow-500 text-3xl">★</span>
            </ProgressCircle>
          </div>

          {/* Counselor Replies */}
          <div className="bg-white p-6 rounded-xl shadow flex items-center justify-between border border-black">
            <div>
              <p className="text-gray-600 text-sm">Counselor Replies</p>
              <h3 className="text-4xl font-extrabold">{stats.counselorReplies}</h3>
            </div>
            <ProgressCircle value={stats.counselorReplies} max={5} color="#22c55e">
              <FiMessageCircle className="text-green-500 text-2xl" />
            </ProgressCircle>
          </div>
        </div>

        {/* Assessment History */}
        <div className="bg-white p-6 rounded-xl shadow border border-black">
          <h3 className="text-xl font-bold mb-4">Assessment History</h3>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-t">
              <thead className="bg-gray-100 text-left text-sm">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Satisfaction</th>
                  <th className="py-3 px-4">Counselor Reply</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((a, idx) => (
                  <tr
                    key={idx}
                    className="border-b text-sm hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4 flex items-center gap-2">
                      <FiCalendar className="text-gray-500" />
                      <div>
                        <p className="font-medium">{a.date}</p>
                        <p className="text-gray-500 text-xs">{a.day}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 text-green-600 bg-green-100 rounded-full text-xs font-medium">
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${
                              i < a.satisfaction ? "text-yellow-400" : "text-gray-300"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                        <span className="ml-2 text-gray-600">{a.satisfaction}/5</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {typeof a.reply === "string" ? (
                        <p className="text-gray-500">{a.reply}</p>
                      ) : (
                        <div className="flex items-center gap-2">
                          <FiFileText className="text-blue-500" />
                          <div>
                            <p className="text-blue-600 font-medium">{a.reply.counselor}</p>
                            <p className="text-xs text-gray-500">{a.reply.date}</p>
                          </div>
                          {a.reply.isNew && (
                            <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => navigate("/results/" + idx)}
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <FiEye /> View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-4 md:hidden">
            {assessments.map((a, idx) => {
              // pick color based on status
              const statusColor =
                a.status === "Completed"
                  ? "bg-green-500"
                  : a.status === "In Progress"
                  ? "bg-yellow-500"
                  : a.status === "Pending"
                  ? "bg-blue-500"
                  : "bg-gray-400"; // fallback for unknown status

              return (
                <div
                  key={idx}
                  className="relative bg-gray-50 p-4 pl-6 rounded-lg shadow-sm border border-gray-200"
                >
                  {/* Dynamic Accent Bar */}
                  <div
                    className={`absolute left-0 top-0 h-full w-1 rounded-l-lg ${statusColor}`}
                  ></div>

                  {/* Date */}
                  <div className="flex items-center gap-2 mb-2">
                    <FiCalendar className="text-gray-500" />
                    <div>
                      <p className="font-medium">{a.date}</p>
                      <p className="text-gray-500 text-xs">{a.day}</p>
                    </div>
                  </div>

                  {/* Status */}
                  <p className="mb-1">
                    <span className="font-semibold text-gray-500">Status: </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        a.status === "Completed"
                          ? "text-green-600 bg-green-100"
                          : a.status === "In Progress"
                          ? "text-yellow-600 bg-yellow-100"
                          : a.status === "Pending"
                          ? "text-blue-600 bg-blue-100"
                          : "text-gray-600 bg-gray-100"
                      }`}
                    >
                      {a.status}
                    </span>
                  </p>

                  {/* Satisfaction */}
                  <p className="mb-1">
                    <span className="font-semibold text-gray-500">Satisfaction: </span>
                    <span className="inline-flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`text-lg ${
                            i < a.satisfaction ? "text-yellow-400" : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                      <span className="ml-1 text-gray-600">{a.satisfaction}/5</span>
                    </span>
                  </p>

                  {/* Counselor Reply */}
                  <div className="mb-2">
                    <span className="font-semibold text-gray-500">Counselor Reply: </span>
                    {typeof a.reply === "string" ? (
                      <span className="text-gray-500">{a.reply}</span>
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <FiFileText className="text-blue-500" />
                        <div>
                          <p className="text-blue-600 font-medium">{a.reply.counselor}</p>
                          <p className="text-xs text-gray-500">{a.reply.date}</p>
                        </div>
                        {a.reply.isNew && (
                          <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => navigate("/results/" + idx)}
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <FiEye /> View Details
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-5">
            <Footer />
      </div>
    </div>
  );
};

export default UserResultsHistory;
