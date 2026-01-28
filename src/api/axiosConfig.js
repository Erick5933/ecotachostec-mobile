// src/api/axiosConfig.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🔧 CONFIGURACIÓN IDÉNTICA A WEB
// Lee del .env la variable EXPO_PUBLIC_API_URL
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.100.26:8000/api";

console.log('🌐 API_URL configurada:', API_URL);

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000,
});

// TOKEN - IDÉNTICO A WEB
axiosInstance.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`📡 [${config.method?.toUpperCase()}] ${config.baseURL}${config.url}`);
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
    (error) => {
        console.error('❌ Error en API:', error.message);
        return Promise.reject(error);
    }
);

export default axiosInstance;