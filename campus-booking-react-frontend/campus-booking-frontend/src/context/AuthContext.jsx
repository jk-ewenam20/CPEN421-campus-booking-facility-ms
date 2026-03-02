import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { logout as apiLogout, getUser, setUser, validateSession } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => getUser());
  const [isLoading, setIsLoading] = useState(true);

  // On mount, restore and validate user session
  useEffect(() => {
    async function restoreSession() {
      try {
        // First, try to load from localStorage (persists across Safari tabs)
        const savedUser = getUser();

        if (!savedUser) {
          // No saved user, not authenticated
          setIsLoading(false);
          return;
        }

        // We have a saved user, validate the session is still active
        // This is important for Safari where cookies may expire
        const [validatedUser, err] = await validateSession();

        if (err) {
          // Session invalid, clear it
          setUser(null);
          setUserState(null);
        } else if (validatedUser) {
          // Session is valid
          setUserState(validatedUser);
        }
      } catch (err) {
        // Network error or validation failed - trust localStorage for now
        if (savedUser) {
          setUserState(savedUser);
        }
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  const signIn = useCallback((userData) => {
    // Use persistent storage helper
    setUser(userData);
    setUserState(userData);
  }, []);

  const signOut = useCallback(async () => {
    await apiLogout();
    setUserState(null);
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


