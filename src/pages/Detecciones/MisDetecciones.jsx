import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    TextInput,
    Alert,
    Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MobileLayout from '../../components/Layout/MobileLayout';
import { getDetecciones } from '../../api/deteccionApi';
import { getTachos } from '../../api/tachoApi';
import api from '../../api/axiosConfig';
import { AuthContext } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const MisDetecciones = ({ navigation }) => {
    const { userInfo } = useContext(AuthContext);
    const userId = userInfo?.id || userInfo?.user?.id || null;
    const isAdmin = !!(userInfo?.is_staff || userInfo?.rol === 'admin');

    const [detecciones, setDetecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Normaliza URL de imagen cuando backend devuelve rutas relativas (p.ej. /media/...)
    const API_BASE = api?.defaults?.baseURL || '';
    const SERVER_ORIGIN = API_BASE.replace(/\/api\/?$/, '');
    const normalizeImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        if (url.startsWith('/')) return `${SERVER_ORIGIN}${url}`;
        return `${SERVER_ORIGIN}/${url}`;
    };

    // Muestra miniatura solo si la imagen existe; evita reservar espacio en blanco
    const Thumb = ({ uri }) => {
        const [ready, setReady] = useState(false);
        const url = normalizeImageUrl(uri);

        useEffect(() => {
            let cancelled = false;
            if (!url) {
                setReady(false);
                return;
            }
            Image.prefetch(url)
                .then(() => { if (!cancelled) setReady(true); })
                .catch(() => { if (!cancelled) setReady(false); });
            return () => { cancelled = true; };
        }, [url]);

        if (!ready) return null;
        return (
            <Image
                source={{ uri: url }}
                style={{
                    width: 80,
                    height: 80,
                    borderRadius: 12,
                    backgroundColor: '#F1F5F9',
                }}
                resizeMode="cover"
            />
        );
    };

    useEffect(() => {
        loadData();
    }, []);

    // Refrescar cada vez que la pantalla gana foco
    useFocusEffect(
        useCallback(() => {
            setRefreshing(true);
            loadData();
        }, [loadData])
    );

    // Map de tachos por id para completar info faltante
    const [tachoMap, setTachoMap] = useState(new Map());

    const getDetUserId = (d) => d.usuario ?? d.usuario_id ?? d.user ?? d.user_id ?? d.creado_por ?? d.creado_por_id ?? d.created_by ?? d.created_by_id;
    
    const getTachoId = (d) => {
        if (!d) return null;
        if (d.tacho_id) return d.tacho_id;
        if (typeof d.tacho === 'number') return d.tacho;
        if (typeof d.tacho === 'string') {
            const num = Number(d.tacho);
            return Number.isNaN(num) ? null : num;
        }
        if (d.tacho && typeof d.tacho === 'object') return d.tacho.id ?? d.tacho.tacho_id ?? null;
        return null;
    };

    const normalizeDeteccion = (det) => {
        let rawConf = det.confianza_ia ?? det.confianza ?? 0;
        let confNum = 0;
        if (rawConf !== null && rawConf !== undefined) {
            const parsed = Number(String(rawConf).replace(',', '.'));
            if (!Number.isNaN(parsed)) {
                confNum = parsed > 1 ? parsed / 100 : parsed;
            }
        }
        const tachoId = getTachoId(det);
        const tachoInfo = tachoMap.get(tachoId) || {};
        
        return {
            id: det.id,
            clase_detectada: det.clase_detectada || det.clasificacion || det.nombre || 'No identificado',
            confianza: confNum,
            tacho: det.tacho,
            tacho_id: tachoId,
            tacho_codigo: det.tacho?.codigo || det.tacho_codigo || tachoInfo.codigo,
            tacho_nombre: det.tacho?.nombre || det.tacho_nombre || tachoInfo.nombre,
            ubicacion_lat: det.ubicacion_lat,
            ubicacion_lon: det.ubicacion_lon,
            fecha_registro: det.fecha_registro || det.fecha_deteccion || det.fecha || det.created_at,
            imagen: det.imagen || det.image || det.imagen_url || null, // ✅ CLAVE PARA LAS IMÁGENES
        };
    };

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [tachosRes, detRes] = await Promise.all([getTachos(), getDetecciones()]);
            const tachosData = tachosRes.data?.results || tachosRes.data || [];
            const detData = detRes.data?.results || detRes.data || [];

            const getOwnerId = (t) => t.propietario ?? t.propietario_id ?? t.usuario ?? t.usuario_id ?? t.encargado ?? t.encargado_id;
            const getTipo = (t) => (t.tipo || '').toLowerCase();

            const userTachos = userId ? tachosData.filter(t => getOwnerId(t) === userId) : [];
            const tachosPersonales = userTachos.filter(t => getTipo(t) === 'personal');
            const tachoPersonalIds = new Set(tachosPersonales.map(t => t.id));

            // Construir map para lookup de código/nombre
            const tMap = new Map();
            tachosData.forEach(t => tMap.set(t.id, t));
            setTachoMap(tMap);

            const myDetections = detData
                .filter(det => {
                    const tId = getTachoId(det);
                    const userMatch = getDetUserId(det) === userId;
                    const tachoMatch = tId && tachoPersonalIds.has(tId);
                    return userMatch || tachoMatch;
                })
                .map(normalizeDeteccion)
                .sort((a, b) => new Date(b.fecha_registro) - new Date(a.fecha_registro)); // Ordenar por fecha

            console.log('✅ Detecciones cargadas:', myDetections.length);
            console.log('📸 Primera detección con imagen:', myDetections.find(d => d.imagen)?.imagen);

            setDetecciones(myDetections);
        } catch (error) {
            console.error('❌ Error cargando detecciones:', error);
            Alert.alert('Error', 'No se pudieron cargar tus detecciones personales');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [userId, tachoMap]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, [loadData]);

    const getCategoria = (clase) => {
        const lower = (clase || '').toLowerCase();
        // Importante: evaluar 'inorganico' ANTES que 'organico' para evitar falso positivo
        if (lower.includes('inorganico')) return 'inorganico';
        if (lower.includes('organico')) return 'organico';
        if (lower.includes('reciclable')) return 'reciclable';
        return 'general';
    };

    const getCategoriaColor = (categoria) => {
        switch (categoria) {
            case 'organico': return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10B981', border: '#10B981' };
            case 'reciclable': return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6', border: '#3B82F6' };
            case 'inorganico': return { bg: 'rgba(239, 68, 68, 0.1)', text: '#EF4444', border: '#EF4444' };
            default: return { bg: 'rgba(156, 163, 175, 0.1)', text: '#6B7280', border: '#6B7280' };
        }
    };

    const getCategoriaIcon = (categoria) => {
        switch (categoria) {
            case 'organico': return 'leaf';
            case 'reciclable': return 'recycle';
            case 'inorganico': return 'block-helper';
            default: return 'help-circle';
        }
    };

    const filteredDetecciones = detecciones.filter((deteccion) => {
        const query = searchQuery.toLowerCase();
        return (
            (deteccion.clase_detectada || '').toLowerCase().includes(query) ||
            (deteccion.tacho_codigo || '').toLowerCase().includes(query) ||
            (deteccion.tacho_nombre || '').toLowerCase().includes(query)
        );
    });

    const stats = {
        total: detecciones.length,
        organico: detecciones.filter((d) => getCategoria(d.clase_detectada) === 'organico').length,
        reciclable: detecciones.filter((d) => getCategoria(d.clase_detectada) === 'reciclable').length,
        inorganico: detecciones.filter((d) => getCategoria(d.clase_detectada) === 'inorganico').length,
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

    const formatRelativeTime = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now - d;
        const min = Math.floor(diffMs / (1000 * 60));
        const hrs = Math.floor(diffMs / (1000 * 60 * 60));
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (days <= 0) {
            if (hrs <= 0) return `Hace ${Math.max(min, 0)} min`;
            return `Hace ${hrs} h`;
        }
        if (days === 1) return 'Ayer';
        if (days < 7) return `Hace ${days} días`;
        return d.toLocaleDateString('es-EC');
    };

    if (loading && !refreshing) {
        return (
            <MobileLayout title="Mis Detecciones" subtitle="Personales">
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#10B981" />
                    <Text style={{ marginTop: 16, color: '#64748B' }}>Cargando tus detecciones...</Text>
                </View>
            </MobileLayout>
        );
    }

    return (
        <MobileLayout title="Mis Detecciones" subtitle="Personales" headerBgColor="#10B981">
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                contentContainerStyle={{ paddingBottom: 24 }}
            >
                {/* Stats Cards */}
                <View style={{ flexDirection: 'row', gap: 8, margin: 16 }}>
                    <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}>
                        <MaterialCommunityIcons name="image-search" size={22} color="#6366F1" />
                        <Text style={{ fontSize: 20, fontWeight: '800', color: '#1E293B', marginTop: 4 }}>{stats.total}</Text>
                        <Text style={{ fontSize: 9, color: '#64748B', fontWeight: '600', marginTop: 2 }}>TOTAL</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}>
                        <MaterialCommunityIcons name="leaf" size={22} color="#10B981" />
                        <Text style={{ fontSize: 20, fontWeight: '800', color: '#1E293B', marginTop: 4 }}>{stats.organico}</Text>
                        <Text style={{ fontSize: 9, color: '#64748B', fontWeight: '600', marginTop: 2 }}>ORGÁNICOS</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}>
                        <MaterialCommunityIcons name="recycle" size={22} color="#3B82F6" />
                        <Text style={{ fontSize: 20, fontWeight: '800', color: '#1E293B', marginTop: 4 }}>{stats.reciclable}</Text>
                        <Text style={{ fontSize: 9, color: '#64748B', fontWeight: '600', marginTop: 2 }}>RECICLABLES</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}>
                        <MaterialCommunityIcons name="block-helper" size={22} color="#EF4444" />
                        <Text style={{ fontSize: 20, fontWeight: '800', color: '#1E293B', marginTop: 4 }}>{stats.inorganico}</Text>
                        <Text style={{ fontSize: 9, color: '#64748B', fontWeight: '600', marginTop: 2 }}>INORGÁNICOS</Text>
                    </View>
                </View>

                {/* Search + Action */}
                <View style={{ paddingHorizontal: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
                        <Ionicons name="search" size={20} color="#64748B" style={{ marginRight: 8 }} />
                        <TextInput
                            style={{ flex: 1, fontSize: 14, color: '#1E293B' }}
                            placeholder="Buscar por material, tacho..."
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

                    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                        <TouchableOpacity
                            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3B82F6', paddingVertical: 12, borderRadius: 12 }}
                            onPress={() => navigation.navigate('DeteccionListScreen')}
                            activeOpacity={0.85}
                        >
                            <Ionicons name="camera" size={18} color="#FFF" style={{ marginRight: 8 }} />
                            <Text style={{ color: '#FFF', fontWeight: '700' }}>Nueva Detección</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#10B981', paddingVertical: 12, borderRadius: 12 }}
                            onPress={() => navigation.navigate('DeteccionEstadisticas')}
                            activeOpacity={0.85}
                        >
                            <Ionicons name="analytics" size={18} color="#FFF" style={{ marginRight: 8 }} />
                            <Text style={{ color: '#FFF', fontWeight: '700' }}>Estadísticas</Text>
                        </TouchableOpacity>
                        {isAdmin && (
                            <TouchableOpacity
                                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0EA5E9', paddingVertical: 12, borderRadius: 12 }}
                                onPress={() => navigation.navigate('DeteccionesAllList')}
                                activeOpacity={0.85}
                            >
                                <Ionicons name="list" size={18} color="#FFF" style={{ marginRight: 8 }} />
                                <Text style={{ color: '#FFF', fontWeight: '700' }}>Ver Todas</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* List */}
                <View style={{ paddingHorizontal: 16 }}>
                    {filteredDetecciones.length === 0 ? (
                        <View style={{ alignItems: 'center', paddingVertical: 60, backgroundColor: '#FFF', borderRadius: 16, paddingHorizontal: 24, borderWidth: 2, borderColor: '#E2E8F0', borderStyle: 'dashed' }}>
                            <MaterialCommunityIcons name="camera-iris" size={64} color="#3B82F6" />
                            <Text style={{ fontSize: 20, fontWeight: '800', color: '#1E293B', marginTop: 20 }}>
                                {searchQuery ? 'No se encontraron resultados' : 'Aún no tienes detecciones'}
                            </Text>
                            <Text style={{ fontSize: 15, color: '#64748B', textAlign: 'center', marginTop: 8, lineHeight: 22 }}>
                                {searchQuery 
                                    ? 'Intenta con otros términos de búsqueda' 
                                    : 'Crea una nueva detección con inteligencia artificial'}
                            </Text>
                        </View>
                    ) : (
                        filteredDetecciones.map((deteccion) => {
                            const badge = getConfidenceBadge(deteccion.confianza);
                            const categoria = getCategoria(deteccion.clase_detectada);
                            const categoriaColor = getCategoriaColor(categoria);
                            const categoriaIcon = getCategoriaIcon(categoria);
                            const tachoLabel = deteccion.tacho_nombre || deteccion.tacho_codigo || 'Tacho';

                            return (
                                <TouchableOpacity
                                    key={deteccion.id}
                                    style={{ 
                                        backgroundColor: '#FFF', 
                                        borderRadius: 16, 
                                        padding: 16, 
                                        marginBottom: 16, 
                                        borderWidth: 1, 
                                        borderColor: '#E2E8F0',
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.05,
                                        shadowRadius: 8,
                                        elevation: 2,
                                    }}
                                    onPress={() => navigation.navigate('DeteccionDetail', { id: deteccion.id })}
                                    activeOpacity={0.8}
                                >
                                    <View style={{ flexDirection: 'row', gap: 12 }}>
                                        {/* Miniatura: solo si la imagen existe (sin espacio en blanco) */}
                                        <Thumb uri={deteccion.imagen} />

                                        {/* Información */}
                                        <View style={{ flex: 1 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                                <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B', flex: 1 }} numberOfLines={1}>
                                                    {tachoLabel}
                                                </Text>
                                                <View style={{ backgroundColor: categoriaColor.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: categoriaColor.border }}>
                                                    <Text style={{ fontSize: 10, fontWeight: '700', color: categoriaColor.text }}>
                                                        {categoria.toUpperCase()}
                                                    </Text>
                                                </View>
                                            </View>

                                            <Text style={{ fontSize: 14, color: '#475569', marginBottom: 8, fontWeight: '500' }}>
                                                {deteccion.clase_detectada}
                                            </Text>

                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                    <Ionicons name="time-outline" size={14} color="#64748B" />
                                                    <Text style={{ fontSize: 12, color: '#64748B' }}>
                                                        {formatRelativeTime(deteccion.fecha_registro)}
                                                    </Text>
                                                </View>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                    <Ionicons name="stats-chart" size={14} color="#64748B" />
                                                    <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '600' }}>
                                                        {(deteccion.confianza * 100).toFixed(1)}%
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Barra de confianza */}
                                            <View style={{ height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                                                <View 
                                                    style={{ 
                                                        height: '100%', 
                                                        width: `${Math.min(100, Math.max(0, deteccion.confianza * 100))}%`, 
                                                        backgroundColor: categoriaColor.text,
                                                        borderRadius: 3,
                                                    }} 
                                                />
                                            </View>
                                        </View>
                                    </View>

                                    {/* Botones de acción */}
                                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
                                        <TouchableOpacity
                                            onPress={() => navigation.navigate('DeteccionDetail', { id: deteccion.id })}
                                            style={{ 
                                                flex: 1, 
                                                flexDirection: 'row', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                paddingVertical: 8, 
                                                paddingHorizontal: 12, 
                                                borderRadius: 8, 
                                                backgroundColor: '#EFF6FF',
                                            }}
                                        >
                                            <Ionicons name="eye" size={16} color="#3B82F6" style={{ marginRight: 6 }} />
                                            <Text style={{ color: '#3B82F6', fontWeight: '700', fontSize: 13 }}>Ver</Text>
                                        </TouchableOpacity>
                                        
                                        {(deteccion.tacho || deteccion.tacho_id) && (
                                            <TouchableOpacity
                                                onPress={() => navigation.navigate('Tachos', { 
                                                    screen: 'TachoDetail', 
                                                    params: { id: deteccion.tacho || deteccion.tacho_id } 
                                                })}
                                                style={{ 
                                                    flex: 1, 
                                                    flexDirection: 'row', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
                                                    paddingVertical: 8, 
                                                    paddingHorizontal: 12, 
                                                    borderRadius: 8, 
                                                    backgroundColor: '#ECFDF5',
                                                }}
                                            >
                                                <Ionicons name="trash-outline" size={16} color="#10B981" style={{ marginRight: 6 }} />
                                                <Text style={{ color: '#10B981', fontWeight: '700', fontSize: 13 }}>Tacho</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </View>
            </ScrollView>
        </MobileLayout>
    );
};

export default MisDetecciones;