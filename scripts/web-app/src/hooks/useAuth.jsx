import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);
const STORAGE_KEY = 'household-monitor-auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      login: async ({ username, password }) => {
        if (!username || !password) {
          throw new Error('Username and password are required.');
        }

        const demoUser = {
          username,
          displayName: username === 'admin' ? 'Admin User' : username,
          role: username === 'admin' ? 'owner' : 'viewer',
        };

        setUser(demoUser);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
        return demoUser;
      },
      logout: () => {
        setUser(null);
        window.localStorage.removeItem(STORAGE_KEY);
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
