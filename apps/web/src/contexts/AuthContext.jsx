import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';

const ProfileContext = createContext(null);

/**
 * There is no account system: a single local profile is created on the first
 * request and reused afterwards. `user` is never null once loading is done.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api.get('/profile');
      setUser(data.user);
      return data.user;
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  const value = useMemo(() => ({ user, loading, refresh, updateUser }), [user, loading, refresh, updateUser]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useAuth() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useAuth doit être utilisé dans AuthProvider.');
  return context;
}
