// src/pages/Dashboard/LandingScreen.jsx
import React, { useEffect, useRef, useContext, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Animated,
    Dimensions,
    Easing,
    StatusBar,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import api from "../../api/axiosConfig";

const { width, height } = Dimensions.get('window');

export default function LandingScreen({ navigation }) {
    const { userInfo } = useContext(AuthContext);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const [stats, setStats] = useState({
        tachos: 0,
        detecciones: 0,
        ubicaciones: 0,
    });

    useEffect(() => {
        loadPublicStats();

        // Animación de entrada
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            })
        ]).start();
    }, []);

    const loadPublicStats = async () => {
        try {
            const [tachosRes, deteccionesRes, ubicacionesRes] = await Promise.all([
                api.get("/tachos/"),
                api.get("/detecciones/"),
                api.get("/ubicacion/cantones/"),
            ]);

            // Animar contadores
            animateCount('tachos', 0, tachosRes.data.length || 0);
            animateCount('detecciones', 0, deteccionesRes.data.length || 0);
            animateCount('ubicaciones', 0, ubicacionesRes.data.length || 0);
        } catch (error) {
            console.error("Error cargando estadísticas públicas", error);
        }
    };

    const animateCount = (key, start, end) => {
        const duration = 2000;
        const startTime = Date.now();
        const timer = setInterval(() => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const current = Math.floor(progress * (end - start) + start);

            setStats(prev => ({ ...prev, [key]: current }));

            if (progress === 1) clearInterval(timer);
        }, 16);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <LinearGradient
                    colors={['#4CAF50', '#2E7D32']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroSection}
                >
                    {/* Círculos decorativos animados */}
                    <Animated.View style={[styles.heroCircle1, { opacity: fadeAnim }]} />
                    <Animated.View style={[styles.heroCircle2, { opacity: fadeAnim }]} />
                    <Animated.View style={[styles.heroCircle3, { opacity: fadeAnim }]} />

                    <View style={styles.heroContent}>
                        <Animated.View
                            style={[
                                styles.heroBadge,
                                {
                                    opacity: fadeAnim,
                                    transform: [{ translateY: slideAnim }]
                                }
                            ]}
                        >
                            <Ionicons name="leaf" size={16} color="#4CAF50" />
                            <Text style={styles.heroBadgeText}>Tecnología Verde del Futuro</Text>
                        </Animated.View>

                        <Animated.Text
                            style={[
                                styles.heroTitle,
                                {
                                    opacity: fadeAnim,
                                    transform: [{ translateY: slideAnim }]
                                }
                            ]}
                        >
                            Gestión Inteligente de
                            <Text style={styles.heroHighlight}> Residuos</Text>
                        </Animated.Text>

                        <Animated.Text
                            style={[
                                styles.heroDescription,
                                {
                                    opacity: fadeAnim,
                                    transform: [{ translateY: slideAnim }]
                                }
                            ]}
                        >
                            Revolucionando el manejo de desechos con IoT, Inteligencia Artificial y tecnología de punta.
                        </Animated.Text>

                        <Animated.View
                            style={[
                                styles.heroActions,
                                {
                                    opacity: fadeAnim,
                                    transform: [{ translateY: slideAnim }]
                                }
                            ]}
                        >
                            {userInfo ? (
                                <TouchableOpacity
                                    style={[styles.heroButton, styles.heroButtonPrimary]}
                                    onPress={() => navigation.navigate('Dashboard')}
                                >
                                    <Ionicons name="analytics" size={20} color="#4CAF50" />
                                    <Text style={[styles.heroButtonText, { color: '#4CAF50' }]}>
                                        Acceder al Panel
                                    </Text>
                                    <Ionicons name="arrow-forward" size={20} color="#4CAF50" />
                                </TouchableOpacity>
                            ) : (
                                <>
                                    <TouchableOpacity
                                        style={[styles.heroButton, styles.heroButtonPrimary]}
                                        onPress={() => navigation.navigate('Register')}
                                    >
                                        <Text style={[styles.heroButtonText, { color: '#4CAF50' }]}>
                                            Comenzar Ahora
                                        </Text>
                                        <Ionicons name="arrow-forward" size={20} color="#4CAF50" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.heroButton, styles.heroButtonSecondary]}
                                        onPress={() => navigation.navigate('Login')}
                                    >
                                        <Text style={[styles.heroButtonText, { color: '#fff' }]}>
                                            Iniciar Sesión
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </Animated.View>

                        {/* Estadísticas */}
                        <Animated.View
                            style={[
                                styles.statsContainer,
                                { opacity: fadeAnim }
                            ]}
                        >
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{stats.tachos}+</Text>
                                <Text style={styles.statLabel}>Tachos Activos</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{stats.detecciones}+</Text>
                                <Text style={styles.statLabel}>Detecciones IA</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{stats.ubicaciones}+</Text>
                                <Text style={styles.statLabel}>Ubicaciones</Text>
                            </View>
                        </Animated.View>
                    </View>

                    {/* Scroll Indicator */}
                    <Animated.View
                        style={[
                            styles.scrollIndicator,
                            { opacity: fadeAnim }
                        ]}
                    >
                        <Text style={styles.scrollText}>Descubre más</Text>
                        <Ionicons name="chevron-down" size={24} color="#fff" />
                    </Animated.View>
                </LinearGradient>

                {/* Sección Proyecto */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionBadge}>
                            <Ionicons name="leaf" size={16} color="#4CAF50" />
                            <Text style={styles.sectionBadgeText}>Nuestra Misión</Text>
                        </View>
                        <Text style={styles.sectionTitle}>El Proyecto EcoTachosTec</Text>
                        <Text style={styles.sectionDescription}>
                            Solución integral basada en IoT, análisis de datos e IA para transformar la gestión de residuos.
                        </Text>
                    </View>

                    <View style={styles.featuresGrid}>
                        {/* Objetivo */}
                        <View style={styles.featureCard}>
                            <LinearGradient
                                colors={['#95D5B2', '#74C69D']}
                                style={styles.featureIcon}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <MaterialIcons name="track-changes" size={32} color="#fff" />
                            </LinearGradient>
                            <Text style={styles.featureTitle}>Objetivo</Text>
                            <Text style={styles.featureDescription}>
                                Optimizar la recolección con monitoreo inteligente y rutas basadas en datos reales.
                            </Text>
                        </View>

                        {/* Innovación */}
                        <View style={styles.featureCard}>
                            <LinearGradient
                                colors={['#A2D2FF', '#BDE0FE']}
                                style={styles.featureIcon}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Ionicons name="bulb" size={32} color="#fff" />
                            </LinearGradient>
                            <Text style={styles.featureTitle}>Innovación</Text>
                            <Text style={styles.featureDescription}>
                                Sensores IoT y machine learning para clasificación y predicción avanzada.
                            </Text>
                        </View>

                        {/* Sostenibilidad */}
                        <View style={styles.featureCard}>
                            <LinearGradient
                                colors={['#CAFFBF', '#9BF6FF']}
                                style={styles.featureIcon}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <FontAwesome5 name="globe-americas" size={32} color="#fff" />
                            </LinearGradient>
                            <Text style={styles.featureTitle}>Sostenibilidad</Text>
                            <Text style={styles.featureDescription}>
                                Reducción de CO₂ y uso eficiente de recursos alineado con los ODS.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Sección Tachos Inteligentes */}
                <LinearGradient
                    colors={['#1E1E2F', '#2A2A3E']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.darkSection}
                >
                    <View style={styles.sectionHeader}>
                        <View style={[styles.sectionBadge, styles.sectionBadgeLight]}>
                            <FontAwesome5 name="trash-alt" size={16} color="#fff" />
                            <Text style={[styles.sectionBadgeText, { color: '#fff' }]}>Tecnología IoT</Text>
                        </View>
                        <Text style={[styles.sectionTitle, { color: '#fff' }]}>
                            Nuestros Tachos Inteligentes
                        </Text>
                        <Text style={[styles.sectionDescription, { color: 'rgba(255,255,255,0.9)' }]}>
                            Equipados con sensores avanzados que monitorean llenado, tipo de residuo y ambiente.
                        </Text>
                    </View>

                    <View style={styles.tachosGrid}>
                        <View style={styles.tachoFeature}>
                            <Ionicons name="radio" size={40} color="#4CAF50" />
                            <Text style={styles.tachoFeatureTitle}>Sensores Ultrasónicos</Text>
                            <Text style={styles.tachoFeatureText}>Medición precisa del nivel de llenado</Text>
                        </View>

                        <View style={styles.tachoFeature}>
                            <Ionicons name="thermometer" size={40} color="#4CAF50" />
                            <Text style={styles.tachoFeatureTitle}>Monitoreo Ambiental</Text>
                            <Text style={styles.tachoFeatureText}>Control de temperatura y humedad</Text>
                        </View>

                        <View style={styles.tachoFeature}>
                            <FontAwesome name="map-marker" size={40} color="#4CAF50" />
                            <Text style={styles.tachoFeatureTitle}>Geolocalización GPS</Text>
                            <Text style={styles.tachoFeatureText}>Ubicación exacta para optimizar rutas</Text>
                        </View>

                        <View style={styles.tachoFeature}>
                            <MaterialIcons name="scanner" size={40} color="#4CAF50" />
                            <Text style={styles.tachoFeatureTitle}>Clasificación IA</Text>
                            <Text style={styles.tachoFeatureText}>Detecta y clasifica residuos automáticamente</Text>
                        </View>
                    </View>

                    {!userInfo && (
                        <View style={styles.ctaBox}>
                            <Text style={styles.ctaTitle}>¿Quieres ver datos en tiempo real?</Text>
                            <Text style={styles.ctaDescription}>
                                Regístrate para acceder al panel completo.
                            </Text>
                            <TouchableOpacity
                                style={[styles.heroButton, styles.heroButtonPrimary]}
                                onPress={() => navigation.navigate('Register')}
                            >
                                <Text style={[styles.heroButtonText, { color: '#4CAF50' }]}>
                                    Crear Cuenta Gratis
                                </Text>
                                <Ionicons name="arrow-forward" size={20} color="#4CAF50" />
                            </TouchableOpacity>
                        </View>
                    )}
                </LinearGradient>

                {/* Sección Impacto */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionBadge}>
                            <MaterialIcons name="recycling" size={16} color="#4CAF50" />
                            <Text style={styles.sectionBadgeText}>Nuestro Impacto</Text>
                        </View>
                        <Text style={styles.sectionTitle}>Cambiando el Mundo</Text>
                        <Text style={styles.sectionDescription}>
                            Cada tacho inteligente aporta a un futuro más limpio.
                        </Text>
                    </View>

                    <View style={styles.impactGrid}>
                        <View style={styles.impactCard}>
                            <Ionicons name="trending-down" size={40} color="#4CAF50" />
                            <Text style={styles.impactNumber}>85%</Text>
                            <Text style={styles.impactLabel}>Reducción de costos</Text>
                        </View>

                        <View style={styles.impactCard}>
                            <Ionicons name="leaf" size={40} color="#4CAF50" />
                            <Text style={styles.impactNumber}>60%</Text>
                            <Text style={styles.impactLabel}>Menos emisiones</Text>
                        </View>

                        <View style={styles.impactCard}>
                            <Ionicons name="flash" size={40} color="#4CAF50" />
                            <Text style={styles.impactNumber}>95%</Text>
                            <Text style={styles.impactLabel}>Precisión IA</Text>
                        </View>

                        <View style={styles.impactCard}>
                            <Ionicons name="time" size={40} color="#4CAF50" />
                            <Text style={styles.impactNumber}>24/7</Text>
                            <Text style={styles.impactLabel}>Monitoreo continuo</Text>
                        </View>
                    </View>
                </View>

                {/* CTA Final */}
                {!userInfo && (
                    <LinearGradient
                        colors={['#4CAF50', '#2E7D32']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.finalCta}
                    >
                        <Text style={styles.finalCtaTitle}>
                            ¿Listo para ser parte del cambio?
                        </Text>
                        <Text style={styles.finalCtaDescription}>
                            Únete a EcoTachosTec y construyamos ciudades más sostenibles.
                        </Text>
                        <View style={styles.finalCtaActions}>
                            <TouchableOpacity
                                style={[styles.heroButton, styles.heroButtonPrimary, { flex: 1 }]}
                                onPress={() => navigation.navigate('Register')}
                            >
                                <Text style={[styles.heroButtonText, { color: '#4CAF50' }]}>
                                    Registrarse Gratis
                                </Text>
                                <Ionicons name="arrow-forward" size={24} color="#4CAF50" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.heroButton, styles.heroButtonSecondary, { flex: 1 }]}
                                onPress={() => navigation.navigate('Login')}
                            >
                                <Text style={[styles.heroButtonText, { color: '#fff' }]}>
                                    Iniciar Sesión
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                )}
            </ScrollView>
        </View>
    );
}

const styles = {
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

    // Hero Section
    heroSection: {
        minHeight: height * 0.85,
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 40,
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    heroCircle1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.1)',
        top: -50,
        right: -50,
    },
    heroCircle2: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.1)',
        bottom: 100,
        left: -30,
    },
    heroCircle3: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.1)',
        top: '50%',
        right: 30,
    },
    heroContent: {
        alignItems: 'center',
        zIndex: 1,
    },
    heroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderRadius: 25,
        marginBottom: 20,
    },
    heroBadgeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4CAF50',
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 40,
    },
    heroHighlight: {
        color: '#E8F5E9',
    },
    heroDescription: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
        paddingHorizontal: 10,
    },
    heroActions: {
        width: '100%',
        gap: 12,
        marginBottom: 40,
    },
    heroButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 30,
    },
    heroButtonPrimary: {
        backgroundColor: '#fff',
    },
    heroButtonSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#fff',
    },
    heroButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 25,
        width: '100%',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 28,
        fontWeight: '800',
        color: '#4CAF50',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        color: '#666',
        fontWeight: '500',
        textAlign: 'center',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    scrollIndicator: {
        alignItems: 'center',
        gap: 8,
        marginTop: 20,
    },
    scrollText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
    },

    // Sections
    section: {
        padding: 24,
        backgroundColor: '#fff',
    },
    darkSection: {
        padding: 24,
    },
    sectionHeader: {
        alignItems: 'center',
        marginBottom: 30,
    },
    sectionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderRadius: 25,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.2)',
    },
    sectionBadgeLight: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderColor: 'rgba(255,255,255,0.3)',
    },
    sectionBadgeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4CAF50',
    },
    sectionTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#333',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 36,
    },
    sectionDescription: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
    },

    // Features
    featuresGrid: {
        gap: 20,
    },
    featureCard: {
        backgroundColor: '#f8f9fa',
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e9ecef',
        alignItems: 'center',
    },
    featureIcon: {
        width: 80,
        height: 80,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    featureTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginBottom: 12,
        textAlign: 'center',
    },
    featureDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },

    // Tachos
    tachosGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
        justifyContent: 'space-between',
    },
    tachoFeature: {
        width: (width - 63) / 2,
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
    },
    tachoFeatureTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
        marginTop: 12,
        marginBottom: 8,
        textAlign: 'center',
    },
    tachoFeatureText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        lineHeight: 18,
    },

    // CTA
    ctaBox: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        marginTop: 30,
    },
    ctaTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 12,
        textAlign: 'center',
    },
    ctaDescription: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },

    // Impact
    impactGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
    },
    impactCard: {
        width: (width - 63) / 2,
        backgroundColor: '#f8f9fa',
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    impactNumber: {
        fontSize: 36,
        fontWeight: '800',
        color: '#4CAF50',
        marginVertical: 12,
    },
    impactLabel: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },

    // Final CTA
    finalCta: {
        padding: 40,
        alignItems: 'center',
    },
    finalCtaTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 36,
    },
    finalCtaDescription: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    finalCtaActions: {
        width: '100%',
        gap: 12,
    },
};