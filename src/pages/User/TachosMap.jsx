import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { styles as globalStyles } from '../../styles/UserPortalStyles';

export default function TachosMap({ tachos, userLocation, onTachoClick }) {
    if (!userLocation) {
        return (
            <View style={[globalStyles.loadingContainer, { minHeight: 400 }]}>
                <Text style={globalStyles.emptyStateText}>Esperando ubicación...</Text>
            </View>
        );
    }

    // Lectura robusta de coordenadas (distintas claves)
    const getLat = (t) => {
        const v = t?.ubicacion_lat ?? t?.latitud ?? t?.latitude ?? t?.lat ?? t?.coord_lat ?? t?.latitud_ubicacion;
        const n = parseFloat(v);
        return isNaN(n) ? null : n;
    };
    const getLon = (t) => {
        const v = t?.ubicacion_lon ?? t?.longitud ?? t?.longitude ?? t?.lon ?? t?.lng ?? t?.coord_lon ?? t?.longitud_ubicacion;
        const n = parseFloat(v);
        return isNaN(n) ? null : n;
    };

    // Region inicial basada en el usuario
    const initialRegion = {
        latitude: userLocation.lat,
        longitude: userLocation.lon,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    return (
        <View style={styles.container}>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={initialRegion}
                showsUserLocation={true}
                showsMyLocationButton={true}
            >
                {tachos.map((tacho) => {
                    const lat = getLat(tacho);
                    const lon = getLon(tacho);
                    if (lat == null || lon == null) return null;

                    return (
                        <Marker
                            key={tacho.id}
                            coordinate={{
                                latitude: lat,
                                longitude: lon,
                            }}
                            title={tacho.nombre || tacho.codigo}
                            description={tacho.empresa_nombre || "Tacho Público"}
                            onCalloutPress={() => onTachoClick && onTachoClick(tacho)}
                        >
                            <View style={styles.markerContainer}>
                                <View style={[styles.markerIcon, { backgroundColor: tacho.estado === 'activo' ? '#10B981' : '#F59E0B' }]}>
                                    <Ionicons name="trash" size={16} color="white" />
                                </View>
                                <View style={styles.triangle} />
                            </View>
                        </Marker>
                    );
                })}
            </MapView>

            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
                    <Text style={styles.legendText}>Activo</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
                    <Text style={styles.legendText}>Lleno / Inactivo</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 500,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#E2E8F0',
        marginBottom: 24,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    markerContainer: {
        alignItems: 'center',
    },
    markerIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'white',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    triangle: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderBottomWidth: 0,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: 'rgba(0,0,0,0.2)', // simulando sombra
        marginTop: -1,
    },
    legendContainer: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 8,
        borderRadius: 12,
        flexDirection: 'row',
        gap: 12,
        elevation: 2,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1E293B',
    }
});
