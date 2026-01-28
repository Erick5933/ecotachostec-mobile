// src/pages/Tachos/TachoList.jsx
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
import { getTachos } from '../../api/tachoApi';
import api from '../../api/axiosConfig';
import { AuthContext } from '../../context/AuthContext';

const TachoList = ({ navigation }) => {
    const [tachos, setTachos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { userInfo } = useContext(AuthContext);

    useEffect(() => {
        loadTachos();
    }, []);

    const loadTachos = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getTachos();
            setTachos(response.data || []);
        } catch (error) {
            console.error('Error cargando tachos:', error);
            Alert.alert('Error', 'No se pudieron cargar los tachos');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadTachos();
    }, [loadTachos]);

    const handleSoftDelete = (id, nombre) => {
        Alert.alert(
            'Confirmar Eliminación',
            `¿Está seguro que desea eliminar el tacho "${nombre}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Borrado lógico mediante PATCH: preferir "activo: false" y caer a "estado: inactivo"
                            try {
                                await api.patch(`/tachos/${id}/`, { activo: false });
                            } catch (err) {
                                // Fallback si el backend usa 'estado' en vez de 'activo'
                                await api.patch(`/tachos/${id}/`, { estado: 'inactivo' });
                            }
                            setTachos(prev => prev.filter(t => t.id !== id));
                            Alert.alert('Éxito', 'Tacho eliminado correctamente');
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo eliminar el tacho');
                        }
                    },
                },
            ]
        );
    };

    const filteredTachos = tachos.filter((tacho) => {
        const query = searchQuery.toLowerCase();
        return (
            tacho.codigo?.toLowerCase().includes(query) ||
            tacho.nombre?.toLowerCase().includes(query) ||
            tacho.descripcion?.toLowerCase().includes(query) ||
            tacho.empresa_nombre?.toLowerCase().includes(query) ||
            tacho.estado?.toLowerCase().includes(query)
        );
    });

    const stats = {
        total: tachos.length,
        activos: tachos.filter((t) => t.estado === 'activo').length,
        inactivos: tachos.filter((t) => t.estado === 'inactivo' || t.estado === 'fuera_servicio').length,
        mantenimiento: tachos.filter((t) => t.estado === 'mantenimiento').length,
        altaCarga: tachos.filter((t) => (t.nivel_llenado || 0) >= 80).length,
        publicos: tachos.filter((t) => t.tipo === 'publico').length,
        personales: tachos.filter((t) => t.tipo === 'personal').length,
    };

    if (loading && !refreshing) {
        return (
            <MobileLayout title="Tachos" subtitle="Gestión de Tachos Inteligentes" headerColor="#10B981">
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#10B981" />
                    <Text style={{ marginTop: 16, color: '#64748B' }}>Cargando tachos...</Text>
                </View>
            </MobileLayout>
        );
    }

    return (
        <MobileLayout title="Tachos" subtitle="Gestión de Tachos Inteligentes" headerColor="#10B981">
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#10B981"]} />
                }
            >
                {/* Stats Cards */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                    <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}>
                        <MaterialCommunityIcons name="trash-can" size={24} color="#10B981" />
                        <Text style={{ fontSize: 22, fontWeight: '800', color: '#1E293B', marginTop: 6 }}>{stats.total}</Text>
                        <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '600', marginTop: 2 }}>Total</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}>
                        <MaterialCommunityIcons name="check-circle" size={24} color="#10B981" />
                        <Text style={{ fontSize: 22, fontWeight: '800', color: '#1E293B', marginTop: 6 }}>{stats.activos}</Text>
                        <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '600', marginTop: 2 }}>Activos</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}>
                        <MaterialCommunityIcons name="close-circle" size={24} color="#EF4444" />
                        <Text style={{ fontSize: 22, fontWeight: '800', color: '#1E293B', marginTop: 6 }}>{stats.inactivos}</Text>
                        <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '600', marginTop: 2 }}>Inactivos / Fuera servicio</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}>
                        <MaterialCommunityIcons name="wrench" size={24} color="#F59E0B" />
                        <Text style={{ fontSize: 22, fontWeight: '800', color: '#1E293B', marginTop: 6 }}>{stats.mantenimiento}</Text>
                        <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '600', marginTop: 2 }}>Mantenimiento</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}>
                        <MaterialCommunityIcons name="alert" size={24} color="#EF4444" />
                        <Text style={{ fontSize: 22, fontWeight: '800', color: '#1E293B', marginTop: 6 }}>{stats.altaCarga}</Text>
                        <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '600', marginTop: 2 }}>Alta carga</Text>
                    </View>
                </View>

                {/* Search Bar */}
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' }}>
                    <Ionicons name="search" size={20} color="#64748B" style={{ marginRight: 8 }} />
                    <TextInput
                        style={{ flex: 1, fontSize: 14, color: '#1E293B' }}
                        placeholder="Buscar por código, nombre..."
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

                {/* Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#1E293B' }}>Gestión de Tachos Inteligentes</Text>
                    {(userInfo?.rol === 'admin' || userInfo?.is_staff) && (
                        <TouchableOpacity
                            style={{ backgroundColor: '#10B981', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }}
                            onPress={() => navigation.navigate('TachoForm')}
                        >
                            <Ionicons name="add" size={18} color="#FFF" />
                            <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '600' }}>Nuevo</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Lista de Tachos (tarjetas) */}
                {filteredTachos.length === 0 ? (
                    <View style={{ alignItems: 'center', paddingVertical: 60, backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
                        <MaterialCommunityIcons name="trash-can-outline" size={64} color="#CBD5E1" />
                        <Text style={{ fontSize: 18, fontWeight: '700', color: '#1E293B', marginTop: 16 }}>No hay tachos</Text>
                        <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center' }}>
                            {searchQuery ? 'No se encontraron resultados' : 'No hay datos disponibles'}
                        </Text>
                    </View>
                ) : (
                    filteredTachos.map((t) => {
                        const nivel = t.nivel_llenado || 0;
                        const nivelColor = nivel >= 80 ? '#EF4444' : (nivel >= 50 ? '#F59E0B' : '#10B981');
                        const estadoLabel = t.estado === 'activo'
                            ? 'ACTIVO'
                            : t.estado === 'mantenimiento'
                                ? 'MANTENIMIENTO'
                                : t.estado === 'fuera_servicio'
                                    ? 'FUERA SERVICIO'
                                    : 'INACTIVO';
                        const estadoStyle = t.estado === 'activo'
                            ? { backgroundColor: '#D1FAE5', color: '#065F46' }
                            : t.estado === 'mantenimiento'
                                ? { backgroundColor: '#FEF3C7', color: '#92400E' }
                                : t.estado === 'fuera_servicio'
                                    ? { backgroundColor: '#FEE2E2', color: '#991B1B' }
                                    : { backgroundColor: '#FEE2E2', color: '#991B1B' };

                        return (
                            <View key={t.id} style={{ flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' }}>
                                {/* Icono */}
                                <LinearGradient
                                    colors={["#10B981", "#059669"]}
                                    style={{ width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <MaterialCommunityIcons name="trash-can" size={24} color="#FFFFFF" />
                                </LinearGradient>

                                {/* Contenido */}
                                <View style={{ flex: 1 }}>
                                    {/* Código + Estado */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B' }}>{t.codigo || 'N/A'}</Text>
                                        <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, ...estadoStyle }}>
                                            <Text style={{ fontSize: 10, fontWeight: '700' }}>{estadoLabel}</Text>
                                        </View>
                                    </View>

                                    {/* Nombre + Empresa */}
                                    <TouchableOpacity onPress={() => navigation.navigate('TachoDetail', { id: t.id })}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                            <Ionicons name="location" size={14} color="#64748B" />
                                            <Text style={{ fontSize: 13, color: '#1F2937', fontWeight: '600', flex: 1 }} numberOfLines={1}>
                                                {t.nombre || 'Sin nombre'}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>

                                    {/* Nivel de llenado */}
                                    <View style={{ height: 22, backgroundColor: '#E5E7EB', borderRadius: 11, overflow: 'hidden', marginBottom: 8 }}>
                                        <View style={{ height: '100%', width: `${nivel}%`, backgroundColor: nivelColor, alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>{nivel}%</Text>
                                        </View>
                                    </View>

                                    {/* Ubicación y Tipo */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                            <MaterialCommunityIcons name="map-marker" size={16} color="#EF4444" />
                                            <Text style={{ fontSize: 12, color: '#64748B' }}>
                                                {(t.ubicacion_lat ? Number(t.ubicacion_lat).toFixed(4) : '0.0000')}, {(t.ubicacion_lon ? Number(t.ubicacion_lon).toFixed(4) : '0.0000')}
                                            </Text>
                                        </View>
                                        {t.tipo && (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: t.tipo === 'personal' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)' }}>
                                                <Text style={{ fontSize: 11, fontWeight: '700', color: t.tipo === 'personal' ? '#1E40AF' : '#065F46', textTransform: 'uppercase' }}>
                                                    {t.tipo === 'personal' ? 'Personal' : 'Público'}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                {/* Acciones */}
                                <View style={{ flexDirection: 'row', gap: 8 }}>
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('TachoDetail', { id: t.id })}
                                        style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: 'rgba(14, 165, 233, 0.1)', justifyContent: 'center', alignItems: 'center' }}
                                    >
                                        <Ionicons name="eye-outline" size={18} color="#0EA5E9" />
                                    </TouchableOpacity>
                                    {(userInfo?.rol === 'admin' || userInfo?.is_staff) && (
                                        <TouchableOpacity
                                            onPress={() => navigation.navigate('TachoForm', { id: t.id })}
                                            style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: 'rgba(245, 158, 11, 0.1)', justifyContent: 'center', alignItems: 'center' }}
                                        >
                                            <Ionicons name="create-outline" size={18} color="#F59E0B" />
                                        </TouchableOpacity>
                                    )}
                                    {(userInfo?.rol === 'admin' || userInfo?.is_staff) && (
                                        <TouchableOpacity
                                            onPress={() => handleSoftDelete(t.id, t.codigo)}
                                            style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: 'rgba(239, 68, 68, 0.1)', justifyContent: 'center', alignItems: 'center' }}
                                        >
                                            <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        );
                    })
                )}

                {/* Info sobre eliminación lógica */}
                <View style={{ marginTop: 20, marginBottom: 20, backgroundColor: 'rgba(16, 185, 129, 0.05)', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#10B981', flexDirection: 'row', gap: 12 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' }}>
                        <MaterialCommunityIcons name="trash-can" size={20} color="#10B981" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#059669', marginBottom: 4 }}>Eliminación Lógica</Text>
                        <Text style={{ fontSize: 13, color: '#64748B', lineHeight: 20 }}>
                            Los tachos eliminados se marcan como inactivos mediante PATCH, no se borran permanentemente. Esto permite mantener el historial y reactivarlos si es necesario.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </MobileLayout>
    );
};

export default TachoList;