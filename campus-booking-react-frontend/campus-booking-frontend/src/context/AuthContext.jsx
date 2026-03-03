import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { logout as apiLogout, getAuthUser, setAuthUser, validateSession } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => getAuthUser());
  const [isLoading, setIsLoading] = useState(true);

  // On mount, restore and validate user session
  useEffect(() => {
    async function restoreSession() {
      try {
        // First, try to load from localStorage (persists across Safari tabs)
        const savedUser = getAuthUser();

        if (!savedUser) {
          // No saved user, not authenticated
          setIsLoading(false);
          return;
        }

        // Validate the session is still active (token/cookie check)
        const [validatedUser, err] = await validateSession();

        if (!err && validatedUser) {
          // Session confirmed valid
          setUserState(validatedUser);
        }
        // On validation failure: trust localStorage — the user is still set from
        // useState initializer. Individual API calls handle 401 when they occur.
      } catch (err) {
        // Network error or validation failed - trust localStorage for now
        const savedUser = getAuthUser();
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
    setAuthUser(userData);
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


