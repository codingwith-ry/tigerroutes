import React, { useState, useEffect } from "react";
import { Home, ClipboardCheck, Users, Activity, Menu, X, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { fetchStaffProfile } from '../utils/staffProfile';
/* eslint-disable react/prop-types */

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const [staffUser, setStaffUser] = useState(null);  
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true); // Start loading
        const p = await fetchStaffProfile();
        if (mounted && p) {
          setStaffUser(p);
        } else if (mounted && !p) {
          // No valid staff profile found
          try {
            try { sessionStorage.removeItem('staffUser'); } catch (e) { console.warn('sessionStorage.removeItem failed', e); }
            try { localStorage.clear(); } catch (e) { console.warn('localStorage.clear failed', e); }
          } catch (e) { console.warn('clearing client storage failed', e); }
          Swal.fire({
            icon: 'warning',
            title: 'Not Authorized',
            text: 'You must be logged in as staff to access this page. Redirecting to admin login...',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            customClass: { popup: 'rounded-xl' },
          });
          setTimeout(() => navigate('/admin'), 3000);
        }
      } catch (e) {
        console.warn('fetchStaffProfile failed', e);
      } finally {
        if (mounted) {
          setIsLoading(false); // End loading regardless of success/failure
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Only render navigation after profile is loaded
  if (isLoading) {
    return (
      <>
        {/* Mobile Topbar Skeleton */}
        <div className="md:hidden flex justify-between items-center p-5 bg-[#fdfcf8] border-b">
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          <button onClick={() => setIsOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar Skeleton */}
        <aside className="hidden md:flex w-64 bg-[#fdfcf8] border-r flex-col">
          <div className="flex justify-between items-center p-5 border-b">
            <div className="h-12 w-40 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex flex-col flex-grow px-4 gap-2 mt-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center px-4 py-2 rounded-lg">
                <div className="w-5 h-5 mr-3 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
              </div>
            ))}
          </div>
        </aside>
      </>
    );
  }

  const effectiveStaff = staffUser;
  const isSupervisor = effectiveStaff?.staffRole_ID === 2 || (effectiveStaff?.role || '').toString().toLowerCase() === 'supervisor';

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
    ...(isSupervisor ? [
      {
        path: "/admin/counselors",
        icon: <Users className="w-5 h-5 mr-3" />,
        label: "Manage Counselors",
        matches: ["/admin/counselors", "/admin/preview"],
      },
      {
        path: "/admin/activity-logs",
        icon: <Activity className="w-5 h-5 mr-3" />,
        label: "Activity Logs",
        matches: ["/admin/activity-logs", "/admin/logs"],
      }
    ] : []),
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
        // Call server to destroy session and clear HttpOnly cookie, then clear client storage
        fetch(`${process.env.REACT_APP_API_URL}/api/logout`, {
          method: 'POST',
          credentials: 'include'
        }).then(() => {
          try { localStorage.clear(); } catch (e) { console.warn('localStorage.clear failed', e); }
          try { sessionStorage.clear(); } catch (e) { console.warn('sessionStorage.clear failed', e); }
          navigate("/admin");
          Swal.fire({
            icon: "success",
            title: "Logged Out",
            text: "You have been successfully logged out.",
            confirmButtonText: "OK",
            customClass: {
              popup: "rounded-xl",
              confirmButton:
                "bg-yellow-400 text-white px-4 py-2 rounded-md hover:bg-yellow-500 w-32",
            },
            buttonsStyling: false,
          });
        }).catch((err) => {
          console.error('Logout request failed', err);
          // Still clear client storage to avoid local re-entry; warn user server logout may have failed
          try { localStorage.clear(); } catch (e) { console.warn('localStorage.clear failed', e); }
          try { sessionStorage.clear(); } catch (e) { console.warn('sessionStorage.clear failed', e); }
          navigate("/");
          Swal.fire('Logged out (local)', 'Local session cleared but server logout may have failed.', 'warning');
        });
      }
    });
  };

  const isLinkActive = (link) => {
    if (location.pathname === link.path) return true;
    if (link.matches?.some(path => location.pathname.includes(path))) return true;
    if (link.children) {
      return link.children.some((child) => location.pathname.startsWith(child));
    }
    return false;
  };

  return (

//Generate a responsive React admin sidebar component. The sidebar has a vertical layout on the left and a topbar for mobile screens. Include a logo at the top of both sidebar and mobile topbar. Add a close button on mobile to collapse the sidebar. Include navigation links with icons: Dashboard, Assessment, Manage Counselors, and Activity Logs. Add a logout button at the bottom with a red color style. Highlight active links visually. Add a dark overlay behind the sidebar on mobile when open. Use TailwindCSS for styling. Do not include state, hooks, or logic. Only generate the JSX structure with class names. Make the design modern and clean.


    <>
      {/* Topbar for Mobile */}
      <div className="md:hidden flex justify-between items-center p-5 bg-[#fdfcf8] border-b">
        <img
          src="/images/02_TigerRoutes_Logo.webp"
          alt="TigerRoutes Logo"
          className="h-10 object-contain"
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
        <div className="flex justify-between items-center p-5 border-b">
          <img
            src="/images/02_TigerRoutes_Logo.webp"
            alt="TigerRoutes Logo"
            className="h-12 object-contain"
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
                (isLinkActive(link))
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
