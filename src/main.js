// src/main.js (ya está correcto)
import React from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./context/AuthContext";
import AppNavigator from "./navigation/AppNavigator";

// Componente principal que envuelve todo
export default function App() {
    return (
        <AuthProvider>
            <NavigationContainer>
                <AppNavigator />
            </NavigationContainer>
        </AuthProvider>
    );
}