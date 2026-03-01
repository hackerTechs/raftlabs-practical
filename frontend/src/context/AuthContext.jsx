import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'RaftFoodLab_email';
const ADMIN_EMAIL = 'admin@mail.com';

function getStoredEmail() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored.trim().length > 0) return stored.trim().toLowerCase();
  } catch {
    // ignore
  }
  return null;
}

export function AuthProvider({ children }) {
  const [email, setEmail] = useState(() => getStoredEmail());

  // Persist to localStorage
  useEffect(() => {
    if (email) {
      localStorage.setItem(STORAGE_KEY, email);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [email]);

  const login = useCallback((userEmail) => {
    const trimmed = userEmail.trim().toLowerCase();
    setEmail(trimmed);
  }, []);

  const logout = useCallback(() => {
    setEmail(null);
  }, []);

  const isAdmin = email === ADMIN_EMAIL;

  return (
    <AuthContext.Provider
      value={{
        email,
        isAuthenticated: !!email,
        isAdmin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
