// src/api/authApi.js
import axios from "./axiosConfig";

export const login = (credentials) =>
    axios.post("/usuarios/auth/login/", credentials);

export const register = (data) =>
    axios.post("/usuarios/auth/register/", data);

export const getProfile = () =>
    axios.get("/usuarios/auth/profile/");

export const updateProfile = (data) =>
    axios.put("/usuarios/auth/profile/", data);

export const logout = () =>
    axios.post("/usuarios/auth/logout/");


// Agrega esta función al archivo authApi.js
export const getUsuarios = () =>
    axios.get("/usuarios/");

// --- Google Login ---
export const googleLogin = (data) => {
    console.log("📤 Enviando token de Firebase al backend...");
    return axios.post("/usuarios/auth/google/", data);
};

// Solicitar correo de recuperación
export const requestPasswordReset = (email) =>
    axios.post("/usuarios/auth/request-reset-email/", { email });

// Confirmar reset con token
export const resetPasswordConfirm = (data) =>
    axios.patch("/usuarios/auth/password-reset-complete/", data);

// --- GESTIÓN DE USUARIOS ---


// Obtener un usuario por ID
export const getUsuarioById = (id) =>
    axios.get(`/usuarios/${id}/`);

// Crear un nuevo usuario
export const createUsuario = (userData) =>
    axios.post("/usuarios/", userData);

// Actualizar un usuario existente
export const updateUsuario = (id, userData) =>
    axios.patch(`/usuarios/${id}/`, userData);

// Eliminar (desactivar) un usuario
export const deleteUsuario = (id) =>
    axios.delete(`/usuarios/${id}/`);
