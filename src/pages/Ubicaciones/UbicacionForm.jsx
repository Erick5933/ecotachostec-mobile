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
import { getProvincias, getCiudades } from '../../api/ubicacionApi';

export default function UbicacionForm({ route, navigation }) {
    const { ubicacionId } = route.params || {};
    const isEdit = !!ubicacionId;

    const [formData, setFormData] = useState({
        provincia: '',
        ciudad: '',
        canton: '',
    });

    const [provincias, setProvincias] = useState([]);
    const [ciudades, setCiudades] = useState([]);
    const [ciudadesFiltradas, setCiudadesFiltradas] = useState([]);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadProvincias();
        if (isEdit) {
            loadUbicacion();
        }
    }, []);

    const loadProvincias = async () => {
        try {
            const response = await getProvincias();
            setProvincias(response.data || []);
        } catch (error) {
            console.error('Error cargando provincias:', error);
            Alert.alert('Error', 'No se pudieron cargar las provincias');
        }
    };

    const loadCiudades = async () => {
        try {
            const response = await getCiudades();
            setCiudades(response.data || []);
        } catch (error) {
            console.error('Error cargando ciudades:', error);
            Alert.alert('Error', 'No se pudieron cargar las ciudades');
        }
    };

    const loadUbicacion = async () => {
        try {
            setLoading(true);
            await loadCiudades();
            
            const response = await api.get(`/ubicacion/cantones/${ubicacionId}/`);
            const ubicacion = response.data;
            
            setFormData({
                provincia: ubicacion.provincia?.toString() || '',
                ciudad: ubicacion.ciudad?.toString() || '',
                canton: ubicacion.nombre || '',
            });

            if (ubicacion.provincia) {
                filterCiudades(ubicacion.provincia);
            }
        } catch (error) {
            console.error('Error cargando ubicación:', error);
            Alert.alert('Error', 'No se pudo cargar la ubicación');
        } finally {
            setLoading(false);
        }
    };

    const filterCiudades = (provinciaId) => {
        if (!ciudades.length) {
            loadCiudades().then(() => {
                const filtered = ciudades.filter(
                    (c) => c.provincia === parseInt(provinciaId)
                );
                setCiudadesFiltradas(filtered);
            });
        } else {
            const filtered = ciudades.filter(
                (c) => c.provincia === parseInt(provinciaId)
            );
            setCiudadesFiltradas(filtered);
        }
    };

    useEffect(() => {
        if (formData.provincia && ciudades.length > 0) {
            filterCiudades(formData.provincia);
        }
    }, [formData.provincia, ciudades]);

    const handleChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleProvinciaChange = (value) => {
        setFormData({
            ...formData,
            provincia: value,
            ciudad: '',
        });
        setCiudadesFiltradas([]);
        if (value) {
            filterCiudades(value);
        }
        if (errors.provincia) {
            setErrors({ ...errors, provincia: '' });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.provincia) {
            newErrors.provincia = 'La provincia es requerida';
        }

        if (!formData.ciudad) {
            newErrors.ciudad = 'La ciudad es requerida';
        }

        // Cantón: requerido y solo letras/espacios
        const nameRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;
        if (!formData.canton.trim()) {
            newErrors.canton = 'El cantón es requerido';
        } else if (!nameRegex.test(formData.canton.trim())) {
            newErrors.canton = 'El cantón solo puede contener letras y espacios';
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
                nombre: formData.canton,
                ciudad: parseInt(formData.ciudad),
            };

            if (isEdit) {
                await api.put(`/ubicacion/cantones/${ubicacionId}/`, payload);
                Alert.alert('Éxito', 'Ubicación actualizada correctamente');
            } else {
                await api.post('/ubicacion/cantones/', payload);
                Alert.alert('Éxito', 'Ubicación creada correctamente');
            }

            navigation.goBack();
        } catch (error) {
            console.error('Error guardando ubicación:', error);
            Alert.alert('Error', error.response?.data?.message || 'No se pudo guardar la ubicación');
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
            title={isEdit ? 'Editar Ubicación' : 'Nueva Ubicación'}
            headerColor="#10B981"
        >
            <ScrollView style={styles.container}>
                {/* Card: Información Geográfica */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="map" size={20} color="#FFFFFF" />
                        <Text style={styles.cardHeaderText}>Información Geográfica</Text>
                    </View>

                    <View style={styles.cardContent}>
                        {/* Provincia */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Provincia *</Text>
                            <View style={styles.pickerWrapper}>
                                <Ionicons name="map-outline" size={20} color="#6B7280" />
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
                                    onValueChange={(value) => handleChange('ciudad', value)}
                                    style={styles.picker}
                                    enabled={ciudadesFiltradas.length > 0}
                                >
                                    <Picker.Item
                                        label={formData.provincia ? "Seleccione una ciudad" : "Primero seleccione una provincia"}
                                        value=""
                                    />
                                    {(ciudadesFiltradas || []).map((city) => (
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
                            <View style={styles.inputWrapper}>
                                <Ionicons name="location-outline" size={20} color="#6B7280" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ingrese el nombre del cantón"
                                    value={formData.canton}
                                    onChangeText={(value) => handleChange('canton', value)}
                                    maxLength={50}
                                />
                            </View>
                            {errors.canton && (
                                <Text style={styles.errorText}>{errors.canton}</Text>
                            )}
                            <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>
                                Nombre completo del cantón o parroquia
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Info Card */}
                <View style={{
                    marginTop: 20,
                    marginBottom: 20,
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                    borderRadius: 12,
                    padding: 16,
                    borderLeftWidth: 4,
                    borderLeftColor: '#10B981',
                    flexDirection: 'row',
                    gap: 12,
                }}>
                    <View style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        backgroundColor: '#FFF',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <Ionicons name="information-circle" size={20} color="#10B981" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#059669', marginBottom: 4 }}>
                            Jerarquía Administrativa
                        </Text>
                        <Text style={{ fontSize: 13, color: '#64748B', lineHeight: 20 }}>
                            El sistema utiliza la división política administrativa del Ecuador: Provincias → Ciudades → Cantones. Asegúrese de seleccionar la provincia correcta antes de elegir la ciudad.
                        </Text>
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
                                    {isEdit ? 'Actualizar' : 'Crear Ubicación'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </MobileLayout>
    );
}
