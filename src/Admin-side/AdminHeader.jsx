import React, { useEffect, useState } from 'react';
import { fetchStaffProfile } from '../utils/staffProfile';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const AdminHeader = ({ title }) => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const p = await fetchStaffProfile();
      if (mounted) setProfile(p);
      // If no session/profile was returned, the user likely navigated directly to a protected admin URL.
      // Show a notice and redirect to home after 5 seconds.
      if (!p) {
        try {
          Swal.fire({
            icon: 'warning',
            title: 'Not authenticated',
            html: 'You are not logged in. Redirecting to home in <strong></strong> seconds.',
            timer: 5000,
            allowOutsideClick: false,
            didOpen: () => {
              const b = Swal.getHtmlContainer().querySelector('strong');
              let i = 5;
              b.textContent = String(i);
              const t = setInterval(() => {
                i -= 1;
                if (b) b.textContent = String(i);
              }, 1000);
              Swal.getTimerLeft = () => 0; // noop to avoid warnings
              Swal.getPopup().addEventListener('swalClose', () => clearInterval(t));
            }
          }).then(() => {
            // navigate to home
            try { window.location.href = '/'; } catch (e) { window.location.replace('/'); }
          });
        } catch (e) {
          // fallback redirect if Swal fails
          setTimeout(() => { try { window.location.href = '/'; } catch (err) { window.location.replace('/'); } }, 5000);
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  const initials = (() => {
    try {
      const staffUser = profile || JSON.parse(sessionStorage.getItem('staffUser') || 'null');
      if (!staffUser) return 'AU';
      const name = staffUser.firstName || staffUser.first_name || staffUser.lastName || staffUser.last_name || staffUser.name || staffUser.fullName || staffUser.displayName || staffUser.staffName || staffUser.email || '';
      let base = String(name || '').trim();
      if (!base && staffUser.email) base = String(staffUser.email).split('@')[0];
      const words = base.split(/\s+/).filter(Boolean);
      let i = '';
      if (words.length >= 2) {
        i = (words[0][0] || '') + (words[1][0] || '');
      } else if (words.length === 1) {
        i = (words[0][0] || '') + (words[0][1] || '');
      }
      i = (i || 'AU').toUpperCase();
      return i;
    } catch (e) {
      return 'AU';
    }
  })();

  return (
    <header className="flex justify-between items-start sm:items-center p-4 sm:p-6 border-b">
      <h1 className="text-2xl sm:text-4xl font-semibold mb-2 sm:mb-0">{title}</h1>
      <div className="flex items-center space-x-4">
        {/* Show logged in user's initials in the top-right avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-base font-semibold text-gray-700">
          {initials}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;