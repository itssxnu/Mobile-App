import API from "./api";

/**
 * Register a new user.
 * @param {Object} data - { name, email, password }
 * @returns {Promise} - { token, user }
 */
export const registerUser = async (data) => {
  const response = await API.post("/auth/register", data);
  return response.data;
};

// NOTE: loginUser → to be added by the Login team member
