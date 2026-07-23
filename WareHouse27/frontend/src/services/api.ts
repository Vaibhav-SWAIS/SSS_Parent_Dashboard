import axios from "axios";

console.log("API URL:", import.meta.env.VITE_API_BASE_URL);

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export default API;