import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { logout as apiLogout } from '../api/client';

const AuthContext = createContext(null);

const STORAGE_KEY = 'cbms_user';

function loadUser() {
  try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null'); }
  catch { return null; }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, verify session with backend
  useEffect(() => {
    async function verifySession() {
      try {
        // Check if we have a stored user or token
        const storedUser = loadUser();

        // If no stored user, we're not authenticated
        if (!storedUser) {
          setIsLoading(false);
          return;
        }

        // We have a stored user, trust it (cookie/token will validate on first API call)
        setUser(storedUser);
      } catch (err) {
        // Silent fail, just mark as not authenticated
      } finally {
        setIsLoading(false);
      }
    }

    verifySession();
  }, []);

  const signIn = useCallback((userData) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  const signOut = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, isAdmin, signIn, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


