import React from 'react';

const AdminHeader = ({ title }) => {
  // notifications removed

  return (
    <header className="flex justify-between items-start sm:items-center p-4 sm:p-6 border-b">
      <h1 className="text-2xl sm:text-4xl font-semibold mb-2 sm:mb-0">{title}</h1>
      <div className="flex items-center space-x-4">
        {/* Show logged in user's initials in the top-right avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-base font-semibold text-gray-700">
          {(() => {
            try {
              const staffUser = JSON.parse(sessionStorage.getItem('staffUser') || 'null');
              if (!staffUser) return 'AU';
              // Possible name fields
              const name = staffUser.firstName || staffUser.first_name || staffUser.lastName || staffUser.last_name || staffUser.name || staffUser.fullName || staffUser.displayName || staffUser.staffName || staffUser.email || '';
              // If name looks like an email, take prefix
              let base = String(name || '').trim();
              if (!base && staffUser.email) base = String(staffUser.email).split('@')[0];
              // Derive initials from words
              const words = base.split(/\s+/).filter(Boolean);
              let initials = '';
              if (words.length >= 2) {
                initials = (words[0][0] || '') + (words[1][0] || '');
              } else if (words.length === 1) {
                // take first two characters of single word (e.g., username)
                initials = (words[0][0] || '') + (words[0][1] || '');
              }
              initials = (initials || 'AU').toUpperCase();
              return initials;
            } catch (e) {
              return 'AU';
            }
          })()}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;