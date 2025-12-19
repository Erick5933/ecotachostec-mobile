// src/pages/Auth/LoginScreen.jsx
import { useState, useContext } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import { login } from "../../api/authApi";
import { authStyles } from "../../styles/authStyles";

export default function LoginScreen({ navigation }) {
    const { loginUser, isLoading, error } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [localError, setLocalError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value,
        });
        setLocalError("");
    };

    const handleLogin = async () => {
        // Validación
        if (!formData.email || !formData.password) {
            setLocalError("Por favor, completa todos los campos");
            return;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setLocalError("Por favor ingresa un email válido");
            return;
        }

        setLocalError("");

        const result = await loginUser(formData.email, formData.password);

        if (result && result.success) {
            // Navegación manejada por el contexto
        }
    };

    const goToRegister = () => {
        navigation.navigate("Register");
    };

    const goToHome = () => {
        navigation.navigate("Home");
    };

    return (
        <SafeAreaView style={authStyles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
            <KeyboardAvoidingView
                style={authStyles.container}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={authStyles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={authStyles.card}>
                        <View style={authStyles.cardHeader}>
                            <View style={authStyles.logoContainer}>
                                <View style={authStyles.logoIcon}>
                                    <Text style={authStyles.logoIconText}>🌿</Text>
                                </View>
                                <Text style={authStyles.logoTitle}>EcoTachosTec</Text>
                            </View>

                            <Text style={authStyles.title}>Iniciar Sesión</Text>
                            <Text style={authStyles.subtitle}>
                                Accede a tu cuenta para gestionar el sistema
                            </Text>
                        </View>

                        {/* Mensajes de error */}
                        {(error || localError) ? (
                            <View style={authStyles.errorAlert}>
                                <Text style={authStyles.errorIcon}>⚠️</Text>
                                <Text style={authStyles.errorText}>{error || localError}</Text>
                            </View>
                        ) : null}

                        {/* Formulario */}
                        <View style={authStyles.form}>
                            {/* Email */}
                            <View style={authStyles.formGroup}>
                                <Text style={authStyles.label}>Correo Electrónico</Text>
                                <TextInput
                                    style={authStyles.input}
                                    placeholder="tu@email.com"
                                    placeholderTextColor="#999"
                                    value={formData.email}
                                    onChangeText={(value) => handleChange("email", value)}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    autoComplete="email"
                                />
                            </View>

                            {/* Password */}
                            <View style={authStyles.formGroup}>
                                <Text style={authStyles.label}>Contraseña</Text>
                                <View style={authStyles.passwordContainer}>
                                    <TextInput
                                        style={[authStyles.input, authStyles.passwordInput]}
                                        placeholder="••••••••"
                                        placeholderTextColor="#999"
                                        value={formData.password}
                                        onChangeText={(value) => handleChange("password", value)}
                                        secureTextEntry={!showPassword}
                                        autoComplete="password"
                                    />
                                    <TouchableOpacity
                                        style={authStyles.passwordToggle}
                                        onPress={() => setShowPassword(!showPassword)}
                                    >
                                        <Text style={authStyles.passwordToggleText}>
                                            {showPassword ? "👁️" : "👁️‍🗨️"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Options */}
                            <View style={authStyles.optionsContainer}>
                                <TouchableOpacity style={authStyles.rememberContainer}>
                                    <View style={authStyles.checkbox} />
                                    <Text style={authStyles.rememberText}>Recordarme</Text>
                                </TouchableOpacity>

                                <TouchableOpacity>
                                    <Text style={authStyles.forgotPassword}>
                                        ¿Olvidaste tu contraseña?
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Login Button */}
                            <TouchableOpacity
                                style={[
                                    authStyles.primaryButton,
                                    isLoading && authStyles.primaryButtonDisabled
                                ]}
                                onPress={handleLogin}
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={authStyles.primaryButtonText}>Iniciar Sesión</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Divider */}
                        <View style={authStyles.dividerContainer}>
                            <View style={authStyles.dividerLine} />
                            <Text style={authStyles.dividerText}>o</Text>
                            <View style={authStyles.dividerLine} />
                        </View>

                        {/* Footer */}
                        <View style={authStyles.footer}>
                            <Text style={authStyles.footerText}>
                                ¿No tienes una cuenta?{" "}
                                <Text
                                    style={authStyles.footerLink}
                                    onPress={goToRegister}
                                >
                                    Regístrate aquí
                                </Text>
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}