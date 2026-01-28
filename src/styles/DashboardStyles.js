// src/styles/DashboardStyles.js - ACTUALIZADO
import { StyleSheet, Dimensions, Platform, Animated } from 'react-native';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

export const styles = StyleSheet.create({
    // Estilos generales
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    
    },
    loadingText: {
        marginTop: 20,
        fontSize: 16,
        color: '#2D6A4F',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },

    // ESTILOS PARA ADMIN DASHBOARD
    adminContainer: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    adminHeader: {
        backgroundColor: '#FFFFFF',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        shadowColor: '#1E1E2F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        marginBottom: 10,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    welcomeText: {
        fontSize: 14,
        color: '#ADB5BD',
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    greetingText: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1E1E2F',
        marginTop: 4,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 10,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E9F5EC',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D8F3DC',
    },

    // Stats Grid
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    quickStatCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    quickStatValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
        marginTop: 8,
    },
    quickStatLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: 4,
        fontWeight: '500',
    },

    // Tabs
    tabsContainer: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    tabButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginRight: 10,
        position: 'relative',
    },
    tabButtonActive: {
        backgroundColor: '#E9F5EC',
        borderRadius: 20,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ADB5BD',
    },
    tabTextActive: {
        color: '#2D6A4F',
    },
    tabIndicator: {
        position: 'absolute',
        bottom: -2,
        left: '25%',
        width: '50%',
        height: 3,
        backgroundColor: '#2D6A4F',
        borderRadius: 2,
    },

    // Content
    content: {
        flex: 1,
        padding: 20,
    },

    // Section Cards
    sectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#1E1E2F',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E1E2F',
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#52B788',
        fontWeight: '600',
    },
    seeAllText: {
        fontSize: 14,
        color: '#2D6A4F',
        fontWeight: '600',
    },

    // Tipo Grid
    tipoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 10,
    },
    tipoCard: {
        width: (width - 80) / 3,
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
    },
    tipoIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    tipoName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1E1E2F',
        marginBottom: 4,
        textAlign: 'center',
    },
    tipoNivel: {
        fontSize: 16,
        fontWeight: '800',
        color: '#2D6A4F',
        marginBottom: 6,
    },
    tipoProgress: {
        width: '100%',
        height: 4,
        backgroundColor: '#E9F5EC',
        borderRadius: 2,
        overflow: 'hidden',
    },
    tipoProgressFill: {
        height: '100%',
        borderRadius: 2,
    },

    // Detecciones
    deteccionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    deteccionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    deteccionContent: {
        flex: 1,
    },
    deteccionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E1E2F',
        marginBottom: 2,
    },
    deteccionSubtitle: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    deteccionMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    deteccionScore: {
        fontSize: 11,
        color: '#52B788',
        fontWeight: '600',
        backgroundColor: '#E9F5EC',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    deteccionDate: {
        fontSize: 11,
        color: '#ADB5BD',
    },

    // Ranking
    rankingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    rankingPosition: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E9F5EC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    rankingPositionText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#2D6A4F',
    },
    rankingContent: {
        flex: 1,
    },
    rankingName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E1E2F',
        marginBottom: 2,
    },
    rankingLocation: {
        fontSize: 12,
        color: '#ADB5BD',
    },
    rankingCount: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rankingCountText: {
        fontSize: 12,
        color: '#52B788',
        fontWeight: '600',
    },

    // Usuarios Grid
    usuariosGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    usuarioCard: {
        width: (width - 80) / 3,
        alignItems: 'center',
    },
    usuarioAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    usuarioInitial: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    usuarioNombre: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1E1E2F',
        marginBottom: 2,
        textAlign: 'center',
    },
    usuarioFecha: {
        fontSize: 10,
        color: '#ADB5BD',
    },

    // Tachos
    tachoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        marginBottom: 12,
    },
    tachoStatus: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    tachoContent: {
        flex: 1,
    },
    tachoName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E1E2F',
        marginBottom: 2,
    },
    tachoInfo: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
    },
    tachoProgress: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    tachoNivel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2D6A4F',
        width: 50,
        textAlign: 'right',
    },

    // Alertas
    alertaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFF5F5',
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#FFE0E0',
    },
    alertaIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FF6B6B',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    alertaContent: {
        flex: 1,
    },
    alertaTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E1E2F',
        marginBottom: 2,
    },
    alertaSubtitle: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
    },
    alertaProgress: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    alertaNivel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FF6B6B',
        width: 50,
        textAlign: 'right',
    },
    alertBadge: {
        backgroundColor: '#FF6B6B',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '800',
    },

    // Ubicaciones
    ubicacionesGrid: {
        gap: 12,
    },
    ubicacionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
    },
    ubicacionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E9F5EC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    ubicacionContent: {
        flex: 1,
    },
    ubicacionNombre: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E1E2F',
        marginBottom: 2,
    },
    ubicacionCiudad: {
        fontSize: 12,
        color: '#52B788',
        fontWeight: '600',
        marginBottom: 2,
    },
    ubicacionDireccion: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    ubicacionCoords: {
        fontSize: 10,
        color: '#ADB5BD',
    },
    ubicacionStats: {
        alignItems: 'center',
    },
    ubicacionCount: {
        fontSize: 18,
        fontWeight: '800',
        color: '#2D6A4F',
    },
    ubicacionLabel: {
        fontSize: 10,
        color: '#ADB5BD',
    },

    // ESTILOS PARA USER DASHBOARD
    userContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    userHeader: {
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        overflow: 'hidden',
        shadowColor: '#1E1E2F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        marginBottom: 10,
    },
    userHeaderGradient: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 30,
        paddingHorizontal: 20,
    },
    userProfile: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    userAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '800',
        color: '#2D6A4F',
    },
    levelBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#FFD700',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    levelText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#1E1E2F',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 12,
    },
    userStats: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        padding: 8,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        height: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    // Progress
    progressContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 16,
        padding: 16,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressTitle: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    progressPercentage: {
        fontSize: 14,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    progressBar: {
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FFD700',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },

    // User Content
    userContent: {
        flex: 1,
        padding: 20,
    },

    // Motivation Card
    motivationCard: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 20,
        shadowColor: '#1E1E2F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    motivationGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    motivationContent: {
        flex: 1,
        marginLeft: 16,
    },
    motivationTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    motivationText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        lineHeight: 20,
    },

    // Quick Stats
    quickStatsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    quickStat: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        marginHorizontal: 5,
    },
    quickStatIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickStatNumber: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1E1E2F',
        marginBottom: 4,
    },

    // Contribution
    contributionGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    contributionItem: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
    },
    contributionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    contributionValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#2D6A4F',
        marginBottom: 4,
    },
    contributionLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },

    // Tipo Actividad
    tipoActividadGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 10,
    },
    tipoActividadItem: {
        width: (width - 80) / 3,
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
    },
    tipoActividadIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    tipoActividadName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1E1E2F',
        marginBottom: 4,
        textAlign: 'center',
    },
    tipoActividadCount: {
        fontSize: 16,
        fontWeight: '800',
        color: '#2D6A4F',
    },

    // User Detecciones
    userDeteccionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    userDeteccionIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    userDeteccionContent: {
        flex: 1,
    },
    userDeteccionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E1E2F',
        marginBottom: 2,
    },
    userDeteccionSubtitle: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    userDeteccionMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userDeteccionScore: {
        fontSize: 11,
        color: '#52B788',
        fontWeight: '600',
        backgroundColor: '#E9F5EC',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    userDeteccionDate: {
        fontSize: 11,
        color: '#ADB5BD',
    },

    // Tachos Cercanos
    tachoCercanoCard: {
        width: width * 0.7,
        marginRight: 12,
    },
    tachoCercanoContent: {
        padding: 16,
        borderRadius: 16,
    },
    tachoCercanoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    tachoCercanoIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tachoCercanoStatus: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    tachoCercanoStatusText: {
        fontSize: 10,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    tachoCercanoName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E1E2F',
        marginBottom: 4,
    },
    tachoCercanoLocation: {
        fontSize: 12,
        color: '#666',
        marginBottom: 12,
    },
    tachoCercanoProgress: {
        marginBottom: 12,
    },
    tachoCercanoNivel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2D6A4F',
        marginBottom: 4,
    },
    tachoCercanoProgressBar: {
        height: 6,
        backgroundColor: '#E9F5EC',
        borderRadius: 3,
        overflow: 'hidden',
    },
    tachoCercanoProgressFill: {
        height: '100%',
        backgroundColor: '#52B788',
        borderRadius: 3,
    },
    navigateButton: {
        backgroundColor: '#2D6A4F',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    navigateButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },

    // Stat Card (para admin)
    statCard: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    statIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500',
    },
});