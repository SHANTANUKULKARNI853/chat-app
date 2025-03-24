// frontend/src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://chat-app-h1gr.onrender.com/api", // Backend URL
});

export default api;
