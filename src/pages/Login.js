import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    try {
        await login(username, password);
        // On success, redirect to the secure dashboard!
        navigate('/');
    } catch (err) {
        setError(err);
    } finally {
        setIsLoggingIn(false);
    }
  };

  return (
    <div className="login-container fade-in">
        <div className="glass-panel login-card">
            <h1 className="login-title">📈 StockPro</h1>
            <p className="login-subtitle">Sign in to your portfolio</p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="login-form">
                <div className="input-group">
                    <label>Username</label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        autoComplete="username"
                        placeholder="Enter any username" 
                    />
                </div>
                
                <div className="input-group">
                    <label>Password</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        autoComplete="current-password"
                        placeholder="••••••••" 
                    />
                </div>

                <button type="submit" className="add-btn login-btn" disabled={isLoggingIn}>
                    {isLoggingIn ? 'Authenticating...' : 'Secure Sign In'}
                </button>
            </form>
        </div>
    </div>
  );
}
