import axios from "axios";
import { getToken } from "./authService";

const API_URL = "http://192.168.1.6:5000/api/users";

// Get auth header with token
const getAuthHeader = async () => {
  const token = await getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Get user profile
export const getUserProfile = async () => {
  const config = await getAuthHeader();
  const response = await axios.get(`${API_URL}/me`, config);
  return response.data.user;
};

// Update user profile (text only)
export const updateUserProfile = async (data) => {
  const config = await getAuthHeader();
  const response = await axios.put(`${API_URL}/me`, data, config);
  return response.data.user;
};

// Upload profile photo
export const uploadProfilePhoto = async (uri) => {
  const config = await getAuthHeader();
  
  const formData = new FormData();
  const filename = uri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';
  
  formData.append('profilePhoto', {
    uri: uri,
    name: filename,
    type: type,
  });
  
  const response = await axios.put(`${API_URL}/me`, formData, {
    headers: {
      ...config.headers,
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.user;
};

// Delete profile photo
export const deleteProfilePhoto = async () => {
  const config = await getAuthHeader();
  await axios.delete(`${API_URL}/me/photo`, config);
};