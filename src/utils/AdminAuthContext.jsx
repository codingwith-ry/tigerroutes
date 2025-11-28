import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshInFlight = useRef(false);
  const lastRefreshTs = useRef(0);

  const refreshUser = useCallback(async () => {
    const now = Date.now();
    if (now - lastRefreshTs.current < 3000) return;
    if (refreshInFlight.current) return;
    lastRefreshTs.current = now;
    refreshInFlight.current = true;
    setLoading(true);
    try {
      const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const res = await fetch(`${base}/api/staff/me`, { credentials: 'include' });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const json = await res.json();
      if (json && json.success && json.data) {
        setUser(json.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
      refreshInFlight.current = false;
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <AdminAuthContext.Provider value={{ user, setUser, loading, refreshUser }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

AdminAuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAdminAuth = () => useContext(AdminAuthContext);

export default AdminAuthContext;
