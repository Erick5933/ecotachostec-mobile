import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const colors = {
    primary: '#1E40AF',
    primaryLight: '#3B82F6',
    primaryLighter: '#DBEAFE',
    dark: '#1E293B',
    darkLight: '#334155',
    gray: '#64748B',
    grayLight: '#E2E8F0',
    grayLighter: '#F8FAFC',
    white: '#FFFFFF',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    purple: '#8B5CF6',
    teal: '#06D6A0',
    pink: '#EC4899',
};

export const styles = StyleSheet.create({
    // ========================================
    // CONTAINERS
    // ========================================
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: 20,
    },

    loadingText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.dark,
        marginTop: 16,
    },

    content: {
        flex: 1,
        paddingHorizontal: 16,
    },

    viewContainer: {
        gap: 20,
        marginBottom: 24,
    },

    // ========================================
    // HEADER
    // ========================================
    header: {
        backgroundColor: colors.white,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        overflow: 'hidden',
        shadowColor: colors.dark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        marginBottom: 16,
        marginHorizontal: 16,
        marginTop: Platform.OS === 'ios' ? 10 : 8,
    },

    headerGradient: {
        paddingVertical: 20,
        paddingHorizontal: 20,
    },

    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },

    adminBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 4,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        alignSelf: 'flex-start',
        marginBottom: 8,
    },

    adminBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.white,
        letterSpacing: 0.5,
    },

    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.white,
        marginBottom: 4,
        letterSpacing: -0.02,
    },

    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '400',
    },

    refreshButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Header Stats
    headerStats: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },

    headerStat: {
        flex: 1,
        alignItems: 'center',
    },

    headerStatValue: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.white,
        marginBottom: 2,
    },

    headerStatLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.9)',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    headerStatDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },

    // ========================================
    // TABS
    // ========================================
    tabsContainer: {
        marginHorizontal: 16,
        marginBottom: 20,
    },

    tabsScroll: {
        paddingHorizontal: 4,
    },

    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginRight: 8,
        borderRadius: 12,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.grayLight,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },

    tabActive: {
        backgroundColor: colors.primaryLighter,
        borderColor: colors.primary,
    },

    tabText: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.gray,
    },

    tabTextActive: {
        color: colors.primary,
        fontWeight: '600',
    },

    // ========================================
    // STATS GRID
    // ========================================
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 8,
    },

    statCard: {
        width: (width - 64) / 2 - 6,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 12,
    },

    statCardContent: {
        padding: 16,
        minHeight: 120,
    },

    statIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },

    statDetails: {
        flex: 1,
    },

    statNumber: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.white,
        marginBottom: 2,
    },

    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 2,
    },

    statSubtitle: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 4,
    },

    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },

    trendText: {
        fontSize: 11,
        fontWeight: '600',
    },

    // ========================================
    // SECTIONS
    // ========================================
    section: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.grayLight,
    },

    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.dark,
    },

    sectionAction: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.primary,
    },

    // ========================================
    // QUICK ACTIONS
    // ========================================
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
    },

    quickAction: {
        width: (width - 104) / 3,
        alignItems: 'center',
        marginBottom: 12,
    },

    quickActionIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },

    quickActionLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.dark,
        textAlign: 'center',
        lineHeight: 16,
    },

    // ========================================
    // ACTIVITY LIST
    // ========================================
    activityList: {
        gap: 12,
    },

    activityItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.grayLight,
    },

    activityDot: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },

    activityContent: {
        flex: 1,
    },

    activityMessage: {
        fontSize: 14,
        color: colors.dark,
        fontWeight: '500',
        marginBottom: 4,
        lineHeight: 18,
    },

    activityMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 4,
    },

    activityTime: {
        fontSize: 12,
        color: colors.gray,
    },

    activityUser: {
        fontSize: 12,
        color: colors.gray,
        fontWeight: '500',
    },

    // ========================================
    // SYSTEM STATUS
    // ========================================
    systemStatusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 4,
        paddingHorizontal: 10,
        backgroundColor: '#D1FAE5',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },

    systemStatusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.success,
    },

    systemStatusText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.success,
    },

    statusList: {
        gap: 12,
    },

    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },

    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
    },

    statusOnline: {
        backgroundColor: colors.success,
    },

    statusWarning: {
        backgroundColor: colors.warning,
    },

    statusOffline: {
        backgroundColor: colors.danger,
    },

    statusInfo: {
        flex: 1,
    },

    statusLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.dark,
        marginBottom: 2,
    },

    statusValue: {
        fontSize: 12,
        color: colors.gray,
    },

    // ========================================
    // BUTTONS
    // ========================================
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: colors.primary,
        borderRadius: 10,
    },

    addButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.white,
    },

    // ========================================
    // EMPTY STATES
    // ========================================
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30,
    },

    emptyStateText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.gray,
        marginTop: 12,
        textAlign: 'center',
    },

    // ========================================
    // INFO CARD
    // ========================================
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        padding: 20,
        backgroundColor: colors.white,
        borderRadius: 16,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.grayLight,
    },

    infoIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: colors.primaryLighter,
        justifyContent: 'center',
        alignItems: 'center',
    },

    infoContent: {
        flex: 1,
    },

    infoTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.primary,
        marginBottom: 4,
    },

    infoText: {
        fontSize: 14,
        color: colors.gray,
        lineHeight: 20,
    },
// Agrega al final de src/styles/DashboardAdminStyles.js
    chartContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    chartHeader: {
        marginBottom: 16,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
    },
    chartSubtitle: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    chartBarsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 120,
        paddingHorizontal: 8,
    },
    chartBarWrapper: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 2,
    },
    chartBar: {
        width: '80%',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 4,
    },
    chartBarValue: {
        fontSize: 10,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    chartBarLabel: {
        fontSize: 10,
        color: '#64748B',
        marginTop: 6,
    },
    summaryCards: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    summaryCardNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E40AF',
    },
    summaryCardLabel: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 4,
        textAlign: 'center',
    },
    headerLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    activityConfianza: {
        fontSize: 11,
        color: '#666',
        marginLeft: 4,
    },
    // ========================================
    // VIEW TITLE
    // ========================================
    viewTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.dark,
        marginBottom: 16,
    },
});