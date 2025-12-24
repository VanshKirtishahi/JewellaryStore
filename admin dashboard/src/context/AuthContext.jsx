import { createContext, useState, useEffect } from 'react';
import axios from '../api/axios';

// 1. FIX: Export 'AuthContext' explicitly so other files can import { AuthContext }
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for logged-in user on app startup
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
            // Optional: Verify token with backend if you have a /me endpoint
            // const res = await axios.get('/auth/me'); 
            // setUser(res.data);
            
            // For now, decode token or just assume valid if exists (simplified)
            // Ideally, store user data in localStorage too or fetch it
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        }
      } catch (error) {
        console.error("Session restoration failed", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/auth/login', { email, password });
      
      // Store token and user data
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      setUser(res.data.user);
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // Optional: Redirect is handled in the UI/Navbar usually
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Default export is also useful for the Provider import
export default AuthProvider;