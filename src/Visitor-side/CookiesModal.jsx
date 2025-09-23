import React, { useState } from 'react';
import { X } from 'lucide-react';

const CookiesModal = ({ isOpen, onClose }) => {
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true,
    functional: true,
    analytics: true,
    marketing: false
  });

  const handleToggle = (key) => {
    if (key === 'necessary') return;
    setCookiePreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 font-sfpro">
      <div className="bg-[#FFFCED] w-full max-w-2xl rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Cookie Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-gray-600">
            We use cookies to enhance your browsing experience and analyze our traffic. 
            Please select your preferences below.
          </p>

          <div className="space-y-4">
            {Object.entries(cookiePreferences).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-[#F6BE1E] transition-colors">
                <div className="pr-4">
                  <h3 className="font-semibold capitalize text-gray-900">{key} Cookies</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {key === 'necessary' 
                      ? 'Essential cookies that ensure the website functions properly.' 
                      : key === 'functional'
                      ? 'Enhance website functionality and personalization features.'
                      : key === 'analytics'
                      ? 'Help us understand how visitors interact with our website.'
                      : 'Used for marketing and advertising purposes.'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={value}
                    onChange={() => handleToggle(key)}
                    disabled={key === 'necessary'}
                  />
                  <div className={`w-11 h-6 bg-gray-200 rounded-full peer 
                    peer-focus:ring-4 peer-focus:ring-[#F6BE1E]/20
                    peer-disabled:cursor-not-allowed peer-disabled:opacity-50
                    ${value ? 'after:translate-x-full bg-[#F6BE1E]' : ''}
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                    after:bg-white after:rounded-full after:h-5 after:w-5 
                    after:transition-all after:shadow`}>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // Add save functionality here
              onClose();
            }}
            className="px-6 py-2 bg-[#F6BE1E] text-white rounded-lg font-medium hover:bg-[#e5ad1b] transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookiesModal;