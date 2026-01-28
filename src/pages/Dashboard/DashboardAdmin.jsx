// src/pages/Dashboard/DashboardAdmin.jsx
import React, { useState, useEffect, useContext, useRef } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
    Animated,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axiosConfig";
import { styles } from "../../styles/DashboardAdminStyles";

const { width } = Dimensions.get('window');

export default function DashboardAdmin({ navigation }) {
    const { userInfo } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const isAdmin = !!(userInfo?.is_staff || userInfo?.rol === 'admin');
    const displayName = userInfo?.nombre || userInfo?.first_name || userInfo?.username || 'Usuario';
    const orgLabel = userInfo?.empresa || userInfo?.organization || userInfo?.company || null;
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { key: 'overview', label: 'Vista General', icon: 'grid-outline' },
        { key: 'tachos', label: 'Tachos', icon: 'trash-outline', screen: 'Tachos' },
        { key: 'ubicaciones', label: 'Ubicaciones', icon: 'location-outline', screen: 'Ubicaciones' },
        { key: 'detecciones', label: 'Detecciones', icon: 'analytics-outline', screen: 'Detecciones' },
        { key: 'usuarios', label: 'Usuarios', icon: 'people-outline', screen: 'Usuarios' },
    ];

    const [stats, setStats] = useState({
        totalTachos: 0,
        totalDetecciones: 0,
        totalUsuarios: 0,
        totalUbicaciones: 0,
    });

    const [recentActivity, setRecentActivity] = useState([]);

    // Animaciones
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        if (!userInfo) {
            navigation.navigate('Login');
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
    // =======================
    // 🔹 Cargar datos del dashboard
    // =======================
    const loadDashboardData = async () => {
        try {
            setRefreshing(true);
            const [tachosRes, deteccionesRes, usuariosRes, ubicacionesRes] =
                await Promise.all([
                    api.get("/tachos/"),
                    api.get("/detecciones/"),
                    api.get("/usuarios/"),
                    api.get("/ubicacion/cantones/"),
                ]);

            setStats({
                totalTachos: tachosRes.data.length || 0,
                totalDetecciones: deteccionesRes.data.length || 0,
                totalUsuarios: usuariosRes.data.length || 0,
                totalUbicaciones: ubicacionesRes.data.length || 0,
            });

            // Cargar actividad reciente basada en el formato de detecciones
            const recent = deteccionesRes.data
                .slice(0, 5)
                .map((deteccion) => ({
                    id: deteccion.id,
                    type: "detection",
                    message: deteccion.nombre
                        ? `Detección: ${deteccion.nombre}`
                        : `Nueva detección #${deteccion.id}`,
                    tacho: deteccion.tacho_nombre || "Tacho desconocido",
                    time: deteccion.fecha_registro
                        ? new Date(deteccion.fecha_registro).toLocaleString("es-EC", {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                        })
                        : "Fecha no disponible",
                    icon: "brain",
                    status: "success",
                    confianza: deteccion.confianza || 0
                }));

            setRecentActivity(recent);

        } catch (error) {
            console.error("Error cargando datos del dashboard", error);

            if (error.response?.status === 404) {
                console.log("Endpoint de detecciones no encontrado, usando datos de ejemplo");
                setRecentActivity([
                    {
                        id: 1,
                        type: "detection",
                        message: "Plástico PET detectado",
                        tacho: "Tacho A-01",
                        time: new Date().toLocaleString("es-EC"),
                        icon: "brain",
                        status: "success",
                        confianza: 95
                    },
                    {
                        id: 2,
                        type: "detection",
                        message: "Vidrio detectado",
                        tacho: "Tacho B-02",
                        time: new Date(Date.now() - 3600000).toLocaleString("es-EC"),
                        icon: "brain",
                        status: "success",
                        confianza: 88
                    }
                ]);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // =======================
    // 🔹 Manejar refresco manual
    // =======================
    const handleRefresh = () => {
        loadDashboardData();
    };

    // ======================
    // 🔹 Tarjetas de estadísticas
    // ======================
    const statsData = [
        {
            icon: 'trash-alt',
            iconLib: 'FontAwesome5',
            value: stats.totalTachos,
            label: 'Tachos Activos',
            description: 'Tachos IoT en funcionamiento',
            color: ['#10b981', '#059669'],
            trend: 12
        },
        {
            icon: 'brain',
            iconLib: 'MaterialCommunityIcons',
            value: stats.totalDetecciones,
            label: 'Detecciones IA',
            description: 'Clasificaciones realizadas',
            color: ['#3b82f6', '#1d4ed8'],
            trend: 28
        },
        {
            icon: 'people-outline',
            iconLib: 'Ionicons',
            value: stats.totalUsuarios,
            label: 'Usuarios Registrados',
            description: 'Usuarios del sistema',
            color: ['#8b5cf6', '#7c3aed'],
            trend: 5
        },
        {
            icon: 'location-outline',
            iconLib: 'Ionicons',
            value: stats.totalUbicaciones,
            label: 'Ubicaciones',
            description: 'Puntos de recolección',
            color: ['#f97316', '#ea580c'],
            trend: 3
        }
    ];

    // ======================
    // 🔹 Acciones rápidas
    // ======================
    const quickActions = [
        {
            icon: 'add-circle-outline',
            label: 'Nuevo Tacho',
            iconBg: '#D1FAE5', // successLight
            iconColor: '#065F46',
            cardBg: '#ECFDF5',
            cardBorder: '#A7F3D0',
            // parent tab name + nested screen
            parent: 'Tachos',
            nested: 'TachoForm',
            description: 'Registrar nuevo tacho IoT'
        },
        {
            icon: 'person-add-outline',
            label: 'Nuevo Usuario',
            iconBg: '#DBEAFE', // infoLight
            iconColor: '#1E3A8A',
            cardBg: '#EFF6FF',
            cardBorder: '#BFDBFE',
            parent: 'Usuarios',
            nested: 'UsuarioForm',
            description: 'Crear cuenta de usuario'
        },
        {
            icon: 'location-outline',
            label: 'Nueva Ubicación',
            iconBg: '#EDE9FE', // purpleLight
            iconColor: '#6D28D9',
            cardBg: '#F5F3FF',
            cardBorder: '#DDD6FE',
            parent: 'Ubicaciones',
            nested: 'UbicacionForm',
            description: 'Agregar punto de recolección'
        },
        {
            icon: 'document-text-outline',
            label: 'Ver Reportes',
            iconBg: '#FED7AA', // orangeLight
            iconColor: '#9A3412',
            cardBg: '#FFF7ED',
            cardBorder: '#FED7AA',
            parent: 'Detecciones',
            // nested uses the internal name in DeteccionesNavigator
            // Admin: ir al historial completo de detecciones
            nested: 'DeteccionesAllList',
            description: 'Analizar con IA y ver historial'
        }
    ];

    // ======================
    // 🔹 Estado del sistema
    // ======================
    const systemStatus = [
        {
            label: 'API Backend',
            value: 'Conectado',
            status: 'online',
            icon: 'checkmark-circle'
        },
        {
            label: 'Base de Datos',
            value: 'Operativa',
            status: 'online',
            icon: 'checkmark-circle'
        },
        {
            label: 'Servicios IoT',
            value: stats.totalTachos > 0 ? `${stats.totalTachos} activos` : 'Sin conexión',
            status: stats.totalTachos > 0 ? 'online' : 'warning',
            icon: stats.totalTachos > 0 ? 'checkmark-circle' : 'warning'
        },
        {
            label: 'IA/ML Engine',
            value: stats.totalDetecciones > 0 ? 'Funcionando' : 'En espera',
            status: stats.totalDetecciones > 0 ? 'online' : 'warning',
            icon: stats.totalDetecciones > 0 ? 'checkmark-circle' : 'warning'
        }
    ];

    // Vista de carga
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={styles.loadingText}>Cargando dashboard...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* ⭐ HEADER ACTUALIZADO - Badge de rol en esquina superior izquierda */}
            <LinearGradient
                colors={['#10b981', '#059669']}
                style={[styles.header, styles.headerGradient]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {/* Fila superior: Badge de rol + Botones de acción */}
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        {/* Badge de rol en esquina superior izquierda */}
                        <View style={styles.adminBadge}>
                            <Ionicons
                                name={isAdmin ? 'shield-checkmark' : 'person'}
                                size={12}
                                color="#FFFFFF"
                            />
                            <Text style={styles.adminBadgeText}>
                                {isAdmin ? 'ADMIN' : 'USUARIO'}
                            </Text>
                        </View>
                    </View>

                    {/* Botones de acción a la derecha */}
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.refreshButton}
                            onPress={handleRefresh}
                            accessibilityLabel="Actualizar"
                        >
                            <Ionicons name="refresh" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.refreshButton}
                            onPress={() => navigation.navigate('UbicacionList')}
                            accessibilityLabel="Ubicaciones cercanas"
                        >
                            <Ionicons name="paper-plane" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Título y subtítulo debajo del badge */}
                <Text style={styles.headerTitle}>¡Hola, {displayName}!</Text>
                <Text style={styles.headerSubtitle}>
                    {orgLabel ? `Encargado de: ${orgLabel}` : (isAdmin ? 'Panel Administrativo' : 'Bienvenido al sistema')}
                </Text>
            </LinearGradient>

            {/* Tabs Bar */}
            <View style={styles.tabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
                    {tabs.map(tab => (
                        <TouchableOpacity
                            key={tab.key}
                            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                            onPress={() => {
                                setActiveTab(tab.key);
                                if (tab.screen) {
                                    navigation.navigate(tab.screen);
                                }
                            }}
                        >
                            <Ionicons name={tab.icon} size={16} color={activeTab === tab.key ? '#1E40AF' : '#64748B'} />
                            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#10b981']}
                        tintColor="#10b981"
                    />
                }
            >
                {/* STATS GRID */}
                <View style={styles.statsGrid}>
                    {statsData.map((stat, index) => {
                        const IconComponent = stat.iconLib === 'FontAwesome5' ? FontAwesome5 :
                            stat.iconLib === 'MaterialCommunityIcons' ? MaterialCommunityIcons :
                                Ionicons;

                        return (
                            <View key={index} style={styles.statCard}>
                                <LinearGradient
                                    colors={stat.color}
                                    style={styles.statCardGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <View style={styles.statCardHeader}>
                                        <View style={styles.statCardIcon}>
                                            <IconComponent name={stat.icon} size={24} color="#fff" />
                                        </View>
                                        <View style={styles.statCardTrendBadge}>
                                            <Ionicons
                                                name={stat.trend > 0 ? "trending-up" : "trending-down"}
                                                size={14}
                                                color="#fff"
                                            />
                                            <Text style={styles.statCardTrendText}>{stat.trend}%</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.statCardValue}>{stat.value}</Text>
                                    <Text style={styles.statCardLabel}>{stat.label}</Text>
                                    <Text style={styles.statCardDescription}>{stat.description}</Text>
                                </LinearGradient>
                            </View>
                        );
                    })}
                </View>

                {/* ACTIVIDAD RECIENTE */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Actividad Reciente</Text>
                        <View style={styles.badge}>
                            <MaterialCommunityIcons name="pulse" size={12} color="#3b82f6" />
                            <Text style={styles.badgeText}>En Vivo</Text>
                        </View>
                    </View>

                    <View style={styles.cardBody}>
                        {recentActivity.length === 0 ? (
                            <View style={styles.emptyState}>
                                <MaterialCommunityIcons name="brain" size={32} color="#cbd5e1" />
                                <Text style={styles.emptyStateText}>No hay actividad reciente</Text>
                                <Text style={styles.emptyStateSubtext}>
                                    Realiza una detección con IA para ver actividad
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.activityList}>
                                {recentActivity.map((activity) => (
                                    <View key={activity.id} style={styles.activityItem}>
                                        <View style={styles.activityIcon}>
                                            <MaterialCommunityIcons name="brain" size={20} color="#fff" />
                                        </View>
                                        <View style={styles.activityContent}>
                                            <Text style={styles.activityMessage}>
                                                {activity.message}
                                            </Text>
                                            <Text style={styles.activityTacho}>en {activity.tacho}</Text>
                                            <View style={styles.activityTime}>
                                                <Ionicons name="time-outline" size={12} color="#6b7280" />
                                                <Text style={styles.activityTimeText}>{activity.time}</Text>
                                                {activity.confianza > 0 && (
                                                    <Text style={styles.activityConfianza}>• {activity.confianza}%</Text>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                {/* ACCIONES RÁPIDAS */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Acciones Rápidas</Text>
                        <Text style={styles.cardSubtitle}>Acceso directo a funciones</Text>
                    </View>

                    <View style={styles.cardBody}>
                        <View style={styles.quickActionsGrid}>
                            {quickActions.map((action, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.quickActionBtn, { backgroundColor: action.cardBg, borderColor: action.cardBorder }]}
                                    onPress={() => {
                                        if (action.parent && action.nested) {
                                            navigation.navigate(action.parent, { screen: action.nested });
                                        } else if (action.screen) {
                                            navigation.navigate(action.screen);
                                        }
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.quickActionContent}>
                                        <View style={[styles.quickActionIcon, { backgroundColor: action.iconBg }]}>
                                            <Ionicons name={action.icon} size={26} color={action.iconColor} />
                                        </View>
                                        <Text style={styles.quickActionLabel} numberOfLines={0}>{action.label}</Text>
                                        <Text style={styles.quickActionDescription} numberOfLines={0}>{action.description}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* ESTADO DEL SISTEMA */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View>
                            <Text style={styles.cardTitle}>Estado del Sistema</Text>
                            <Text style={styles.cardSubtitle}>Monitoreo en tiempo real</Text>
                        </View>
                        <View style={styles.badgeSuccess}>
                            <Ionicons name="checkmark-circle" size={12} color="#10b981" />
                            <Text style={styles.badgeSuccessText}>Operativo</Text>
                        </View>
                    </View>

                    <View style={styles.cardBody}>
                        <View style={styles.systemStatusGrid}>
                            {systemStatus.map((item, index) => (
                                <View key={index} style={styles.statusItem}>
                                    <View style={[
                                        styles.statusIndicator,
                                        item.status === 'online' && styles.statusOnline,
                                        item.status === 'warning' && styles.statusWarning,
                                        item.status === 'offline' && styles.statusOffline
                                    ]} />
                                    <View style={styles.statusInfo}>
                                        <Text style={styles.statusLabel}>{item.label}</Text>
                                        <View style={styles.statusValueContainer}>
                                            <Ionicons
                                                name={item.icon}
                                                size={12}
                                                color={item.status === 'online' ? '#10b981' : '#f59e0b'}
                                            />
                                            <Text style={styles.statusValue}>{item.value}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Espaciado final */}
                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
    );
}