// src/pages/Tachos/TachoForm.jsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { tachosStyles, colors } from '../../styles/mobileStyles';
import { getTachoById, createTacho, updateTacho } from '../../api/tachoApi';

const TachoForm = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { id } = route.params || {};

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [cantones, setCantones] = useState([]);

    const [tacho, setTacho] = useState({
        codigo: '',
        nombre: '',
        descripcion: '',
        ubicacion_lat: '-2.90055',
        ubicacion_lon: '-79.00453',
        canton: '',
    });

    const [region, setRegion] = useState({
        latitude: -2.90055,
        longitude: -79.00453,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });

    // Cargar datos para edición
    useEffect(() => {
        if (id) {
            loadTacho();
        } else {
            // En creación, obtener ubicación actual
            getCurrentLocation();
        }
        loadCantones();
    }, [id]);

    const loadTacho = async () => {
        setLoading(true);
        try {
            const response = await getTachoById(id);
            const data = response.data;
            setTacho(data);

            // Centrar mapa en la ubicación existente
            if (data.ubicacion_lat && data.ubicacion_lon) {
                setRegion({
                    latitude: parseFloat(data.ubicacion_lat),
                    longitude: parseFloat(data.ubicacion_lon),
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                });
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo cargar el tacho');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const loadCantones = async () => {
        try {
            // AQUÍ DEBES REEMPLAZAR CON TU API REAL
            // const response = await api.get('/ubicacion/cantones/');
            // setCantones(response.data);

            // Datos de ejemplo
            setCantones([
                { id: 1, nombre: 'Cuenca' },
                { id: 2, nombre: 'Quito' },
                { id: 3, nombre: 'Guayaquil' },
            ]);
        } catch (error) {
            console.error('Error cargando cantones:', error);
        }
    };

    const getCurrentLocation = async () => {
        setLocationLoading(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permiso denegado', 'Se necesita permiso para acceder a la ubicación');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            setTacho(prev => ({
                ...prev,
                ubicacion_lat: latitude.toString(),
                ubicacion_lon: longitude.toString(),
            }));

            setRegion({
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });
        } catch (error) {
            console.error('Error obteniendo ubicación:', error);
            // Usar Cuenca como fallback
            setRegion({
                latitude: -2.90055,
                longitude: -79.00453,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });
        } finally {
            setLocationLoading(false);
        }
    };

    const handleChange = (name, value) => {
        setTacho(prev => ({ ...prev, [name]: value }));
    };

    const handleMapPress = (event) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setTacho(prev => ({
            ...prev,
            ubicacion_lat: latitude.toString(),
            ubicacion_lon: longitude.toString(),
        }));
        setRegion(prev => ({
            ...prev,
            latitude,
            longitude,
        }));
    };

    const validateForm = () => {
        if (!tacho.codigo.trim()) {
            Alert.alert('Error', 'El código es obligatorio');
            return false;
        }
        if (!tacho.nombre.trim()) {
            Alert.alert('Error', 'El nombre es obligatorio');
            return false;
        }
        if (!tacho.ubicacion_lat || !tacho.ubicacion_lon) {
            Alert.alert('Error', 'Debe seleccionar una ubicación en el mapa');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setSaving(true);
        try {
            const dataToSend = {
                ...tacho,
                ubicacion_lat: parseFloat(tacho.ubicacion_lat),
                ubicacion_lon: parseFloat(tacho.ubicacion_lon),
                canton: tacho.canton || null,
            };

            if (id) {
                await updateTacho(id, dataToSend);
                Alert.alert('Éxito', 'Tacho actualizado correctamente');
            } else {
                await createTacho(dataToSend);
                Alert.alert('Éxito', 'Tacho creado correctamente');
            }

            navigation.navigate('TachoList');
        } catch (error) {
            console.error('Error guardando tacho:', error);
            Alert.alert('Error', 'No se pudo guardar el tacho');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={tachosStyles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[tachosStyles.emptyText, tachosStyles.mtMd]}>Cargando tacho...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView style={tachosStyles.container}>
                {/* Header */}
                <View style={tachosStyles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={[tachosStyles.flexRow, tachosStyles.gapSm]}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.dark} />
                        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.dark }}>
                            {id ? 'Editar Tacho' : 'Nuevo Tacho'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={tachosStyles.formContainer}>
                    {/* Formulario */}
                    <View style={tachosStyles.card}>
                        <View style={tachosStyles.formGroup}>
                            <Text style={tachosStyles.formLabel}>
                                <Ionicons name="barcode-outline" size={14} /> Código
                            </Text>
                            <TextInput
                                style={tachosStyles.formInput}
                                value={tacho.codigo}
                                onChangeText={(value) => handleChange('codigo', value)}
                                placeholder="Ej: TCH-001"
                                placeholderTextColor={colors.gray}
                            />
                        </View>

                        <View style={tachosStyles.formGroup}>
                            <Text style={tachosStyles.formLabel}>
                                <Ionicons name="trash-outline" size={14} /> Nombre
                            </Text>
                            <TextInput
                                style={tachosStyles.formInput}
                                value={tacho.nombre}
                                onChangeText={(value) => handleChange('nombre', value)}
                                placeholder="Nombre del tacho"
                                placeholderTextColor={colors.gray}
                            />
                        </View>

                        <View style={tachosStyles.formGroup}>
                            <Text style={tachosStyles.formLabel}>
                                <Ionicons name="document-text-outline" size={14} /> Descripción
                            </Text>
                            <TextInput
                                style={tachosStyles.formTextArea}
                                value={tacho.descripcion}
                                onChangeText={(value) => handleChange('descripcion', value)}
                                placeholder="Descripción o referencia del lugar..."
                                placeholderTextColor={colors.gray}
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        {/* Cantón */}
                        <View style={tachosStyles.formGroup}>
                            <Text style={tachosStyles.formLabel}>
                                <Ionicons name="location-outline" size={14} /> Cantón
                            </Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={[tachosStyles.flexRow, tachosStyles.gapSm]}>
                                    {cantones.map((canton) => (
                                        <TouchableOpacity
                                            key={canton.id}
                                            style={[
                                                {
                                                    paddingHorizontal: 16,
                                                    paddingVertical: 10,
                                                    borderRadius: 20,
                                                    backgroundColor: tacho.canton === canton.id.toString()
                                                        ? colors.primary
                                                        : colors.grayLight,
                                                },
                                            ]}
                                            onPress={() => handleChange('canton', canton.id.toString())}
                                        >
                                            <Text style={{
                                                color: tacho.canton === canton.id.toString()
                                                    ? colors.white
                                                    : colors.gray,
                                                fontWeight: '500',
                                            }}>
                                                {canton.nombre}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>

                        {/* Coordenadas */}
                        <View style={tachosStyles.formRow}>
                            <View style={[tachosStyles.formCol, tachosStyles.formGroup]}>
                                <Text style={tachosStyles.formLabel}>Latitud</Text>
                                <TextInput
                                    style={tachosStyles.formInput}
                                    value={tacho.ubicacion_lat}
                                    editable={false}
                                    placeholderTextColor={colors.gray}
                                />
                            </View>
                            <View style={[tachosStyles.formCol, tachosStyles.formGroup]}>
                                <Text style={tachosStyles.formLabel}>Longitud</Text>
                                <TextInput
                                    style={tachosStyles.formInput}
                                    value={tacho.ubicacion_lon}
                                    editable={false}
                                    placeholderTextColor={colors.gray}
                                />
                            </View>
                        </View>

                        {/* Botón de ubicación actual */}
                        <TouchableOpacity
                            style={[tachosStyles.flexRow, tachosStyles.gapSm, { marginBottom: 16 }]}
                            onPress={getCurrentLocation}
                            disabled={locationLoading}
                        >
                            <Ionicons
                                name={locationLoading ? "refresh" : "navigate"}
                                size={20}
                                color={colors.primary}
                            />
                            <Text style={{ color: colors.primary, fontWeight: '500' }}>
                                {locationLoading ? 'Obteniendo ubicación...' : 'Usar mi ubicación actual'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Mapa */}
                    <View style={tachosStyles.card}>
                        <Text style={tachosStyles.detailSectionTitle}>
                            <Ionicons name="map-outline" size={18} /> Seleccionar Ubicación
                        </Text>
                        <Text style={[tachosStyles.detailLabel, tachosStyles.mbMd]}>
                            Toque en el mapa para seleccionar la ubicación del tacho
                        </Text>

                        <View style={tachosStyles.mapContainer}>
                            <MapView
                                style={tachosStyles.map}
                                region={region}
                                onPress={handleMapPress}
                                showsUserLocation={true}
                                showsMyLocationButton={false}
                            >
                                <Marker
                                    coordinate={{
                                        latitude: parseFloat(tacho.ubicacion_lat),
                                        longitude: parseFloat(tacho.ubicacion_lon),
                                    }}
                                >
                                    <View style={tachosStyles.mapMarkerContainer}>
                                        <View style={tachosStyles.mapMarker}>
                                            <Text style={tachosStyles.mapMarkerText}>🗑️</Text>
                                        </View>
                                    </View>
                                </Marker>
                            </MapView>
                        </View>
                    </View>

                    {/* Botones de acción */}
                    <View style={[tachosStyles.flexRow, tachosStyles.gapMd, tachosStyles.mtLg]}>
                        <TouchableOpacity
                            style={[tachosStyles.btn, tachosStyles.btnSecondary, { flex: 1 }]}
                            onPress={() => navigation.goBack()}
                            disabled={saving}
                        >
                            <Ionicons name="close-outline" size={20} color={colors.dark} />
                            <Text style={[tachosStyles.btnText, tachosStyles.btnSecondaryText]}>
                                Cancelar
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[tachosStyles.btn, tachosStyles.btnPrimary, { flex: 1 }]}
                            onPress={handleSubmit}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator size="small" color={colors.white} />
                            ) : (
                                <>
                                    <Ionicons name="save-outline" size={20} color={colors.white} />
                                    <Text style={tachosStyles.btnText}>
                                        {id ? 'Actualizar' : 'Guardar'}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default TachoForm;