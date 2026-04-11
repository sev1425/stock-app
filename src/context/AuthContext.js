import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in securely via local storage
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    // Mocking real authentication delay for the "proper app" feel!
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!username || !password) {
            reject("Username and password required.");
            return;
        }
        localStorage.setItem('auth_user', username);
        setUser(username);
        resolve(username);
      }, 1000);
    });
  };

  const logout = () => {
    localStorage.removeItem('auth_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
