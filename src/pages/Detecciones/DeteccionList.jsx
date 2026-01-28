// src/pages/Detecciones/DeteccionList.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    TextInput,
    Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// (no gradient used in table layout)
import MobileLayout from '../../components/Layout/MobileLayout';
import { getDetecciones, patchDeteccion } from '../../api/deteccionApi';
import { AuthContext } from '../../context/AuthContext';

const DeteccionList = ({ navigation }) => {
    const { userInfo } = useContext(AuthContext);
    const isAdmin = !!(userInfo?.is_staff || userInfo?.rol === 'admin');

    const [detecciones, setDetecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadDetecciones();
    }, []);

    const loadDetecciones = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getDetecciones();
            const items = Array.isArray(response.data) ? response.data : [];
            // Ocultar las detecciones marcadas como eliminadas o inactivas (borrado lógico)
            setDetecciones(
                items.filter((d) => !(d?.eliminado === true || d?.activo === false || d?.activo === 0))
            );
        } catch (error) {
            console.error('Error cargando detecciones:', error);
            Alert.alert('Error', 'No se pudieron cargar las detecciones');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadDetecciones();
    }, [loadDetecciones]);

    const filteredDetecciones = detecciones.filter((deteccion) => {
        const query = searchQuery.toLowerCase();
        return (
            deteccion.clase_detectada?.toLowerCase().includes(query) ||
            deteccion.tacho?.codigo?.toLowerCase().includes(query) ||
            (deteccion.nombre || '').toLowerCase().includes(query)
        );
    });
    const stats = {
        total: detecciones.length,
        alta: detecciones.filter((d) => d.confianza >= 0.8).length,
        media: detecciones.filter((d) => d.confianza >= 0.5 && d.confianza < 0.8).length,
        baja: detecciones.filter((d) => d.confianza < 0.5).length,
    };

    // Formato amigable de fecha/hora (incluye hora visible)
    const formatFechaLegible = (fechaString) => {
        if (!fechaString) return 'Fecha no disponible';
        const fecha = new Date(fechaString);
        if (isNaN(fecha.getTime())) return fechaString;
        const ahora = new Date();
        const diffMs = ahora - fecha;
        const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDias === 0) {
            const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
            if (diffHoras < 1) {
                const diffMin = Math.floor(diffMs / (1000 * 60));
                if (diffMin < 1) return 'Hace unos momentos';
                return `Hace ${diffMin} min${diffMin !== 1 ? 's' : ''}`;
            }
            return `Hace ${diffHoras} hora${diffHoras !== 1 ? 's' : ''}`;
        }
        if (diffDias === 1) {
            return `Ayer ${fecha.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}`;
        }
        if (diffDias < 7) {
            return `${fecha.toLocaleDateString('es-EC', { weekday: 'long' })} ${fecha.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}`;
        }
        return fecha.toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // Aproximar ubicación por coordenadas (similar a web)
    const getUbicacionFromCoords = (lat, lon) => {
        if (!lat || !lon) return 'Ubicación desconocida';
        const locations = [
            { provincia: 'Pichincha', ciudad: 'Quito', latRange: [-0.3, 0.1], lonRange: [-78.6, -78.4] },
            { provincia: 'Guayas', ciudad: 'Guayaquil', latRange: [-2.3, -2.1], lonRange: [-79.95, -79.85] },
            { provincia: 'Azuay', ciudad: 'Cuenca', latRange: [-2.92, -2.88], lonRange: [-79.02, -78.98] },
            { provincia: 'Manabí', ciudad: 'Manta', latRange: [-1.06, -0.98], lonRange: [-80.75, -80.65] },
            { provincia: 'El Oro', ciudad: 'Machala', latRange: [-3.28, -3.24], lonRange: [-79.97, -79.93] },
            { provincia: 'Loja', ciudad: 'Loja', latRange: [-4.02, -3.98], lonRange: [-79.22, -79.18] },
            { provincia: 'Tungurahua', ciudad: 'Ambato', latRange: [-1.28, -1.22], lonRange: [-78.65, -78.59] },
            { provincia: 'Imbabura', ciudad: 'Ibarra', latRange: [0.35, 0.39], lonRange: [-78.15, -78.11] },
            { provincia: 'Cotopaxi', ciudad: 'Latacunga', latRange: [-0.95, -0.91], lonRange: [-78.62, -78.58] },
            { provincia: 'Chimborazo', ciudad: 'Riobamba', latRange: [-1.68, -1.64], lonRange: [-78.67, -78.63] },
        ];
        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);
        for (const loc of locations) {
            if (latNum >= loc.latRange[0] && latNum <= loc.latRange[1] && lonNum >= loc.lonRange[0] && lonNum <= loc.lonRange[1]) {
                return `${loc.ciudad}, ${loc.provincia}`;
            }
        }
        if (latNum > 0) return 'Región Norte';
        if (latNum < -2) return 'Región Sur';
        if (lonNum < -80) return 'Región Costa';
        return 'Región Sierra';
    };

    const confirmDelete = (id) => {
        Alert.alert(
            'Eliminar detección',
            'Esta acción no se puede deshacer. ¿Deseas eliminarla?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Borrado lógico usando campo 'activo' si el backend lo usa
                            await patchDeteccion(id, { activo: false });
                            await loadDetecciones();
                        } catch (error) {
                            console.error('Error eliminando detección (lógico):', error);
                            Alert.alert('Error', 'No se pudo eliminar la detección');
                        }
                    }
                }
            ]
        );
    };

    const getConfidenceBadge = (confidence) => {
        if (confidence >= 0.8) {
            return { color: '#D1FAE5', textColor: '#065F46', label: 'ALTA' };
        } else if (confidence >= 0.5) {
            return { color: '#FEF3C7', textColor: '#92400E', label: 'MEDIA' };
        } else {
            return { color: '#FEE2E2', textColor: '#991B1B', label: 'BAJA' };
        }
    };

    if (loading && !refreshing) {
        return (
            <MobileLayout title="Detecciones" subtitle="Análisis con IA">
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <ActivityIndicator size="large" color="#10B981" />
                    <Text style={{ marginTop: 16, color: '#64748B' }}>Cargando detecciones...</Text>
                </View>
            </MobileLayout>
        );
    }
    return (
        <MobileLayout title="Historial de Detecciones" subtitle={isAdmin ? 'Administración' : 'Clasificación inteligente'} headerBgColor="#10B981">
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Stats Cards */}
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                    <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}>
                        <MaterialCommunityIcons name="image-search" size={22} color="#10B981" />
                        <Text style={{ fontSize: 20, fontWeight: '800', color: '#1E293B', marginTop: 4 }}>{stats.total}</Text>
                        <Text style={{ fontSize: 9, color: '#64748B', fontWeight: '600', marginTop: 2 }}>Total</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}>
                        <MaterialCommunityIcons name="check-circle" size={22} color="#10B981" />
                        <Text style={{ fontSize: 20, fontWeight: '800', color: '#1E293B', marginTop: 4 }}>{stats.alta}</Text>
                        <Text style={{ fontSize: 9, color: '#64748B', fontWeight: '600', marginTop: 2 }}>Alta</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}>
                        <MaterialCommunityIcons name="alert-circle" size={22} color="#F59E0B" />
                        <Text style={{ fontSize: 20, fontWeight: '800', color: '#1E293B', marginTop: 4 }}>{stats.media}</Text>
                        <Text style={{ fontSize: 9, color: '#64748B', fontWeight: '600', marginTop: 2 }}>Media</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}>
                        <MaterialCommunityIcons name="close-circle" size={22} color="#EF4444" />
                        <Text style={{ fontSize: 20, fontWeight: '800', color: '#1E293B', marginTop: 4 }}>{stats.baja}</Text>
                        <Text style={{ fontSize: 9, color: '#64748B', fontWeight: '600', marginTop: 2 }}>Baja</Text>
                    </View>
                </View>

                {/* Search Bar */}
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' }}>
                    <Ionicons name="search" size={20} color="#64748B" style={{ marginRight: 8 }} />
                    <TextInput
                        style={{ flex: 1, fontSize: 14, color: '#1E293B' }}
                        placeholder="Buscar por clase detectada..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#94A3B8"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#64748B" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Cards layout */}
                {filteredDetecciones.length === 0 ? (
                    <View style={{ alignItems: 'center', paddingVertical: 60, backgroundColor: '#FFF', borderRadius: 16, paddingHorizontal: 24, borderWidth: 2, borderColor: '#E2E8F0', borderStyle: 'dashed', marginHorizontal: 12 }}>
                        <MaterialCommunityIcons name="camera-iris" size={64} color="#10B981" />
                        <Text style={{ fontSize: 20, fontWeight: '800', color: '#1E293B', marginTop: 20 }}>
                            {searchQuery ? 'No se encontraron resultados' : 'Sin detecciones aún'}
                        </Text>
                        <Text style={{ fontSize: 15, color: '#64748B', textAlign: 'center', marginTop: 8, lineHeight: 22 }}>
                            {searchQuery ? 'Prueba con otros términos' : 'Realiza una detección con IA para ver aquí'}
                        </Text>
                    </View>
                ) : (
                    filteredDetecciones.map((d) => {
                        const badge = getConfidenceBadge(d.confianza ?? 0);
                        const nombre = d.nombre || d.titulo || (d.clase_detectada ? `Detección ${d.clase_detectada}` : `Detección #${d.id}`);
                        const clasificacion = d.clasificacion || d.clase_detectada || '—';
                        const tachoLabel = d.tacho_nombre || d.tacho?.nombre || d.tacho?.codigo || '—';
                        const ubicacionLabel = d.ubicacion_nombre || d.canton_nombre || (d.ubicacion_lat && d.ubicacion_lon ? getUbicacionFromCoords(d.ubicacion_lat, d.ubicacion_lon) : '—');
                        const registroRaw = d.fecha_registro || d.fecha_deteccion || d.created_at || d.fecha || '';
                        let registro = '—';
                        if (registroRaw) {
                            registro = formatFechaLegible(registroRaw);
                        }

                        return (
                            <View key={d.id} style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginHorizontal: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
                                {/* Header: nombre + badge */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A', flex: 1 }} numberOfLines={1}>{nombre}</Text>
                                    <View style={{ backgroundColor: badge.color, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                                        <Text style={{ fontSize: 10, fontWeight: '700', color: badge.textColor }}>{badge.label}</Text>
                                    </View>
                                </View>

                                {/* Fields */}
                                    <View style={{ gap: 8 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <MaterialCommunityIcons name="label-outline" size={16} color="#64748B" />
                                            <Text style={{ fontSize: 13, color: '#334155' }} numberOfLines={1}>Clasificación: <Text style={{ fontWeight: '600' }}>{clasificacion}</Text></Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <MaterialCommunityIcons name="trash-can" size={16} color="#64748B" />
                                            <Text style={{ fontSize: 13, color: '#334155' }} numberOfLines={1}>Tacho: <Text style={{ fontWeight: '600' }}>{tachoLabel}</Text></Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Ionicons name="location-outline" size={16} color="#64748B" />
                                            <Text style={{ fontSize: 13, color: '#334155' }} numberOfLines={1}>Ubicación: <Text style={{ fontWeight: '600' }}>{ubicacionLabel}</Text></Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Ionicons name="time-outline" size={16} color="#64748B" />
                                            <Text style={{ fontSize: 13, color: '#334155' }} numberOfLines={1}>Registro: <Text style={{ fontWeight: '600' }}>{registro}</Text></Text>
                                    </View>
                                </View>

                                {/* Actions */}
                                <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('DeteccionDetail', { id: d.id })}
                                        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: '#EFF6FF' }}
                                        activeOpacity={0.85}
                                    >
                                        <Ionicons name="eye" size={18} color="#3B82F6" style={{ marginRight: 8 }} />
                                        <Text style={{ color: '#3B82F6', fontWeight: '700' }}>Ver detalle</Text>
                                    </TouchableOpacity>
                                    {isAdmin && (
                                        <TouchableOpacity
                                            onPress={() => confirmDelete(d.id)}
                                            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: '#FEE2E2' }}
                                            activeOpacity={0.85}
                                        >
                                            <Ionicons name="trash" size={18} color="#991B1B" style={{ marginRight: 8 }} />
                                            <Text style={{ color: '#991B1B', fontWeight: '700' }}>Eliminar</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </MobileLayout>
    );
};

export default DeteccionList;
