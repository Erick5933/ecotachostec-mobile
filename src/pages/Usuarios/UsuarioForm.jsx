import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import MobileLayout from '../../components/Layout/MobileLayout';
import { usuarioFormStyles as styles } from '../../styles/usuarioStyles';
import api from '../../api/axiosConfig';
import { getProvincias, getCiudades, getCantones } from '../../api/ubicacionApi';

export default function UsuarioForm({ route, navigation }) {
    const { usuarioId } = route.params || {};
    const isEdit = !!usuarioId;

    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        provincia: '',
        ciudad: '',
        canton: '',
        rol: 'user',
        password: '',
        confirmPassword: '',
    });

    const [provincias, setProvincias] = useState([]);
    const [ciudades, setCiudades] = useState([]);
    const [cantones, setCantones] = useState([]);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        loadProvincias();
        if (isEdit) {
            loadUsuario();
        }
    }, []);

    const loadProvincias = async () => {
        try {
            const response = await getProvincias();
            setProvincias(response.data || []);
        } catch (error) {
            console.error('Error cargando provincias:', error);
            setProvincias([]);
            Alert.alert('Error', 'No se pudieron cargar las provincias');
        }
    };

    const loadCiudades = async (provinciaId) => {
        try {
            const response = await getCiudades();
            const allCiudades = response.data || [];
            const filteredCiudades = allCiudades.filter(
                (ciudad) => ciudad.provincia === parseInt(provinciaId)
            );
            setCiudades(filteredCiudades);
        } catch (error) {
            console.error('Error cargando ciudades:', error);
            setCiudades([]);
            Alert.alert('Error', 'No se pudieron cargar las ciudades');
        }
    };

    const loadCantones = async (ciudadId) => {
        try {
            const response = await getCantones();
            const allCantones = response.data || [];
            const filteredCantones = allCantones.filter(
                (canton) => canton.ciudad === parseInt(ciudadId)
            );
            setCantones(filteredCantones);
        } catch (error) {
            console.error('Error cargando cantones:', error);
            setCantones([]);
            Alert.alert('Error', 'No se pudieron cargar los cantones');
        }
    };

    const loadUsuario = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/usuarios/${usuarioId}/`);
            const usuario = response.data;
            setFormData({
                nombre: usuario.nombre || '',
                email: usuario.email || '',
                telefono: usuario.telefono || '',
                provincia: usuario.provincia_id?.toString() || '',
                ciudad: usuario.ciudad_id?.toString() || '',
                canton: usuario.canton_id?.toString() || '',
                rol: usuario.rol || 'user',
                password: '',
                confirmPassword: '',
            });
            
            if (usuario.provincia_id) {
                await loadCiudades(usuario.provincia_id);
            }
            if (usuario.ciudad_id) {
                await loadCantones(usuario.ciudad_id);
            }
        } catch (error) {
            console.error('Error cargando usuario:', error);
            Alert.alert('Error', 'No se pudo cargar el usuario');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleProvinciaChange = async (value) => {
        setFormData({
            ...formData,
            provincia: value,
            ciudad: '',
            canton: '',
        });
        setCiudades([]);
        setCantones([]);
        if (value) {
            await loadCiudades(value);
        }
        if (errors.provincia) {
            setErrors({ ...errors, provincia: '' });
        }
    };

    const handleCiudadChange = async (value) => {
        setFormData({
            ...formData,
            ciudad: value,
            canton: '',
        });
        setCantones([]);
        if (value) {
            await loadCantones(value);
        }
        if (errors.ciudad) {
            setErrors({ ...errors, ciudad: '' });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Nombre: requerido y solo letras/espacios
        const nameRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;
        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        } else if (!nameRegex.test(formData.nombre.trim())) {
            newErrors.nombre = 'El nombre solo puede contener letras y espacios';
        }

        // Email
        if (!formData.email.trim()) {
            newErrors.email = 'El email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        // Teléfono: exactamente 10 dígitos
        const phoneDigits = (formData.telefono || '').replace(/\D/g, '');
        if (!phoneDigits) {
            newErrors.telefono = 'El teléfono es requerido';
        } else if (phoneDigits.length !== 10) {
            newErrors.telefono = 'El teléfono debe contener exactamente 10 dígitos';
        }

        if (!formData.provincia) {
            newErrors.provincia = 'La provincia es requerida';
        }

        if (!formData.ciudad) {
            newErrors.ciudad = 'La ciudad es requerida';
        }

        if (!formData.canton) {
            newErrors.canton = 'El cantón es requerido';
        }

        if (!isEdit) {
            if (!formData.password) {
                newErrors.password = 'La contraseña es requerida';
            } else if (formData.password.length < 6) {
                newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
            }

            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Las contraseñas no coinciden';
            }
        } else {
            if (formData.password && formData.password.length < 6) {
                newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
            }

            if (formData.password && formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Las contraseñas no coinciden';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            Alert.alert('Error', 'Por favor completa todos los campos requeridos');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                nombre: formData.nombre,
                email: formData.email,
                telefono: (formData.telefono || '').replace(/\D/g, ''),
                provincia_id: parseInt(formData.provincia),
                ciudad_id: parseInt(formData.ciudad),
                canton_id: parseInt(formData.canton),
                rol: formData.rol,
            };

            if (formData.password) {
                payload.password = formData.password;
            }

            if (isEdit) {
                await api.patch(`/usuarios/${usuarioId}/`, payload);
                Alert.alert('Éxito', 'Usuario actualizado correctamente');
            } else {
                await api.post('/usuarios/', payload);
                Alert.alert('Éxito', 'Usuario creado correctamente');
            }

            navigation.goBack();
        } catch (error) {
            console.error('Error guardando usuario:', error);
            Alert.alert('Error', error.response?.data?.message || 'No se pudo guardar el usuario');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEdit) {
        return (
            <MobileLayout title="Cargando..." headerColor="#10B981">
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#10B981" />
                </View>
            </MobileLayout>
        );
    }

    return (
        <MobileLayout
            title={isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
            headerColor="#10B981"
        >
            <ScrollView style={styles.container}>
                {/* Card: Información Personal */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="person" size={20} color="#FFFFFF" />
                        <Text style={styles.cardHeaderText}>Información Personal</Text>
                    </View>

                    <View style={styles.cardContent}>
                        {/* Nombre */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nombre Completo *</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="person-outline" size={20} color="#6B7280" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nombre completo"
                                    value={formData.nombre}
                                    onChangeText={(value) => handleChange('nombre', value)}
                                />
                            </View>
                            {errors.nombre && (
                                <Text style={styles.errorText}>{errors.nombre}</Text>
                            )}
                        </View>

                        {/* Email */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Correo Electrónico *</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="mail-outline" size={20} color="#6B7280" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="correo@ejemplo.com"
                                    value={formData.email}
                                    onChangeText={(value) => handleChange('email', value)}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                            {errors.email && (
                                <Text style={styles.errorText}>{errors.email}</Text>
                            )}
                        </View>

                        {/* Teléfono */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Teléfono *</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="call-outline" size={20} color="#6B7280" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="0987654321"
                                    value={formData.telefono}
                                    onChangeText={(value) => handleChange('telefono', value)}
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                />
                            </View>
                            {errors.telefono && (
                                <Text style={styles.errorText}>{errors.telefono}</Text>
                            )}
                        </View>

                        {/* Provincia */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Provincia *</Text>
                            <View style={styles.pickerWrapper}>
                                <Ionicons name="location-outline" size={20} color="#6B7280" />
                                <Picker
                                    selectedValue={formData.provincia}
                                    onValueChange={handleProvinciaChange}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Seleccione una provincia" value="" />
                                    {(provincias || []).map((prov) => (
                                        <Picker.Item
                                            key={prov.id}
                                            label={prov.nombre}
                                            value={prov.id.toString()}
                                        />
                                    ))}
                                </Picker>
                            </View>
                            {errors.provincia && (
                                <Text style={styles.errorText}>{errors.provincia}</Text>
                            )}
                        </View>

                        {/* Ciudad */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Ciudad *</Text>
                            <View style={styles.pickerWrapper}>
                                <Ionicons name="business-outline" size={20} color="#6B7280" />
                                <Picker
                                    selectedValue={formData.ciudad}
                                    onValueChange={handleCiudadChange}
                                    style={styles.picker}
                                    enabled={ciudades.length > 0}
                                >
                                    <Picker.Item label="Seleccione una ciudad" value="" />
                                    {(ciudades || []).map((city) => (
                                        <Picker.Item
                                            key={city.id}
                                            label={city.nombre}
                                            value={city.id.toString()}
                                        />
                                    ))}
                                </Picker>
                            </View>
                            {errors.ciudad && (
                                <Text style={styles.errorText}>{errors.ciudad}</Text>
                            )}
                        </View>

                        {/* Cantón */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Cantón *</Text>
                            <View style={styles.pickerWrapper}>
                                <Ionicons name="map-outline" size={20} color="#6B7280" />
                                <Picker
                                    selectedValue={formData.canton}
                                    onValueChange={(value) => {
                                        handleChange('canton', value);
                                        if (errors.canton) {
                                            setErrors({ ...errors, canton: '' });
                                        }
                                    }}
                                    style={styles.picker}
                                    enabled={cantones.length > 0}
                                >
                                    <Picker.Item label="Seleccione un cantón" value="" />
                                    {(cantones || []).map((cant) => (
                                        <Picker.Item
                                            key={cant.id}
                                            label={cant.nombre}
                                            value={cant.id.toString()}
                                        />
                                    ))}
                                </Picker>
                            </View>
                            {errors.canton && (
                                <Text style={styles.errorText}>{errors.canton}</Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Card: Rol y Seguridad */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
                        <Text style={styles.cardHeaderText}>Rol y Seguridad</Text>
                    </View>

                    <View style={styles.cardContent}>
                        {/* Rol */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Rol *</Text>
                            <View style={styles.roleButtons}>
                                <TouchableOpacity
                                    style={[
                                        styles.roleButton,
                                        formData.rol === 'user' && styles.roleButtonActive,
                                    ]}
                                    onPress={() => handleChange('rol', 'user')}
                                >
                                    <Ionicons
                                        name="person"
                                        size={20}
                                        color={formData.rol === 'user' ? '#FFFFFF' : '#10B981'}
                                    />
                                    <Text
                                        style={[
                                            styles.roleButtonText,
                                            formData.rol === 'user' && styles.roleButtonTextActive,
                                        ]}
                                    >
                                        Usuario
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.roleButton,
                                        formData.rol === 'admin' && styles.roleButtonActive,
                                    ]}
                                    onPress={() => handleChange('rol', 'admin')}
                                >
                                    <Ionicons
                                        name="shield"
                                        size={20}
                                        color={formData.rol === 'admin' ? '#FFFFFF' : '#10B981'}
                                    />
                                    <Text
                                        style={[
                                            styles.roleButtonText,
                                            formData.rol === 'admin' && styles.roleButtonTextActive,
                                        ]}
                                    >
                                        Administrador
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Password */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                {isEdit ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}
                            </Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
                                <TextInput
                                    style={styles.input}
                                    placeholder={isEdit ? 'Dejar vacío para mantener' : 'Contraseña'}
                                    value={formData.password}
                                    onChangeText={(value) => handleChange('password', value)}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ paddingHorizontal: 8 }}>
                                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </View>
                            {errors.password && (
                                <Text style={styles.errorText}>{errors.password}</Text>
                            )}
                        </View>

                        {/* Confirmar Password */}
                        {(formData.password || !isEdit) && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Confirmar Contraseña *</Text>
                                <View style={styles.inputWrapper}>
                                        <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Confirmar contraseña"
                                            value={formData.confirmPassword}
                                            onChangeText={(value) => handleChange('confirmPassword', value)}
                                            secureTextEntry={!showConfirm}
                                        />
                                        <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={{ paddingHorizontal: 8 }}>
                                            <Ionicons name={showConfirm ? 'eye-off' : 'eye'} size={20} color="#6B7280" />
                                        </TouchableOpacity>
                                    </View>
                                {errors.confirmPassword && (
                                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                                )}
                            </View>
                        )}
                    </View>
                </View>

                {/* Botones de acción */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                                <Text style={styles.submitButtonText}>
                                    {isEdit ? 'Actualizar' : 'Crear Usuario'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </MobileLayout>
    );
}
