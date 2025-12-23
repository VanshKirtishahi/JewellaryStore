import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper: Decode token locally without API call
  const getUserFromToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      // Check if token is expired
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        return null;
      }
      // Return user data (adjust 'decoded.user' vs 'decoded' based on your JWT structure)
      return decoded.user || decoded;
    } catch (error) {
      return null;
    }
  };

  // Function to fetch the full user profile
  const fetchUserProfile = async (token) => {
    try {
      // 1. Try to fetch fresh data from the database
      const res = await axios.get('/auth/me'); 
      setUser(res.data);
    } catch (error) {
      console.warn("API '/auth/me' not found or failed. Falling back to local token data.");
      
      // 2. FALLBACK: If API fails (404), just use the data inside the token
      const userData = getUserFromToken(token);
      if (userData) {
        setUser(userData);
      } else {
        // Token is invalid/expired
        localStorage.removeItem("token");
        setUser(null);
      }
    }
  };

  // 1. Check login status on app load
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        // Optimization: Set local data immediately so UI doesn't flicker
        const localUser = getUserFromToken(token);
        if (localUser) {
          setUser(localUser);
          // Then try to fetch fresh data (will fail silently if route missing)
          await fetchUserProfile(token);
        } else {
          localStorage.removeItem("token");
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  // 2. Login Function
  const login = (token, userData) => {
    localStorage.setItem("token", token);
    
    // If backend sent the user object, use it. Otherwise decode token.
    if (userData) {
      setUser(userData);
    } else {
      const decodedUser = getUserFromToken(token);
      setUser(decodedUser);
    }
  };

  // 3. Logout Function
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};