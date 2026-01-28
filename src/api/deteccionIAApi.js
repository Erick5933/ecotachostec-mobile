// src/api/deteccionIAApi.js
import axios from "./axiosConfig";

// Información de categorías
export const CATEGORY_INFO = {
  organico: {
    label: "ORGÁNICO",
    icon: "🍃",
    color: "#10b981",
    bgColor: "#d1fae5",
    description: "Residuos biodegradables de origen natural",
    descripcion: "Residuos biodegradables de origen natural",
    examples: "Frutas, verduras, cáscaras, restos de comida, hojas",
    ejemplos: "Frutas, verduras, cáscaras, restos de comida, hojas"
  },
  reciclable: {
    label: "RECICLABLE",
    icon: "♻️",
    color: "#3b82f6",
    bgColor: "#dbeafe",
    description: "Materiales que pueden ser procesados nuevamente",
    descripcion: "Materiales que pueden ser procesados nuevamente",
    examples: "Papel, cartón, plástico, vidrio, metal",
    ejemplos: "Papel, cartón, plástico, vidrio, metal"
  },
  inorganico: {
    label: "INORGÁNICO",
    icon: "🗑️",
    color: "#6b7280",
    bgColor: "#f3f4f6",
    description: "Residuos no biodegradables",
    descripcion: "Residuos no biodegradables",
    examples: "Plásticos no reciclables, residuos sanitarios",
    ejemplos: "Plásticos no reciclables, residuos sanitarios"
  }
};

/**
 * Valida formato de imagen
 */
export const isValidImageFormat = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type);
};

/**
 * Detecta residuos usando IA (Roboflow Workflow)
 * Conecta con el backend Django en /api/ia/detect/
 */
export const detectWasteWithAI = async (imageBase64) => {
  try {
    console.log("🚀 Iniciando detección IA...");
    
    // El backend espera base64 CON el prefijo data:image
    let imagenData = imageBase64;
    if (!imageBase64.startsWith('data:image')) {
      // Si no tiene prefijo, agregarlo
      imagenData = `data:image/jpeg;base64,${imageBase64}`;
    }
    
    console.log("📤 Enviando a /ia/detect/");
    console.log("📊 Tamaño de imagen:", imagenData.length, "caracteres");
    
    // Crear FormData con el base64 completo (con prefijo)
    const formData = new FormData();
    formData.append("imagen", imagenData);
    
    // Llamar al endpoint de Django con FormData
    const apiResponse = await axios.post("/ia/detect/", formData, {
      timeout: 60000 // 60 segundos para dar tiempo a Roboflow
    });
    
    console.log("✅ Respuesta recibida:", apiResponse.status);
    console.log("📊 Datos de respuesta:", apiResponse.data);
    
    // Retornar la respuesta del servidor
    return apiResponse.data;

  } catch (error) {
    console.error("❌ Error en detectWasteWithAI:", error);
    console.error("📋 Status:", error.response?.status);
    console.error("📋 Data:", error.response?.data);

    // Manejo de errores de respuesta
    if (error.response?.data) {
      const errorData = error.response.data;
      
      // Caso: No se detectaron objetos
      if (errorData.no_detection) {
        return {
          success: false,
          no_detection: true,
          message: errorData.message || "No se detectaron objetos",
          suggestions: errorData.suggestions || [
            "Asegúrate de que el objeto esté bien iluminado",
            "Intenta acercar más la cámara al objeto",
            "Verifica que el objeto esté en el centro de la imagen"
          ]
        };
      }
      
      // Caso: Error del servidor
      return {
        success: false,
        error: errorData.error || "Error del servidor",
        message: errorData.message
      };
    }

    // Caso: Error de conexión
    return {
      success: false,
      error: error.message || "Error de conexión",
      suggestions: [
        "Verifica tu conexión a internet",
        "Intenta de nuevo en unos momentos"
      ]
    };
  }
};

export default {
  detectWasteWithAI,
  isValidImageFormat,
  CATEGORY_INFO
};
