import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const response = await api.get('/users/profile');
        if (response.data) {
          setUser(response.data);
        }
      } catch (error) {
        // This error is expected if the user is not logged in, so we don't need to show a toast.
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      setUser(response.data);
      toast.success('Logged in successfully!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
      throw error;
    }
  };
  
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      setUser(response.data);
      toast.success('Registration successful!');
      return response.data;
    } catch (error) {
       toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      toast.success('Logged out successfully!');
    } catch (error) {
      toast.error('Logout failed. Please try again.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
