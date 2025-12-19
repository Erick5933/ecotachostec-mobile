// src/pages/Dashboard/DashboardAdmin.jsx
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
    Alert
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from "../../context/AuthContext";
import { getDetecciones, getDeteccionesCriticas, getUltimasDetecciones } from "../../api/deteccionApi";
import { getTachos } from "../../api/tachoApi";
import { getUsuarios } from "../../api/authApi";
import { styles } from "../../styles/DashboardAdminStyles";

const { width } = Dimensions.get('window');

// Función para calcular estadísticas reales
const calculateAdminStats = (detecciones, tachos, usuarios) => {
    const hoy = new Date();
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

    // Detecciones hoy
    const deteccionesHoy = detecciones.filter(d => {
        if (!d.fecha_deteccion && !d.fecha_registro) return false;
        const fecha = d.fecha_deteccion || d.fecha_registro;
        const fechaDeteccion = new Date(fecha);
        return fechaDeteccion >= inicioHoy;
    }).length;

    // Detecciones con confianza alta
    const deteccionesAltaConfianza = detecciones.filter(d => d.confianza >= 80).length;

    // Tachos con detecciones críticas
    const tachosConDetecciones = [...new Set(detecciones.map(d => d.tacho_id).filter(Boolean))].length;

    // Tasa de éxito basada en confianza promedio
    const confianzaPromedio = detecciones.length > 0
        ? detecciones.reduce((sum, d) => sum + (d.confianza || 0), 0) / detecciones.length
        : 0;

    return {
        totalTachos: tachos.length,
        tachosActivos: tachos.filter(t => t.estado === 'activo' || t.activo === true).length,
        totalDetecciones: detecciones.length,
        deteccionesHoy,
        deteccionesAltaConfianza,
        tachosConDetecciones,
        totalUsuarios: usuarios.length,
        usuariosActivos: usuarios.filter(u => u.is_active === true).length,
        tasaExito: Math.round(confianzaPromedio) || 0,
        deteccionesRecientes: detecciones.slice(0, 10).length,
    };
};

// Función para obtener las tendencias diarias de la semana
const getWeeklyTrendData = (detecciones) => {
    const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const dayCounts = Array(7).fill(0);

    detecciones.forEach(d => {
        if (d.fecha_deteccion || d.fecha_registro) {
            const fecha = new Date(d.fecha_deteccion || d.fecha_registro);
            const day = fecha.getDay(); // 0 = Domingo
            dayCounts[day]++;
        }
    });

    return { labels: daysOfWeek, values: dayCounts };
};

export default function DashboardAdmin({ navigation }) {
    const { userInfo, logout } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeView, setActiveView] = useState('overview');

    const [stats, setStats] = useState({
        totalTachos: 0,
        tachosActivos: 0,
        totalDetecciones: 0,
        deteccionesHoy: 0,
        deteccionesAltaConfianza: 0,
        tachosConDetecciones: 0,
        totalUsuarios: 0,
        usuariosActivos: 0,
        tasaExito: 0,
        deteccionesRecientes: 0,
    });

    const [tachos, setTachos] = useState([]);
    const [detecciones, setDetecciones] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [deteccionesCriticas, setDeteccionesCriticas] = useState([]);
    const [ultimasDetecciones, setUltimasDetecciones] = useState([]);
    const [weeklyTrend, setWeeklyTrend] = useState({ labels: [], values: [] });

    // Animaciones
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        if (!userInfo) {
            navigation.navigate('Login');
            return;
        }

        // Verificar si es admin
        if (!userInfo.is_staff && userInfo.rol !== 'admin') {
            Alert.alert(
                "Acceso Restringido",
                "Esta función requiere permisos de administrador",
                [{ text: "OK", onPress: () => navigation.goBack() }]
            );
            return;
        }

        loadDashboardData();

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

    // Cargar datos reales del dashboard
    const loadDashboardData = useCallback(async () => {
        try {
            setLoading(true);

            // Cargar datos en paralelo para mejor rendimiento
            const [deteccionesRes, tachosRes, usuariosRes, criticasRes, ultimasRes] = await Promise.allSettled([
                getDetecciones(),
                getTachos(),
                getUsuarios(),
                getDeteccionesCriticas(),
                getUltimasDetecciones(5)
            ]);

            const deteccionesData = deteccionesRes.status === 'fulfilled' ? deteccionesRes.value.data : [];
            const tachosData = tachosRes.status === 'fulfilled' ? tachosRes.value.data : [];
            const usuariosData = usuariosRes.status === 'fulfilled' ? usuariosRes.value.data : [];
            const criticasData = criticasRes.status === 'fulfilled' ? criticasRes.value.data : [];
            const ultimasData = ultimasRes.status === 'fulfilled' ? ultimasRes.value.data : [];

            // Ordenar detecciones por fecha
            const deteccionesOrdenadas = [...deteccionesData].sort((a, b) => {
                const dateA = new Date(a.fecha_deteccion || a.fecha_registro || a.created_at);
                const dateB = new Date(b.fecha_deteccion || b.fecha_registro || b.created_at);
                return dateB - dateA;
            });

            // Calcular tendencia semanal
            const trendData = getWeeklyTrendData(deteccionesOrdenadas);

            const calculatedStats = calculateAdminStats(
                deteccionesOrdenadas,
                tachosData,
                usuariosData
            );

            setStats(calculatedStats);
            setDetecciones(deteccionesOrdenadas);
            setTachos(tachosData);
            setUsuarios(usuariosData);
            setDeteccionesCriticas(criticasData);
            setUltimasDetecciones(ultimasData);
            setWeeklyTrend(trendData);

        } catch (error) {
            console.error("Error cargando dashboard admin:", error);
            Alert.alert("Error", "No se pudieron cargar los datos del sistema");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadDashboardData();
    }, [loadDashboardData]);

    // Navegación a secciones de admin
    const navigateTo = (screen, params = {}) => {
        navigation.navigate(screen, params);
    };

    // Acciones rápidas del admin (sin configuracion y permisos)
    const quickActions = [
        {
            id: 1,
            icon: 'add-circle-outline',
            label: 'Nuevo Tacho',
            screen: 'TachoForm',
            color: '#52B788',
        },
        {
            id: 2,
            icon: 'analytics-outline',
            label: 'Detecciones',
            screen: 'DeteccionList',
            color: '#4361EE',
        },
        {
            id: 3,
            icon: 'location-outline',
            label: 'Ubicaciones',
            screen: 'UbicacionList',
            color: '#7209B7',
        },
        {
            id: 4,
            icon: 'document-text-outline',
            label: 'Reportes',
            screen: 'Reports',
            color: '#F8961E',
        },
        {
            id: 5,
            icon: 'people-outline',
            label: 'Usuarios',
            screen: 'UsersList',
            color: '#06D6A0',
        },
        {
            id: 6,
            icon: 'stats-chart-outline',
            label: 'Estadísticas',
            screen: 'Statistics',
            color: '#EF476F',
        },
    ];

    // Estado del sistema simplificado
    const systemStatus = [
        {
            id: 1,
            label: 'API Backend',
            status: 'online',
            value: 'Conectado',
            description: 'Servidor principal operativo'
        },
        {
            id: 2,
            label: 'Base de Datos',
            status: 'online',
            value: 'Operativa',
            description: 'Datos sincronizados'
        },
        {
            id: 3,
            label: 'Sensores IoT',
            status: tachos.length > 0 ? 'online' : 'warning',
            value: `${tachos.length} activos`,
            description: `${stats.tachosActivos} tachos en línea`
        },
        {
            id: 4,
            label: 'Sistema IA',
            status: stats.tasaExito > 80 ? 'online' : 'warning',
            value: `${stats.tasaExito}% precisión`,
            description: `${stats.deteccionesAltaConfianza} detecciones precisas`
        },
    ];

    // Componente de tarjeta de estadística
    const StatCard = React.memo(({ icon, value, label, subtitle, trend, gradientColors, onPress }) => (
        <TouchableOpacity
            style={styles.statCard}
            activeOpacity={0.9}
            onPress={onPress}
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
                    {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
                    {trend !== undefined && (
                        <View style={styles.trendContainer}>
                            <Ionicons
                                name={trend > 0 ? "trending-up" : "trending-down"}
                                size={14}
                                color={trend > 0 ? "#10B981" : "#EF4444"}
                            />
                            <Text style={[
                                styles.trendText,
                                { color: trend > 0 ? "#10B981" : "#EF4444" }
                            ]}>
                                {Math.abs(trend)}%
                            </Text>
                        </View>
                    )}
                </View>
            </LinearGradient>
        </TouchableOpacity>
    ));

    // Componente de item de actividad
    const ActivityItem = React.memo(({ item }) => {
        const getIconForType = (type) => {
            switch(type) {
                case 'high': return 'alert-circle-outline';
                case 'medium': return 'warning-outline';
                default: return 'analytics-outline';
            }
        };

        const getColorForConfianza = (confianza) => {
            if (confianza >= 80) return '#10B981';
            if (confianza >= 50) return '#F59E0B';
            return '#EF4444';
        };

        return (
            <TouchableOpacity
                style={styles.activityItem}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('DeteccionDetail', { id: item.id })}
            >
                <View style={[
                    styles.activityDot,
                    { backgroundColor: getColorForConfianza(item.confianza || 0) }
                ]}>
                    <Ionicons
                        name={getIconForType(item.nivel)}
                        size={14}
                        color="#FFFFFF"
                    />
                </View>
                <View style={styles.activityContent}>
                    <Text style={styles.activityMessage} numberOfLines={2}>
                        {item.nombre || `Detección #${item.id}`}
                        {item.tacho_nombre && ` - ${item.tacho_nombre}`}
                    </Text>
                    <View style={styles.activityMeta}>
                        <Ionicons name="time-outline" size={12} color="#666" />
                        <Text style={styles.activityTime}>
                            {new Date(item.fecha_deteccion || item.fecha_registro).toLocaleTimeString('es-EC', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </Text>
                        {item.confianza && (
                            <>
                                <Ionicons name="stats-chart-outline" size={12} color="#666" style={{ marginLeft: 8 }} />
                                <Text style={styles.activityConfianza}>{item.confianza}%</Text>
                            </>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    });

    // Componente de acción rápida
    const QuickAction = React.memo(({ action }) => (
        <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigateTo(action.screen)}
            activeOpacity={0.7}
        >
            <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                <Ionicons name={action.icon} size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.quickActionLabel}>{action.label}</Text>
        </TouchableOpacity>
    ));

    // Componente de estado del sistema
    const StatusItem = React.memo(({ item }) => (
        <View style={styles.statusItem}>
            <View style={[
                styles.statusIndicator,
                item.status === 'online' ? styles.statusOnline :
                    item.status === 'warning' ? styles.statusWarning :
                        styles.statusOffline
            ]} />
            <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>{item.label}</Text>
                <Text style={styles.statusValue}>{item.value}</Text>
                <Text style={styles.statusDescription}>{item.description}</Text>
            </View>
        </View>
    ));

    // Gráfico de barras simple para tendencia semanal
    const SimpleBarChart = ({ data, labels }) => {
        if (data.values.every(v => v === 0)) return null;

        const maxValue = Math.max(...data.values);
        const barWidth = (width - 60) / data.values.length;

        return (
            <View style={styles.chartContainer}>
                <View style={styles.chartHeader}>
                    <Text style={styles.chartTitle}>Tendencia Semanal</Text>
                    <Text style={styles.chartSubtitle}>Detecciones por día</Text>
                </View>
                <View style={styles.chartBarsContainer}>
                    {data.values.map((value, index) => {
                        const barHeight = value > 0 ? Math.max((value / maxValue) * 100, 20) : 0;

                        return (
                            <View key={index} style={styles.chartBarWrapper}>
                                <View style={[styles.chartBar, {
                                    height: barHeight,
                                    backgroundColor: index % 2 === 0 ? '#3B82F6' : '#8B5CF6'
                                }]}>
                                    {value > 0 && (
                                        <Text style={styles.chartBarValue}>{value}</Text>
                                    )}
                                </View>
                                <Text style={styles.chartBarLabel}>{labels[index]}</Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    };

    // Vista de carga
    if (loading && !refreshing) {
        return (
            <SafeAreaProvider>
                <SafeAreaView style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2D6A4F" />
                    <Text style={styles.loadingText}>Cargando Panel de Administración...</Text>
                </SafeAreaView>
            </SafeAreaProvider>
        );
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                {/* Header del Admin */}
                <Animated.View style={[
                    styles.header,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                ]}>
                    <LinearGradient
                        colors={['#1E40AF', '#3B82F6']}
                        style={styles.headerGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.headerContent}>
                            <View style={styles.headerLeft}>
                                <View style={styles.adminBadge}>
                                    <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
                                    <Text style={styles.adminBadgeText}>ADMIN</Text>
                                </View>
                                <View>
                                    <Text style={styles.headerTitle}>
                                        Panel de Control
                                    </Text>
                                    <Text style={styles.headerSubtitle}>
                                        {userInfo?.nombre || 'Administrador'}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.refreshButton}
                                onPress={onRefresh}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="refresh" size={22} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>

                        {/* Stats Header */}
                        <View style={styles.headerStats}>
                            <TouchableOpacity
                                style={styles.headerStat}
                                onPress={() => navigateTo('Tachos')}
                            >
                                <Text style={styles.headerStatValue}>{stats.totalTachos}</Text>
                                <Text style={styles.headerStatLabel}>Tachos</Text>
                            </TouchableOpacity>
                            <View style={styles.headerStatDivider} />
                            <TouchableOpacity
                                style={styles.headerStat}
                                onPress={() => navigateTo('Detecciones')}
                            >
                                <Text style={styles.headerStatValue}>{stats.totalDetecciones}</Text>
                                <Text style={styles.headerStatLabel}>Detecciones</Text>
                            </TouchableOpacity>
                            <View style={styles.headerStatDivider} />
                            <TouchableOpacity
                                style={styles.headerStat}
                                onPress={() => navigateTo('UsersList')}
                            >
                                <Text style={styles.headerStatValue}>{stats.totalUsuarios}</Text>
                                <Text style={styles.headerStatLabel}>Usuarios</Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Tabs de Navegación simplificados */}
                <View style={styles.tabsContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.tabsScroll}
                    >
                        {[
                            { key: 'overview', label: 'Vista General', icon: 'grid-outline' },
                            { key: 'tachos', label: 'Tachos', icon: 'trash-outline' },
                            { key: 'detecciones', label: 'Detecciones', icon: 'analytics-outline' },
                            { key: 'users', label: 'Usuarios', icon: 'people-outline' },
                            { key: 'reports', label: 'Reportes', icon: 'document-text-outline' },
                        ].map((tab) => (
                            <TouchableOpacity
                                key={tab.key}
                                style={[
                                    styles.tab,
                                    activeView === tab.key && styles.tabActive
                                ]}
                                onPress={() => setActiveView(tab.key)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={tab.icon}
                                    size={18}
                                    color={activeView === tab.key ? '#1E40AF' : '#64748B'}
                                />
                                <Text style={[
                                    styles.tabText,
                                    activeView === tab.key && styles.tabTextActive
                                ]}>
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Contenido Principal */}
                <ScrollView
                    style={styles.content}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#1E40AF']}
                            tintColor="#1E40AF"
                        />
                    }
                    showsVerticalScrollIndicator={false}
                >
                    {/* Vista General */}
                    {activeView === 'overview' && (
                        <View style={styles.viewContainer}>
                            {/* Stats Grid Mejorado */}
                            <View style={styles.statsGrid}>
                                <StatCard
                                    icon={<FontAwesome5 name="trash-alt" size={20} color="#FFFFFF" />}
                                    value={stats.totalTachos}
                                    label="Tachos Totales"
                                    subtitle={`${stats.tachosActivos} activos`}
                                    gradientColors={['#10B981', '#059669']}
                                    onPress={() => navigateTo('Tachos')}
                                />
                                <StatCard
                                    icon={<Ionicons name="analytics-outline" size={20} color="#FFFFFF" />}
                                    value={stats.totalDetecciones}
                                    label="Detecciones"
                                    subtitle={`${stats.deteccionesHoy} hoy`}
                                    gradientColors={['#3B82F6', '#1D4ED8']}
                                    onPress={() => navigateTo('Detecciones')}
                                />
                                <StatCard
                                    icon={<Ionicons name="people-outline" size={20} color="#FFFFFF" />}
                                    value={stats.totalUsuarios}
                                    label="Usuarios"
                                    subtitle={`${stats.usuariosActivos} activos`}
                                    gradientColors={['#8B5CF6', '#7C3AED']}
                                    onPress={() => navigateTo('UsersList')}
                                />
                                <StatCard
                                    icon={<MaterialCommunityIcons name="chart-donut" size={20} color="#FFFFFF" />}
                                    value={`${stats.tasaExito}%`}
                                    label="Precisión IA"
                                    subtitle={`${stats.deteccionesAltaConfianza} alta confianza`}
                                    gradientColors={['#F59E0B', '#D97706']}
                                    onPress={() => navigateTo('Statistics')}
                                />
                            </View>

                            {/* Gráfico de tendencia semanal */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Actividad Semanal</Text>
                                    <Text style={styles.sectionSubtitle}>
                                        Total: {weeklyTrend.values.reduce((a, b) => a + b, 0)} detecciones
                                    </Text>
                                </View>
                                <SimpleBarChart
                                    data={weeklyTrend}
                                    labels={weeklyTrend.labels}
                                />
                            </View>

                            {/* Acciones Rápidas */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
                                    <TouchableOpacity onPress={() => Alert.alert('Info', 'Acceso rápido a funciones principales')}>
                                        <Ionicons name="information-circle-outline" size={20} color="#64748B" />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.quickActionsGrid}>
                                    {quickActions.map((action) => (
                                        <QuickAction key={action.id} action={action} />
                                    ))}
                                </View>
                            </View>

                            {/* Detecciones Recientes */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Detecciones Recientes</Text>
                                    <TouchableOpacity onPress={() => navigateTo('DeteccionList')}>
                                        <Text style={styles.sectionAction}>Ver todas</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.activityList}>
                                    {ultimasDetecciones.length > 0 ? (
                                        ultimasDetecciones.map((item) => (
                                            <ActivityItem key={item.id} item={item} />
                                        ))
                                    ) : (
                                        <View style={styles.emptyState}>
                                            <Ionicons name="analytics-outline" size={40} color="#CBD5E1" />
                                            <Text style={styles.emptyStateText}>No hay detecciones recientes</Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Estado del Sistema */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Estado del Sistema</Text>
                                    <View style={styles.systemStatusBadge}>
                                        <View style={styles.systemStatusDot} />
                                        <Text style={styles.systemStatusText}>
                                            {systemStatus.every(s => s.status === 'online') ? 'Óptimo' : 'Parcial'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.statusList}>
                                    {systemStatus.map((item) => (
                                        <StatusItem key={item.id} item={item} />
                                    ))}
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Vista de Tachos */}
                    {activeView === 'tachos' && (
                        <View style={styles.viewContainer}>
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Resumen de Tachos</Text>
                                    <TouchableOpacity
                                        style={styles.addButton}
                                        onPress={() => navigateTo('TachoForm')}
                                    >
                                        <Ionicons name="add" size={20} color="#FFFFFF" />
                                        <Text style={styles.addButtonText}>Nuevo</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.summaryCards}>
                                    <View style={styles.summaryCard}>
                                        <Text style={styles.summaryCardNumber}>{stats.totalTachos}</Text>
                                        <Text style={styles.summaryCardLabel}>Total</Text>
                                    </View>
                                    <View style={styles.summaryCard}>
                                        <Text style={styles.summaryCardNumber}>{stats.tachosActivos}</Text>
                                        <Text style={styles.summaryCardLabel}>Activos</Text>
                                    </View>
                                    <View style={styles.summaryCard}>
                                        <Text style={styles.summaryCardNumber}>{stats.tachosConDetecciones}</Text>
                                        <Text style={styles.summaryCardLabel}>Con detecciones</Text>
                                    </View>
                                </View>
                                {/* Aquí podrías agregar una lista de tachos si lo deseas */}
                            </View>
                        </View>
                    )}

                    {/* Vista de Detecciones */}
                    {activeView === 'detecciones' && (
                        <View style={styles.viewContainer}>
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Resumen de Detecciones</Text>
                                    <TouchableOpacity onPress={() => navigateTo('DeteccionList')}>
                                        <Text style={styles.sectionAction}>Ver detalle</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.summaryCards}>
                                    <View style={styles.summaryCard}>
                                        <Text style={styles.summaryCardNumber}>{stats.totalDetecciones}</Text>
                                        <Text style={styles.summaryCardLabel}>Total</Text>
                                    </View>
                                    <View style={styles.summaryCard}>
                                        <Text style={styles.summaryCardNumber}>{stats.deteccionesHoy}</Text>
                                        <Text style={styles.summaryCardLabel}>Hoy</Text>
                                    </View>
                                    <View style={styles.summaryCard}>
                                        <Text style={styles.summaryCardNumber}>{stats.deteccionesAltaConfianza}</Text>
                                        <Text style={styles.summaryCardLabel}>Alta precisión</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Vista de Usuarios */}
                    {activeView === 'users' && (
                        <View style={styles.viewContainer}>
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Gestión de Usuarios</Text>
                                    <TouchableOpacity
                                        style={styles.addButton}
                                        onPress={() => navigateTo('UserForm')}
                                    >
                                        <Ionicons name="add" size={20} color="#FFFFFF" />
                                        <Text style={styles.addButtonText}>Nuevo</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.summaryCards}>
                                    <View style={styles.summaryCard}>
                                        <Text style={styles.summaryCardNumber}>{stats.totalUsuarios}</Text>
                                        <Text style={styles.summaryCardLabel}>Total</Text>
                                    </View>
                                    <View style={styles.summaryCard}>
                                        <Text style={styles.summaryCardNumber}>{stats.usuariosActivos}</Text>
                                        <Text style={styles.summaryCardLabel}>Activos</Text>
                                    </View>
                                    <View style={styles.summaryCard}>
                                        <Text style={styles.summaryCardNumber}>{userInfo?.is_staff ? 'Admin' : 'Usuarios'}</Text>
                                        <Text style={styles.summaryCardLabel}>Tipo</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Información del Sistema */}
                    <View style={styles.infoCard}>
                        <View style={styles.infoIconWrapper}>
                            <Ionicons name="server-outline" size={24} color="#1E40AF" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoTitle}>Sistema de Administración</Text>
                            <Text style={styles.infoText}>
                                Última actualización: {new Date().toLocaleString('es-EC')} •
                                {detecciones.length > 0 ? ` ${detecciones.length} detecciones procesadas` : ' Sin datos cargados'}
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}