import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  withCredentials: true,
});

const extractApiData = (response) => response?.data?.data ?? response?.data;

export { api, extractApiData };
