import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { startKeepAlive, stopKeepAlive } from '../services/keepAlive';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (doctor) {
      startKeepAlive();
    } else {
      stopKeepAlive();
    }
    return () => stopKeepAlive();
  }, [doctor]);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('cms_token');
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          setDoctor(res.data.data);
        } catch (error) {
          localStorage.removeItem('cms_token');
          setDoctor(null);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const login = (data) => {
    localStorage.setItem('cms_token', data.token);
    localStorage.setItem('cms_doctor', JSON.stringify(data));
    setDoctor(data);
  };

  const updateUser = (data) => {
    const updatedDoctor = { ...doctor, ...data };
    localStorage.setItem('cms_doctor', JSON.stringify(updatedDoctor));
    setDoctor(updatedDoctor);
  };

  const logout = () => {
    localStorage.removeItem('cms_token');
    localStorage.removeItem('cms_doctor');
    setDoctor(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        doctor, 
        loading, 
        login, 
        logout,
        updateUser
      }}
    >  {children}
    </AuthContext.Provider>
  );
};
