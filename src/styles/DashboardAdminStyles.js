// src/styles/DashboardAdminStyles.js
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
    successLight: '#D1FAE5',
    successDark: '#059669',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
    purple: '#8B5CF6',
    purpleDark: '#7C3AED',
    purpleLight: '#EDE9FE',
    teal: '#06D6A0',
    pink: '#EC4899',
    orange: '#F97316',
    orangeLight: '#FED7AA',
};

export const styles = StyleSheet.create({
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
        gap: 32,
        marginBottom: 32,
    },

    // HEADER
    header: {
        backgroundColor: 'transparent',
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        overflow: 'hidden',
        shadowColor: colors.dark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        marginBottom: 24,
        marginHorizontal: 0,
        // Reduce top margin so header sits closer to top and appears fuller
        marginTop: Platform.OS === 'ios' ? 6 : 4,
    },

    headerGradient: {
        // Increase vertical padding so green area is more prominent
        paddingVertical: 64,
        paddingHorizontal: 24,
        // Ensures the gradient fills the full header width when header has no horizontal margin
        width: '100%',
    },

    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 32,
    },

    headerLeft: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-start',
    },

    adminBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        alignSelf: 'flex-start',
        marginBottom: 20,
    },

    adminBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.white,
        letterSpacing: 0.5,
    },

    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    refreshButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.white,
        marginBottom: 0,
        marginTop: 0,
        letterSpacing: -0.02,
    },

    headerSubtitle: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '400',
    },

    headerStats: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        gap: 12,
    },

    headerStat: {
        flex: 1,
        alignItems: 'center',
    },

    headerStatValue: {
        fontSize: 22,
        fontWeight: '800',
        color: colors.white,
        marginBottom: 4,
    },

    headerStatLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.9)',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    headerStatDivider: {
        width: 1,
        height: 36,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },

    // TABS
    tabsContainer: {
        marginHorizontal: 16,
        marginBottom: 28,
    },

    

    tabsScroll: {
        paddingHorizontal: 4,
    },

    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 12,
        paddingHorizontal: 18,
        marginRight: 10,
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

    // STATS GRID
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 16,
    },

    statCard: {
        width: (width - 68) / 2,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 16,
    },

    statCardGradient: {
        padding: 16,
        minHeight: 190,
        justifyContent: 'space-between',
    },

    statCardContent: {
        padding: 16,
        minHeight: 140,
    },

    statCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },

    statIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },

    statCardIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    statCardTrendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },

    statCardTrendText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },

    statDetails: {
        flex: 1,
    },

    statNumber: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.white,
        marginBottom: 4,
    },

    statCardValue: {
        fontSize: 32,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },

    statLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 4,
    },

    statCardLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
        lineHeight: 18,
    },

    statSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 4,
    },

    statCardDescription: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: 15,
    },

    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },

    trendText: {
        fontSize: 12,
        fontWeight: '600',
    },

    // SECTIONS & CARDS
    section: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.grayLight,
        marginBottom: 20,
    },

    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },

    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },

    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },

    cardSubtitle: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 4,
    },

    cardBody: {
        padding: 18,
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
        color: colors.dark,
    },

    sectionSubtitle: {
        fontSize: 12,
        color: colors.gray,
        marginTop: 4,
    },

    sectionAction: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.primary,
    },

    // BADGES
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#dbeafe',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },

    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1e40af',
    },

    badgeSuccess: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#d1fae5',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },

    badgeSuccessText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#065f46',
    },

    // QUICK ACTIONS
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 14,
        justifyContent: 'space-between',
        marginBottom: 16,
        width: width - 32,
        alignSelf: 'center',
    },

    quickAction: {
        width: (width - 104) / 3,
        alignItems: 'center',
        marginBottom: 16,
    },

    quickActionBtn: {
        width: (width - 32 - 14) / 2,
        overflow: 'hidden',
        borderRadius: 14,
        marginBottom: 12,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },

    quickActionContent: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 10,
        padding: 18,
        minHeight: 220,
    },

    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 5,
        elevation: 3,
    },

    quickActionLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
        textAlign: 'center',
        marginBottom: 4,
        lineHeight: 20,
    },

    quickActionDescription: {
        fontSize: 11,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 18,
    },

    quickActionLabelWhite: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 6,
    },

    quickActionDescriptionWhite: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        lineHeight: 18,
    },

    // ACTIVITY LIST
    activityList: {
        gap: 16,
    },

    activityItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 14,
        padding: 16,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },

    activityDot: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },

    activityIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
    },

    activityContent: {
        flex: 1,
        gap: 6,
    },

    activityMessage: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
        lineHeight: 20,
    },

    activityTacho: {
        fontSize: 13,
        color: '#6b7280',
    },

    activityMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 6,
    },

    activityTime: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    activityTimeText: {
        fontSize: 12,
        color: '#6b7280',
    },

    activityUser: {
        fontSize: 12,
        color: colors.gray,
        fontWeight: '500',
    },

    activityConfianza: {
        fontSize: 12,
        color: '#6b7280',
        marginLeft: 6,
    },

    // SYSTEM STATUS
    systemStatusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
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

    systemStatusGrid: {
        flexDirection: 'column',
        gap: 16,
        marginBottom: 32,
    },

    statusList: {
        gap: 16,
    },

    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        padding: 18,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },

    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
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
        gap: 6,
    },

    statusLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },

    statusValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    statusValue: {
        fontSize: 13,
        color: '#6b7280',
    },

    // BUTTONS
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: colors.primary,
        borderRadius: 10,
    },

    addButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.white,
    },

    // EMPTY STATES
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
        gap: 12,
    },

    emptyStateText: {
        fontSize: 14,
        color: '#9ca3af',
        fontWeight: '500',
    },

    emptyStateSubtext: {
        fontSize: 12,
        color: '#cbd5e1',
        textAlign: 'center',
    },

    // INFO CARD
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 18,
        padding: 24,
        backgroundColor: colors.white,
        borderRadius: 16,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
        marginBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.grayLight,
    },

    infoIconWrapper: {
        width: 52,
        height: 52,
        borderRadius: 14,
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
        marginBottom: 6,
    },

    infoText: {
        fontSize: 14,
        color: colors.gray,
        lineHeight: 20,
    },

    // CHART STYLES
    chartContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },

    chartHeader: {
        marginBottom: 20,
    },

    chartTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
    },

    chartSubtitle: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 4,
    },

    chartBarsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 140,
        paddingHorizontal: 12,
    },

    chartBarWrapper: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 4,
    },

    chartBar: {
        width: '80%',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 6,
    },

    chartBarValue: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    chartBarLabel: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 8,
    },

    summaryCards: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },

    summaryCard: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        padding: 18,
        alignItems: 'center',
        marginHorizontal: 6,
    },

    summaryCardNumber: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1E40AF',
    },

    summaryCardLabel: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 6,
        textAlign: 'center',
    },

    // VIEW TITLE
    viewTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.dark,
        marginBottom: 20,
    },
});
