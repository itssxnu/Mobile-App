import axios from "axios";

import { API_URL } from "../config/apiConfig";

const API = axios.create({
  baseURL: API_URL,
});

export default API;