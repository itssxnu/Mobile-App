import axios from "axios";
import { getToken, storeUserData } from "./authService";

const API_URL = process.env.EXPO_PUBLIC_API_URL 
  ? `${process.env.EXPO_PUBLIC_API_URL}/users`
  : "http://172.20.10.6:5000/api/users";

const getAuthHeaders = async (isFormData = false) => {
  const token = await getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": isFormData ? "multipart/form-data" : "application/json",
    },
  };
};

export const updateProfile = async (formData) => {
  try {
    const config = await getAuthHeaders(true);
    const response = await axios.put(`${API_URL}/me`, formData, config);
    if (response.data.success) {
      await storeUserData(response.data.user);
      return response.data.user;
    }
  } catch (error) {
    throw error;
  }
};

export const deleteAccount = async () => {
  try {
    const config = await getAuthHeaders();
    const response = await axios.delete(`${API_URL}/me`, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};