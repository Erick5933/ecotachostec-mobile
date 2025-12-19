// src/api/axiosConfig.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";



const API_URL = "http://192.168.1.84:8000/api";

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
    timeout: 15000,
});

axiosInstance.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (token && token !== "null" && token !== "undefined") {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error("Error getting token:", error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response) {
            console.log("API Error Response:", {
                status: error.response.status,
                data: error.response.data,
                url: error.config.url,
            });
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;