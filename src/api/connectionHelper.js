// src/api/connectionHelper.js
/**
 * Helper para verificar y diagnosticar problemas de conexión
 */

import axios from "axios";

// Configuraciones de API disponibles
export const API_CONFIGS = {
    localhost: "http://127.0.0.1:8000/api",
    localNetwork: "http://192.168.100.26:8000/api", // Cambia según tu IP
    ngrok: "", // Si usas ngrok para exponer
    production: "", // API producción
};

/**
 * Verifica si el servidor está disponible
 */
export const checkServerHealth = async (baseURL) => {
    try {
        const response = await axios.get(baseURL + "/ping", {
            timeout: 5000,
        });
        return { online: true, message: "Servidor disponible" };
    } catch (error) {
        return {
            online: false,
            error: error.message,
            message: "Servidor no disponible",
        };
    }
};

/**
 * Obtiene la configuración de API más accesible
 */
export const getAvailableAPI = async () => {
    console.log("🔍 Verificando APIs disponibles...");

    for (const [name, url] of Object.entries(API_CONFIGS)) {
        if (!url) continue; // Skip empty configs

        console.log(`Probando ${name}: ${url}`);
        const health = await checkServerHealth(url);

        if (health.online) {
            console.log(`✅ API disponible: ${name} (${url})`);
            return url;
        } else {
            console.log(`❌ ${name} no disponible: ${health.error}`);
        }
    }

    console.warn("⚠️ No se encontró API disponible. Usando localhost por defecto");
    return API_CONFIGS.localhost;
};

/**
 * Mejora los mensajes de error de red
 */
export const getNetworkErrorMessage = (error) => {
    if (!error) return "Error desconocido";

    if (error.code === "ECONNABORTED") {
        return "Conexión tardó demasiado - servidor no responde";
    }
    if (error.code === "ENOTFOUND") {
        return "Servidor no encontrado - verifica la dirección IP";
    }
    if (error.code === "ECONNREFUSED") {
        return "Conexión rechazada - servidor offline";
    }
    if (error.response?.status === 404) {
        return "Recurso no encontrado (404)";
    }
    if (error.response?.status === 500) {
        return "Error en el servidor (500)";
    }
    if (error.message === "Network Error") {
        return "Error de red - verifica tu conexión";
    }

    return error.message || "Error de conexión";
};

/**
 * Obtiene detalles del error para logging
 */
export const getErrorDetails = (error) => {
    return {
        message: error?.message,
        code: error?.code,
        status: error?.response?.status,
        url: error?.config?.url,
        baseURL: error?.config?.baseURL,
        timestamp: new Date().toISOString(),
    };
};

export default {
    checkServerHealth,
    getAvailableAPI,
    getNetworkErrorMessage,
    getErrorDetails,
    API_CONFIGS,
};
