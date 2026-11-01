import axios from "axios";
import { readAuthSession } from "../context/authStorage";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
    headers: {
        Accept: "application/json"
    }
});

api.interceptors.request.use(config => {
    const token = readAuthSession()?.token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
