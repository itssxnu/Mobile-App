import axios from "axios";
import { getToken, storeUserData } from "./authService";

import { API_URL as BASE_API_URL } from "../config/apiConfig";

const API_URL = `${BASE_API_URL}/users`;

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

export const upgradeAccount = async (providerType) => {
  try {
    const config = await getAuthHeaders();
    const response = await axios.put(`${API_URL}/upgrade`, { providerType }, config);
    if (response.data.success) {
      await storeUserData(response.data.user);
      return response.data.user;
    }
  } catch (error) {
    throw error;
  }
};

// ==========================================
// ADMIN SERVICES
// ==========================================

export const getAllUsers = async () => {
  try {
    const config = await getAuthHeaders();
    const response = await axios.get(`${API_URL}`, config);
    return response.data.users;
  } catch (error) {
    throw error;
  }
};

export const updateUserRole = async (id, role, providerType = undefined) => {
  try {
    const config = await getAuthHeaders();
    const response = await axios.put(`${API_URL}/${id}/role`, { role, providerType }, config);
    return response.data.user;
  } catch (error) {
    throw error;
  }
};

export const deleteUserById = async (id) => {
  try {
    const config = await getAuthHeaders();
    const response = await axios.delete(`${API_URL}/${id}`, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};