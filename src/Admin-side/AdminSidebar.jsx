import React, { useState } from "react";
import { Home, ClipboardCheck, Users, Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { path: "/admin/dashboard", label: "Dashboard", icon: <Home className="mr-3 w-5 h-5" /> },
    { path: "/admin/assessment", label: "Assessment", icon: <ClipboardCheck className="mr-3 w-5 h-5" /> },
    { path: "/admin/counselors", label: "Manage Counselors", icon: <Users className="mr-3 w-5 h-5" /> },
  ];

  return (
    <>
      {/* Topbar for Mobile */}
      <div className="md:hidden flex justify-between items-center p-7 bg-[#fdfcf8] border-b">
        <img
          src="/images/TIGER ROUTES.png"
          alt="TigerRoutes Logo"
          className="h-8 object-contain"
        />
        <button onClick={() => setIsOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar (collapsible on mobile, static on desktop) */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-[#fdfcf8] border-r transform transition-transform duration-300 z-50
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:w-64`}
      >
        {/* Sidebar header with close button */}
        <div className="flex justify-between items-center p-7 border-b">
          <img
            src="/images/TIGER ROUTES.png"
            alt="TigerRoutes Logo"
            className="h-8 object-contain"
          />
          <button className="md:hidden" onClick={() => setIsOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col px-4 gap-2 mt-4">
          {links.map((link) => (
            <button
              key={link.path}
              onClick={() => {
                navigate(link.path);
                setIsOpen(false); // auto-close on mobile
              }}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? "bg-yellow-100 text-yellow-600"
                  : "hover:bg-gray-100"
              }`}
            >
              {link.icon} {link.label}
            </button>
          ))}
        </nav>

        {/* Profile (Desktop only) */}
        <div className="hidden md:flex absolute bottom-6 left-6 items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            AU
          </div>
          <div>
            <p className="font-semibold">Admin User</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
        </div>
      </aside>

      {/* Overlay when sidebar is open on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default AdminSidebar;
