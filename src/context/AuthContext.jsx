import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('voices_token');
    const storedUser = localStorage.getItem('voices_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('voices_token');
        localStorage.removeItem('voices_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await apiLogin(email, password);
    localStorage.setItem('voices_token', data.token);
    localStorage.setItem('voices_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('voices_token');
    localStorage.removeItem('voices_user');
    setToken(null);
    setUser(null);
  }, []);

  const isRole = useCallback((...roles) => {
    return user && roles.includes(user.role);
  }, [user]);

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isRole,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// Role-based redirect helper
export function getRoleHomePath(role) {
  switch (role) {
    case 'sales': return '/sales';
    case 'admin': return '/admin';
    case 'super_admin': return '/super-admin';
    case 'organization': return '/org';
    case 'student': return '/student';
    case 'parent': return '/parent';
    default: return '/login';
  }
}
