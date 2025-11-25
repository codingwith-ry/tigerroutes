import React, { useEffect, useState } from 'react';
import { fetchStaffProfile } from '../utils/staffProfile';
import { useAuth } from '../utils/AuthContext';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const AdminHeader = ({ title }) => {
  const [profile, setProfile] = useState(null);
  const { user: authUser, refreshUser } = useAuth();

  useEffect(() => {
    // Ensure AuthContext fetches the current user using the server-side cookie (tigerroutes.sid)
    let mounted = true;
    (async () => {
      try {
        await refreshUser();
        // also try the legacy staff profile fetch as a fallback
        const p = await fetchStaffProfile();
        if (mounted && p) setProfile(p);
      } catch (e) {
        // ignore — we'll show an auth notice below if no auth user exists
      }
    })();
    return () => { mounted = false; };
  }, [refreshUser]);

  // When AuthContext receives a user from `/api/me`, prefer that as the profile source.
  useEffect(() => {
    if (authUser) setProfile(authUser);
  }, [authUser]);

  const initials = (() => {
    try {
      const staffUser = profile || authUser || JSON.parse(sessionStorage.getItem('staffUser') || 'null');
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