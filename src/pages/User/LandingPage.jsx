import React, { useEffect, useState, useRef, useContext } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    ScrollView,
    Dimensions,
    Alert,
    ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import CameraCapture from '../../components/CameraCapture';
import { getDetecciones } from '../../api/deteccionApi';
import { getTachos } from '../../api/tachoApi';
import { getUbicaciones } from '../../api/ubicacionApi';
import { detectWasteWithAI } from '../../api/deteccionIAApi';
import { AuthContext } from '../../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LandingPage({ navigation }) {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({ tachos: 0, detecciones: 0, ubicaciones: 0 });
    const [showCameraModal, setShowCameraModal] = useState(false);
    const iaSectionRef = useRef(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);

    useEffect(() => {
        loadPublicStats();
    }, []);

    const loadPublicStats = async () => {
        try {
            const [deteccionesRes, tachosRes, ubicacionesRes] = await Promise.all([
                getDetecciones(),
                getTachos(),
                getUbicaciones()
            ]);
            const tachosCount = (tachosRes.data && tachosRes.data.length) || (tachosRes.data?.results?.length) || 0;
            const deteccionesCount = (deteccionesRes.data && deteccionesRes.data.length) || (deteccionesRes.data?.results?.length) || 0;
            const ubicacionesCount = (ubicacionesRes.data && ubicacionesRes.data.length) || (ubicacionesRes.data?.results?.length) || 0;

            animateCount('tachos', 0, tachosCount, 1500);
            animateCount('detecciones', 0, deteccionesCount, 1500);
            animateCount('ubicaciones', 0, ubicacionesCount, 1500);
        } catch (err) {
            console.error('Error cargando stats:', err);
        }
    };

    const animateCount = (key, start, end, duration) => {
        const startTime = Date.now();
        const timer = setInterval(() => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const current = Math.floor(progress * (end - start) + start);

            setStats(prev => ({ ...prev, [key]: current }));

            if (progress === 1) clearInterval(timer);
        }, 16);
    };

    const handleOpenCamera = () => setShowCameraModal(true);

    const pickImageFromLibrary = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permiso denegado', 'Se necesita permiso para acceder a la galería.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.7,
                base64: true
            });

            if (!result.cancelled) {
                setCapturedImage(result.uri);
                setAnalysisResult(null);
                // Lanzar análisis directamente si tenemos base64
                if (result.base64) {
                    analyzeBase64(result.base64);
                }
            }
        } catch (error) {
            console.error('Error al seleccionar imagen:', error);
            Alert.alert('Error', 'No se pudo seleccionar la imagen.');
        }
    };

    const analyzeBase64 = async (base64) => {
        try {
            setAnalysisLoading(true);
            const payload = base64.startsWith('data:image') ? base64 : `data:image/jpeg;base64,${base64}`;
            const res = await detectWasteWithAI(payload);
            setAnalysisResult(res);
            if (res?.no_detection) {
                Alert.alert('Sin detecciones', res.message || 'No se detectaron objetos.');
            } else if (res?.success === false) {
                Alert.alert('Error IA', res.message || res.error || 'Error en el análisis IA');
            }
        } catch (err) {
            console.error('Error analizando imagen:', err);
            Alert.alert('Error', 'Error analizando la imagen.');
        } finally {
            setAnalysisLoading(false);
        }
    };

    const handleImageCaptured = (detectionData) => {
        setShowCameraModal(false);
        // intentar obtener una preview/uri de la respuesta
        const possibleUri = detectionData?.imagen || detectionData?.imageUri || detectionData?.uri || detectionData?.preview;
        if (possibleUri) setCapturedImage(possibleUri);
        setAnalysisResult(detectionData);
        Alert.alert('Detección', `Clasificación: ${detectionData.categoria || detectionData.categoriaLabel || detectionData?.label || 'N/A'}`);
        // opcional: navegar a la lista de detecciones
        // navigation.navigate('Detecciones');
    };

    const handleResetImage = () => {
        setCapturedImage(null);
        setAnalysisResult(null);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <LinearGradient colors={["#F8FAFC", "#EEF2FF"]} style={styles.hero}>
                <Image source={require('../../../assets/logo.png')} style={styles.logo} />
                <Text style={styles.title}>EcoTachosTec</Text>
                <Text style={styles.subtitle}>Gestión inteligente de residuos</Text>

                <View style={styles.heroActions}>
                    {user ? (
                        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('UserPortal')}>
                            <MaterialCommunityIcons name="chart-bar" size={18} color="#fff" />
                            <Text style={styles.primaryBtnText}>Acceder al Portal</Text>
                        </TouchableOpacity>
                    ) : (
                        <>
                            <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.primaryBtnText}>Comenzar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.ghostBtn} onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.ghostBtnText}>Iniciar Sesión</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </LinearGradient>

            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats.tachos}</Text>
                    <Text style={styles.statLabel}>Tachos</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats.detecciones}</Text>
                    <Text style={styles.statLabel}>Detecciones IA</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats.ubicaciones}</Text>
                    <Text style={styles.statLabel}>Ubicaciones</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tecnología</Text>
                <View style={styles.featuresRow}>
                    <View style={styles.featureCard}>
                        <Ionicons name="water" size={28} color="#10b981" />
                        <Text style={styles.featureTitle}>Sensores</Text>
                        <Text style={styles.featureText}>Ultrasónicos y ambientales</Text>
                    </View>
                    <View style={styles.featureCard}>
                        <Ionicons name="camera" size={28} color="#3b82f6" />
                        <Text style={styles.featureTitle}>Clasificación IA</Text>
                        <Text style={styles.featureText}>YOLO + RoboFlow</Text>
                    </View>
                </View>
            </View>

            <View style={styles.section} ref={iaSectionRef}>
                <Text style={styles.sectionTitle}>Probá nuestra IA</Text>
                <Text style={styles.sectionDesc}>Captura o sube una imagen y analiza el tipo de residuo.</Text>
                <View style={styles.iaControls}>
                    <TouchableOpacity style={styles.primaryBtn} onPress={handleOpenCamera}>
                        <Ionicons name="camera" size={18} color="#fff" />
                        <Text style={styles.primaryBtnText}>Abrir Cámara</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{ height: 40 }} />

            <CameraCapture visible={showCameraModal} onCapture={handleImageCaptured} onClose={() => setShowCameraModal(false)} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    content: { paddingBottom: 40 },
    hero: { paddingVertical: 28, alignItems: 'center', paddingHorizontal: 20 },
    logo: { width: 96, height: 96, marginBottom: 12 },
    title: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
    subtitle: { fontSize: 14, color: '#475569', marginTop: 6, textAlign: 'center' },
    heroActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
    primaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#2563eb', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
    primaryBtnText: { color: '#fff', fontWeight: '700' },
    ghostBtn: { marginLeft: 10, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#c7d2fe' },
    ghostBtnText: { color: '#2563eb', fontWeight: '700' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 18 },
    statCard: { flex: 1, backgroundColor: '#fff', marginHorizontal: 6, padding: 12, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 },
    statNumber: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
    statLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
    section: { paddingHorizontal: 16, marginTop: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
    sectionDesc: { color: '#64748b', marginTop: 6 },
    featuresRow: { flexDirection: 'row', marginTop: 12 },
    featureCard: { flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 12, marginRight: 8 },
    featureTitle: { fontWeight: '700', marginTop: 8 },
    featureText: { color: '#64748b', marginTop: 4 },
    iaControls: { marginTop: 12, flexDirection: 'row' },
});