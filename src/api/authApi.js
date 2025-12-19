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
    axios.post("/usuarios/auth/logout/");  // Corregido también


// Agrega esta función al archivo authApi.js
export const getUsuarios = () =>
    axios.get("/usuarios/");