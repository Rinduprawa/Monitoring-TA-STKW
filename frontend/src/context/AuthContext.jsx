import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Configure axios default headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier, password) => {
    const response = await axios.post('http://localhost:8000/api/login', {
      identifier,
      password,
    });

    const { access_token, user: userData } = response.data;
    
    // Save token to localStorage
    localStorage.setItem('token', access_token);
    
    // Set axios default header
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    
    // Update state
    setToken(access_token);
    setUser(userData);
    
    return userData;
  };

  const logout = async () => {
    try {
      if (token) {
        await axios.post('http://localhost:8000/api/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear token
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      
      // Clear state
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
