import React, { useState } from "react";
import { Home, ClipboardCheck, Users, Menu, X, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    {
      path: "/admin/dashboard",
      icon: <Home className="w-5 h-5 mr-3" />,
      label: "Dashboard",
    },
    {
      path: "/admin/assessment",
      icon: <ClipboardCheck className="w-5 h-5 mr-3" />,
      label: "Assessment",
      matches: ["/admin/assessment", "/admin/student"],
    },
    {
      path: "/admin/counselors",
      icon: <Users className="w-5 h-5 mr-3" />,
      label: "Manage Counselors",
      matches: ["/admin/counselors", "/admin/preview"],
    },
  ];

  const handleLogout = () => {
    Swal.fire({
      title: "Logout",
      text: "Are you sure you want to log out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Logout",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      customClass: {
        popup: "rounded-xl",
        confirmButton:
          "bg-yellow-400 text-white px-4 py-2 rounded-md hover:bg-yellow-500 ml-2",
        cancelButton:
          "bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 mr-2",
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.clear();
        navigate("/");
      }
    });
  };

  const isLinkActive = (link) => {
    if (location.pathname === link.path) return true;
    // check if current route starts with any child route
    if (link.children) {
      return link.children.some((child) => location.pathname.startsWith(child));
    }
    return false;
  };

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

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-[#fdfcf8] border-r transform transition-transform duration-300 z-50
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:w-64 flex flex-col`}
      >
        {/* Header */}
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
        <nav className="flex flex-col flex-grow px-4 gap-2 mt-4">
          {links.map((link) => (
            <button
              key={link.path}
              onClick={() => {
                navigate(link.path);
                setIsOpen(false);
              }}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                (link.matches?.some(path => location.pathname.includes(path)) || location.pathname === link.path)
                  ? "bg-yellow-100 text-yellow-600"
                  : "hover:bg-gray-100"
              }`}
            >
              {link.icon} {link.label}
            </button>
          ))}
        </nav>

        {/* Logout button */}
        <div className="px-4 mb-6">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay for Mobile */}
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
