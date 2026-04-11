import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Basic startup checks
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      setUser(storedUser);
      // Load their personal bank account, or give them $10,000 for paper trading!
      const storedBalance = localStorage.getItem(`auth_bal_${storedUser}`);
      if (storedBalance) {
          setBalance(Number(storedBalance));
      } else {
          setBalance(10000);
          localStorage.setItem(`auth_bal_${storedUser}`, 10000);
      }
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!username || !password) {
            reject("Username and password required.");
            return;
        }
        localStorage.setItem('auth_user', username);
        setUser(username);
        
        let existingBalance = localStorage.getItem(`auth_bal_${username}`);
        if (!existingBalance) {
            existingBalance = 10000;
            localStorage.setItem(`auth_bal_${username}`, existingBalance);
        }
        setBalance(Number(existingBalance));
        
        resolve(username);
      }, 1000);
    });
  };

  const logout = () => {
    localStorage.removeItem('auth_user');
    setUser(null);
    setBalance(0);
  };

  const updateBalance = (newAmount) => {
      if (!user) return;
      setBalance(newAmount);
      localStorage.setItem(`auth_bal_${user}`, newAmount);
  };

  return (
    <AuthContext.Provider value={{ user, balance, updateBalance, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
