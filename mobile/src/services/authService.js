import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_URL as BASE_API_URL } from "../config/apiConfig";

// Direct API URL
const API_URL = `${BASE_API_URL}/auth`;

// Token management using AsyncStorage
export const storeToken = async (token) => {
  await AsyncStorage.setItem('userToken', token);
};

export const getToken = async () => {
  return await AsyncStorage.getItem('userToken');
};

export const removeToken = async () => {
  await AsyncStorage.removeItem('userToken');
  await AsyncStorage.removeItem('userData');
};

export const storeUserData = async (user) => {
  await AsyncStorage.setItem('userData', JSON.stringify(user));
};

export const getUserData = async () => {
  const data = await AsyncStorage.getItem('userData');
  return data ? JSON.parse(data) : null;
};

export const isAuthenticated = async () => {
  const token = await getToken();
  return token !== null;
};

// Register user
export const registerUser = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data.token) {
      await storeToken(response.data.token);
      await storeUserData(response.data.user);
    }
    
    console.log("✅ Registration success:", response.data);
    return response.data;
  } catch (error) {
    console.log("❌ Registration error:", error.response?.data);
    throw error;
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password,
    });
    
    if (response.data.token) {
      await storeToken(response.data.token);
      await storeUserData(response.data.user);
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Verify Email OTP
export const verifyEmail = async (email, otp) => {
  try {
    const response = await axios.post(`${API_URL}/verify-email`, { email, otp });
    
    if (response.data.token) {
      await storeToken(response.data.token);
      await storeUserData(response.data.user);
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Resend Verification OTP
export const resendVerification = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/resend-verification`, { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Logout
export const logout = async () => {
  await removeToken();
};