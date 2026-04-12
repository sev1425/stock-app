import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [theme, setTheme] = useState('dark');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Startup checks
    const storedUser = localStorage.getItem('auth_user');
    
    // Check Theme
    const savedTheme = localStorage.getItem('app_theme');
    if (savedTheme) {
        setTheme(savedTheme);
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
        }
    }

    if (storedUser) {
      setUser(storedUser);
      let storedBalance = localStorage.getItem(`auth_bal_${storedUser}`);
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

  const toggleTheme = () => {
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      localStorage.setItem('app_theme', newTheme);
      if (newTheme === 'light') {
          document.body.classList.add('light-theme');
      } else {
          document.body.classList.remove('light-theme');
      }
  };

  const resetAccount = () => {
      // Brutally wipe all data!
      updateBalance(10000);
      localStorage.removeItem("portfolio");
      localStorage.removeItem("stocks");
      localStorage.removeItem("ledger");
      alert("Bankruptcy declared! Account has been totally reset. Wait for reload...");
      window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ user, balance, theme, toggleTheme, resetAccount, updateBalance, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
