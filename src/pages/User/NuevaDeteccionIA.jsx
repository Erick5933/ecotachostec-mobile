import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { detectWasteWithAI } from '../../api/deteccionIAApi';
import { styles as globalStyles } from '../../styles/UserPortalStyles';

export default function NuevaDeteccionIA({ userLocation, onNewDetection }) {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
            base64: true,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
            setResult(null); // Reset anterior
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Necesitamos acceso a tu cámara.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
            base64: true,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
            setResult(null);
        }
    };

    const analizarImagen = async () => {
        if (!image?.base64) return;

        try {
            setLoading(true);
            const base64Str = `data:image/jpeg;base64,${image.base64}`;
            const response = await detectWasteWithAI(base64Str);
            setResult(response);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudo analizar la imagen');
        } finally {
            setLoading(false);
        }
    };

    const guardarDeteccion = async () => {
        if (!result || !onNewDetection) return;

        try {
            setLoading(true);
            // Preparar objeto de detección
            // Asumiendo que la API devuelve { predictions: [{ class: '', confidence: 0.9 }] } o similar
            // Ajusta según la respuesta real de tu API de IA
            const mainPrediction = result.predictions?.[0] || {};

            const payload = {
                tacho: null, // Opcional
                clasificacion: mainPrediction.class || 'No identificado',
                confianza_ia: Math.round((mainPrediction.confidence || mainPrediction.score || 0) * 100),
                imagen_base64: image.base64, // Si tu backend lo soporta directo
                ubicacion_lat: userLocation?.lat,
                ubicacion_lon: userLocation?.lon,
                descripcion: `Detección manual: ${mainPrediction.class || 'Objeto'}`
            };

            await onNewDetection(payload);
            Alert.alert('¡Éxito!', 'Detección guardada correctamente.');
            setImage(null);
            setResult(null);
        } catch (error) {
            Alert.alert('Error', 'No se pudo guardar la detección.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Área de Imagen */}
            <View style={styles.imageArea}>
                {image ? (
                    <Image source={{ uri: image.uri }} style={styles.previewImage} />
                ) : (
                    <View style={styles.placeholder}>
                        <Ionicons name="image-outline" size={64} color="#CBD5E1" />
                        <Text style={styles.placeholderText}>Selecciona o captura una imagen</Text>
                    </View>
                )}

                {/* Botones de Selección */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.actionBtn} onPress={takePhoto}>
                        <Ionicons name="camera" size={24} color="#FFF" />
                        <Text style={styles.btnText}>Cámara</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#3B82F6' }]} onPress={pickImage}>
                        <Ionicons name="images" size={24} color="#FFF" />
                        <Text style={styles.btnText}>Galería</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Botón Analizar */}
            {image && !result && (
                <TouchableOpacity
                    style={[globalStyles.primaryBtn, loading && { opacity: 0.7 }]}
                    onPress={analizarImagen}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <>
                            <Ionicons name="scan-outline" size={20} color="#FFF" />
                            <Text style={globalStyles.primaryBtnText}>Analizar con IA</Text>
                        </>
                    )}
                </TouchableOpacity>
            )}

            {/* Resultado */}
            {result && (
                <View style={globalStyles.card}>
                    <View style={globalStyles.cardHeader}>
                        <Text style={globalStyles.cardTitle}>Resultado del Análisis</Text>
                    </View>
                    <View style={{ padding: 16 }}>
                        {(result.predictions || []).map((pred, i) => (
                            <View key={i} style={styles.predictionRow}>
                                <Text style={styles.predClass}>{pred.class || pred.label}</Text>
                                <View style={styles.confidenceBadge}>
                                    <Text style={styles.confidenceText}>
                                        {Math.round((pred.confidence || pred.score || 0) * 100)}%
                                    </Text>
                                </View>
                            </View>
                        ))}

                        {result.predictions?.length === 0 && (
                            <Text>No se detectaron objetos reconocibles.</Text>
                        )}

                        <TouchableOpacity
                            style={[globalStyles.primaryBtn, { marginTop: 24, backgroundColor: '#10B981' }]}
                            onPress={guardarDeteccion}
                        >
                            <Ionicons name="save-outline" size={20} color="#FFF" />
                            <Text style={globalStyles.primaryBtnText}>Guardar Detección</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageArea: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
    },
    previewImage: {
        width: '100%',
        height: 300,
        borderRadius: 12,
        marginBottom: 16,
    },
    placeholder: {
        width: '100%',
        height: 200,
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
    },
    placeholderText: {
        color: '#94A3B8',
        marginTop: 8,
        fontWeight: '500',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#EF4444', // Camera default
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    btnText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 14,
    },
    predictionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    predClass: {
        fontSize: 16,
        fontWeight: '700',
        color: '#334155',
    },
    confidenceBadge: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    confidenceText: {
        color: '#166534',
        fontWeight: '700',
        fontSize: 12,
    }
});
