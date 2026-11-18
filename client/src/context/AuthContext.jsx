import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the session from a saved token on first load
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setLoading(false);
      return;
    }
    api('/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const authenticate = async (path, body) => {
    const d = await api(path, { method: 'POST', body });
    localStorage.setItem('token', d.token);
    setUser(d.user);
    return d.user;
  };

  const login = (email, password) => authenticate('/auth/login', { email, password });
  const register = (name, email, password) => authenticate('/auth/register', { name, email, password });

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const toggleFavorite = async (destinationId) => {
    const d = await api(`/users/favorites/${destinationId}`, { method: 'POST' });
    setUser((u) => ({ ...u, favorites: d.favorites }));
  };

  const value = { user, loading, login, register, logout, toggleFavorite };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
