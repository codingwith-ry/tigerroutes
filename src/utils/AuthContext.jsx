import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [justLoggedOut, setJustLoggedOut] = useState(false);

  const refreshUser = async () => {
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
    }
  };

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, refreshUser, justLoggedOut, setJustLoggedOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
