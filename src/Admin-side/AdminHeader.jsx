import React, { useState, useRef, useEffect } from 'react';
import { Bell, X } from 'lucide-react';

const AdminHeader = ({ title }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      text: "New assessment completed by STU-0012",
      time: "2 minutes ago",
      isRead: false
    },
    { 
      id: 2, 
      text: "Student feedback received from STU-0008",
      time: "1 hour ago",
      isRead: false
    }
  ]);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
  };

  return (
    <header className="flex justify-between items-start sm:items-center p-4 sm:p-6 border-b">
      <h1 className="text-2xl sm:text-4xl font-semibold mb-2 sm:mb-0">{title}</h1>
      <div className="flex items-center space-x-4">
        <div className="relative" ref={notificationRef}>
          <button 
            className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          >
            <Bell className="w-5 h-5" />
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                {notifications.filter(n => !n.isRead).length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                  {notifications.some(n => !n.isRead) && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50' : ''}`}
                      >
                        <p className={`text-sm ${!notification.isRead ? 'font-semibold' : ''}`}>
                          {notification.text}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">{notification.time}</span>
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-base">
          AU
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;