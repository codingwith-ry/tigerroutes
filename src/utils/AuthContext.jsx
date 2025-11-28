import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [justLoggedOut, setJustLoggedOut] = useState(false);

  // Use a ref to prevent concurrent refreshes and useCallback to ensure
  // the function identity is stable so components which list
  // `refreshUser` in their effect deps don't repeatedly re-run.
  const refreshInFlight = useRef(false);
  const refreshUser = useCallback(async () => {
    if (refreshInFlight.current) return;
    refreshInFlight.current = true;
    setLoading(true);
    try {
      const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const res = await fetch(`${base}/api/me`, { credentials: 'include' });
      const json = await res.json();
      if (json && json.success && json.user) {
        setUser(json.user);
      } else if (json && json.success && json.user === undefined && json.data) {
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
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, refreshUser, justLoggedOut, setJustLoggedOut }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
