// src/pages/Tachos/TachoDetail.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    Linking,
    RefreshControl,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import MobileLayout from '../../components/Layout/MobileLayout';
import api from '../../api/axiosConfig';
import { AuthContext } from '../../context/AuthContext';

const TachoDetail = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { id } = route.params;
    const { userInfo } = useContext(AuthContext);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [tacho, setTacho] = useState(null);
    const [usuarioEncargado, setUsuarioEncargado] = useState(null);
    const [detecciones, setDetecciones] = useState([]);
    const [loadingDetecciones, setLoadingDetecciones] = useState(false);
    const [error, setError] = useState(null);

    // Cargar información del usuario encargado
    const loadUsuarioEncargado = async (usuarioId) => {
        if (!usuarioId) {
            setUsuarioEncargado(null);
            return;
        }

        try {
            const res = await api.get(`/usuarios/${usuarioId}/`, {
                validateStatus: (status) => [200, 403, 404].includes(status),
            });
            if (res.status === 200) {
                setUsuarioEncargado(res.data);
            } else {
                // Sin permisos o no encontrado: ocultar sección sin romper
                setUsuarioEncargado(null);
            }
        } catch (e) {
            // Silenciar errores de permisos para usuarios no admin
            setUsuarioEncargado(null);
        }
    };

    const loadTacho = async () => {
        try {
            const res = await api.get(`/tachos/${id}/`);
            const tachoData = res.data;
            setTacho(tachoData);

            // Cargar información del usuario encargado si existe
            if (tachoData.propietario) {
                await loadUsuarioEncargado(tachoData.propietario);
            }
        } catch (e) {
            console.error("Error cargando tacho", e);
            setError("No se pudo cargar la información del tacho");
        }
    };

    const loadDeteccionesTacho = async () => {
        setLoadingDetecciones(true);
        setError(null);
        try {
            // Intentar con endpoint específico; permitir 404 sin lanzar error
            const res = await api.get(`/tachos/${id}/detecciones/`, {
                validateStatus: (status) => status === 200 || status === 404,
            });

            if (res.status === 200) {
                setDetecciones(res.data);
                return;
            }

            // Fallback: endpoint general con filtro
            const fallbackRes = await api.get(`/detecciones/`, {
                params: { tacho_id: id },
            });
            const deteccionesFiltradas = fallbackRes.data.filter(det =>
                det.tacho_id == id || det.tacho == id
            );
            setDetecciones(deteccionesFiltradas);
        } catch (error) {
            console.error("Error cargando detecciones", error);
            setDetecciones([]);
        } finally {
            setLoadingDetecciones(false);
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadTacho();
        await loadDeteccionesTacho();
    };

    useEffect(() => {
        const fetchData = async () => {
            await loadTacho();
            await loadDeteccionesTacho();
        };
        fetchData();
    }, [id]);

    // Helper functions
    const getEstadoText = (estado) => {
        switch (estado) {
            case 'activo': return 'Activo';
            case 'mantenimiento': return 'Mantenimiento';
            case 'fuera_servicio': return 'Fuera de Servicio';
            default: return estado;
        }
    };

    const getNivelColor = (nivel) => {
        const nivelValue = nivel || 0;
        if (nivelValue >= 80) return '#ef4444';
        if (nivelValue >= 50) return '#f59e0b';
        return '#10b981';
    };

    const getClasificacionText = (clasificacion) => {
        switch (clasificacion?.toLowerCase()) {
            case 'organico': return 'Orgánico';
            case 'inorganico': return 'Inorgánico';
            case 'reciclable': return 'Reciclable';
            default: return clasificacion || 'No definido';
        }
    };

    const getClasificacionBadgeColor = (clasificacion) => {
        switch (clasificacion?.toLowerCase()) {
            case 'organico': return '#10b981';
            case 'inorganico': return '#3b82f6';
            case 'reciclable': return '#f59e0b';
            default: return '#6b7280';
        }
    };

    const formatFecha = (fechaString) => {
        if (!fechaString) return 'No disponible';
        const fecha = new Date(fechaString);
        return fecha.toLocaleDateString('es-EC', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatConfianza = (confianza) => {
        if (!confianza) return '0%';
        return `${parseFloat(confianza).toFixed(1)}%`;
    };

    const openInGoogleMaps = () => {
        if (!tacho?.ubicacion_lat || !tacho?.ubicacion_lon) return;
        const url = `https://www.google.com/maps?q=${tacho.ubicacion_lat},${tacho.ubicacion_lon}`;
        Linking.openURL(url).catch(err =>
            Alert.alert('Error', 'No se pudo abrir Google Maps')
        );
    };

    if (loading && !refreshing) {
        return (
            <MobileLayout title="Detalle Tacho" subtitle="Cargando..." headerColor="#10B981">
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 }}>
                    <ActivityIndicator size="large" color="#10B981" />
                    <Text style={{ marginTop: 16, color: '#64748B', fontSize: 14 }}>Cargando detalle del tacho...</Text>
                </View>
            </MobileLayout>
        );
    }

    if (!tacho && error) {
        return (
            <MobileLayout title="Error" subtitle="No se pudo cargar" headerColor="#10B981">
                <View style={{ alignItems: 'center', paddingVertical: 80 }}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#CBD5E1" />
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#1E293B', marginTop: 16 }}>Error al cargar</Text>
                    <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 8 }}>{error}</Text>
                    <TouchableOpacity
                        style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#10B981', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 }}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={18} color="#FFF" />
                        <Text style={{ color: '#FFF', fontWeight: '600' }}>Volver</Text>
                    </TouchableOpacity>
                </View>
            </MobileLayout>
        );
    }

    if (!tacho) {
        return (
            <MobileLayout title="Tacho" subtitle="No encontrado" headerColor="#10B981">
                <View style={{ alignItems: 'center', paddingVertical: 80 }}>
                    <MaterialCommunityIcons name="trash-can-outline" size={64} color="#CBD5E1" />
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#1E293B', marginTop: 16 }}>Tacho no encontrado</Text>
                    <TouchableOpacity
                        style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#10B981', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 }}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={18} color="#FFF" />
                        <Text style={{ color: '#FFF', fontWeight: '600' }}>Volver</Text>
                    </TouchableOpacity>
                </View>
            </MobileLayout>
        );
    }

    const lat = Number(tacho.ubicacion_lat) || 0;
    const lon = Number(tacho.ubicacion_lon) || 0;

    // Estadísticas de detecciones
    const stats = {
        total: detecciones.length,
        altaConfianza: detecciones.filter(d => parseFloat(d.confianza_ia || 0) >= 80).length,
        confianzaPromedio: detecciones.length > 0
            ? (detecciones.reduce((acc, det) => acc + parseFloat(det.confianza_ia || 0), 0) / detecciones.length).toFixed(1)
            : 0,
        tiposUnicos: new Set(detecciones.map(d => d.clasificacion)).size,
        distribucion: {
            organico: detecciones.filter(d => d.clasificacion === 'organico').length,
            inorganico: detecciones.filter(d => d.clasificacion === 'inorganico').length,
            reciclable: detecciones.filter(d => d.clasificacion === 'reciclable').length,
            otros: detecciones.filter(d => !['organico', 'inorganico', 'reciclable'].includes(d.clasificacion)).length
        }
    };

    const estadoStyle = tacho.estado === 'activo'
        ? { backgroundColor: '#D1FAE5', color: '#065F46' }
        : tacho.estado === 'mantenimiento'
            ? { backgroundColor: '#FEF3C7', color: '#92400E' }
            : { backgroundColor: '#FEE2E2', color: '#991B1B' };

    return (
        <MobileLayout title={tacho.nombre} subtitle={`Código: ${tacho.codigo}`} headerColor="#10B981">
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#10B981"]} />
                }
            >
                {/* Header con botones */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' }}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={18} color="#1E293B" />
                        <Text style={{ fontSize: 13, fontWeight: '600', color: '#1E293B' }}>Volver</Text>
                    </TouchableOpacity>
                    {(userInfo?.rol === 'admin' || userInfo?.is_staff) && (
                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#10B981', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 }}
                            onPress={() => navigation.navigate('TachoForm', { id })}
                        >
                            <Ionicons name="create-outline" size={18} color="#FFF" />
                            <Text style={{ fontSize: 13, fontWeight: '600', color: '#FFF' }}>Editar</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Información del Tacho */}
                <View style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <LinearGradient
                            colors={["#10B981", "#059669"]}
                            style={{ width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <MaterialCommunityIcons name="trash-can" size={24} color="#FFFFFF" />
                        </LinearGradient>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 4 }}>{tacho.nombre}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Text style={{ fontSize: 13, color: '#64748B' }}><MaterialCommunityIcons name="barcode" size={14} /> {tacho.codigo}</Text>
                                <Text style={{ fontSize: 13, color: '#64748B' }}>•</Text>
                                <Text style={{ fontSize: 13, color: '#64748B' }}>ID: #{tacho.id}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Badge de estado */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 16, ...estadoStyle }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: estadoStyle.color }} />
                        <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>{getEstadoText(tacho.estado)}</Text>
                    </View>

                    {/* Grid de información */}
                    <View style={{ gap: 12 }}>
                        <View>
                            <Text style={{ fontSize: 11, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                                <MaterialCommunityIcons name="tag" size={14} /> Código
                            </Text>
                            <Text style={{ fontSize: 14, fontWeight: '500', color: '#111827' }}>{tacho.codigo}</Text>
                        </View>

                        <View>
                            <Text style={{ fontSize: 11, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                                <MaterialCommunityIcons name="battery" size={14} /> Nivel de Llenado
                            </Text>
                            <View style={{ height: 28, backgroundColor: '#F3F4F6', borderRadius: 14, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: '#E5E7EB' }}>
                                <View style={{ height: '100%', width: `${tacho.nivel_llenado || 0}%`, backgroundColor: getNivelColor(tacho.nivel_llenado), alignItems: 'center', justifyContent: 'center', borderRadius: 14 }}>
                                    <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700', textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2, letterSpacing: 0.5 }}>
                                        {tacho.nivel_llenado || 0}%
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View>
                            <Text style={{ fontSize: 11, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                                <MaterialCommunityIcons name="calendar" size={14} /> Fecha de Registro
                            </Text>
                            <Text style={{ fontSize: 14, fontWeight: '500', color: '#111827' }}>{formatFecha(tacho.created_at)}</Text>
                        </View>

                        <View>
                            <Text style={{ fontSize: 11, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                                <MaterialCommunityIcons name="map-marker" size={14} /> Coordenadas
                            </Text>
                            <Text style={{ fontSize: 14, fontWeight: '500', color: '#111827', fontFamily: 'monospace' }}>
                                {lat.toFixed(6)}, {lon.toFixed(6)}
                            </Text>
                        </View>

                        {/* Ubicación Completa */}
                        {(tacho.provincia_nombre || tacho.ciudad_nombre || tacho.canton_nombre) && (
                            <View>
                                <Text style={{ fontSize: 11, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                                    <MaterialCommunityIcons name="map-marker-radius" size={14} /> Ubicación
                                </Text>
                                <View style={{ gap: 6 }}>
                                    {tacho.provincia_nombre && (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' }} />
                                            <Text style={{ fontSize: 13, color: '#6B7280' }}>Provincia:</Text>
                                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>{tacho.provincia_nombre}</Text>
                                        </View>
                                    )}
                                    {tacho.ciudad_nombre && (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' }} />
                                            <Text style={{ fontSize: 13, color: '#6B7280' }}>Ciudad:</Text>
                                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>{tacho.ciudad_nombre}</Text>
                                        </View>
                                    )}
                                    {tacho.canton_nombre && (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' }} />
                                            <Text style={{ fontSize: 13, color: '#6B7280' }}>Cantón:</Text>
                                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>{tacho.canton_nombre}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        )}

                        {/* Tipo de Tacho */}
                        <View>
                            <Text style={{ fontSize: 11, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                                <MaterialCommunityIcons name="shape" size={14} /> Tipo
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: tacho.tipo === 'personal' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)', alignSelf: 'flex-start' }}>
                                <Text style={{ fontSize: 11, fontWeight: '700', color: tacho.tipo === 'personal' ? '#1E40AF' : '#065F46', textTransform: 'uppercase' }}>
                                    {tacho.tipo === 'personal' ? 'Personal' : 'Público / Empresa'}
                                </Text>
                            </View>
                        </View>

                        {/* Información de Empresa */}
                        {tacho.empresa_nombre && (
                            <View style={{ backgroundColor: 'rgba(249, 250, 251, 1)', borderRadius: 8, padding: 12, borderLeftWidth: 3, borderLeftColor: '#10B981' }}>
                                <Text style={{ fontSize: 11, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                                    <MaterialCommunityIcons name="office-building" size={14} /> Empresa Asociada
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' }}>
                                        <MaterialCommunityIcons name="domain" size={18} color="#FFF" />
                                    </View>
                                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827', flex: 1 }}>{tacho.empresa_nombre}</Text>
                                </View>
                            </View>
                        )}

                        {/* Usuario Encargado */}
                        <View>
                            <Text style={{ fontSize: 11, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                                <MaterialCommunityIcons name="account" size={14} /> Usuario Encargado
                            </Text>
                            {usuarioEncargado ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center' }}>
                                        <MaterialCommunityIcons name="account" size={14} color="#FFF" />
                                    </View>
                                    <View>
                                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>{usuarioEncargado.nombre}</Text>
                                        <Text style={{ fontSize: 12, color: '#6B7280' }}>{usuarioEncargado.email}</Text>
                                    </View>
                                </View>
                            ) : (
                                <Text style={{ fontSize: 14, color: '#9CA3AF', fontStyle: 'italic' }}>No asignado</Text>
                            )}
                        </View>

                        {tacho.ultima_deteccion && (
                            <View>
                                <Text style={{ fontSize: 11, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                                    <MaterialCommunityIcons name="clock-outline" size={14} /> Última Detección
                                </Text>
                                <Text style={{ fontSize: 14, fontWeight: '500', color: '#111827' }}>{formatFecha(tacho.ultima_deteccion)}</Text>
                            </View>
                        )}
                    </View>

                    {tacho.descripcion && (
                        <View style={{ marginTop: 16 }}>
                            <Text style={{ fontSize: 11, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                                <MaterialCommunityIcons name="text" size={14} /> Descripción
                            </Text>
                            <Text style={{ fontSize: 14, color: '#111827', lineHeight: 20, marginTop: 4 }}>{tacho.descripcion}</Text>
                        </View>
                    )}

                    {/* Resumen de Propiedad */}
                    <View style={{ marginTop: 16, padding: 12, backgroundColor: tacho.tipo === 'personal' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(16, 185, 129, 0.05)', borderRadius: 8, borderLeftWidth: 4, borderLeftColor: tacho.tipo === 'personal' ? '#3b82f6' : '#10b981' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: tacho.tipo === 'personal' ? '#3b82f6' : '#10b981', alignItems: 'center', justifyContent: 'center' }}>
                                <MaterialCommunityIcons name={tacho.tipo === 'personal' ? 'account' : 'office-building'} size={18} color="#FFF" />
                            </View>
                            <View>
                                <Text style={{ fontWeight: '600', fontSize: 13 }}>
                                    {tacho.tipo === 'personal' ? 'Tacho Personal' : 'Tacho Público'}
                                </Text>
                                <Text style={{ fontSize: 12, color: '#6B7280' }}>
                                    {tacho.tipo === 'personal'
                                        ? (usuarioEncargado
                                            ? `Pertenece a: ${usuarioEncargado.nombre}`
                                            : 'Sin usuario asignado')
                                        : (tacho.empresa_nombre
                                            ? `Empresa: ${tacho.empresa_nombre} ${usuarioEncargado ? `(Encargado: ${usuarioEncargado.nombre})` : ''}`
                                            : 'Empresa no definida')
                                    }
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Mapa */}
                {lat && lon && (
                    <View style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 12, flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialCommunityIcons name="map" size={20} color="#10B981" /> Ubicación en Mapa
                        </Text>
                        <View style={{ height: 300, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' }}>
                            <MapView
                                style={{ height: '100%', width: '100%' }}
                                initialRegion={{
                                    latitude: lat,
                                    longitude: lon,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                            >
                                <Marker coordinate={{ latitude: lat, longitude: lon }}>
                                    <View style={{ alignItems: 'center' }}>
                                        <View style={{ width: 42, height: 42, backgroundColor: '#10B981', borderRadius: 21, borderWidth: 3, borderColor: '#FFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 }}>
                                            <Text style={{ fontSize: 20 }}>🗑️</Text>
                                        </View>
                                    </View>
                                </Marker>
                            </MapView>
                        </View>
                        <TouchableOpacity
                            style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#10B981', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center' }}
                            onPress={openInGoogleMaps}
                        >
                            <MaterialCommunityIcons name="map-marker" size={18} color="#FFF" />
                            <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 13 }}>Ver en Google Maps</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Historial de Detecciones */}
                <View style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B' }}>
                            <MaterialCommunityIcons name="history" size={20} color="#10B981" /> Historial de Detecciones IA
                        </Text>
                        <View style={{ backgroundColor: '#3b82f6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
                            <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '700' }}>{detecciones.length}</Text>
                        </View>
                    </View>

                    {loadingDetecciones ? (
                        <View style={{ padding: 40, alignItems: 'center' }}>
                            <ActivityIndicator size="small" color="#10B981" />
                            <Text style={{ marginTop: 12, color: '#6B7280', fontSize: 13 }}>Cargando detecciones...</Text>
                        </View>
                    ) : detecciones.length === 0 ? (
                        <View style={{ padding: 40, alignItems: 'center' }}>
                            <MaterialCommunityIcons name="brain" size={48} color="#CBD5E1" />
                            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B', marginTop: 12 }}>No hay detecciones</Text>
                            <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 4 }}>Este tacho no tiene detecciones de IA registradas</Text>
                        </View>
                    ) : (
                        <>
                            {/* Mini estadísticas */}
                            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                                <View style={{ flex: 1, backgroundColor: 'rgba(241, 245, 249, 1)', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}>
                                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 2 }}>{stats.total}</Text>
                                    <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Total</Text>
                                </View>
                                <View style={{ flex: 1, backgroundColor: 'rgba(241, 245, 249, 1)', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}>
                                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 2 }}>{stats.altaConfianza}</Text>
                                    <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Alta Conf.</Text>
                                </View>
                                <View style={{ flex: 1, backgroundColor: 'rgba(241, 245, 249, 1)', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}>
                                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 2 }}>{stats.confianzaPromedio}%</Text>
                                    <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Conf. Prom.</Text>
                                </View>
                                <View style={{ flex: 1, backgroundColor: 'rgba(241, 245, 249, 1)', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}>
                                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 2 }}>{stats.tiposUnicos}</Text>
                                    <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Tipos</Text>
                                </View>
                            </View>

                            {/* Lista de detecciones */}
                            {detecciones.slice(0, 5).map((det) => {
                                const confianza = parseFloat(det.confianza_ia || 0);
                                const confianzaColor = confianza >= 80 ? '#10b981' : confianza >= 60 ? '#f59e0b' : '#ef4444';
                                return (
                                    <View key={det.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                                        <View style={{ flex: 1 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                                <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, backgroundColor: getClasificacionBadgeColor(det.clasificacion) }}>
                                                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#FFF', textTransform: 'uppercase' }}>
                                                        {getClasificacionText(det.clasificacion)}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={{ height: 20, backgroundColor: '#F1F5F9', borderRadius: 10, overflow: 'hidden', marginBottom: 4 }}>
                                                <View style={{ height: '100%', width: `${confianza}%`, backgroundColor: confianzaColor, alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}>
                                                    <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700', textShadowColor: 'rgba(0, 0, 0, 0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2, letterSpacing: 0.5 }}>
                                                        {formatConfianza(det.confianza_ia)}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text style={{ fontSize: 12, color: '#64748B' }}>{formatFecha(det.created_at)}</Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => navigation.navigate('DeteccionDetail', { id: det.id })}
                                            style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(14, 165, 233, 0.1)', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <Ionicons name="eye-outline" size={18} color="#0EA5E9" />
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}

                            {/* Distribución por tipo */}
                            {Object.entries(stats.distribucion).some(([_, count]) => count > 0) && (
                                <View style={{ marginTop: 16, gap: 8 }}>
                                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 4 }}>Distribución por Tipo</Text>
                                    {Object.entries(stats.distribucion).map(([tipo, count]) => {
                                        if (count === 0) return null;
                                        const porcentaje = detecciones.length > 0 ? ((count / detecciones.length) * 100).toFixed(1) : 0;
                                        return (
                                            <View key={tipo} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E5E7EB' }}>
                                                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: getClasificacionBadgeColor(tipo), alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                                    <MaterialCommunityIcons name="check-circle" size={14} color="#FFF" />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                        {getClasificacionText(tipo)}
                                                    </Text>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827' }}>{count}</Text>
                                                        <Text style={{ fontSize: 11, fontWeight: '600', color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 }}>
                                                            {porcentaje}%
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            )}
                        </>
                    )}
                </View>

                {/* Resumen IA */}
                {detecciones.length > 0 && (
                    <View style={{ backgroundColor: 'rgba(240, 253, 244, 1)', borderRadius: 12, borderWidth: 1, borderColor: '#86efac', padding: 16, marginBottom: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                            <View style={{ width: 32, height: 32, backgroundColor: '#10B981', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                                <MaterialCommunityIcons name="brain" size={18} color="#FFF" />
                            </View>
                            <Text style={{ fontSize: 16, fontWeight: '700', color: '#065F46' }}>Resumen de IA</Text>
                        </View>
                        <Text style={{ fontSize: 13, color: '#065F46', lineHeight: 20 }}>
                            Este tacho ha procesado <Text style={{ fontWeight: '700', color: '#111827' }}>{detecciones.length}</Text> detecciones mediante IA
                            con una confianza promedio de <Text style={{ fontWeight: '700', color: '#111827' }}>{stats.confianzaPromedio}%</Text>.
                            Última detección: <Text style={{ fontWeight: '700', color: '#111827' }}>{formatFecha(detecciones[0]?.created_at)}</Text>
                        </Text>
                        <TouchableOpacity
                            style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center', borderWidth: 1, borderColor: '#10B981' }}
                            onPress={() => navigation.navigate('DeteccionList')}
                        >
                            <MaterialCommunityIcons name="chart-bar" size={18} color="#10B981" />
                            <Text style={{ color: '#10B981', fontWeight: '600', fontSize: 13 }}>Ver Todas</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </MobileLayout>
    );
};

export default TachoDetail;
