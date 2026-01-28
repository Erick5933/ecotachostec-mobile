// src/pages/Detecciones/DeteccionList.jsx
import React, { useState, useEffect, useCallback } from 'react';
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
import { getDetecciones } from '../../api/deteccionApi';

const DeteccionList = ({ navigation }) => {
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
            setDetecciones(response.data || []);
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
            deteccion.tacho?.codigo?.toLowerCase().includes(query)
        );
    });

    const stats = {
        total: detecciones.length,
        alta: detecciones.filter((d) => d.confianza >= 0.8).length,
        media: detecciones.filter((d) => d.confianza >= 0.5 && d.confianza < 0.8).length,
        baja: detecciones.filter((d) => d.confianza < 0.5).length,
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
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#10B981" />
                    <Text style={{ marginTop: 16, color: '#64748B' }}>Cargando detecciones...</Text>
                </View>
            </MobileLayout>
        );
    }

    return (
        <MobileLayout title="Detecciones IA" subtitle="Clasificación inteligente" headerBgColor="#10B981">
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
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

                {/* Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#1E293B' }}>Detecciones IA</Text>
                </View>

                {/* Lista de Detecciones */}
                {filteredDetecciones.length === 0 ? (
                    <View style={{ alignItems: 'center', paddingVertical: 60, backgroundColor: '#FFF', borderRadius: 16, paddingHorizontal: 24, borderWidth: 2, borderColor: '#E2E8F0', borderStyle: 'dashed' }}>
                        <MaterialCommunityIcons name="camera-iris" size={64} color="#10B981" />
                        <Text style={{ fontSize: 20, fontWeight: '800', color: '#1E293B', marginTop: 20 }}>
                            {searchQuery ? 'No se encontraron resultados' : 'Comienza a Analizar'}
                        </Text>
                        <Text style={{ fontSize: 15, color: '#64748B', textAlign: 'center', marginTop: 8, lineHeight: 22 }}>
                            {searchQuery 
                                ? 'Intenta con otros términos de búsqueda' 
                                : 'Usa la pestaña "Analizar" para capturar y clasificar residuos con IA'}
                        </Text>
                    </View>
                ) : (
                    filteredDetecciones.map((deteccion) => {
                        const badge = getConfidenceBadge(deteccion.confianza);
                        return (
                            <TouchableOpacity
                                key={deteccion.id}
                                style={{ flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' }}
                                onPress={() => navigation.navigate('DeteccionDetail', { id: deteccion.id })}
                            >
                                <LinearGradient
                                    colors={['#10B981', '#059669']}
                                    style={{ width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <MaterialCommunityIcons name="camera-iris" size={24} color="#FFFFFF" />
                                </LinearGradient>

                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B', flex: 1 }} numberOfLines={1}>
                                            {deteccion.clase_detectada || 'Sin clase'}
                                        </Text>
                                        <View style={{ backgroundColor: badge.color, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                                            <Text style={{ fontSize: 10, fontWeight: '700', color: badge.textColor }}>{badge.label}</Text>
                                        </View>
                                    </View>

                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                        <Ionicons name="stats-chart" size={14} color="#64748B" />
                                        <Text style={{ fontSize: 13, color: '#64748B' }}>
                                            Confianza: {(deteccion.confianza * 100).toFixed(1)}%
                                        </Text>
                                    </View>

                                    {deteccion.tacho && (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                            <MaterialCommunityIcons name="trash-can" size={14} color="#64748B" />
                                            <Text style={{ fontSize: 13, color: '#64748B' }}>
                                                Tacho: {deteccion.tacho.codigo}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>
        </MobileLayout>
    );
};

export default DeteccionList;
