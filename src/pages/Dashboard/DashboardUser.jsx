// src/pages/Dashboard/DashboardUser.jsx
import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
    Animated,
    Platform,
    TextInput,
    FlatList
    
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Ionicons,
    FontAwesome5,
    Feather,
} from '@expo/vector-icons';
import { AuthContext } from "../../context/AuthContext";
import { getDetecciones } from "../../api/deteccionApi";
import { getTachos } from "../../api/tachoApi";
import { getUbicaciones } from "../../api/ubicacionApi";
import { styles } from "../../styles/DashboardUserStyles";

const { width } = Dimensions.get('window');

// Función para calcular estadísticas del usuario BASADA EN TUS MODELOS REALES
const calculateUserStats = (usuario, detecciones, tachos) => {
    if (!usuario) return {};

    const hoy = new Date().toISOString().split('T')[0];

    // Detecciones hoy - usando fecha_registro de tu modelo
    const deteccionesHoy = detecciones.filter(d => {
        if (!d.fecha_registro) return false;
        const fechaDeteccion = new Date(d.fecha_registro).toISOString().split('T')[0];
        return fechaDeteccion === hoy;
    }).length;

    // Usar todos los tachos como disponibles
    const tachosDisponibles = tachos.slice(0, 5);

    // Puntos del usuario (si existe el campo)
    const puntos = usuario.puntos_acumulados || 0;
    const nivel = Math.floor(puntos / 100);
    const progreso = puntos % 100;

    // Contribución ecológica estimada
    const kgReciclados = detecciones.length * 0.5;
    const co2Ahorrado = kgReciclados * 2.5;
    const horasContribuidas = detecciones.length * 0.25;

    return {
        deteccionesUsuario: detecciones,
        deteccionesHoy,
        tachosDisponibles,
        nivel,
        progreso,
        kgReciclados: parseFloat(kgReciclados.toFixed(1)),
        co2Ahorrado: parseFloat(co2Ahorrado.toFixed(1)),
        horasContribuidas: parseFloat(horasContribuidas.toFixed(1)),
        totalDetecciones: detecciones.length,
        puntos,
        totalTachos: tachos.length,
        tachosActivos: tachos.filter(t => t.activo === true).length,
    };
};

// Función auxiliar para obtener icono basado en el código o nombre
const getIconByTipo = (codigo) => {
    if (!codigo) return 'trash';
    const codigoLower = codigo.toLowerCase();

    if (codigoLower.includes('plast') || codigoLower.includes('pet')) return 'water-bottle';
    if (codigoLower.includes('papel') || codigoLower.includes('carton')) return 'file-alt';
    if (codigoLower.includes('organ') || codigoLower.includes('bio')) return 'leaf';
    if (codigoLower.includes('vidrio') || codigoLower.includes('glass')) return 'glass-whiskey';
    if (codigoLower.includes('metal') || codigoLower.includes('alum')) return 'cog';

    return 'trash';
};

// Función auxiliar para obtener color
const getColorByTipo = (codigo) => {
    if (!codigo) return '#9E9E9E';
    const codigoLower = codigo.toLowerCase();

    if (codigoLower.includes('plast') || codigoLower.includes('pet')) return '#2196F3';
    if (codigoLower.includes('papel') || codigoLower.includes('carton')) return '#FF9800';
    if (codigoLower.includes('organ') || codigoLower.includes('bio')) return '#795548';
    if (codigoLower.includes('vidrio') || codigoLower.includes('glass')) return '#4CAF50';
    if (codigoLower.includes('metal') || codigoLower.includes('alum')) return '#607D8B';

    return '#9E9E9E';
};

export default function DashboardUser({ navigation }) {
    const { userInfo } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeView, setActiveView] = useState('overview');
    const [searchTerm, setSearchTerm] = useState("");

    const [stats, setStats] = useState({
        deteccionesUsuario: [],
        deteccionesHoy: 0,
        tachosDisponibles: [],
        nivel: 0,
        progreso: 0,
        kgReciclados: 0,
        co2Ahorrado: 0,
        horasContribuidas: 0,
        totalDetecciones: 0,
        puntos: 0,
        totalTachos: 0,
        tachosActivos: 0,
    });

    const [tachos, setTachos] = useState([]);
    const [detecciones, setDetecciones] = useState([]);
    const [ubicaciones, setUbicaciones] = useState([]);

    // Animaciones optimizadas
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        if (!userInfo) {
            navigation.navigate('Login');
            return;
        }

        loadDashboardData();

        // Animación de entrada optimizada
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    // Cargar datos del dashboard CORREGIDO
    const loadDashboardData = useCallback(async () => {
        try {
            setLoading(true);

            // Cargar datos en paralelo - usando tus APIs reales
            const [deteccionesRes, tachosRes, ubicacionesRes] = await Promise.all([
                getDetecciones(),
                getTachos(),
                getUbicaciones()
            ]);

            console.log('Datos recibidos:', {
                detecciones: deteccionesRes.data?.length || 0,
                tachos: tachosRes.data?.length || 0,
                ubicaciones: ubicacionesRes.data?.length || 0
            });

            const deteccionesData = deteccionesRes.data || [];
            const tachosData = tachosRes.data || [];
            const ubicacionesData = ubicacionesRes.data || [];

            // Ordenar detecciones por fecha_registro (más reciente primero)
            const deteccionesOrdenadas = [...deteccionesData].sort((a, b) => {
                const dateA = new Date(a.fecha_registro || a.created_at);
                const dateB = new Date(b.fecha_registro || b.created_at);
                return dateB - dateA;
            });

            const calculatedStats = calculateUserStats(
                userInfo,
                deteccionesOrdenadas,
                tachosData
            );

            console.log('Stats calculadas:', calculatedStats);

            setStats(calculatedStats);
            setDetecciones(deteccionesOrdenadas);
            setTachos(tachosData);
            setUbicaciones(ubicacionesData);

        } catch (error) {
            console.error("Error cargando datos:", error);
            // Manejo de error limpio
            setStats(prev => ({
                ...prev,
                totalDetecciones: 0,
                totalTachos: 0,
                deteccionesUsuario: [],
                tachosDisponibles: []
            }));
            setDetecciones([]);
            setTachos([]);
            setUbicaciones([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [userInfo]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadDashboardData();
    }, [loadDashboardData]);

    // Componente de tarjeta de estadística optimizada
    const StatCard = React.memo(({ icon, value, label, gradientColors }) => (
        <TouchableOpacity
            style={styles.portalStatCard}
            activeOpacity={0.9}
        >
            <LinearGradient
                colors={gradientColors}
                style={styles.statCardContent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.statIconWrapper}>
                    {icon}
                </View>
                <View style={styles.statDetails}>
                    <Text style={styles.statNumber}>{value}</Text>
                    <Text style={styles.statLabel}>{label}</Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    ));

    // Componente de item de actividad optimizado - ADAPTADO A TUS MODELOS
    const ActivityItem = React.memo(({ det, index }) => {
        return (
            <TouchableOpacity style={styles.activityItem} activeOpacity={0.8}>
                <View style={styles.activityDot}>
                    <Ionicons name="analytics-outline" size={14} color="#2D6A4F" />
                </View>
                <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>
                        Detección {det.nombre || det.codigo || `#${index + 1}`}
                    </Text>
                    <View style={styles.activityMeta}>
                        <Ionicons name="time-outline" size={12} color="#666" />
                        <Text style={styles.activityMetaText}>
                            {det.fecha_registro ? new Date(det.fecha_registro).toLocaleDateString('es-EC') : 'Sin fecha'}
                        </Text>
                        {det.ubicacion_lat && det.ubicacion_lon && (
                            <Text style={[styles.activityMetaText, { color: '#52B788', marginLeft: 4 }]}>
                                • {det.ubicacion_lat}, {det.ubicacion_lon}
                            </Text>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    });

    // Componente de fila de tacho optimizado - ADAPTADO A TUS MODELOS
    const TachoRow = React.memo(({ tacho, index }) => {
        return (
            <TouchableOpacity style={styles.tableRow} activeOpacity={0.8}>
                <View style={styles.tableCell}>
                    <View style={[styles.tableBadge, styles.greenBadge]}>
                        <Text style={styles.tableBadgeText}>
                            {tacho.codigo || `TCH-${index + 1}`}
                        </Text>
                    </View>
                </View>
                <View style={[styles.tableCell, styles.tableCellFlex]}>
                    <Text style={styles.tablePrimaryText} numberOfLines={1}>
                        {tacho.nombre}
                    </Text>
                    <Text style={styles.tableSubText}>
                        Ubicación: {tacho.ubicacion_lat || 'N/A'}, {tacho.ubicacion_lon || 'N/A'}
                    </Text>
                </View>
                <View style={styles.tableCell}>
                    <Text style={styles.tableCoordsText} numberOfLines={1}>
                        {tacho.descripcion?.substring(0, 20) || 'Sin descripción'}...
                    </Text>
                </View>
                <View style={styles.tableCell}>
                    <View style={[
                        styles.statusBadge,
                        tacho.activo ? styles.activeBadge : styles.inactiveBadge
                    ]}>
                        <Text style={styles.statusBadgeText}>
                            {tacho.activo ? 'Activo' : 'Inactivo'}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    });

    // Vista de carga optimizada
    if (loading && !refreshing) {
        return (
            <SafeAreaProvider>
                <SafeAreaView style={styles.portalLoading}>
                    <ActivityIndicator size="large" color="#2D6A4F" />
                    <Text style={styles.loadingText}>Cargando datos del sistema...</Text>
                </SafeAreaView>
            </SafeAreaProvider>
        );
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.userPortal}>
                {/* Header */}
                <Animated.View style={[
                    styles.portalHeader,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                ]}>
                    <LinearGradient
                        colors={['#2D6A4F', '#52B788']}
                        style={styles.headerGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.portalWelcome}>
                            <Text style={styles.portalTitle}>
                                ¡Hola, {userInfo?.nombre || "Usuario"}!
                            </Text>
                            <Text style={styles.portalSubtitle}>
                                {userInfo?.email || 'Bienvenido al sistema'}
                            </Text>
                        </View>

                        <View style={styles.portalHeaderActions}>
                            <TouchableOpacity
                                style={styles.portalActionBtn}
                                onPress={onRefresh}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="refresh" size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Stats Grid Compacta - CON DATOS REALES */}
                <Animated.View style={[
                    styles.portalStatsGrid,
                    { opacity: fadeAnim }
                ]}>
                    <StatCard
                        icon={<FontAwesome5 name="trash-alt" size={22} color="#FFFFFF" />}
                        value={stats.totalTachos}
                        label="Tachos Totales"
                        gradientColors={['#95D5B2', '#74C69D']}
                    />
                    <StatCard
                        icon={<Ionicons name="analytics-outline" size={22} color="#FFFFFF" />}
                        value={stats.totalDetecciones}
                        label="Detecciones"
                        gradientColors={['#A2D2FF', '#72BFFF']}
                    />
                    <StatCard
                        icon={<Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" />}
                        value={stats.tachosActivos}
                        label="Tachos Activos"
                        gradientColors={['#C8B6FF', '#9D84FF']}
                    />
                </Animated.View>

                {/* Tabs de Navegación */}
                <View style={styles.portalTabs}>
                    {[
                        { key: 'overview', label: 'Vista General', icon: 'grid-outline' },
                        { key: 'tachos', label: `Tachos (${stats.totalTachos})`, icon: 'trash-alt' },
                        { key: 'detecciones', label: `Detecciones (${stats.totalDetecciones})`, icon: 'analytics-outline' }
                    ].map((tab) => (
                        <TouchableOpacity
                            key={tab.key}
                            style={[
                                styles.portalTab,
                                activeView === tab.key && styles.portalTabActive
                            ]}
                            onPress={() => setActiveView(tab.key)}
                            activeOpacity={0.7}
                        >
                            {tab.icon === 'trash-alt' ? (
                                <FontAwesome5
                                    name={tab.icon}
                                    size={14}
                                    color={activeView === tab.key ? '#2D6A4F' : '#666'}
                                />
                            ) : (
                                <Ionicons
                                    name={tab.icon}
                                    size={18}
                                    color={activeView === tab.key ? '#2D6A4F' : '#666'}
                                />
                            )}
                            <Text style={[
                                styles.portalTabText,
                                activeView === tab.key && styles.portalTabTextActive
                            ]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Contenido Principal con Scroll optimizado */}
                <ScrollView
                    style={styles.portalContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#2D6A4F']}
                            tintColor="#2D6A4F"
                        />
                    }
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Vista General */}
                    {activeView === 'overview' && (
                        <View style={styles.portalView}>
                            {/* Actividad Reciente */}
                            <View style={[styles.portalCard, styles.activityCard]}>
                                <View style={styles.portalCardHeader}>
                                    <View style={styles.cardHeaderLeft}>
                                        <Ionicons name="time-outline" size={20} color="#2D6A4F" />
                                        <Text style={styles.portalCardTitle}>Actividad Reciente</Text>
                                    </View>
                                    <View style={styles.cardHeaderActions}>
                                        <View style={styles.liveBadge}>
                                            <View style={styles.liveDot} />
                                            <Text style={styles.liveBadgeText}>
                                                {stats.deteccionesHoy} hoy
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.portalCardBody}>
                                    {stats.deteccionesUsuario.length > 0 ? (
                                        <FlatList
                                            data={stats.deteccionesUsuario.slice(0, 5)}
                                            renderItem={({ item, index }) => (
                                                <ActivityItem det={item} index={index} />
                                            )}
                                            keyExtractor={(item, index) => `${item.id || item.codigo || index}`}
                                            scrollEnabled={false}
                                            showsVerticalScrollIndicator={false}
                                        />
                                    ) : (
                                        <View style={styles.emptyState}>
                                            <Ionicons name="analytics-outline" size={40} color="#E0E0E0" />
                                            <Text style={styles.emptyStateText}>No hay actividad registrada</Text>
                                            <Text style={styles.emptyStateSubtext}>
                                                Las detecciones aparecerán aquí automáticamente
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Contribución Ecológica */}
                            <View style={[styles.portalCard, styles.contributionCard]}>
                                <View style={styles.portalCardHeader}>
                                    <View style={styles.cardHeaderLeft}>
                                        <Ionicons name="leaf-outline" size={20} color="#2D6A4F" />
                                        <Text style={styles.portalCardTitle}>Tu Impacto Ambiental</Text>
                                    </View>
                                </View>
                                <View style={styles.portalCardBody}>
                                    <View style={styles.contributionStats}>
                                        <View style={styles.contributionItem}>
                                            <Text style={styles.contributionValue}>
                                                {stats.kgReciclados}kg
                                            </Text>
                                            <Text style={styles.contributionLabel}>Residuos procesados</Text>
                                        </View>
                                        <View style={styles.contributionItem}>
                                            <Text style={styles.contributionValue}>
                                                {stats.co2Ahorrado}kg
                                            </Text>
                                            <Text style={styles.contributionLabel}>CO₂ ahorrado</Text>
                                        </View>
                                        <View style={styles.contributionItem}>
                                            <Text style={styles.contributionValue}>
                                                {stats.totalDetecciones}
                                            </Text>
                                            <Text style={styles.contributionLabel}>Detecciones totales</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Vista de Tachos */}
                    {activeView === 'tachos' && (
                        <View style={styles.portalView}>
                            <View style={styles.portalCard}>
                                <View style={styles.portalCardHeader}>
                                    <View style={styles.cardHeaderLeft}>
                                        <FontAwesome5 name="trash-alt" size={20} color="#2D6A4F" />
                                        <Text style={styles.portalCardTitle}>Tachos Registrados</Text>
                                        <View style={styles.countBadge}>
                                            <Text style={styles.countBadgeText}>{tachos.length}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.cardHeaderActions}>
                                        <View style={styles.searchBox}>
                                            <Ionicons name="search-outline" size={16} color="#666" />
                                            <TextInput
                                                style={styles.searchInput}
                                                placeholder="Buscar por código o nombre..."
                                                value={searchTerm}
                                                onChangeText={setSearchTerm}
                                                placeholderTextColor="#999"
                                                returnKeyType="search"
                                            />
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.portalCardBody}>
                                    {tachos.length > 0 ? (
                                        <FlatList
                                            data={tachos.filter(t =>
                                                searchTerm === '' ||
                                                (t.nombre && t.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                                (t.codigo && t.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
                                            )}
                                            renderItem={({ item, index }) => (
                                                <TachoRow tacho={item} index={index} />
                                            )}
                                            keyExtractor={(item, index) => `${item.id || item.codigo || index}`}
                                            scrollEnabled={false}
                                            showsVerticalScrollIndicator={false}
                                            initialNumToRender={10}
                                            maxToRenderPerBatch={10}
                                            windowSize={5}
                                        />
                                    ) : (
                                        <View style={styles.emptyState}>
                                            <FontAwesome5 name="trash-alt" size={40} color="#E0E0E0" />
                                            <Text style={styles.emptyStateText}>No hay tachos registrados</Text>
                                            <Text style={styles.emptyStateSubtext}>
                                                Los tachos aparecerán cuando se agreguen al sistema
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Vista de Detecciones */}
                    {activeView === 'detecciones' && (
                        <View style={styles.portalView}>
                            <View style={styles.portalCard}>
                                <View style={styles.portalCardHeader}>
                                    <View style={styles.cardHeaderLeft}>
                                        <Ionicons name="analytics-outline" size={20} color="#2D6A4F" />
                                        <Text style={styles.portalCardTitle}>Historial de Detecciones</Text>
                                        <View style={styles.countBadge}>
                                            <Text style={styles.countBadgeText}>{detecciones.length}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.cardHeaderActions}>
                                        <View style={styles.searchBox}>
                                            <Ionicons name="search-outline" size={16} color="#666" />
                                            <TextInput
                                                style={styles.searchInput}
                                                placeholder="Buscar por código o nombre..."
                                                value={searchTerm}
                                                onChangeText={setSearchTerm}
                                                placeholderTextColor="#999"
                                                returnKeyType="search"
                                            />
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.portalCardBody}>
                                    {detecciones.length > 0 ? (
                                        <FlatList
                                            data={detecciones.filter(d =>
                                                searchTerm === '' ||
                                                (d.nombre && d.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                                (d.codigo && d.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
                                            )}
                                            renderItem={({ item, index }) => (
                                                <ActivityItem det={item} index={index} />
                                            )}
                                            keyExtractor={(item, index) => `${item.id || item.codigo || index}`}
                                            scrollEnabled={false}
                                            showsVerticalScrollIndicator={false}
                                            initialNumToRender={10}
                                        />
                                    ) : (
                                        <View style={styles.emptyState}>
                                            <Ionicons name="analytics-outline" size={40} color="#E0E0E0" />
                                            <Text style={styles.emptyStateText}>No hay detecciones registradas</Text>
                                            <Text style={styles.emptyStateSubtext}>
                                                Las detecciones aparecerán cuando se detecten residuos
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Información del Sistema */}
                    <View style={styles.portalInfoCard}>
                        <View style={styles.infoIconWrapper}>
                            <Ionicons name="information-circle-outline" size={24} color="#2D6A4F" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoTitle}>Sistema de Gestión de Residuos</Text>
                            <Text style={styles.infoText}>
                                Sistema activo con {stats.totalTachos} tachos registrados y
                                {stats.totalDetecciones} detecciones procesadas.
                                {stats.tachosActivos > 0 ? ` ${stats.tachosActivos} tachos activos.` : ''}
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}