// src/pages/Ubicaciones/UbicacionList.jsx
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
import { LinearGradient } from 'expo-linear-gradient';
import MobileLayout from '../../components/Layout/MobileLayout';
import { getProvincias, getCiudades, getCantones } from "../../api/ubicacionApi";
import { AuthContext } from '../../context/AuthContext';

export default function UbicacionList({ navigation }) {
    const [ubicaciones, setUbicaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { userInfo } = useContext(AuthContext);

    useEffect(() => {
        loadUbicaciones();
    }, []);

    const loadUbicaciones = useCallback(async () => {
        try {
            setLoading(true);
            
            // Cargar todos los datos
            const provinciasRes = await getProvincias();
            const ciudadesRes = await getCiudades();
            const cantonesRes = await getCantones();

            const provincias = provinciasRes.data || [];
            const ciudades = ciudadesRes.data || [];
            const cantones = cantonesRes.data || [];

            // Combinar datos como en web
            const combined = cantones.map((c) => {
                const ciudad = ciudades.find((ci) => ci.id === c.ciudad);
                const provincia = provincias.find((p) => p.id === ciudad?.provincia);

                return {
                    id: c.id,
                    provincia_nombre: provincia?.nombre || '—',
                    provincia_id: provincia?.id,
                    ciudad_nombre: ciudad?.nombre || '—',
                    ciudad_id: ciudad?.id,
                    canton_nombre: c.nombre,
                };
            });

            // Ordenar como en web
            combined.sort((a, b) => {
                if (a.provincia_nombre !== b.provincia_nombre) {
                    return a.provincia_nombre.localeCompare(b.provincia_nombre);
                }
                if (a.ciudad_nombre !== b.ciudad_nombre) {
                    return a.ciudad_nombre.localeCompare(b.ciudad_nombre);
                }
                return a.canton_nombre.localeCompare(b.canton_nombre);
            });

            setUbicaciones(combined);
        } catch (error) {
            console.error('Error cargando ubicaciones:', error);
            Alert.alert('Error', 'No se pudieron cargar las ubicaciones');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadUbicaciones();
    }, [loadUbicaciones]);

    const filteredUbicaciones = ubicaciones.filter((ubicacion) => {
        const query = searchQuery.toLowerCase();
        return (
            ubicacion.provincia_nombre?.toLowerCase().includes(query) ||
            ubicacion.ciudad_nombre?.toLowerCase().includes(query) ||
            ubicacion.canton_nombre?.toLowerCase().includes(query)
        );
    });

    const stats = {
        total: ubicaciones.length,
        provincias: [...new Set(ubicaciones.map((u) => u.provincia_id).filter(Boolean))].length,
        ciudades: [...new Set(ubicaciones.map((u) => u.ciudad_id).filter(Boolean))].length,
    };

    if (loading && !refreshing) {
        return (
            <MobileLayout title="Ubicaciones" subtitle="Gestión de ubicaciones" headerColor="#10B981">
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#10B981" />
                    <Text style={{ marginTop: 16, color: '#64748B' }}>Cargando ubicaciones...</Text>
                </View>
            </MobileLayout>
        );
    }

    return (
        <MobileLayout title="Ubicaciones" subtitle="Gestión de ubicaciones" headerColor="#10B981">
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10B981']} />
                }
            >
                {/* Stats Cards */}
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                    <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}>
                        <MaterialCommunityIcons name="map-marker" size={28} color="#10B981" />
                        <Text style={{ fontSize: 24, fontWeight: '800', color: '#1E293B', marginTop: 8 }}>{stats.total}</Text>
                        <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '600', marginTop: 4 }}>Cantones</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}>
                        <MaterialCommunityIcons name="map" size={28} color="#059669" />
                        <Text style={{ fontSize: 24, fontWeight: '800', color: '#1E293B', marginTop: 8 }}>{stats.provincias}</Text>
                        <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '600', marginTop: 4 }}>Provincias</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}>
                        <MaterialCommunityIcons name="city" size={28} color="#34D399" />
                        <Text style={{ fontSize: 24, fontWeight: '800', color: '#1E293B', marginTop: 8 }}>{stats.ciudades}</Text>
                        <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '600', marginTop: 4 }}>Ciudades</Text>
                    </View>
                </View>

                {/* Search Bar */}
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' }}>
                    <Ionicons name="search" size={20} color="#64748B" style={{ marginRight: 8 }} />
                    <TextInput
                        style={{ flex: 1, fontSize: 14, color: '#1E293B' }}
                        placeholder="Buscar por provincia, ciudad o cantón..."
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

                {/* Header con botón */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#1E293B' }}>
                        Todas las Ubicaciones
                    </Text>
                    {(userInfo?.rol === 'admin' || userInfo?.is_staff) && (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('UbicacionForm')}
                            style={{
                                backgroundColor: '#10B981',
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                                borderRadius: 8,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 6,
                            }}
                        >
                            <Ionicons name="add" size={20} color="#FFF" />
                            <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 14 }}>Nueva</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Tabla de Ubicaciones */}
                {filteredUbicaciones.length === 0 ? (
                    <View style={{ alignItems: 'center', paddingVertical: 60, backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
                        <MaterialCommunityIcons name="map-marker-outline" size={64} color="#CBD5E1" />
                        <Text style={{ fontSize: 18, fontWeight: '700', color: '#1E293B', marginTop: 16 }}>No hay ubicaciones</Text>
                        <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 8 }}>
                            {searchQuery ? 'No se encontraron resultados' : 'No hay datos disponibles'}
                        </Text>
                    </View>
                ) : (
                    <View style={{ backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' }}>
                        {/* Table Header */}
                        <LinearGradient
                            colors={['#10B981', '#059669']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{ paddingVertical: 12, paddingHorizontal: 16 }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ flex: 0.8, fontSize: 11, fontWeight: '700', color: '#FFF', textTransform: 'uppercase', letterSpacing: 0.5 }}>ID</Text>
                                <Text style={{ flex: 2, fontSize: 11, fontWeight: '700', color: '#FFF', textTransform: 'uppercase', letterSpacing: 0.5 }}>Provincia</Text>
                                <Text style={{ flex: 2, fontSize: 11, fontWeight: '700', color: '#FFF', textTransform: 'uppercase', letterSpacing: 0.5 }}>Ciudad</Text>
                                <Text style={{ flex: 2, fontSize: 11, fontWeight: '700', color: '#FFF', textTransform: 'uppercase', letterSpacing: 0.5 }}>Cantón</Text>
                                <Text style={{ flex: 1.2, fontSize: 11, fontWeight: '700', color: '#FFF', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>Acciones</Text>
                            </View>
                        </LinearGradient>

                        {/* Table Rows */}
                        {filteredUbicaciones.map((ubicacion, index) => (
                            <View
                                key={ubicacion.id || index}
                                style={{
                                    paddingVertical: 12,
                                    paddingHorizontal: 16,
                                    borderBottomWidth: index < filteredUbicaciones.length - 1 ? 1 : 0,
                                    borderBottomColor: '#E5E7EB',
                                    backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    {/* ID */}
                                    <View style={{ flex: 0.8 }}>
                                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#10B981' }}>
                                            #{ubicacion.id}
                                        </Text>
                                    </View>

                                    {/* Provincia */}
                                    <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <MaterialCommunityIcons name="map" size={16} color="#10B981" />
                                        <Text style={{ fontSize: 13, color: '#1E293B', fontWeight: '600' }}>
                                            {ubicacion.provincia_nombre}
                                        </Text>
                                    </View>

                                    {/* Ciudad */}
                                    <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <MaterialCommunityIcons name="city" size={16} color="#0EA5E9" />
                                        <Text style={{ fontSize: 13, color: '#64748B' }}>
                                            {ubicacion.ciudad_nombre}
                                        </Text>
                                    </View>

                                    {/* Cantón */}
                                    <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <MaterialCommunityIcons name="map-marker" size={16} color="#10B981" />
                                        <Text style={{ fontSize: 13, color: '#64748B' }}>
                                            {ubicacion.canton_nombre}
                                        </Text>
                                    </View>

                                    {/* Acciones (solo admin) */}
                                    <View style={{ flex: 1.2, flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                                        {(userInfo?.rol === 'admin' || userInfo?.is_staff) && (
                                            <TouchableOpacity
                                                onPress={() => navigation.navigate('UbicacionForm', { ubicacionId: ubicacion.id })}
                                                style={{
                                                    width: 34,
                                                    height: 34,
                                                    borderRadius: 8,
                                                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Ionicons name="create-outline" size={18} color="#F59E0B" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

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
                        <MaterialCommunityIcons name="map-marker" size={20} color="#10B981" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#059669', marginBottom: 4 }}>
                            Organización Geográfica
                        </Text>
                        <Text style={{ fontSize: 13, color: '#64748B', lineHeight: 20 }}>
                            Las ubicaciones están organizadas jerárquicamente: Provincia → Ciudad → Cantón. Esta estructura permite una gestión precisa de los tachos distribuidos en todo el territorio.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </MobileLayout>
    );
}
