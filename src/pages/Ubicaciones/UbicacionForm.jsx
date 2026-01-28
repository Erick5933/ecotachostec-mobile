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
import { Ionicons } from '@expo/vector-icons';
import MobileLayout from '../../components/Layout/MobileLayout';
import { usuarioFormStyles as styles } from '../../styles/usuarioStyles';
import api from '../../api/axiosConfig';
import { getProvincias, getCiudades } from '../../api/ubicacionApi';

export default function UbicacionForm({ route, navigation }) {
    const { ubicacionId } = route.params || {};
    const isEdit = !!ubicacionId;

    const [formData, setFormData] = useState({
        provincia: '', // id cuando selecciona de sugerencias
        ciudad: '', // id cuando selecciona de sugerencias
        canton: '',
    });

    // Inputs de texto con autocompletado
    const [provinciaInput, setProvinciaInput] = useState('');
    const [ciudadInput, setCiudadInput] = useState('');
    const [showProvinciaSuggestions, setShowProvinciaSuggestions] = useState(false);
    const [showCiudadSuggestions, setShowCiudadSuggestions] = useState(false);

    const [provincias, setProvincias] = useState([]);
    const [ciudades, setCiudades] = useState([]);
    const [ciudadesFiltradas, setCiudadesFiltradas] = useState([]);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const init = async () => {
            await loadProvincias();
            await loadCiudades();
            if (isEdit) {
                await loadUbicacion();
            }
        };
        init();
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

            // Mapear IDs a nombres para inputs de texto
            const provName = (provincias.find(p => p.id === ubicacion.provincia)?.nombre) || '';
            const ciudadName = (ciudades.find(c => c.id === ubicacion.ciudad)?.nombre) || '';

            setProvinciaInput(provName);
            setCiudadInput(ciudadName);

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

    // Capitalizar: primera mayúscula, resto minúscula
    const capitalizar = (txt) => {
        if (!txt) return '';
        return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
    };

    const handleProvinciaInput = (value) => {
        const val = capitalizar(value);
        setProvinciaInput(val);
        setShowProvinciaSuggestions(true);
        // Al cambiar provincia por texto, limpiar selección previa
        setFormData({ ...formData, provincia: '', ciudad: '' });
        setCiudadesFiltradas([]);
        if (errors.provincia) setErrors({ ...errors, provincia: '' });
    };

    const handleCiudadInput = (value) => {
        const val = capitalizar(value);
        setCiudadInput(val);
        setShowCiudadSuggestions(true);
        setFormData({ ...formData, ciudad: '' });
        if (errors.ciudad) setErrors({ ...errors, ciudad: '' });
    };

    const seleccionarProvincia = (prov) => {
        setProvinciaInput(prov.nombre);
        setFormData({ ...formData, provincia: prov.id.toString(), ciudad: '' });
        setShowProvinciaSuggestions(false);
        filterCiudades(prov.id);
    };

    const seleccionarCiudad = (ciud) => {
        setCiudadInput(ciud.nombre);
        setFormData({ ...formData, ciudad: ciud.id.toString() });
        setShowCiudadSuggestions(false);
    };

    const validateForm = () => {
        const newErrors = {};

        // Reglas: siempre requerir textos de provincia y ciudad, y canton
        if (!provinciaInput.trim()) {
            newErrors.provincia = 'La provincia es requerida';
        }

        if (!ciudadInput.trim()) {
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

            // Buscar provincia por nombre (case-insensitive)
            const provinciaExistente = (provincias || []).find(
                (p) => p.nombre?.toLowerCase() === provinciaInput.trim().toLowerCase()
            );

            // Buscar ciudad por nombre dentro de la provincia (si existe)
            let ciudadExistente = null;
            if (provinciaExistente) {
                ciudadExistente = (ciudades || []).find(
                    (c) => c.nombre?.toLowerCase() === ciudadInput.trim().toLowerCase() && c.provincia === provinciaExistente.id
                );
            } else {
                ciudadExistente = (ciudades || []).find(
                    (c) => c.nombre?.toLowerCase() === ciudadInput.trim().toLowerCase()
                );
            }

            let provinciaId = provinciaExistente?.id;
            let ciudadId = ciudadExistente?.id;

            // Caso 1: no existe provincia -> crear provincia y ciudad
            if (!provinciaExistente) {
                const resProv = await api.post('/ubicacion/provincias/', { nombre: provinciaInput.trim() });
                provinciaId = resProv.data?.id;
                // ciudad puede existir sin vincularse? normalmente no, crear ciudad bajo nueva provincia
                const resCiud = await api.post('/ubicacion/ciudades/', { nombre: ciudadInput.trim(), provincia: provinciaId });
                ciudadId = resCiud.data?.id;
            }
            // Caso 2: provincia existe pero ciudad no -> crear ciudad
            else if (provinciaExistente && !ciudadExistente) {
                const resCiud = await api.post('/ubicacion/ciudades/', { nombre: ciudadInput.trim(), provincia: provinciaId });
                ciudadId = resCiud.data?.id;
            }
            // Caso 3: ambos existen -> usar ciudadId directamente

            const payload = {
                nombre: formData.canton.trim(),
                ciudad: ciudadId,
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
            const msg = error.response?.data?.message || error.response?.data?.nombre?.[0] || error.response?.data?.error || 'No se pudo guardar la ubicación';
            Alert.alert('Error', msg);
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
                        {/* Provincia con autocompletado */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Provincia *</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="map-outline" size={20} color="#6B7280" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Escriba el nombre de la provincia"
                                    value={provinciaInput}
                                    onChangeText={handleProvinciaInput}
                                    onFocus={() => setShowProvinciaSuggestions(true)}
                                    autoCapitalize="none"
                                />
                            </View>
                            {errors.provincia && (
                                <Text style={styles.errorText}>{errors.provincia}</Text>
                            )}

                            {/* Sugerencias de provincias */}
                            {showProvinciaSuggestions && provinciaInput.trim().length > 0 && (
                                <View style={{ backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, marginTop: 8, maxHeight: 200 }}>
                                    {(provincias || [])
                                        .filter(p => p.nombre.toLowerCase().includes(provinciaInput.trim().toLowerCase()))
                                        .map((p) => (
                                            <TouchableOpacity key={p.id} onPress={() => seleccionarProvincia(p)} style={{ paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                                                <Text style={{ fontSize: 13, fontWeight: '600', color: '#1F2937' }}>{p.nombre}</Text>
                                            </TouchableOpacity>
                                        ))}
                                </View>
                            )}
                        </View>

                        {/* Ciudad con autocompletado */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Ciudad *</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="business-outline" size={20} color="#6B7280" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Escriba el nombre de la ciudad"
                                    value={ciudadInput}
                                    onChangeText={handleCiudadInput}
                                    onFocus={() => setShowCiudadSuggestions(true)}
                                    autoCapitalize="none"
                                />
                            </View>
                            {errors.ciudad && (
                                <Text style={styles.errorText}>{errors.ciudad}</Text>
                            )}

                            {/* Sugerencias de ciudades */}
                            {showCiudadSuggestions && ciudadInput.trim().length > 0 && (
                                <View style={{ backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, marginTop: 8, maxHeight: 200 }}>
                                    {(ciudades || [])
                                        .filter(c => {
                                            // Si hay provincia seleccionada por id, filtrar por ella
                                            if (formData.provincia) {
                                                return c.provincia === parseInt(formData.provincia) && c.nombre.toLowerCase().includes(ciudadInput.trim().toLowerCase());
                                            }
                                            // Si no, filtrar solo por texto
                                            return c.nombre.toLowerCase().includes(ciudadInput.trim().toLowerCase());
                                        })
                                        .map((c) => (
                                            <TouchableOpacity key={c.id} onPress={() => seleccionarCiudad(c)} style={{ paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                                                <Text style={{ fontSize: 13, fontWeight: '600', color: '#1F2937' }}>{c.nombre}</Text>
                                            </TouchableOpacity>
                                        ))}
                                </View>
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
