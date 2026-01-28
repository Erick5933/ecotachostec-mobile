// src/pages/Detecciones/DeteccionDetail.jsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    Linking,
    Share,
    StyleSheet,
    RefreshControl,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { deteccionStyles, deteccionColors } from '../../styles/deteccionesStyles';
import { getDeteccionById } from '../../api/deteccionApi';
import { getTachoById } from '../../api/tachoApi';
import api from '../../api/axiosConfig';
// Eliminado manejo de descarga/preview de imagen analizada

const DeteccionDetail = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { id } = route.params;

    const [loading, setLoading] = useState(true);
    const [deteccion, setDeteccion] = useState(null);
    const [tacho, setTacho] = useState(null);
    const [region, setRegion] = useState(null);
    const [tachoRegion, setTachoRegion] = useState(null);
    const [mapReady, setMapReady] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Normalización de URL de imagen (para rutas relativas)
    const API_BASE = api?.defaults?.baseURL || '';
    const SERVER_ORIGIN = API_BASE.replace(/\/api\/?$/, '');
    const normalizeImageUrl = (url) => {
        if (!url) return '';
        if (typeof url !== 'string') return '';
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image')) return url;
        if (url.startsWith('/')) return `${SERVER_ORIGIN}${url}`;
        return `${SERVER_ORIGIN}/${url}`;
    };

    // Ubicación legible a partir de nombre o coordenadas
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

    const getUbicacionLegible = (d, t) => {
        const byName = d?.ubicacion_nombre || d?.canton_nombre || t?.canton_nombre;
        if (byName) return byName;
        const lat = d?.ubicacion_lat ?? t?.ubicacion_lat;
        const lon = d?.ubicacion_lon ?? t?.ubicacion_lon;
        if (lat && lon) return getUbicacionFromCoords(lat, lon);
        return 'Ubicación no disponible';
    };

    const loadDeteccion = async () => {
        try {
            const response = await getDeteccionById(id);
            const data = response.data;
            setDeteccion(data);
            console.log('📋 Detección cargada:', data);
            
            // Imagen analizada eliminada del detalle

            // Configurar región del mapa
            let hasLocation = false;

            if (data.ubicacion_lat && data.ubicacion_lon) {
                const lat = parseFloat(data.ubicacion_lat);
                const lon = parseFloat(data.ubicacion_lon);

                if (!isNaN(lat) && !isNaN(lon)) {
                    setRegion({
                        latitude: lat,
                        longitude: lon,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    });
                    hasLocation = true;
                    console.log('📍 Región de detección configurada:', { lat, lon });
                }
            }

            if (data.tacho_id) {
                await loadTachoInfo(data.tacho_id, hasLocation);
            } else if (!hasLocation) {
                setRegion({
                    latitude: -2.90055,
                    longitude: -79.00453,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                });
            }
        } catch (error) {
            console.error('❌ Error cargando detección:', error);
            Alert.alert('Error', 'No se pudo cargar la detección');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const loadTachoInfo = async (tachoId, hasDeteccionLocation) => {
        try {
            const response = await getTachoById(tachoId);
            const tachoData = response.data;
            setTacho(tachoData);
            console.log('🗑️ Tacho cargado:', tachoData);

            if (tachoData.ubicacion_lat && tachoData.ubicacion_lon) {
                const lat = parseFloat(tachoData.ubicacion_lat);
                const lon = parseFloat(tachoData.ubicacion_lon);

                if (!isNaN(lat) && !isNaN(lon)) {
                    setTachoRegion({
                        latitude: lat,
                        longitude: lon,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    });

                    if (!hasDeteccionLocation) {
                        setRegion({
                            latitude: lat,
                            longitude: lon,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        });
                    }
                    console.log('📍 Región de tacho configurada:', { lat, lon });
                }
            }
        } catch (error) {
            console.error('❌ Error cargando tacho:', error);
        }
    };

    const handleShare = async () => {
        if (!deteccion) return;

        try {
            await Share.share({
                title: `Detección: ${deteccion.nombre || 'Análisis de residuos'}`,
                message: `Detección ID: #${deteccion.id}\n\n` +
                    `Tacho: ${deteccion.tacho_nombre || tacho?.nombre || 'No especificado'}\n` +
                    `Tipo: ${deteccion.tipo_residuo || 'No especificado'}\n` +
                    `Confianza: ${confPercent || 'N/A'}%\n` +
                    `Fecha: ${formatFecha(deteccion.fecha_registro || deteccion.created_at)}`,
            });
        } catch (error) {
            console.error('Error compartiendo:', error);
        }
    };

    const openInGoogleMaps = () => {
        let lat, lon, source;

        if (deteccion?.ubicacion_lat && deteccion?.ubicacion_lon) {
            lat = parseFloat(deteccion.ubicacion_lat);
            lon = parseFloat(deteccion.ubicacion_lon);
            source = 'detección';
        } else if (tacho?.ubicacion_lat && tacho?.ubicacion_lon) {
            lat = parseFloat(tacho.ubicacion_lat);
            lon = parseFloat(tacho.ubicacion_lon);
            source = 'tacho';
        } else {
            Alert.alert('Información', 'No hay ubicación disponible para esta detección');
            return;
        }

        if (isNaN(lat) || isNaN(lon)) {
            Alert.alert('Error', 'Coordenadas inválidas');
            return;
        }

        console.log(`Abriendo ubicación del ${source}:`, { lat, lon });
        const url = `https://www.google.com/maps?q=${lat},${lon}`;
        Linking.openURL(url).catch(err =>
            Alert.alert('Error', 'No se pudo abrir Google Maps')
        );
    };

    useEffect(() => {
        loadDeteccion();
    }, [id]);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await loadDeteccion();
        } finally {
            setRefreshing(false);
        }
    };

    const getConfianzaColor = (confianza) => {
        if (!confianza) return deteccionColors.gray;
        if (confianza >= 90) return '#4CAF50';
        if (confianza >= 70) return '#FF9800';
        return '#F44336';
    };

    const normalizeConfianza = (raw) => {
        if (raw === null || raw === undefined || raw === '') return 0;
        const parsed = Number(String(raw).replace(',', '.'));
        if (Number.isNaN(parsed)) return 0;
        const percent = parsed > 1 ? parsed : parsed * 100;
        return Math.round(percent);
    };

    const formatFecha = (fecha) => {
        if (!fecha) return '—';
        try {
            const d = (typeof fecha === 'number') ? new Date(fecha) : new Date(String(fecha));
            if (Number.isNaN(d.getTime())) return '—';
            return d.toLocaleString('es-EC', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return '—';
        }
    };

    const getConfianzaLabel = (confianza) => {
        if (!confianza) return 'No disponible';
        if (confianza >= 90) return 'Alta';
        if (confianza >= 70) return 'Media';
        return 'Baja';
    };

    const getClasificacionText = (clasificacion) => {
        if (!clasificacion) return 'No definido';
        const lower = clasificacion.toLowerCase();
        // Priorizar 'inorganico' para evitar coincidir con 'organico'
        if (lower.includes('inorganico')) return 'Inorgánico';
        if (lower.includes('organico')) return 'Orgánico';
        if (lower.includes('reciclable')) return 'Reciclable';
        return clasificacion;
    };

    const getClasificacionColors = (clasificacion) => {
        const lower = (clasificacion || '').toLowerCase();
        // Priorizar 'inorganico' antes de 'organico'
        if (lower.includes('inorganico')) return { color: '#1E40AF', bg: 'rgba(59,130,246,0.12)', border: '#3b82f6' };
        if (lower.includes('organico')) return { color: '#065F46', bg: 'rgba(16,185,129,0.12)', border: '#10b981' };
        if (lower.includes('reciclable')) return { color: '#92400E', bg: 'rgba(245,158,11,0.12)', border: '#f59e0b' };
        return { color: '#6b7280', bg: 'rgba(156,163,175,0.08)', border: '#94a3b8' };
    };

    const mapRegion = region || tachoRegion || {
        latitude: -2.90055,
        longitude: -79.00453,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
    };

    const confPercent = deteccion ? normalizeConfianza(deteccion.confianza ?? deteccion.confianza_ia) : 0;

    if (loading && !refreshing) {
        return (
            <View style={deteccionStyles.loadingContainer}>
                <ActivityIndicator size="large" color={deteccionColors.primary} />
                <Text style={{ color: deteccionColors.gray, marginTop: 16 }}>
                    Cargando detalle de la detección...
                </Text>
            </View>
        );
    }

    if (!deteccion) {
        return (
            <View style={deteccionStyles.emptyContainer}>
                <Ionicons name="alert-circle-outline" size={80} color={deteccionColors.grayLight} />
                <Text style={deteccionStyles.emptyTitle}>Detección no encontrada</Text>
                <Text style={deteccionStyles.emptyText}>
                    No se pudo cargar la información de la detección
                </Text>
                <TouchableOpacity
                    style={[deteccionStyles.btn, deteccionStyles.btnPrimary, deteccionStyles.mtLg]}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={20} color={deteccionColors.white} />
                    <Text style={deteccionStyles.btnText}>Volver a la lista</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            style={deteccionStyles.container}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[deteccionColors.primary]}
                    tintColor={deteccionColors.primary}
                />
            }
        >
            {/* Header */}
            <View style={deteccionStyles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[deteccionStyles.flexRow, deteccionStyles.gapSm]}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={deteccionStyles.headerTitleContainer}>
                    <Text style={[deteccionStyles.headerTitle, { fontSize: 20 }]}>
                        Detalle de Detección
                    </Text>
                    <Text style={deteccionStyles.headerSubtitle}>
                        Análisis por inteligencia artificial
                    </Text>
                </View>
                <View style={deteccionStyles.headerActions}>
                    <TouchableOpacity
                        style={[deteccionStyles.btnIcon, { backgroundColor: 'rgba(255,255,255,0.12)' }]}
                        onPress={handleShare}
                    >
                        <Ionicons name="share-outline" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={deteccionStyles.screenContainer}>
                {/* Summary card */}
                <View style={[deteccionStyles.card, { marginBottom: 12, borderLeftWidth: 6, borderLeftColor: '#9C27B0', backgroundColor: '#FBF7FF' }]}>
                    <View style={deteccionStyles.statsRow}>
                        <View style={deteccionStyles.statCard}>
                            <Text style={deteccionStyles.statValue}>{confPercent > 0 ? `${confPercent}%` : '—'}</Text>
                            <Text style={deteccionStyles.statLabel}>Confianza IA</Text>
                        </View>

                        <View style={deteccionStyles.statCard}>
                            <Text style={[deteccionStyles.statValue, { fontSize: 22 }]}>
                                {getClasificacionText(deteccion.tipo_residuo || deteccion.clase_detectada || deteccion.clasificacion)}
                            </Text>
                            <Text style={deteccionStyles.statLabel}>Clasificación</Text>
                        </View>
                    </View>
                </View>

                {/* Información principal */}
                <View style={[deteccionStyles.card, { borderLeftColor: '#4CAF50', borderLeftWidth: 6, backgroundColor: '#F7FFF7' }]}>
                    <View style={deteccionStyles.detailHeader}>
                        <View style={{ flex: 1 }}>
                            <View style={[deteccionStyles.flexRow, deteccionStyles.gapMd, { marginBottom: 12 }]}>
                                <View style={[
                                    styles.iconContainer,
                                    { backgroundColor: 'rgba(76, 175, 80, 0.1)' }
                                ]}>
                                    <Ionicons name="analytics" size={24} color="#4CAF50" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={deteccionStyles.detailTitle}>
                                        {deteccion.nombre || `Detección #${deteccion.id}`}
                                    </Text>
                                    <Text style={deteccionStyles.detailSubtitle}>
                                        <Ionicons name="barcode-outline" size={14} /> {deteccion.codigo || 'N/A'}
                                    </Text>
                                </View>
                            </View>

                            <View style={[deteccionStyles.flexRow, deteccionStyles.gapSm, { flexWrap: 'wrap' }]}>
                                <View style={[
                                    deteccionStyles.badge,
                                    { backgroundColor: 'rgba(76, 175, 80, 0.1)' }
                                ]}>
                                    <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
                                    <Text style={[deteccionStyles.badgeText, { color: '#4CAF50', marginLeft: 4 }]}>
                                        Procesado
                                    </Text>
                                </View>

                                {confPercent > 0 && (
                                    <View style={[
                                        deteccionStyles.badge,
                                        { backgroundColor: `${getConfianzaColor(confPercent)}20` }
                                    ]}>
                                        <Text style={[
                                            deteccionStyles.badgeText,
                                            { color: getConfianzaColor(confPercent) }
                                        ]}>
                                            {getConfianzaLabel(confPercent)} Confianza
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Grid de información */}
                    <View style={deteccionStyles.detailGrid}>
                        <View style={deteccionStyles.detailItem}>
                            <Text style={deteccionStyles.detailLabel}>
                                <Ionicons name="key-outline" size={12} /> ID
                            </Text>
                            <Text style={deteccionStyles.detailValue}>#{deteccion.id}</Text>
                        </View>

                        <View style={deteccionStyles.detailItem}>
                            <Text style={deteccionStyles.detailLabel}>
                                <Ionicons name="trash-outline" size={12} /> Tacho
                            </Text>
                            <Text style={deteccionStyles.detailValue}>
                                {deteccion.tacho_nombre || tacho?.nombre || 'No especificado'}
                            </Text>
                        </View>

                        <View style={deteccionStyles.detailItem}>
                            <Text style={deteccionStyles.detailLabel}>
                                <Ionicons name="calendar-outline" size={12} /> Fecha
                            </Text>
                            <Text style={deteccionStyles.detailValue}>
                                {formatFecha(deteccion.fecha_registro || deteccion.created_at)}
                            </Text>
                        </View>

                        <View style={deteccionStyles.detailItem}>
                            <Text style={deteccionStyles.detailLabel}>
                                <Ionicons name="location-outline" size={12} /> Ubicación
                            </Text>
                            <Text style={deteccionStyles.detailValue}>
                                {getUbicacionLegible(deteccion, tacho)}
                            </Text>
                        </View>

                        {deteccion.tipo_residuo && (
                            <View style={deteccionStyles.detailItem}>
                                <Text style={deteccionStyles.detailLabel}>
                                    <Ionicons name="pricetag-outline" size={12} /> Tipo Residuo
                                </Text>
                                <Text style={deteccionStyles.detailValue}>{deteccion.tipo_residuo}</Text>
                            </View>
                        )}

                        {confPercent > 0 && (
                            <View style={deteccionStyles.detailItem}>
                                <Text style={deteccionStyles.detailLabel}>
                                    <Ionicons name="stats-chart-outline" size={12} /> Confianza
                                </Text>
                                <View style={[deteccionStyles.flexRow, deteccionStyles.gapMd, { alignItems: 'center' }]}>
                                    <View style={[
                                        deteccionStyles.levelBar,
                                        { flex: 1, height: 8, backgroundColor: deteccionColors.grayLight }
                                    ]}>
                                        <View
                                            style={{
                                                height: '100%',
                                                width: `${confPercent}%`,
                                                backgroundColor: getConfianzaColor(confPercent),
                                                borderRadius: 4,
                                            }}
                                        />
                                    </View>
                                    <Text style={[
                                        deteccionStyles.detailValue,
                                        {
                                            fontSize: 16,
                                            color: getConfianzaColor(confPercent),
                                            minWidth: 50,
                                            textAlign: 'right'
                                        }
                                    ]}>
                                        {confPercent}%
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Coordenadas */}
                    <View style={[deteccionStyles.formRow, { marginTop: 16 }]}>
                        <View style={[deteccionStyles.formCol, deteccionStyles.detailItem]}>
                            <Text style={deteccionStyles.formLabel}>
                                <Ionicons name="location-outline" size={12} /> Latitud
                            </Text>
                            <Text style={[deteccionStyles.detailValue, { fontFamily: 'monospace', fontSize: 14 }]}>
                                {deteccion.ubicacion_lat ?
                                    Number(deteccion.ubicacion_lat).toFixed(6) :
                                    (tacho?.ubicacion_lat ?
                                        Number(tacho.ubicacion_lat).toFixed(6) :
                                        'N/A'
                                    )
                                }
                            </Text>
                        </View>
                        <View style={[deteccionStyles.formCol, deteccionStyles.detailItem]}>
                            <Text style={deteccionStyles.formLabel}>
                                <Ionicons name="location-outline" size={12} /> Longitud
                            </Text>
                            <Text style={[deteccionStyles.detailValue, { fontFamily: 'monospace', fontSize: 14 }]}>
                                {deteccion.ubicacion_lon ?
                                    Number(deteccion.ubicacion_lon).toFixed(6) :
                                    (tacho?.ubicacion_lon ?
                                        Number(tacho.ubicacion_lon).toFixed(6) :
                                        'N/A'
                                    )
                                }
                            </Text>
                        </View>
                    </View>

                    {/* Descripción */}
                    {deteccion.descripcion && (
                        <View style={[deteccionStyles.detailItem, { marginTop: 16 }]}>
                            <Text style={deteccionStyles.detailLabel}>
                                <Ionicons name="document-text-outline" size={12} /> Descripción
                            </Text>
                            <Text style={[
                                deteccionStyles.detailValue,
                                {
                                    fontSize: 16,
                                    lineHeight: 24,
                                    marginTop: 8,
                                }
                            ]}>
                                {deteccion.descripcion}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Imagen Analizada */}
                {(() => {
                    const rawImg = deteccion?.imagen || deteccion?.image || deteccion?.imagen_url || deteccion?.image_url || deteccion?.preview || null;
                    const imageUri = normalizeImageUrl(rawImg);
                    if (!imageUri) return null;
                    return (
                        <View style={[deteccionStyles.card, { marginTop: 16, borderLeftWidth: 6, borderLeftColor: '#8B5CF6', backgroundColor: '#F5F3FF' }]}>                    
                            <Text style={deteccionStyles.detailSectionTitle}>
                                <Ionicons name="image-outline" size={18} /> Imagen Analizada
                            </Text>
                            <View style={styles.imageContainer}>
                                {!imageError ? (
                                    <Image
                                        source={{ uri: imageUri }}
                                        style={styles.image}
                                        resizeMode="contain"
                                        onError={() => setImageError(true)}
                                    />
                                ) : (
                                    <View style={styles.imagePlaceholder}>
                                        <Ionicons name="image-outline" size={48} color={deteccionColors.gray} />
                                        <Text style={styles.imageCaption}>No se pudo cargar la imagen</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={[styles.imageCaption, { marginTop: 8 }]}>Esta imagen fue analizada por IA para clasificar el residuo.</Text>
                        </View>
                    );
                })()}

                {/* Mapa */}
                <View style={[deteccionStyles.card, { marginTop: 16, borderLeftWidth: 6, borderLeftColor: '#4CAF50', backgroundColor: '#F7FFF7' }]}>
                    <Text style={deteccionStyles.detailSectionTitle}>
                        <Ionicons name="map-outline" size={18} /> Ubicación
                    </Text>

                    <View style={styles.mapContainer}>
                        <MapView
                            style={styles.map}
                            region={mapRegion}
                            onMapReady={() => setMapReady(true)}
                            showsUserLocation={false}
                        >
                            {region && (
                                <Marker
                                    coordinate={region}
                                    title="Detección IA"
                                    description={`Confianza: ${confPercent || 'N/A'}%`}
                                >
                                    <View style={styles.markerContainer}>
                                        <View style={[styles.marker, { backgroundColor: '#9C27B0' }]}>
                                            <Ionicons name="analytics" size={20} color="#FFFFFF" />
                                        </View>
                                    </View>
                                </Marker>
                            )}

                            {tachoRegion && (
                                <Marker
                                    coordinate={tachoRegion}
                                    title={tacho?.nombre || 'Tacho'}
                                    description={`Código: ${tacho?.codigo || 'N/A'}`}
                                >
                                    <View style={styles.markerContainer}>
                                        <View style={[styles.marker, { backgroundColor: '#4CAF50' }]}>
                                            <Ionicons name="trash" size={20} color="#FFFFFF" />
                                        </View>
                                    </View>
                                </Marker>
                            )}
                        </MapView>
                    </View>

                    {/* Leyenda */}
                    <View style={[deteccionStyles.flexRow, deteccionStyles.gapMd, { marginTop: 16 }]}>
                        {region && (
                            <View style={[deteccionStyles.flexRow, deteccionStyles.gapSm, { alignItems: 'center' }]}>
                                <View style={[styles.legendDot, { backgroundColor: '#9C27B0' }]} />
                                <Text style={styles.legendText}>Detección IA</Text>
                            </View>
                        )}
                        {tachoRegion && (
                            <View style={[deteccionStyles.flexRow, deteccionStyles.gapSm, { alignItems: 'center' }]}>
                                <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
                                <Text style={styles.legendText}>Tacho</Text>
                            </View>
                        )}
                    </View>

                    <TouchableOpacity
                        style={[deteccionStyles.btn, deteccionStyles.btnPrimary, { marginTop: 16 }]}
                        onPress={openInGoogleMaps}
                    >
                        
                        <Ionicons name="navigate" size={20} color={deteccionColors.white} />
                        <Text style={deteccionStyles.btnText}>Abrir en Google Maps</Text>
                    </TouchableOpacity>
                </View>

                {/* Información del tacho */}
                {tacho && (
                    <View style={[deteccionStyles.card, { marginTop: 16, borderLeftColor: '#4CAF50', borderLeftWidth: 6, backgroundColor: '#F7FFF7' }]}>
                        <View style={[deteccionStyles.flexRow, deteccionStyles.gapMd]}>
                            <View style={[
                                styles.iconContainer,
                                { backgroundColor: 'rgba(76, 175, 80, 0.1)' }
                            ]}>
                                <Ionicons name="trash" size={24} color="#4CAF50" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={deteccionStyles.detailSectionTitle}>
                                    Tacho Asociado
                                </Text>
                                <Text style={deteccionStyles.detailSubtitle}>
                                    {tacho.codigo} - {tacho.nombre}
                                </Text>
                            </View>
                        </View>

                        <View style={[deteccionStyles.detailGrid, { marginTop: 16 }]}>
                            <View style={deteccionStyles.detailItem}>
                                <Text style={deteccionStyles.detailLabel}>Estado</Text>
                                <View style={[deteccionStyles.flexRow, deteccionStyles.gapSm, { alignItems: 'center' }]}>
                                    <View style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: 4,
                                        backgroundColor: tacho.estado === 'activo' ? '#4CAF50' : '#F44336'
                                    }} />
                                    <Text style={[deteccionStyles.detailValue, { fontSize: 16 }]}>
                                        {tacho.estado === 'activo' ? 'Activo' : 'Inactivo'}
                                    </Text>
                                </View>
                            </View>

                            {tacho.canton_nombre && (
                                <View style={deteccionStyles.detailItem}>
                                    <Text style={deteccionStyles.detailLabel}>Cantón</Text>
                                    <Text style={deteccionStyles.detailValue}>{tacho.canton_nombre}</Text>
                                </View>
                            )}

                            {tacho.descripcion && (
                                <View style={deteccionStyles.detailItem}>
                                    <Text style={deteccionStyles.detailLabel}>Descripción</Text>
                                    <Text style={[deteccionStyles.detailValue, { fontSize: 14 }]}>
                                        {tacho.descripcion}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Botones de acción */}
                <View style={[deteccionStyles.flexRow, deteccionStyles.gapMd, { marginTop: 24, marginBottom: 32 }]}>
                    <TouchableOpacity
                        style={[deteccionStyles.btn, deteccionStyles.btnSecondary, { flex: 1 }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={20} color={deteccionColors.dark} />
                        <Text style={deteccionStyles.btnSecondaryText}>Volver</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

// Estilos específicos
const styles = StyleSheet.create({
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapContainer: {
        height: 300,
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 12,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    marker: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendText: {
        fontSize: 12,
        color: deteccionColors.gray,
    },
    imageContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 12,
        backgroundColor: deteccionColors.grayLight,
        minHeight: 250,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: 250,
    },
    imagePlaceholder: {
        width: '100%',
        height: 250,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    imageCaption: {
        fontSize: 12,
        color: deteccionColors.gray,
        fontStyle: 'italic',
        textAlign: 'center',
    },
});

export default DeteccionDetail;