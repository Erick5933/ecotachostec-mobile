// src/pages/Auth/RegisterScreen.jsx
import { useState, useEffect, useContext } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import { register } from "../../api/authApi";
import {
    getProvincias,
    getCiudades,
    getCantones,
} from "../../api/ubicacionApi";
import { authStyles } from "../../styles/authStyles";
import { UbicacionModal } from "../../components/UbicacionModal";
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen({ navigation }) {
    const { loginUser, isLoading, error } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        nombre: "",
        email: "",
        telefono: "",
        provincia: "",
        provinciaNombre: "",
        ciudad: "",
        ciudadNombre: "",
        canton: "", // Aquí guardamos solo el ID
        cantonNombre: "",
        password: "",
        confirmPassword: "",
    });

    const [provincias, setProvincias] = useState([]);
    const [ciudades, setCiudades] = useState([]);
    const [cantones, setCantones] = useState([]);
    const [loadingUbicacion, setLoadingUbicacion] = useState(false);
    const [localError, setLocalError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [ubicacionCache, setUbicacionCache] = useState({
        provincias: [],
        ciudades: {},
        cantones: {}
    });

    // Estados para modales
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('provincia'); // 'provincia', 'ciudad', 'canton'
    const [modalItems, setModalItems] = useState([]);
    const [modalTitle, setModalTitle] = useState('');

    // Cargar todas las provincias al inicio
    useEffect(() => {
        loadAllUbicacionData();
    }, []);

    const loadAllUbicacionData = async () => {
        try {
            setLoadingUbicacion(true);

            // Cargar provincias
            const resProvincias = await getProvincias();
            const provinciasData = resProvincias.data || [];
            setProvincias(provinciasData);

            // Inicializar caché
            const newCache = {
                provincias: provinciasData,
                ciudades: {},
                cantones: {}
            };

            // Pre-cargar todas las ciudades
            const resCiudades = await getCiudades();
            const ciudadesData = resCiudades.data || [];

            // Organizar ciudades por provincia
            provinciasData.forEach(provincia => {
                const ciudadesProvincia = ciudadesData.filter(
                    ciudad => ciudad.provincia === provincia.id
                );
                newCache.ciudades[provincia.id] = ciudadesProvincia;
            });

            // Pre-cargar todos los cantones
            const resCantones = await getCantones();
            const cantonesData = resCantones.data || [];

            // Organizar cantones por ciudad
            ciudadesData.forEach(ciudad => {
                const cantonesCiudad = cantonesData.filter(
                    canton => canton.ciudad === ciudad.id
                );
                newCache.cantones[ciudad.id] = cantonesCiudad;
            });

            setUbicacionCache(newCache);

        } catch (err) {
            console.error("Error cargando datos de ubicación", err);
        } finally {
            setLoadingUbicacion(false);
        }
    };

    const handleProvinciaChange = (provinciaId) => {
        if (!provinciaId) {
            // Si se selecciona "Selecciona provincia"
            setFormData(prev => ({
                ...prev,
                provincia: "",
                provinciaNombre: "",
                ciudad: "",
                ciudadNombre: "",
                canton: "",
                cantonNombre: "",
            }));
            setCiudades([]);
            setCantones([]);
            return;
        }

        const provinciaSeleccionada = provincias.find(p => p.id.toString() === provinciaId);
        const ciudadesProvincia = ubicacionCache.ciudades[provinciaId] || [];

        setFormData(prev => ({
            ...prev,
            provincia: provinciaId,
            provinciaNombre: provinciaSeleccionada?.nombre || "",
            ciudad: "",
            ciudadNombre: "",
            canton: "",
            cantonNombre: "",
        }));

        setCiudades(ciudadesProvincia);
        setCantones([]);
    };

    const handleCiudadChange = (ciudadId) => {
        if (!ciudadId) {
            // Si se selecciona "Selecciona ciudad"
            setFormData(prev => ({
                ...prev,
                ciudad: "",
                ciudadNombre: "",
                canton: "",
                cantonNombre: "",
            }));
            setCantones([]);
            return;
        }

        const ciudadSeleccionada = ciudades.find(c => c.id.toString() === ciudadId);
        const cantonesCiudad = ubicacionCache.cantones[ciudadId] || [];

        setFormData(prev => ({
            ...prev,
            ciudad: ciudadId,
            ciudadNombre: ciudadSeleccionada?.nombre || "",
            canton: "",
            cantonNombre: "",
        }));

        setCantones(cantonesCiudad);
    };

    const handleCantonChange = (cantonId) => {
        if (!cantonId) {
            setFormData(prev => ({
                ...prev,
                canton: "",
                cantonNombre: "",
            }));
            return;
        }

        const cantonSeleccionado = cantones.find(c => c.id.toString() === cantonId);

        setFormData(prev => ({
            ...prev,
            canton: cantonId, // Solo guardamos el ID
            cantonNombre: cantonSeleccionado?.nombre || "",
        }));
    };

    // Funciones para abrir modales
    const openProvinciaModal = () => {
        setModalType('provincia');
        setModalItems(provincias);
        setModalTitle('Selecciona Provincia');
        setModalVisible(true);
    };

    const openCiudadModal = () => {
        setModalType('ciudad');
        setModalItems(ciudades);
        setModalTitle('Selecciona Ciudad');
        setModalVisible(true);
    };

    const openCantonModal = () => {
        setModalType('canton');
        setModalItems(cantones);
        setModalTitle('Selecciona Cantón');
        setModalVisible(true);
    };

    // Función para manejar selección del modal
    const handleModalSelect = (selectedId) => {
        switch (modalType) {
            case 'provincia':
                handleProvinciaChange(selectedId);
                break;
            case 'ciudad':
                handleCiudadChange(selectedId);
                break;
            case 'canton':
                handleCantonChange(selectedId);
                break;
        }
    };

    const handleChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value,
        });
        setLocalError("");
    };

    const validateForm = () => {
        // Nombre: requerido y solo letras/espacios
        const nameRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;
        if (!formData.nombre || !formData.nombre.trim()) {
            setLocalError("El nombre es requerido");
            return false;
        } else if (!nameRegex.test(formData.nombre.trim())) {
            setLocalError("El nombre solo puede contener letras y espacios");
            return false;
        }

        // Teléfono: exactamente 10 dígitos
        const phoneDigits = (formData.telefono || '').replace(/\D/g, '');
        if (!phoneDigits) {
            setLocalError("El teléfono es requerido");
            return false;
        } else if (phoneDigits.length !== 10) {
            setLocalError("El teléfono debe contener exactamente 10 dígitos");
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setLocalError("Las contraseñas no coinciden");
            return false;
        }

        if (formData.password.length < 6) {
            setLocalError("La contraseña debe tener al menos 6 caracteres");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setLocalError("Por favor ingresa un email válido");
            return false;
        }

        if (!formData.canton) {
            setLocalError("Selecciona tu provincia, ciudad y cantón");
            return false;
        }

        return true;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        try {
            // Preparar datos para enviar - ENVIAMOS SOLO LOS IDs
            const dataToSend = {
                nombre: formData.nombre,
                email: formData.email,
                telefono: (formData.telefono || '').replace(/\D/g, ''),
                provincia: formData.provincia, // Enviamos ID de provincia
                ciudad: formData.ciudad,       // Enviamos ID de ciudad
                canton: formData.canton,       // Enviamos ID de cantón (solo esto)
                password: formData.password,
                rol: "user"
            };

            console.log("Datos a enviar al backend:", dataToSend);

            const response = await register(dataToSend);

            if (response && response.token && response.user) {
                loginUser(response.user, response.token);
                navigation.replace("MainApp");
            }
        } catch (err) {
            console.error("Error en registro:", err);
            setLocalError(
                err.response?.data?.message ||
                err.response?.data?.email?.[0] ||
                "Error al crear la cuenta. Intenta nuevamente."
            );
        }
    };

    const goToLogin = () => {
        navigation.navigate("Login");
    };

    const goToHome = () => {
        navigation.navigate("Home");
    };

    // Componente Picker mejorado que funciona para ambos sistemas
    const UbicacionPicker = ({
                                 value,
                                 onPress,
                                 items,
                                 placeholder,
                                 disabled,
                                 loading,
                                 selectedText
                             }) => {
        if (loading) {
            return (
                <View style={[authStyles.pickerContainer, authStyles.pickerDisabled]}>
                    <Text style={authStyles.pickerPlaceholder}>Cargando...</Text>
                </View>
            );
        }

        if (Platform.OS === 'ios') {
            // Para iOS usamos botón que abre modal
            return (
                <TouchableOpacity
                    style={[styles.pickerButton, disabled && styles.pickerButtonDisabled]}
                    onPress={onPress}
                    disabled={disabled}
                    activeOpacity={0.7}
                >
                    <Text style={[
                        styles.pickerButtonText,
                        value ? styles.pickerButtonSelected : styles.pickerButtonPlaceholder
                    ]}>
                        {value ? selectedText : placeholder}
                    </Text>
                    <Ionicons
                        name="chevron-down"
                        size={20}
                        color={value ? "#2d6a4f" : "#999"}
                    />
                </TouchableOpacity>
            );
        } else {
            // Para Android usamos Picker nativo
            return (
                <View style={[styles.androidPickerContainer, disabled && styles.pickerButtonDisabled]}>
                    <Picker
                        selectedValue={value}
                        onValueChange={(itemValue) => {
                            if (itemValue === "") {
                                // Cuando se selecciona el placeholder
                                if (placeholder.includes("provincia")) {
                                    handleProvinciaChange("");
                                } else if (placeholder.includes("ciudad")) {
                                    handleCiudadChange("");
                                } else if (placeholder.includes("cantón")) {
                                    handleCantonChange("");
                                }
                            } else {
                                if (placeholder.includes("provincia")) {
                                    handleProvinciaChange(itemValue);
                                } else if (placeholder.includes("ciudad")) {
                                    handleCiudadChange(itemValue);
                                } else if (placeholder.includes("cantón")) {
                                    handleCantonChange(itemValue);
                                }
                            }
                        }}
                        enabled={!disabled}
                        style={styles.androidPicker}
                        dropdownIconColor="#2d6a4f"
                    >
                        <Picker.Item label={placeholder} value="" />
                        {items.map((item) => (
                            <Picker.Item
                                key={item.id}
                                label={item.nombre}
                                value={item.id.toString()}
                            />
                        ))}
                    </Picker>
                </View>
            );
        }
    };

    // Obtener texto seleccionado para mostrar
    const getSelectedText = (type) => {
        switch (type) {
            case 'provincia':
                return formData.provinciaNombre || '';
            case 'ciudad':
                return formData.ciudadNombre || '';
            case 'canton':
                return formData.cantonNombre || '';
            default:
                return '';
        }
    };

    return (
        <SafeAreaView style={authStyles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
            <KeyboardAvoidingView
                style={authStyles.container}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={authStyles.scrollContentExtended}
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

                            <Text style={authStyles.title}>Crear Cuenta</Text>
                            <Text style={authStyles.subtitle}>
                                Únete a la revolución de gestión inteligente de residuos
                            </Text>
                        </View>

                        {/* Mensajes de error */}
                        {(error || localError) ? (
                            <View style={authStyles.errorAlert}>
                                <Text style={authStyles.errorIcon}>⚠️</Text>
                                <Text style={authStyles.errorText}>{error || localError}</Text>
                            </View>
                        ) : null}

                        <View style={authStyles.form}>
                            {/* Nombre */}
                            <View style={authStyles.formGroup}>
                                <Text style={authStyles.label}>Nombre Completo</Text>
                                <TextInput
                                    style={authStyles.input}
                                    placeholder="Tu nombre completo"
                                    placeholderTextColor="#999"
                                    value={formData.nombre}
                                    onChangeText={(value) => handleChange("nombre", value)}
                                />
                            </View>

                            {/* Teléfono */}
                            <View style={authStyles.formGroup}>
                                <Text style={authStyles.label}>Teléfono</Text>
                                <TextInput
                                    style={authStyles.input}
                                    placeholder="Tu número de teléfono"
                                    placeholderTextColor="#999"
                                    value={formData.telefono}
                                    onChangeText={(value) => handleChange("telefono", value)}
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                />
                            </View>

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

                            {/* Ubicación */}
                            <View style={authStyles.formGroup}>
                                <Text style={authStyles.label}>Ubicación</Text>

                                <View style={authStyles.ubicacionGroup}>
                                    <Text style={authStyles.ubicacionLabel}>Provincia</Text>
                                    <UbicacionPicker
                                        value={formData.provincia}
                                        onPress={openProvinciaModal}
                                        items={provincias}
                                        placeholder="Selecciona provincia"
                                        disabled={loadingUbicacion}
                                        loading={loadingUbicacion && provincias.length === 0}
                                        selectedText={getSelectedText('provincia')}
                                    />
                                </View>

                                {formData.provincia && (
                                    <View style={authStyles.ubicacionGroup}>
                                        <Text style={authStyles.ubicacionLabel}>Ciudad</Text>
                                        <UbicacionPicker
                                            value={formData.ciudad}
                                            onPress={openCiudadModal}
                                            items={ciudades}
                                            placeholder="Selecciona ciudad"
                                            disabled={loadingUbicacion || !formData.provincia}
                                            loading={loadingUbicacion}
                                            selectedText={getSelectedText('ciudad')}
                                        />
                                    </View>
                                )}

                                {formData.ciudad && (
                                    <View style={authStyles.ubicacionGroup}>
                                        <Text style={authStyles.ubicacionLabel}>Cantón</Text>
                                        <UbicacionPicker
                                            value={formData.canton}
                                            onPress={openCantonModal}
                                            items={cantones}
                                            placeholder="Selecciona cantón"
                                            disabled={loadingUbicacion || !formData.ciudad}
                                            loading={loadingUbicacion}
                                            selectedText={getSelectedText('canton')}
                                        />
                                    </View>
                                )}

                                {loadingUbicacion && (
                                    <ActivityIndicator
                                        size="small"
                                        color="#2d6a4f"
                                        style={authStyles.loadingUbicacion}
                                    />
                                )}

                                {/* Mostrar selección actual */}
                                {(formData.provinciaNombre || formData.ciudadNombre || formData.cantonNombre) && (
                                    <View style={styles.ubicacionSeleccionada}>
                                        <Ionicons name="location" size={16} color="#2d6a4f" style={styles.locationIcon} />
                                        <Text style={styles.ubicacionSeleccionadaText}>
                                            {formData.provinciaNombre}
                                            {formData.ciudadNombre && `, ${formData.ciudadNombre}`}
                                            {formData.cantonNombre && `, ${formData.cantonNombre}`}
                                        </Text>
                                        <Text style={styles.idText}>
                                            (ID Cantón: {formData.canton || "No seleccionado"})
                                        </Text>
                                    </View>
                                )}
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

                            {/* Confirm Password */}
                            <View style={authStyles.formGroup}>
                                <Text style={authStyles.label}>Confirmar Contraseña</Text>
                                <View style={authStyles.passwordContainer}>
                                    <TextInput
                                        style={[authStyles.input, authStyles.passwordInput]}
                                        placeholder="••••••••"
                                        placeholderTextColor="#999"
                                        value={formData.confirmPassword}
                                        onChangeText={(value) => handleChange("confirmPassword", value)}
                                        secureTextEntry={!showConfirmPassword}
                                        autoComplete="password"
                                    />
                                    <TouchableOpacity
                                        style={authStyles.passwordToggle}
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        <Text style={authStyles.passwordToggleText}>
                                            {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Register Button */}
                            <TouchableOpacity
                                style={[
                                    authStyles.primaryButton,
                                    isLoading && authStyles.primaryButtonDisabled
                                ]}
                                onPress={handleRegister}
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={authStyles.primaryButtonText}>Crear Cuenta</Text>
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
                                ¿Ya tienes una cuenta?{" "}
                                <Text
                                    style={authStyles.footerLink}
                                    onPress={goToLogin}
                                >
                                    Inicia sesión aquí
                                </Text>
                            </Text>
                        </View>
                    </View>

                    {/* Benefits Section */}
                    <View style={authStyles.benefitsCard}>
                        <Text style={authStyles.benefitsTitle}>Beneficios de Registrarte</Text>
                        <View style={authStyles.benefitsList}>
                            <View style={authStyles.benefitItem}>
                                <Text style={authStyles.benefitIcon}>✓</Text>
                                <Text style={authStyles.benefitText}>Gestión inteligente de residuos</Text>
                            </View>
                            <View style={authStyles.benefitItem}>
                                <Text style={authStyles.benefitIcon}>✓</Text>
                                <Text style={authStyles.benefitText}>Seguimiento en tiempo real</Text>
                            </View>
                            <View style={authStyles.benefitItem}>
                                <Text style={authStyles.benefitIcon}>✓</Text>
                                <Text style={authStyles.benefitText}>Reportes y estadísticas</Text>
                            </View>
                            <View style={authStyles.benefitItem}>
                                <Text style={authStyles.benefitIcon}>✓</Text>
                                <Text style={authStyles.benefitText}>Soporte técnico 24/7</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Modal para selección de ubicación */}
            <UbicacionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                items={modalItems}
                onSelect={handleModalSelect}
                title={modalTitle}
                selectedValue={
                    modalType === 'provincia' ? formData.provincia :
                        modalType === 'ciudad' ? formData.ciudad :
                            formData.canton
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // Estilos para iOS
    pickerButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        backgroundColor: '#fafafa',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    pickerButtonDisabled: {
        backgroundColor: '#f0f0f0',
        opacity: 0.7,
    },
    pickerButtonText: {
        fontSize: 16,
        flex: 1,
    },
    pickerButtonPlaceholder: {
        color: '#999',
    },
    pickerButtonSelected: {
        color: '#333',
    },

    // Estilos para Android
    androidPickerContainer: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        backgroundColor: '#fafafa',
        borderRadius: 12,
        overflow: 'hidden',
    },
    androidPicker: {
        height: 50,
    },

    // Ubicación seleccionada
    ubicacionSeleccionada: {
        marginTop: 8,
        padding: 12,
        backgroundColor: '#f0f9f0',
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#2d6a4f',
    },
    ubicacionSeleccionadaText: {
        color: '#1e3a2a',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    idText: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
    },
    locationIcon: {
        marginRight: 4,
    },
});