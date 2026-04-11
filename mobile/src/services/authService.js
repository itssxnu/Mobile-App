import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Direct API URL
const API_URL = "http://192.168.1.6:5000/api/auth";

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
    const response = await axios.post(`${API_URL}/register`, formData);
    
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

// Logout
export const logout = async () => {
  await removeToken();
};