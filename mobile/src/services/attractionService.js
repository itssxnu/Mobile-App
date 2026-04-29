import axios from "axios";
import { getToken } from "./authService";
import { API_URL as BASE_API_URL } from "../config/apiConfig";

const API_URL = `${BASE_API_URL}/attractions`;

const getAuthHeaders = async (isFormData = false) => {
  const token = await getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": isFormData ? "multipart/form-data" : "application/json",
    },
  };
};

export const createAttraction = async (formData) => {
  try {
    const config = await getAuthHeaders(true);
    const response = await axios.post(API_URL, formData, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAttractions = async (district = "") => {
  try {
    const query = district ? `?district=${district}` : "";
    const response = await axios.get(`${API_URL}${query}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAttractionById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateAttraction = async (id, data) => {
  try {
    const config = await getAuthHeaders();
    const response = await axios.put(`${API_URL}/${id}`, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteAttraction = async (id) => {
  try {
    const config = await getAuthHeaders();
    const response = await axios.delete(`${API_URL}/${id}`, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};
