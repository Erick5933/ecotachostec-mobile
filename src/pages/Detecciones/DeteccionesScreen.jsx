import React, { useEffect, useState, useRef, useCallback, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
    RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
// Usar API legacy para compatibilidad con write/read Base64 en Expo 54
import * as FileSystem from 'expo-file-system/legacy';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import MobileLayout from '../../components/Layout/MobileLayout';
import { getDetecciones } from '../../api/deteccionApi';
import api from '../../api/axiosConfig';
import { getTachos } from '../../api/tachoApi';
import { CustomPicker } from '../../components/CustomPicker';
import { AuthContext } from '../../context/AuthContext';
import { CATEGORY_INFO, detectWasteWithAI } from '../../api/deteccionIAApi';

const DeteccionesScreen = () => {
    const navigation = useNavigation();
    const scrollViewRef = useRef(null);
    const cameraRef = useRef(null);

    // Estados
    const [detecciones, setDetecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [cameraFacing, setCameraFacing] = useState('back');
    const [capturedImage, setCapturedImage] = useState(null);
    const [analyzeLoading, setAnalyzeLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [saving, setSaving] = useState(false);
    const [tachos, setTachos] = useState([]);
    const [selectedTachoId, setSelectedTachoId] = useState("");
    const { userInfo } = useContext(AuthContext);

    // Permisos de cámara
    const [permission, requestPermission] = useCameraPermissions();

    // Cargar detecciones al montar
    useEffect(() => {
        loadDetecciones();
        loadTachosUsuario();
    }, []);

    const getOwnerId = (t) => t.propietario ?? t.propietario_id ?? t.usuario ?? t.usuario_id ?? t.encargado ?? t.encargado_id;
    const getTipo = (t) => (t.tipo || '').toLowerCase();

    const loadTachosUsuario = useCallback(async () => {
        try {
            const res = await getTachos();
            const all = res.data?.results || res.data || [];
            const userId = userInfo?.id || userInfo?.user?.id;
            const userOwned = userId ? all.filter(t => getOwnerId(t) === userId) : [];
            const personales = userOwned.filter(t => getTipo(t) === 'personal');
            const publicosAsignados = userOwned.filter(t => getTipo(t) === 'publico');
            // Mostrar personales primero y conservar coords/codigo
            const ordered = [...personales, ...publicosAsignados].map(t => ({
                id: t.id,
                nombre: `${t.nombre || t.codigo || `Tacho ${t.id}`}${(t.tipo || '').toLowerCase() === 'personal' ? ' · Personal' : ''}`,
                raw: t,
            }));
            setTachos(ordered);
        } catch (e) {
            console.warn('No se pudieron cargar tachos del usuario', e?.message);
            setTachos([]);
        }
    }, [userInfo]);

    const loadDetecciones = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getDetecciones();
            const data = [];
            
            (res.data || []).forEach((det) => {
                // Normalizar confianza a número entre 0 y 1
                let rawConf = det.confianza_ia ?? det.confianza ?? 0;
                let confNum = 0;
                if (rawConf !== null && rawConf !== undefined) {
                    const parsed = Number(String(rawConf).replace(',', '.'));
                    if (!Number.isNaN(parsed)) {
                        confNum = parsed > 1 ? parsed / 100 : parsed;
                    }
                }

                data.push({
                    id: det.id,
                    clase_detectada: det.clase_detectada || det.clasificacion || det.nombre,
                    confianza: confNum,
                    tacho: det.tacho,
                    ubicacion_lat: det.ubicacion_lat,
                    ubicacion_lon: det.ubicacion_lon,
                    fecha_registro: det.fecha_registro || det.created_at
                });
            });
            
            setDetecciones(data);
        } catch (error) {
            console.error('❌ Error cargando detecciones:', error);
            Alert.alert('Error', 'No se pudieron cargar las detecciones');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const onRefresh = useCallback(() => {
        console.log("🔄 Refrescando detecciones...");
        setRefreshing(true);
        loadDetecciones();
    }, [loadDetecciones]);

    const startCamera = async () => {
        if (!permission?.granted) {
            const { granted } = await requestPermission();
            if (!granted) {
                Alert.alert("Permiso Denegado", "Se necesita acceso a la cámara");
                return;
            }
        }
        setShowCamera(true);
    };

    const capturePhoto = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                    base64: true,
                });
                const imageData = `data:image/jpeg;base64,${photo.base64}`;
                setCapturedImage(imageData);
                setShowCamera(false);
                setResult(null);
            } catch (error) {
                console.error("Error capturando foto:", error);
                Alert.alert("Error", "No se pudo capturar la foto");
            }
        }
    };

    const pickImage = async () => {
        console.log('UI: pickImage invoked');
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permiso Denegado", "Se necesita acceso a la galería");
            return;
        }

        try {
            console.log('UI: launching image library');
            const mediaTypeImages = ImagePicker?.MediaType?.Images || ImagePicker?.MediaType?.Image || ImagePicker?.MediaTypeOptions?.Images;
            console.log('UI: mediaTypesOption', mediaTypeImages);
            const pickerOptions = { allowsEditing: false, quality: 0.8, base64: true };
            if (mediaTypeImages) pickerOptions.mediaTypes = mediaTypeImages;

            const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);

            const cancelled = result.canceled ?? result.cancelled;
            if (cancelled) return;

            const asset = result.assets?.[0] || result;
            if (!asset) return;

            if (asset.base64) {
                const mime = asset.type || 'image/jpeg';
                const imageData = `data:${mime};base64,${asset.base64}`;
                setCapturedImage(imageData);
                setResult(null);
                setShowCamera(false);
                return;
            }

            if (asset.uri) {
                try {
                    const fileBase64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: 'base64' });
                    const imageData = `data:image/jpeg;base64,${fileBase64}`;
                    setCapturedImage(imageData);
                    setResult(null);
                    setShowCamera(false);
                } catch (fsErr) {
                    console.error('Error leyendo archivo de galería:', fsErr);
                    Alert.alert('Error', 'No se pudo procesar la imagen seleccionada');
                }
            }
        } catch (err) {
            console.error('UI: error during pickImage flow:', err);
            Alert.alert('Error', 'No se pudo cargar la imagen');
        }
    };

    const handleAnalyze = async () => {
        if (!capturedImage) {
            Alert.alert("Error", "No hay imagen para analizar");
            return;
        }

        setAnalyzeLoading(true);
        setResult(null);

        try {
            const response = await detectWasteWithAI(capturedImage);

            if (!response.success && response.error) {
                Alert.alert("Error", response.error);
                return;
            }

            if (!response.success && response.no_detection) {
                setResult({
                    no_detection: true,
                    message: response.message,
                    suggestions: response.suggestions || []
                });
                setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 100);
                return;
            }

            if (response.success && response.clasificacion_principal) {
                const { categoria, confianza } = response.clasificacion_principal;
                const categoryInfo = response.category_info || CATEGORY_INFO[categoria] || CATEGORY_INFO.inorganico;

                setResult({
                    success: true,
                    categoria: categoria,
                    categoriaLabel: categoryInfo.label,
                    confianza: confianza,
                    color: categoryInfo.color,
                    bgColor: categoryInfo.bgColor,
                    icon: categoryInfo.icon,
                    descripcion: categoryInfo.descripcion || categoryInfo.description,
                    ejemplos: categoryInfo.ejemplos || categoryInfo.examples,
                    topPredicciones: response.top_predicciones || []
                });

                setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 100);
            }
        } catch (err) {
            console.error("Error crítico:", err);
            Alert.alert("Error", `Error al procesar: ${err.message}`);
        } finally {
            setAnalyzeLoading(false);
        }
    };

    const handleReset = () => {
        setCapturedImage(null);
        setResult(null);
        setShowCamera(false);
        setSelectedTachoId("");
    };

    const getClasificacion = (clase) => {
        if (!clase) return null;
        const lower = clase.toLowerCase();
        if (lower.includes('organico')) return 'organico';
        if (lower.includes('reciclable')) return 'reciclable';
        if (lower.includes('inorganico')) return 'inorganico';
        return null;
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

    const formatFecha = (fecha) => {
        if (!fecha) return '—';
        try {
            const d = (typeof fecha === 'number') ? new Date(fecha) : new Date(String(fecha));
            if (Number.isNaN(d.getTime())) return '—';
            return d.toLocaleString('es-EC', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return '—';
        }
    };

    const getIcon = (clase) => {
        const lower = clase?.toLowerCase() || '';
        if (lower.includes('inorganico')) return '🧱';
        if (lower.includes('organico')) return '🌱';
        if (lower.includes('reciclable')) return '♻️';
        return '🗑️';
    };

    const getClaseName = (clase) => {
        const lower = clase?.toLowerCase() || '';
        if (lower.includes('inorganico')) return 'Inorgánico';
        if (lower.includes('organico')) return 'Orgánico';
        if (lower.includes('reciclable')) return 'Reciclable';
        return 'General';
    };

    const handleGuardarDeteccion = async () => {
        if (!result?.success || !selectedTachoId) {
            Alert.alert('Faltan datos', 'Selecciona un tacho para guardar.');
            return;
        }
        if (!capturedImage || !capturedImage.startsWith('data:image')) {
            Alert.alert('Imagen requerida', 'Captura o selecciona una imagen antes de guardar.');
            return;
        }
        try {
            setSaving(true);
            const tachoIdNum = Number(selectedTachoId);
            const tSel = tachos.find(t => String(t.id) === String(selectedTachoId))?.raw || {};
            let lat = tSel.ubicacion_lat ?? tSel.latitud ?? tSel.latitude;
            let lon = tSel.ubicacion_lon ?? tSel.longitud ?? tSel.longitude;

            // Si el tacho no tiene coordenadas válidas, usar ubicación del dispositivo
            const latNum = lat != null ? Number(lat) : NaN;
            const lonNum = lon != null ? Number(lon) : NaN;
            if (Number.isNaN(latNum) || Number.isNaN(lonNum)) {
                try {
                    const { status } = await Location.requestForegroundPermissionsAsync();
                    if (status === 'granted') {
                        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                        lat = pos.coords.latitude;
                        lon = pos.coords.longitude;
                    }
                } catch (locErr) {
                    console.warn('No se pudo obtener ubicación del dispositivo', locErr?.message);
                }
            }

            const categoria = (result.categoria || '').toLowerCase();
            // Redondear confianza a 2 decimales y asegurar máximo 5 dígitos total
            const confianzaPorc = Number(Number(result.confianza).toFixed(2));

            // Redondear coordenadas a 6 decimales para cumplir con el serializer
            const latFmt = lat != null ? Number(Number(lat).toFixed(6)) : undefined;
            const lonFmt = lon != null ? Number(Number(lon).toFixed(6)) : undefined;

            // Construir FormData con imagen como archivo
            const fd = new FormData();
            fd.append('tacho', String(tachoIdNum));
            // Usuario opcional si está disponible
            const userId = userInfo?.id || userInfo?.user?.id;
            if (userId) fd.append('usuario', String(userId));
            fd.append('clasificacion', categoria || 'ninguno');
            fd.append('confianza_ia', String(confianzaPorc));
            if (latFmt !== undefined) fd.append('ubicacion_lat', String(latFmt));
            if (lonFmt !== undefined) fd.append('ubicacion_lon', String(lonFmt));
            fd.append('procesado', 'true');
            fd.append('activo', 'true');

            // Convertir base64 a archivo temporal y adjuntar
            const base64Data = capturedImage.split(',')[1];
            const fileUri = `${FileSystem.cacheDirectory}deteccion_${Date.now()}.jpg`;
            await FileSystem.writeAsStringAsync(fileUri, base64Data, { encoding: 'base64' });
            fd.append('imagen', { uri: fileUri, name: 'deteccion.jpg', type: 'image/jpeg' });

            await api.post('/detecciones/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            // Navegar de inmediato a Mis Detecciones y forzar refresco al enfocar
            navigation.navigate('MisDetecciones', { forceRefresh: Date.now() });
            // También refrescar listado local del historial de esta pantalla en background
            loadDetecciones();
        } catch (e) {
            console.error('Error guardando detección', e?.response?.data || e?.message);
            // Construir mensaje legible desde posibles errores de DRF
            const data = e?.response?.data;
            let msg = e?.message || 'Error al guardar';
            if (data) {
                if (typeof data === 'string') msg = data;
                else if (data.detail) msg = String(data.detail);
                else {
                    const flat = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`).join('\n');
                    if (flat) msg = flat;
                }
            }
            Alert.alert('Error', msg);
        } finally {
            setSaving(false);
        }
    };

    // Vista de cámara
    if (showCamera) {
        return (
            <View style={styles.cameraContainer}>
                <CameraView ref={cameraRef} style={styles.camera} facing={cameraFacing} />
                <View style={styles.cameraControls}>
                    <TouchableOpacity style={styles.captureBtn} onPress={capturePhoto}>
                        <View style={styles.captureDot} />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCamera(false)}>
                    <Ionicons name="close" size={32} color="#fff" />
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <MobileLayout title="Detecciones IA" subtitle="Clasificación inteligente" headerBgColor="#10B981">
            <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
            >
                {/* SISTEMA DE CLASIFICACIÓN */}
                <View style={styles.infoCard}>
                    <View style={styles.iconCircle}>
                        <Text style={styles.iconText}>IA</Text>
                    </View>
                    <Text style={styles.infoTitle}>Sistema de Clasificación</Text>
                    <Text style={styles.infoSubtitle}>
                        Clasificación automática de residuos mediante inteligencia artificial
                    </Text>
                </View>

                {/* BOTONES PRINCIPALES */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.cameraButton} onPress={startCamera}>
                        <Ionicons name="camera" size={28} color="#fff" />
                        <Text style={styles.buttonText}>Abrir Cámara</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                        <Ionicons name="image" size={28} color="#fff" />
                        <Text style={styles.buttonText}>Subir Imagen</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('MisDetecciones')}>
                        <Ionicons name="list" size={20} color="#10b981" />
                        <Text style={styles.linkButtonText}>Mis Detecciones Personales</Text>
                    </TouchableOpacity>
                </View>

                {/* IMAGEN CAPTURADA */}
                {capturedImage && (
                    <View style={styles.imageSection}>
                        <Text style={styles.sectionTitle}>Imagen Capturada</Text>
                        <View style={styles.imageWrapper}>
                            <Image source={{ uri: capturedImage }} style={styles.capturedImage} resizeMode="contain" />
                        </View>

                        <View style={styles.imageActions}>
                            <TouchableOpacity 
                                style={styles.analyzeButton} 
                                onPress={handleAnalyze}
                                disabled={analyzeLoading}
                            >
                                {analyzeLoading ? (
                                    <>
                                        <ActivityIndicator color="#fff" size="small" />
                                        <Text style={styles.buttonText}>Analizando...</Text>
                                    </>
                                ) : (
                                    <>
                                        <Ionicons name="flash" size={22} color="#fff" />
                                        <Text style={styles.buttonText}>Analizar con IA</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                                <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                <Text style={[styles.buttonText, { color: "#ef4444" }]}>Eliminar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* RESULTADOS */}
                {result?.success && (
                    <View style={styles.resultsSection}>
                        <Text style={styles.sectionTitle}>Resultado del Análisis</Text>
                        
                        <View style={[styles.resultCard, { backgroundColor: result.bgColor, borderColor: result.color }]}>
                            <View style={styles.resultHeader}>
                                <Text style={styles.resultIcon}>{result.icon}</Text>
                                <View style={styles.resultInfo}>
                                    <Text style={[styles.resultCategory, { color: result.color }]}>
                                        {result.categoriaLabel}
                                    </Text>
                                    <Text style={[styles.resultConfidence, { color: result.color }]}>
                                        {Math.round(result.confianza)}% Confianza
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${result.confianza}%`, backgroundColor: result.color }]} />
                            </View>

                            <Text style={styles.resultDescription}>{result.descripcion}</Text>
                            <Text style={styles.resultExamples}>Ejemplos: {result.ejemplos}</Text>
                        </View>

                        {result.topPredicciones && result.topPredicciones.length > 0 && (
                            <View style={styles.predictionsSection}>
                                <Text style={styles.predictionsTitle}>Predicciones Principales</Text>
                                {result.topPredicciones.slice(0, 3).map((pred, idx) => {
                                    const catInfo = CATEGORY_INFO[pred.categoria.toLowerCase()] || CATEGORY_INFO.inorganico;
                                    return (
                                        <View key={idx} style={[styles.predictionCard, { backgroundColor: catInfo.bgColor, borderColor: catInfo.color }]}>
                                            <View style={styles.predictionHeader}>
                                                <Text style={styles.predictionIcon}>{catInfo.icon}</Text>
                                                <Text style={styles.predictionLabel}>{catInfo.label}</Text>
                                                <Text style={[styles.predictionConfidence, { color: catInfo.color }]}>
                                                    {Math.round(pred.confianza)}%
                                                </Text>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        )}

                        {/* GUARDAR DETECCIÓN */}
                        <View style={{ marginTop: 12, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 12 }}>
                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 8 }}>Guardar en</Text>
                            <CustomPicker
                                value={selectedTachoId}
                                onValueChange={setSelectedTachoId}
                                items={tachos}
                                placeholder={tachos.length ? 'Selecciona uno de tus tachos' : 'Sin tachos disponibles'}
                                disabled={!tachos.length}
                            />
                            <TouchableOpacity
                                onPress={handleGuardarDeteccion}
                                disabled={!selectedTachoId || saving}
                                style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: !selectedTachoId || saving ? '#94A3B8' : '#10B981', padding: 14, borderRadius: 12 }}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="save" size={18} color="#fff" style={{ marginRight: 8 }} />
                                        <Text style={{ color: '#fff', fontWeight: '700' }}>Guardar Detección</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.newAnalysisButton} onPress={handleReset}>
                            <Ionicons name="refresh" size={22} color="#fff" />
                            <Text style={styles.buttonText}>Nuevo Análisis</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* ERROR / NO DETECCIÓN */}
                {result?.no_detection && (
                    <View style={styles.errorSection}>
                        <View style={styles.errorCard}>
                            <Ionicons name="information-circle" size={48} color="#f59e0b" />
                            <Text style={styles.errorTitle}>No se detectaron objetos</Text>
                            <Text style={styles.errorMessage}>{result.message}</Text>
                            
                            {result.suggestions && result.suggestions.length > 0 && (
                                <View style={styles.suggestions}>
                                    <Text style={styles.suggestionsTitle}>Sugerencias:</Text>
                                    {result.suggestions.map((sug, idx) => (
                                        <Text key={idx} style={styles.suggestionItem}>• {sug}</Text>
                                    ))}
                                </View>
                            )}

                            <TouchableOpacity style={styles.retryButton} onPress={handleReset}>
                                <Ionicons name="refresh" size={22} color="#fff" />
                                <Text style={styles.buttonText}>Intentar de Nuevo</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* DIVISOR */}
                <View style={{ height: 1, backgroundColor: '#E2E8F0', marginVertical: 24 }} />

                {/* HISTORIAL DE DETECCIONES */}
                <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <MaterialCommunityIcons name="history" size={24} color="#10B981" />
                        <Text style={{ fontSize: 18, fontWeight: '700', color: '#1E293B' }}>
                            Historial de Detecciones
                        </Text>
                    </View>

                    {loading ? (
                        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                            <ActivityIndicator size="large" color="#10B981" />
                        </View>
                    ) : detecciones.length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="inbox" size={48} color="#94A3B8" />
                            <Text style={styles.emptyTitle}>Sin detecciones</Text>
                            <Text style={styles.emptySubtitle}>
                                No hay detecciones registradas en la base de datos
                            </Text>
                        </View>
                    ) : (
                        <View style={{ gap: 12 }}>
                            {detecciones.slice().reverse().map((det) => {
                                const badge = getConfidenceBadge(det.confianza);
                                const confPercent = Math.round((Number(det.confianza) || 0) * 100);

                                return (
                                    <TouchableOpacity
                                        key={det.id}
                                        style={styles.detectionCard}
                                        onPress={() => navigation.navigate('DeteccionDetail', { id: det.id })}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.cardHeader}>
                                            <View style={styles.cardIconContainer}>
                                                <LinearGradient
                                                    colors={['#10B981', '#059669']}
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 1, y: 1 }}
                                                    style={styles.cardIconGradient}
                                                >
                                                    <MaterialCommunityIcons name="camera-iris" size={24} color="#FFFFFF" />
                                                </LinearGradient>
                                            </View>

                                            <View style={styles.cardTitle}>
                                                <Text style={styles.cardClaseName} numberOfLines={1}>
                                                    {det.clase_detectada || 'Sin clase'}
                                                </Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                                    <Text>{getIcon(det.clase_detectada)}</Text>
                                                    <Text style={styles.cardClaseType}>
                                                        {getClaseName(det.clase_detectada)}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View style={[styles.confidenceBadge, { backgroundColor: badge.color }]}>
                                                <Text style={[styles.confidenceBadgeText, { color: badge.textColor }]}>
                                                    {badge.label}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.cardDivider} />

                                        <View style={styles.cardContent}>
                                            {/* Confianza */}
                                            <View style={styles.contentRow}>
                                                <View style={styles.contentLabel}>
                                                    <Ionicons name="stats-chart" size={16} color="#10B981" />
                                                    <Text style={styles.contentLabelText}>Confianza</Text>
                                                </View>
                                                <Text style={styles.contentValue}>{confPercent}%</Text>
                                            </View>

                                            {/* Tacho */}
                                            <View style={styles.contentRow}>
                                                <View style={styles.contentLabel}>
                                                    <MaterialCommunityIcons name="trash-can" size={16} color="#10B981" />
                                                    <Text style={styles.contentLabelText}>Tacho</Text>
                                                </View>
                                                <Text style={styles.contentValue}>
                                                    {det.tacho?.nombre || det.tacho?.codigo || 'Sin tacho'}
                                                </Text>
                                            </View>

                                            {/* Ubicación */}
                                            {(det.ubicacion_lat && det.ubicacion_lon) && (
                                                <View style={styles.contentRow}>
                                                    <View style={styles.contentLabel}>
                                                        <Ionicons name="location" size={16} color="#10B981" />
                                                        <Text style={styles.contentLabelText}>Ubicación</Text>
                                                    </View>
                                                    <Text style={[styles.contentValue, { fontSize: 12 }]} numberOfLines={1}>
                                                        {Number(det.ubicacion_lat).toFixed(3)}, {Number(det.ubicacion_lon).toFixed(3)}
                                                    </Text>
                                                </View>
                                            )}

                                            {/* Fecha */}
                                            <View style={styles.contentRow}>
                                                <View style={styles.contentLabel}>
                                                    <Ionicons name="calendar" size={16} color="#10B981" />
                                                    <Text style={styles.contentLabelText}>Registro</Text>
                                                </View>
                                                <Text style={styles.contentValue}>
                                                    {formatFecha(det.fecha_registro)}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.cardFooter}>
                                            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </View>
            </ScrollView>
        </MobileLayout>
    );
};

const styles = StyleSheet.create({
    infoCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 32,
        alignItems: "center",
        marginBottom: 20,
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: "#10b981"
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#10b981",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16
    },
    iconText: {
        fontSize: 36,
        fontWeight: "700",
        color: "#fff"
    },
    infoTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#111827",
        marginBottom: 8,
        textAlign: "center"
    },
    infoSubtitle: {
        fontSize: 15,
        color: "#6b7280",
        textAlign: "center",
        lineHeight: 22
    },
    actionButtons: {
        gap: 12,
        marginBottom: 20
    },
    cameraButton: {
        backgroundColor: "#10b981",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: 18,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    uploadButton: {
        backgroundColor: "#374151",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: 18,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    linkButton: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#10b981",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: 14,
        borderRadius: 12
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff"
    },
    linkButtonText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#10b981"
    },
    imageSection: {
        marginBottom: 20
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 12
    },
    imageWrapper: {
        backgroundColor: "#000",
        borderRadius: 12,
        borderWidth: 3,
        borderColor: "#10b981",
        overflow: "hidden",
        height: 300,
        marginBottom: 16
    },
    capturedImage: {
        width: "100%",
        height: "100%"
    },
    imageActions: {
        gap: 12
    },
    analyzeButton: {
        backgroundColor: "#10b981",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: 16,
        borderRadius: 12
    },
    resetButton: {
        backgroundColor: "#fff",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#ef4444"
    },
    resultsSection: {
        marginTop: 20
    },
    resultCard: {
        padding: 20,
        borderRadius: 12,
        borderWidth: 2,
        marginBottom: 16
    },
    resultHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 12
    },
    resultIcon: {
        fontSize: 40
    },
    resultInfo: {
        flex: 1
    },
    resultCategory: {
        fontSize: 24,
        fontWeight: "800",
        marginBottom: 4
    },
    resultConfidence: {
        fontSize: 14,
        fontWeight: "700"
    },
    progressBar: {
        width: "100%",
        height: 10,
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        borderRadius: 5,
        overflow: "hidden",
        marginBottom: 12
    },
    progressFill: {
        height: "100%"
    },
    resultDescription: {
        fontSize: 14,
        color: "#374151",
        marginBottom: 8,
        lineHeight: 20,
        fontWeight: "500"
    },
    resultExamples: {
        fontSize: 13,
        color: "#6b7280",
        lineHeight: 20
    },
    predictionsSection: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#e5e7eb",
        marginBottom: 16
    },
    predictionsTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 12
    },
    predictionCard: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 2,
        marginBottom: 8
    },
    predictionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8
    },
    predictionIcon: {
        fontSize: 24
    },
    predictionLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: "600",
        color: "#374151"
    },
    predictionConfidence: {
        fontSize: 14,
        fontWeight: "700"
    },
    newAnalysisButton: {
        backgroundColor: "#10b981",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: 16,
        borderRadius: 12
    },
    errorSection: {
        marginTop: 20
    },
    errorCard: {
        backgroundColor: "#fef3c7",
        borderRadius: 12,
        padding: 24,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#fbbf24"
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#92400e",
        marginTop: 16,
        marginBottom: 12
    },
    errorMessage: {
        fontSize: 15,
        color: "#6b7280",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 16
    },
    suggestions: {
        width: "100%",
        marginBottom: 20
    },
    suggestionsTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#374151",
        marginBottom: 10
    },
    suggestionItem: {
        fontSize: 13,
        color: "#6b7280",
        lineHeight: 22,
        marginBottom: 6
    },
    retryButton: {
        backgroundColor: "#10b981",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: 16,
        borderRadius: 12,
        width: "100%"
    },
    cameraContainer: {
        flex: 1,
        backgroundColor: "#000"
    },
    camera: {
        flex: 1
    },
    cameraControls: {
        position: "absolute",
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: "center"
    },
    captureBtn: {
        width: 75,
        height: 75,
        borderRadius: 37.5,
        borderWidth: 4,
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        justifyContent: "center",
        alignItems: "center"
    },
    captureDot: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        backgroundColor: "#10b981"
    },
    cancelBtn: {
        position: "absolute",
        top: 50,
        right: 20,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        padding: 12,
        borderRadius: 50
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
        backgroundColor: '#FFF',
        borderRadius: 16,
        paddingHorizontal: 24,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed'
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        marginTop: 16
    },
    emptySubtitle: {
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20
    },
    detectionCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12
    },
    cardIconContainer: {
        width: 52,
        height: 52,
        borderRadius: 12,
        overflow: 'hidden'
    },
    cardIconGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    cardTitle: {
        flex: 1
    },
    cardClaseName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B'
    },
    cardClaseType: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B'
    },
    confidenceBadge: {
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        justifyContent: 'center',
        alignItems: 'center'
    },
    confidenceBadgeText: {
        fontSize: 11,
        fontWeight: '700'
    },
    cardDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginHorizontal: 16
    },
    cardContent: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 6
    },
    contentLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 0.35
    },
    contentLabelText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B'
    },
    contentValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1E293B',
        flex: 0.65,
        textAlign: 'right'
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9'
    }
});

export default DeteccionesScreen;