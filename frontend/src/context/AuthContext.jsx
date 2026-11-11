import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('bakery_token') || null);
  const [loading, setLoading] = useState(true);

  // Check current session
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken = localStorage.getItem('bakery_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.warn('Session expired or invalid:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Owner Login
  const ownerLogin = async (phoneOrIdentifier, password, email) => {
    let payload = {};
    if (typeof phoneOrIdentifier === 'object') {
      payload = {
        ...phoneOrIdentifier,
        identifier: phoneOrIdentifier.identifier || phoneOrIdentifier.phone || phoneOrIdentifier.email
      };
    } else {
      payload = {
        identifier: phoneOrIdentifier,
        phone: !phoneOrIdentifier?.includes('@') ? phoneOrIdentifier : undefined,
        email: email || (phoneOrIdentifier?.includes('@') ? phoneOrIdentifier : undefined),
        password
      };
    }
    const res = await api.post('/auth/owner/login', payload);
    if (res.data.success) {
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('bakery_token', newToken);
      localStorage.setItem('bakery_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  // Owner Send OTP
  const sendOwnerOTP = async (phone, email) => {
    const res = await api.post('/auth/owner/send-otp', { phone, email });
    return res.data;
  };

  // Owner Verify OTP
  const verifyOwnerOTP = async (phone, email, otp) => {
    const res = await api.post('/auth/owner/verify-otp', { phone, email, otp });
    if (res.data.success) {
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('bakery_token', newToken);
      localStorage.setItem('bakery_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data.message || 'OTP verification failed');
  };

  // Owner Register (Bonus helper for initial setup if needed)
  const ownerRegister = async (formData) => {
    const res = await api.post('/auth/owner/register', formData);
    if (res.data.success) {
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('bakery_token', newToken);
      localStorage.setItem('bakery_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  // Customer Login (Phone or Email + Password)
  const customerLogin = async (phoneOrEmail, password) => {
    let payload = {};
    if (typeof phoneOrEmail === 'object') {
      payload = phoneOrEmail;
    } else {
      payload = {
        identifier: phoneOrEmail,
        password
      };
    }
    const res = await api.post('/auth/customer/login', payload);
    if (res.data.success) {
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('bakery_token', newToken);
      localStorage.setItem('bakery_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  // Customer Register (Name, Phone, Email, Password) -> auto logs in
  const customerRegister = async ({ name, phone, email, password }) => {
    const res = await api.post('/auth/customer/register', { name, phone, email, password });
    if (res.data.success) {
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('bakery_token', newToken);
      localStorage.setItem('bakery_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  // Customer Send OTP
  const sendCustomerOTP = async (phone) => {
    const res = await api.post('/auth/customer/send-otp', { phone });
    return res.data;
  };

  // Customer Verify OTP
  const verifyCustomerOTP = async (phone, otp, name) => {
    const res = await api.post('/auth/customer/verify-otp', { phone, otp, name });
    if (res.data.success) {
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('bakery_token', newToken);
      localStorage.setItem('bakery_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data.message || 'Verification failed');
  };

  // Update Profile
  const updateProfile = async (profileData) => {
    const res = await api.put('/auth/customer/profile', profileData);
    if (res.data.success) {
      setUser(res.data.user);
      return res.data.user;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('bakery_token');
    localStorage.removeItem('bakery_user');
    setToken(null);
    setUser(null);
  };

  const isOwner = user?.role === 'owner' || user?.role === 'admin';
  const isCustomer = user?.role === 'customer';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isOwner,
        isCustomer,
        ownerLogin,
        ownerRegister,
        sendOwnerOTP,
        verifyOwnerOTP,
        customerLogin,
        customerRegister,
        sendCustomerOTP,
        verifyCustomerOTP,
        updateProfile,
        logout,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
