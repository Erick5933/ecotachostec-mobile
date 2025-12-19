// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authApi from "../api/authApi";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const user = await AsyncStorage.getItem('userInfo');

            // Verificar que el token no sea null/undefined/string vacío
            if (token && token !== "null" && token !== "undefined" && token.trim() !== "") {
                setUserToken(token);
                if (user && user !== "null" && user !== "undefined") {
                    try {
                        const parsedUser = JSON.parse(user);
                        setUserInfo(parsedUser);
                    } catch (e) {
                        console.log("Error parsing userInfo:", e);
                        await AsyncStorage.removeItem('userInfo');
                    }
                }
            }
        } catch (error) {
            console.error("Error checking login status:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const loginUser = async (email, password) => {
        setIsLoading(true);
        setError(null);
        try {
            console.log("Attempting login with:", { email });

            // Usa authApi.js
            const response = await authApi.login({
                email: email,
                password: password,
            });

            console.log("Login response:", response.data);

            // 🔥 VERIFICA la estructura de la respuesta de tu Django
            // Depende de cómo devuelve los datos tu backend
            let token = null;
            let userData = null;

            // Opción 1: Si usa JWT simple (access/refresh)
            if (response.data.access) {
                token = response.data.access;
                userData = response.data.user || { email: email };
            }
            // Opción 2: Si devuelve token directamente
            else if (response.data.token) {
                token = response.data.token;
                userData = response.data.user || response.data;
            }
            // Opción 3: Si devuelve datos personalizados
            else {
                token = response.data.jwt || response.data.access_token;
                userData = response.data;
            }

            // 🔥 VALIDA que el token no sea undefined/null
            if (!token) {
                console.error("No token received in response:", response.data);
                setError("Error: El servidor no devolvió un token válido");
                return { success: false, error: "No token received" };
            }

            // 🔥 GUARDAR con validación
            try {
                await AsyncStorage.setItem('token', token);
                if (userData) {
                    await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
                    setUserInfo(userData);
                }
                setUserToken(token);
                console.log("Token saved successfully:", token.substring(0, 20) + "...");
            } catch (storageError) {
                console.error("Error saving to AsyncStorage:", storageError);
                setError("Error al guardar la sesión");
                return { success: false, error: storageError.message };
            }

            return { success: true, user: userData };

        } catch (error) {
            console.error("Login error:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: error.config,
            });

            let errorMessage = "Credenciales incorrectas";

            if (error.response?.data) {
                if (error.response.data.detail) {
                    errorMessage = error.response.data.detail;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.non_field_errors) {
                    errorMessage = error.response.data.non_field_errors[0];
                }
            } else if (error.message.includes("Network Error")) {
                errorMessage = "Error de conexión. Verifica el backend.";
            }

            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const registerUser = async (userData) => {
        setIsLoading(true);
        setError(null);
        try {
            console.log("Registering user:", userData);
            const response = await authApi.register(userData);
            console.log("Register response:", response.data);

            return { success: true, data: response.data };

        } catch (error) {
            console.error("Register error:", error.response?.data || error.message);

            let errorMessage = "Error en el registro";
            if (error.response?.data) {
                if (error.response.data.email) {
                    errorMessage = `Email: ${error.response.data.email[0]}`;
                } else if (error.response.data.username) {
                    errorMessage = `Usuario: ${error.response.data.username[0]}`;
                } else if (error.response.data.detail) {
                    errorMessage = error.response.data.detail;
                }
            }

            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            // Limpiar primero el estado
            setUserToken(null);
            setUserInfo(null);
            setError(null);

            // Luego limpiar AsyncStorage
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('refreshToken');
            await AsyncStorage.removeItem('userInfo');

            console.log("Logout successful");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                loginUser,
                registerUser,
                logout,
                userToken,
                userInfo,
                isLoading,
                error,
                setError, // Añade esto para limpiar errores
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};