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
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { deteccionStyles, deteccionColors } from '../../styles/deteccionesStyles';
import { getDeteccionById } from '../../api/deteccionApi';
import { getTachoById } from '../../api/tachoApi';

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

    const loadDeteccion = async () => {
        try {
            // Cargar detección
            const response = await getDeteccionById(id);
            const data = response.data;
            setDeteccion(data);
            console.log('Detección cargada:', data);

            // Configurar región del mapa con la ubicación de la detección
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
                    console.log('Región de detección configurada:', { lat, lon });
                }
            }

            // Si la detección tiene un tacho asociado, cargar su ubicación
            if (data.tacho_id) {
                await loadTachoInfo(data.tacho_id, hasLocation);
            } else if (!hasLocation) {
                // Si no hay ubicación ni tacho, usar ubicación por defecto (Cuenca)
                setRegion({
                    latitude: -2.90055,
                    longitude: -79.00453,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                });
            }
        } catch (error) {
            console.error('Error cargando detección:', error);
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
            console.log('Tacho cargado:', tachoData);

            // Configurar región del tacho si tiene ubicación
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

                    // Si la detección no tiene ubicación, usar la del tacho como región principal
                    if (!hasDeteccionLocation) {
                        setRegion({
                            latitude: lat,
                            longitude: lon,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        });
                    }
                    console.log('Región de tacho configurada:', { lat, lon });
                }
            }
        } catch (error) {
            console.error('Error cargando información del tacho:', error);
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
                    `Confianza: ${deteccion.confianza || 'N/A'}%\n` +
                    `Fecha: ${new Date(deteccion.fecha_registro).toLocaleString('es-ES')}`,
            });
        } catch (error) {
            console.error('Error compartiendo:', error);
        }
    };

    const openInGoogleMaps = () => {
        // Priorizar ubicación de detección, si no tiene, usar ubicación del tacho
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

    const getConfianzaColor = (confianza) => {
        if (!confianza) return deteccionColors.gray;
        if (confianza >= 90) return '#4CAF50'; // Verde
        if (confianza >= 70) return '#FF9800'; // Naranja
        return '#F44336'; // Rojo
    };

    const getConfianzaLabel = (confianza) => {
        if (!confianza) return 'No disponible';
        if (confianza >= 90) return 'Alta';
        if (confianza >= 70) return 'Media';
        return 'Baja';
    };

    // Determinar qué región usar para el mapa
    const mapRegion = region || tachoRegion || {
        latitude: -2.90055,
        longitude: -79.00453,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
    };

    if (loading) {
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
        <ScrollView style={deteccionStyles.container}>
            {/* Header */}
            <View style={deteccionStyles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[deteccionStyles.flexRow, deteccionStyles.gapSm]}
                >
                    <Ionicons name="arrow-back" size={24} color={deteccionColors.dark} />
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
                        style={[deteccionStyles.btnIcon, { backgroundColor: 'rgba(33, 150, 243, 0.1)' }]}
                        onPress={handleShare}
                    >
                        <Ionicons name="share-outline" size={20} color={deteccionColors.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={deteccionStyles.screenContainer}>
                {/* Información principal */}
                <View style={[deteccionStyles.card, { borderLeftColor: '#9C27B0' }]}>
                    <View style={deteccionStyles.detailHeader}>
                        <View style={{ flex: 1 }}>
                            <View style={[deteccionStyles.flexRow, deteccionStyles.gapMd, { marginBottom: 12 }]}>
                                <View style={[
                                    styles.iconContainer,
                                    { backgroundColor: 'rgba(156, 39, 176, 0.1)' }
                                ]}>
                                    <Ionicons name="analytics" size={24} color="#9C27B0" />
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

                                {deteccion.confianza && (
                                    <View style={[
                                        deteccionStyles.badge,
                                        { backgroundColor: `${getConfianzaColor(deteccion.confianza)}20` }
                                    ]}>
                                        <Text style={[
                                            deteccionStyles.badgeText,
                                            { color: getConfianzaColor(deteccion.confianza) }
                                        ]}>
                                            {getConfianzaLabel(deteccion.confianza)} Confianza
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
                                {new Date(deteccion.fecha_registro).toLocaleString('es-ES', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
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

                        {deteccion.confianza && (
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
                                                width: `${deteccion.confianza}%`,
                                                backgroundColor: getConfianzaColor(deteccion.confianza),
                                                borderRadius: 4,
                                            }}
                                        />
                                    </View>
                                    <Text style={[
                                        deteccionStyles.detailValue,
                                        {
                                            fontSize: 16,
                                            color: getConfianzaColor(deteccion.confianza),
                                            minWidth: 50,
                                            textAlign: 'right'
                                        }
                                    ]}>
                                        {deteccion.confianza}%
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

                {/* Mapa */}
                <View style={[deteccionStyles.card, { marginTop: 16 }]}>
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
                            {/* Marcador de detección (si tiene ubicación) */}
                            {region && (
                                <Marker
                                    coordinate={region}
                                    title="Detección IA"
                                    description={`Confianza: ${deteccion.confianza || 'N/A'}%`}
                                >
                                    <View style={styles.markerContainer}>
                                        <View style={[styles.marker, { backgroundColor: '#9C27B0' }]}>
                                            <Ionicons name="analytics" size={20} color="#FFFFFF" />
                                        </View>
                                    </View>
                                </Marker>
                            )}

                            {/* Marcador del tacho (si tiene ubicación) */}
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

                {/* Imagen de la detección */}
                {deteccion.imagen && (
                    <View style={[deteccionStyles.card, { marginTop: 16 }]}>
                        <Text style={deteccionStyles.detailSectionTitle}>
                            <Ionicons name="image-outline" size={18} /> Imagen Analizada
                        </Text>

                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: deteccion.imagen }}
                                style={styles.image}
                                resizeMode="cover"
                                onError={(error) => console.log('Error cargando imagen:', error)}
                            />
                        </View>

                        <Text style={[styles.imageCaption, { marginTop: 12 }]}>
                            Imagen procesada por el sistema de inteligencia artificial
                        </Text>
                    </View>
                )}

                {/* Información del tacho */}
                {tacho && (
                    <View style={[deteccionStyles.card, { marginTop: 16, borderLeftColor: '#4CAF50' }]}>
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

                    {deteccion.imagen && (
                        <TouchableOpacity
                            style={[deteccionStyles.btn, deteccionStyles.btnPrimary, { flex: 1 }]}
                            onPress={() => {
                                if (deteccion.imagen) {
                                    Linking.openURL(deteccion.imagen).catch(err =>
                                        Alert.alert('Error', 'No se pudo abrir la imagen')
                                    );
                                }
                            }}
                        >
                            <Ionicons name="expand-outline" size={20} color={deteccionColors.white} />
                            <Text style={deteccionStyles.btnText}>Ver Imagen</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

// Estilos específicos para este componente
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
        minHeight: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: 250,
    },
    imageCaption: {
        fontSize: 12,
        color: deteccionColors.gray,
        fontStyle: 'italic',
        textAlign: 'center',
    },
});

export default DeteccionDetail;