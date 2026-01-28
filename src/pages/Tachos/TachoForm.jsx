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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import MobileLayout from '../../components/Layout/MobileLayout';
import api from '../../api/axiosConfig';
import { getCantones } from '../../api/ubicacionApi';
import { getTachos, getTachoById, createTacho, updateTacho } from '../../api/tachoApi';
import { Picker } from '@react-native-picker/picker';

const estadosDisponibles = [
    { value: 'activo', label: 'Activo', color: '#10B981' },
    { value: 'mantenimiento', label: 'Mantenimiento', color: '#F59E0B' },
    { value: 'fuera_servicio', label: 'Fuera de servicio', color: '#EF4444' },
];

const tiposDisponibles = [
    { value: 'publico', label: 'Público / Empresa' },
    { value: 'personal', label: 'Personal' },
];

const TachoForm = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { id } = route.params || {};

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [error, setError] = useState('');

    const [usuarios, setUsuarios] = useState([]);
    const [loadingUsuarios, setLoadingUsuarios] = useState(false);
    const [cantones, setCantones] = useState([]);
    const [tachosExistentes, setTachosExistentes] = useState([]);

    const [verificandoCodigo, setVerificandoCodigo] = useState(false);
    const [codigoDisponible, setCodigoDisponible] = useState(null);

    const [tacho, setTacho] = useState({
        codigo: '',
        nombre: '',
        descripcion: '',
        ubicacion_lat: '-2.900550',
        ubicacion_lon: '-79.004530',
        canton: '',
        estado: 'activo',
        nivel_llenado: 0,
        tipo: 'publico',
        propietario: null,
        empresa_nombre: '',
    });

    const [region, setRegion] = useState({
        latitude: -2.90055,
        longitude: -79.00453,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });

    useEffect(() => {
        const init = async () => {
            await Promise.all([
                loadUsuarios(),
                loadCantonesData(),
                loadTachosExistentes(),
            ]);

            if (id) {
                await loadTacho();
            } else {
                await getCurrentLocation();
                setLoading(false);
            }
        };

        init();
    }, [id]);

    const loadUsuarios = async () => {
        setLoadingUsuarios(true);
        try {
            const res = await api.get('/usuarios/');
            const data = res.data?.results || res.data || [];
            setUsuarios(data);
        } catch (e) {
            console.error('Error cargando usuarios', e);
        } finally {
            setLoadingUsuarios(false);
        }
    };

    const loadCantonesData = async () => {
        try {
            const res = await getCantones();
            setCantones(res.data || []);
        } catch (e) {
            console.error('Error cargando cantones', e);
        }
    };

    const loadTachosExistentes = async () => {
        try {
            const res = await getTachos();
            const data = res.data?.results || res.data || [];
            setTachosExistentes(data);
        } catch (e) {
            console.error('Error cargando tachos existentes', e);
        }
    };

    const validarCodigoUnico = (codigo) => {
        if (!codigo.trim()) {
            setCodigoDisponible(null);
            return;
        }

        setVerificandoCodigo(true);
        const lista = id
            ? tachosExistentes.filter(t => t.id !== Number(id))
            : tachosExistentes;

        const existe = lista.some(t => (t.codigo || '').toLowerCase() === codigo.toLowerCase());
        setCodigoDisponible(!existe);
        setVerificandoCodigo(false);
    };

    const loadTacho = async () => {
        setLoading(true);
        try {
            const res = await getTachoById(id);
            const data = res.data;

            setTacho({
                codigo: data.codigo || '',
                nombre: data.nombre || '',
                descripcion: data.descripcion || '',
                ubicacion_lat: data.ubicacion_lat ? String(data.ubicacion_lat) : '-2.900550',
                ubicacion_lon: data.ubicacion_lon ? String(data.ubicacion_lon) : '-79.004530',
                canton: data.canton || '',
                estado: data.estado || 'activo',
                nivel_llenado: 0,
                tipo: data.tipo || 'publico',
                propietario: data.propietario || null,
                empresa_nombre: data.empresa_nombre || '',
            });

            if (data.codigo) {
                validarCodigoUnico(data.codigo);
            }

            if (data.ubicacion_lat && data.ubicacion_lon) {
                setRegion({
                    latitude: Number(data.ubicacion_lat),
                    longitude: Number(data.ubicacion_lon),
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                });
            }
        } catch (e) {
            Alert.alert('Error', 'No se pudo cargar el tacho');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const getCurrentLocation = async () => {
        setLocationLoading(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permiso denegado', 'Se necesita permiso para la ubicación');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            setTacho(prev => ({
                ...prev,
                ubicacion_lat: latitude.toFixed(6),
                ubicacion_lon: longitude.toFixed(6),
            }));

            setRegion({
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });
        } catch (e) {
            console.error('Error obteniendo ubicación', e);
        } finally {
            setLocationLoading(false);
        }
    };

    const handleChange = (name, value) => {
        setTacho(prev => ({ ...prev, [name]: value }));
        if (name === 'codigo') {
            validarCodigoUnico(value);
        }
        if (name === 'tipo' && value === 'personal') {
            setTacho(prev => ({ ...prev, tipo: 'personal', empresa_nombre: '' }));
        }
        setError('');
    };

    const handleMapPress = (event) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setTacho(prev => ({
            ...prev,
            ubicacion_lat: latitude.toFixed(6),
            ubicacion_lon: longitude.toFixed(6),
        }));
        setRegion(prev => ({ ...prev, latitude, longitude }));
    };

    const validateForm = () => {
        const nameRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;

        if (!tacho.codigo.trim()) {
            setError('El código es obligatorio');
            return false;
        }

        if (tacho.codigo.trim().length > 15) {
            setError('El código no puede tener más de 15 caracteres');
            return false;
        }

        if (!tacho.nombre.trim()) {
            setError('El nombre es obligatorio');
            return false;
        }

        if (!nameRegex.test(tacho.nombre.trim())) {
            setError('El nombre solo puede contener letras y espacios');
            return false;
        }

        if (codigoDisponible === false) {
            setError('El código ya está en uso. Use otro.');
            return false;
        }

        if (tacho.tipo === 'publico' && !tacho.empresa_nombre.trim()) {
            setError('Para tachos públicos, ingrese el nombre de la empresa/institución');
            return false;
        }

        if (!tacho.ubicacion_lat || !tacho.ubicacion_lon) {
            setError('Seleccione una ubicación en el mapa');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setSaving(true);
        try {
            const dataToSend = {
                codigo: tacho.codigo.trim(),
                nombre: tacho.nombre.trim(),
                descripcion: tacho.descripcion || '',
                ubicacion_lat: tacho.ubicacion_lat ? parseFloat(tacho.ubicacion_lat) : null,
                ubicacion_lon: tacho.ubicacion_lon ? parseFloat(tacho.ubicacion_lon) : null,
                canton: tacho.canton || null,
                estado: tacho.estado,
                nivel_llenado: 0,
                tipo: tacho.tipo,
                propietario: tacho.propietario ? Number(tacho.propietario) : null,
                empresa_nombre: tacho.tipo === 'publico' ? (tacho.empresa_nombre || '') : '',
            };

            if (id) {
                await updateTacho(id, dataToSend);
                Alert.alert('Éxito', 'Tacho actualizado');
            } else {
                await createTacho(dataToSend);
                Alert.alert('Éxito', 'Tacho creado');
            }

            navigation.navigate('TachoList');
        } catch (err) {
            console.error('Error guardando tacho', err);
            if (err.response?.status === 400 && err.response.data?.codigo) {
                setError('El código ya está en uso.');
            } else {
                setError('No se pudo guardar el tacho.');
            }
            
        } finally {
            setSaving(false);
        }
    };

    const selectedUsuario = usuarios.find(u => u.id === tacho.propietario);

    if (loading) {
        return (
            <MobileLayout title={id ? 'Editar Tacho' : 'Nuevo Tacho'} subtitle="Cargando" headerColor="#10B981">
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
                    <ActivityIndicator size="large" color="#10B981" />
                    <Text style={{ marginTop: 12, color: '#6B7280' }}>Cargando tacho...</Text>
                </View>
            </MobileLayout>
        );
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <MobileLayout title={id ? 'Editar Tacho' : 'Nuevo Tacho'} subtitle="Configura los datos" headerColor="#10B981">
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' }}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="arrow-back" size={18} color="#1E293B" />
                            <Text style={{ fontSize: 13, fontWeight: '600', color: '#1E293B' }}>Volver</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#10B981', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 }}
                            onPress={handleSubmit}
                            disabled={saving}
                        >
                            {saving ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="save-outline" size={18} color="#FFF" />}
                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFF' }}>{id ? 'Actualizar' : 'Crear'}</Text>
                        </TouchableOpacity>
                    </View>

                    {error ? (
                        <View style={{ backgroundColor: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)', borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 12 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <MaterialCommunityIcons name="alert-circle" size={18} color="#B91C1C" />
                                <Text style={{ color: '#B91C1C', fontWeight: '700' }}>{error}</Text>
                            </View>
                        </View>
                    ) : null}

                    {/* Datos principales */}
                    <View style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 12 }}>
                            <Ionicons name="information-circle-outline" size={18} color="#10B981" /> Datos del Tacho
                        </Text>

                        <View style={{ marginBottom: 12 }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 6 }}>Código</Text>
                            <TextInput
                                value={tacho.codigo}
                                onChangeText={(v) => handleChange('codigo', v)}
                                placeholder="Ej: TAC-001"
                                placeholderTextColor="#94A3B8"
                                style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, fontSize: 14, color: '#111827' }}
                                autoCapitalize="characters"
                                maxLength={15}
                            />
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                                {verificandoCodigo ? (
                                    <ActivityIndicator size="small" color="#10B981" />
                                ) : codigoDisponible === true ? (
                                    <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" />
                                ) : codigoDisponible === false ? (
                                    <MaterialCommunityIcons name="close-circle" size={16} color="#EF4444" />
                                ) : null}
                                <Text style={{ fontSize: 12, color: codigoDisponible === false ? '#EF4444' : '#6B7280' }}>
                                    {codigoDisponible === false ? 'El código ya está en uso' : 'El código debe ser único'}
                                </Text>
                            </View>
                        </View>

                        <View style={{ marginBottom: 12 }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 6 }}>Nombre</Text>
                            <TextInput
                                value={tacho.nombre}
                                onChangeText={(v) => handleChange('nombre', v)}
                                placeholder="Ej: Tacho Parque Central"
                                placeholderTextColor="#94A3B8"
                                style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, fontSize: 14, color: '#111827' }}
                            />
                        </View>

                        <View style={{ marginBottom: 12 }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 6 }}>Tipo</Text>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                {tiposDisponibles.map(tipo => {
                                    const active = tacho.tipo === tipo.value;
                                    return (
                                        <TouchableOpacity
                                            key={tipo.value}
                                            onPress={() => handleChange('tipo', tipo.value)}
                                            style={{ paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: active ? '#10B981' : '#E2E8F0', backgroundColor: active ? 'rgba(16,185,129,0.08)' : '#FFF' }}
                                        >
                                            <Text style={{ fontSize: 13, fontWeight: '700', color: active ? '#065F46' : '#475569' }}>{tipo.label}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        <View style={{ marginBottom: 12 }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 6 }}>Estado</Text>
                            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                                {estadosDisponibles.map(estado => {
                                    const active = tacho.estado === estado.value;
                                    return (
                                        <TouchableOpacity
                                            key={estado.value}
                                            onPress={() => handleChange('estado', estado.value)}
                                            style={{ paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: active ? estado.color : '#E2E8F0', backgroundColor: active ? `${estado.color}22` : '#FFF' }}
                                        >
                                            <Text style={{ fontSize: 13, fontWeight: '700', color: active ? '#111827' : '#475569' }}>{estado.label}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        <View style={{ marginBottom: 12 }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 6 }}>Nivel de llenado</Text>
                            <View style={{ padding: 12, borderRadius: 10, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E2E8F0' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Ionicons name="battery-full" size={18} color="#10B981" />
                                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827' }}>0%</Text>
                                    </View>
                                    <Text style={{ fontSize: 12, color: '#6B7280', backgroundColor: '#E5E7EB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>Fijado por sistema</Text>
                                </View>
                                <Text style={{ marginTop: 8, fontSize: 12, color: '#6B7280', fontStyle: 'italic' }}>
                                    El nivel se actualiza automáticamente con detecciones IA.
                                </Text>
                            </View>
                        </View>

                        {tacho.tipo === 'publico' && (
                            <View style={{ marginBottom: 12 }}>
                                <Text style={{ fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 6 }}>Empresa / Institución</Text>
                                <TextInput
                                    value={tacho.empresa_nombre}
                                    onChangeText={(v) => handleChange('empresa_nombre', v)}
                                    placeholder="Ej: Municipio de Cuenca"
                                    placeholderTextColor="#94A3B8"
                                    style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, fontSize: 14, color: '#111827' }}
                                />
                                <Text style={{ marginTop: 6, fontSize: 12, color: '#6B7280' }}>Ingrese el nombre de la empresa o institución responsable</Text>
                            </View>
                        )}

                        <View style={{ marginBottom: 12 }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 6 }}>Usuario Encargado</Text>
                            <View style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 4 }}>
                                {loadingUsuarios ? (
                                    <View style={{ paddingVertical: 12, alignItems: 'center' }}>
                                        <ActivityIndicator size="small" color="#10B981" />
                                    </View>
                                ) : (
                                    <Picker
                                        selectedValue={tacho.propietario ?? ''}
                                        onValueChange={(value) => handleChange('propietario', value === '' ? null : value)}
                                        style={{ width: '100%', color: '#111827' }}
                                        dropdownIconColor="#6B7280"
                                    >
                                        <Picker.Item label="-- Sin usuario encargado --" value="" />
                                        {usuarios.map((u) => (
                                            <Picker.Item
                                                key={u.id}
                                                label={`${u.nombre} (${u.email})`}
                                                value={u.id}
                                            />
                                        ))}
                                    </Picker>
                                )}
                            </View>
                            <Text style={{ marginTop: 6, fontSize: 12, color: '#6B7280' }}>
                                {tacho.tipo === 'publico'
                                    ? 'Opcional: usuario responsable de este tacho público'
                                    : 'Usuario al que pertenece este tacho personal'}
                            </Text>
                        </View>

                        <View style={{ marginBottom: 12 }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 6 }}>Descripción</Text>
                            <TextInput
                                value={tacho.descripcion}
                                onChangeText={(v) => handleChange('descripcion', v)}
                                placeholder="Descripción o referencia del lugar..."
                                placeholderTextColor="#94A3B8"
                                style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, fontSize: 14, color: '#111827', minHeight: 90, textAlignVertical: 'top' }}
                                multiline
                            />
                        </View>

                        {cantones.length > 0 && (
                            <View style={{ marginBottom: 12 }}>
                                <Text style={{ fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 6 }}>Cantón</Text>
                                <View style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 4 }}>
                                    <Picker
                                        selectedValue={tacho.canton || ''}
                                        onValueChange={(value) => handleChange('canton', value)}
                                        style={{ width: '100%', color: '#111827' }}
                                        dropdownIconColor="#6B7280"
                                    >
                                        <Picker.Item label="-- Seleccionar cantón --" value="" />
                                        {cantones.map((canton) => (
                                            <Picker.Item key={canton.id} label={canton.nombre} value={canton.id} />
                                        ))}
                                    </Picker>
                                </View>
                            </View>
                        )}

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 6 }}>Latitud</Text>
                                <TextInput
                                    value={tacho.ubicacion_lat}
                                    editable={false}
                                    style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, fontSize: 14, color: '#111827', backgroundColor: '#F9FAFB' }}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 6 }}>Longitud</Text>
                                <TextInput
                                    value={tacho.ubicacion_lon}
                                    editable={false}
                                    style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, fontSize: 14, color: '#111827', backgroundColor: '#F9FAFB' }}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}
                            onPress={getCurrentLocation}
                            disabled={locationLoading}
                        >
                            <Ionicons name={locationLoading ? 'refresh' : 'navigate'} size={18} color="#10B981" />
                            <Text style={{ color: '#0F766E', fontWeight: '600' }}>
                                {locationLoading ? 'Obteniendo ubicación...' : 'Usar mi ubicación actual'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Mapa */}
                    <View style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 8 }}>
                            <Ionicons name="map-outline" size={18} color="#10B981" /> Ubicación del Tacho
                        </Text>
                        <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 10 }}>Toca el mapa para fijar la ubicación</Text>
                        <View style={{ height: 320, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0' }}>
                            <MapView
                                style={{ flex: 1 }}
                                region={region}
                                onPress={handleMapPress}
                                showsUserLocation
                                showsMyLocationButton={false}
                            >
                                <Marker coordinate={{ latitude: Number(tacho.ubicacion_lat), longitude: Number(tacho.ubicacion_lon) }}>
                                    <View style={{ alignItems: 'center' }}>
                                        <View style={{ width: 42, height: 42, backgroundColor: '#10B981', borderRadius: 21, borderWidth: 3, borderColor: '#FFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 8 }}>
                                            <Text style={{ fontSize: 20 }}>🗑️</Text>
                                        </View>
                                    </View>
                                </Marker>
                            </MapView>
                        </View>
                        <Text style={{ marginTop: 8, fontSize: 12, color: '#6B7280' }}>
                            Coordenadas seleccionadas: {tacho.ubicacion_lat || '-'}, {tacho.ubicacion_lon || '-'}
                        </Text>
                    </View>

                    {/* Resumen */}
                    <View style={{ backgroundColor: 'rgba(16,185,129,0.05)', borderRadius: 12, padding: 14, borderLeftWidth: 4, borderLeftColor: '#10B981', marginBottom: 24 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                            <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' }}>
                                <Ionicons name="trash-outline" size={18} color="#FFF" />
                            </View>
                            <Text style={{ fontSize: 15, fontWeight: '700', color: '#065F46' }}>Resumen del Tacho</Text>
                        </View>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                            <ResumenItem label="Tipo" value={tacho.tipo === 'personal' ? 'Personal' : 'Público'} highlight={tacho.tipo === 'personal' ? '#3B82F6' : '#10B981'} />
                            <ResumenItem label="Empresa" value={tacho.tipo === 'publico' ? (tacho.empresa_nombre || 'No definida') : 'No aplica'} />
                            <ResumenItem label="Usuario encargado" value={selectedUsuario ? `${selectedUsuario.nombre}` : 'No asignado'} />
                            <ResumenItem label="Nivel" value="0% (automático)" highlight="#10B981" />
                            <ResumenItem label="Código" value={tacho.codigo || 'No definido'} highlight={codigoDisponible === false ? '#EF4444' : '#10B981'} />
                        </View>
                    </View>
                </ScrollView>
            </MobileLayout>
        </KeyboardAvoidingView>
    );
};

const ResumenItem = ({ label, value, highlight }) => (
    <View style={{ padding: 10, backgroundColor: '#FFF', borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', minWidth: '45%' }}>
        <Text style={{ fontSize: 11, color: '#6B7280', marginBottom: 4 }}>{label}</Text>
        <Text style={{ fontSize: 13, fontWeight: '700', color: highlight || '#111827' }}>{value}</Text>
    </View>
);

export default TachoForm;