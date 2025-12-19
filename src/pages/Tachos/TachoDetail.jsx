// src/pages/Tachos/TachoDetail.jsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    Linking,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { tachosStyles, colors } from '../../styles/mobileStyles';
import { getTachoById, deleteTacho } from '../../api/tachoApi';

const TachoDetail = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { id } = route.params;

    const [loading, setLoading] = useState(true);
    const [tacho, setTacho] = useState(null);
    const [region, setRegion] = useState(null);

    const loadTacho = async () => {
        try {
            const response = await getTachoById(id);
            const data = response.data;
            setTacho(data);

            // Configurar región del mapa
            if (data.ubicacion_lat && data.ubicacion_lon) {
                setRegion({
                    latitude: parseFloat(data.ubicacion_lat),
                    longitude: parseFloat(data.ubicacion_lon),
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                });
            }
        } catch (error) {
            console.error('Error cargando tacho:', error);
            Alert.alert('Error', 'No se pudo cargar el tacho');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Confirmar Eliminación',
            `¿Está seguro que desea eliminar el tacho "${tacho?.nombre}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteTacho(id);
                            Alert.alert('Éxito', 'Tacho eliminado correctamente', [
                                { text: 'OK', onPress: () => navigation.navigate('TachoList') }
                            ]);
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo eliminar el tacho');
                        }
                    },
                },
            ]
        );
    };

    const openInGoogleMaps = () => {
        if (!tacho?.ubicacion_lat || !tacho?.ubicacion_lon) return;

        const url = `https://www.google.com/maps?q=${tacho.ubicacion_lat},${tacho.ubicacion_lon}`;
        Linking.openURL(url).catch(err =>
            Alert.alert('Error', 'No se pudo abrir Google Maps')
        );
    };

    useEffect(() => {
        loadTacho();
    }, [id]);

    if (loading) {
        return (
            <View style={tachosStyles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[tachosStyles.emptyText, tachosStyles.mtMd]}>Cargando detalles...</Text>
            </View>
        );
    }

    if (!tacho) {
        return (
            <View style={tachosStyles.emptyContainer}>
                <Ionicons name="alert-circle-outline" size={80} color={colors.grayLight} />
                <Text style={tachosStyles.emptyTitle}>Tacho no encontrado</Text>
                <TouchableOpacity
                    style={[tachosStyles.btn, tachosStyles.btnPrimary, tachosStyles.mtLg]}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={20} color={colors.white} />
                    <Text style={tachosStyles.btnText}>Volver a la lista</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={tachosStyles.container}>
            {/* Header */}
            <View style={tachosStyles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[tachosStyles.flexRow, tachosStyles.gapSm]}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.dark} />
                </TouchableOpacity>

                <View style={tachosStyles.headerTitleContainer}>
                    <Text style={tachosStyles.headerTitle}>Detalle del Tacho</Text>
                </View>

                <View style={tachosStyles.headerActions}>
                    <TouchableOpacity
                        style={[tachosStyles.btnIcon, tachosStyles.btnIconEdit]}
                        onPress={() => navigation.navigate('TachoForm', { id })}
                    >
                        <Ionicons name="create-outline" size={20} color={colors.warning} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={tachosStyles.screenContainer}>
                {/* Información principal */}
                <View style={tachosStyles.card}>
                    <View style={tachosStyles.detailHeader}>
                        <View style={{ flex: 1 }}>
                            <View style={[tachosStyles.flexRow, tachosStyles.gapMd, { marginBottom: 12 }]}>
                                <View style={[tachosStyles.btnIcon, tachosStyles.btnIconPrimary]}>
                                    <Ionicons name="trash" size={24} color={colors.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={tachosStyles.detailTitle}>{tacho.nombre}</Text>
                                    <Text style={tachosStyles.detailSubtitle}>
                                        <Ionicons name="barcode-outline" size={14} /> {tacho.codigo}
                                    </Text>
                                </View>
                            </View>

                            <View style={[
                                tachosStyles.badge,
                                tachosStyles.badgeActive,
                                { alignSelf: 'flex-start' }
                            ]}>
                                <View style={tachosStyles.badgeIndicator} />
                                <Text style={tachosStyles.badgeTextActive}>
                                    {tacho.estado || 'Activo'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Grid de información */}
                    <View style={tachosStyles.detailGrid}>
                        <View style={tachosStyles.detailItem}>
                            <Text style={tachosStyles.detailLabel}>
                                <Ionicons name="key-outline" size={12} /> ID
                            </Text>
                            <Text style={tachosStyles.detailValue}>#{tacho.id}</Text>
                        </View>

                        <View style={tachosStyles.detailItem}>
                            <Text style={tachosStyles.detailLabel}>
                                <Ionicons name="calendar-outline" size={12} /> Fecha Registro
                            </Text>
                            <Text style={tachosStyles.detailValue}>
                                {new Date(tacho.fecha_registro).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </Text>
                        </View>

                        <View style={tachosStyles.detailItem}>
                            <Text style={tachosStyles.detailLabel}>
                                <Ionicons name="location-outline" size={12} /> Cantón
                            </Text>
                            <Text style={tachosStyles.detailValue}>
                                {tacho.canton_nombre || 'No asignado'}
                            </Text>
                        </View>
                    </View>

                    {/* Coordenadas */}
                    <View style={tachosStyles.formRow}>
                        <View style={[tachosStyles.formCol, tachosStyles.detailItem]}>
                            <Text style={tachosStyles.formLabel}>Latitud</Text>
                            <Text style={[tachosStyles.detailValue, { fontFamily: 'monospace' }]}>
                                {Number(tacho.ubicacion_lat)?.toFixed(6)}
                            </Text>
                        </View>
                        <View style={[tachosStyles.formCol, tachosStyles.detailItem]}>
                            <Text style={tachosStyles.formLabel}>Longitud</Text>
                            <Text style={[tachosStyles.detailValue, { fontFamily: 'monospace' }]}>
                                {Number(tacho.ubicacion_lon)?.toFixed(6)}
                            </Text>
                        </View>
                    </View>

                    {/* Descripción */}
                    {tacho.descripcion && (
                        <View style={tachosStyles.detailItem}>
                            <Text style={tachosStyles.detailLabel}>
                                <Ionicons name="document-text-outline" size={12} /> Descripción
                            </Text>
                            <Text style={[tachosStyles.detailValue, {
                                fontSize: 16,
                                lineHeight: 24,
                                marginTop: 8
                            }]}>
                                {tacho.descripcion}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Mapa */}
                {region && (
                    <View style={tachosStyles.card}>
                        <Text style={tachosStyles.detailSectionTitle}>
                            <Ionicons name="map-outline" size={18} /> Ubicación
                        </Text>

                        <View style={tachosStyles.mapContainer}>
                            <MapView style={tachosStyles.map} region={region}>
                                <Marker coordinate={region}>
                                    <View style={tachosStyles.mapMarkerContainer}>
                                        <View style={tachosStyles.mapMarker}>
                                            <Text style={tachosStyles.mapMarkerText}>🗑️</Text>
                                        </View>
                                    </View>
                                </Marker>
                            </MapView>
                        </View>

                        <TouchableOpacity
                            style={[tachosStyles.btn, tachosStyles.btnPrimary, tachosStyles.mtMd]}
                            onPress={openInGoogleMaps}
                        >
                            <Ionicons name="navigate" size={20} color={colors.white} />
                            <Text style={tachosStyles.btnText}>Abrir en Google Maps</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Botones de acción */}
                <View style={[tachosStyles.flexRow, tachosStyles.gapMd, tachosStyles.mtLg]}>
                    <TouchableOpacity
                        style={[tachosStyles.btn, tachosStyles.btnPrimary, { flex: 1 }]}
                        onPress={() => navigation.navigate('TachoForm', { id })}
                    >
                        <Ionicons name="create-outline" size={20} color={colors.white} />
                        <Text style={tachosStyles.btnText}>Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[tachosStyles.btn, tachosStyles.btnDanger, { flex: 1 }]}
                        onPress={handleDelete}
                    >
                        <Ionicons name="trash-outline" size={20} color={colors.white} />
                        <Text style={tachosStyles.btnText}>Eliminar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

export default TachoDetail;