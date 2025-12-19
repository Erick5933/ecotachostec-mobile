// src/styles/DashboardUserStyles.js
import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

// Paleta de colores optimizada
const colors = {
    primary: '#2D6A4F',
    primaryLight: '#52B788',
    primaryPale: '#D8F3DC',
    dark: '#1E1E2F',
    gray: '#ADB5BD',
    grayLight: '#E9ECEF',
    white: '#FFFFFF',
};

export const styles = StyleSheet.create({
    // CONTAINERS - MÁS COMPACTOS
    userPortal: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },

    portalLoading: {
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

    // HEADER MÁS COMPACTO
    portalHeader: {
        backgroundColor: colors.white,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        overflow: 'hidden',
        shadowColor: colors.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 12,
        marginHorizontal: 12,
        marginTop: Platform.OS === 'ios' ? 10 : 8,
    },

    headerGradient: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    portalWelcome: {
        flex: 1,
    },

    portalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.white,
        marginBottom: 2,
    },

    portalSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.9)',
    },

    portalHeaderActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    portalActionBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },

    // STATS GRID MÁS COMPACTA
    portalStatsGrid: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 12,
        marginBottom: 16,
    },

    portalStatCard: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        minHeight: 80,
    },

    statCardContent: {
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },

    statIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    statDetails: {
        flex: 1,
    },

    statNumber: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.white,
        marginBottom: 2,
    },

    statLabel: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '600',
    },

    // TABS MÁS COMPACTAS
    portalTabs: {
        flexDirection: 'row',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: colors.white,
        borderRadius: 12,
        marginHorizontal: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },

    portalTab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 10,
    },

    portalTabActive: {
        backgroundColor: colors.primaryPale,
    },

    portalTabText: {
        fontSize: 12,
        fontWeight: '500',
        color: colors.gray,
    },

    portalTabTextActive: {
        color: colors.primary,
        fontWeight: '600',
    },

    // CONTENT MÁS COMPACTO
    portalContent: {
        flex: 1,
        paddingHorizontal: 12,
    },

    portalView: {
        gap: 12,
        marginBottom: 16,
    },

    // CARDS MÁS COMPACTAS
    portalCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
        borderWidth: 1,
        borderColor: colors.grayLight,
    },

    activityCard: {
        borderLeftWidth: 3,
        borderLeftColor: colors.primary,
    },

    portalCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.grayLight,
    },

    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },

    portalCardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.dark,
        flex: 1,
    },

    cardHeaderActions: {
        flex: 1,
        alignItems: 'flex-end',
    },

    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: colors.grayLight,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.grayLight,
        minWidth: 120,
        maxWidth: 200,
    },

    searchInput: {
        flex: 1,
        fontSize: 12,
        color: colors.dark,
        padding: 0,
    },

    portalCardBody: {
        padding: 16,
    },

    // ACTIVITY ITEM MÁS COMPACTO
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.grayLight,
    },

    activityDot: {
        width: 24,
        height: 24,
        borderRadius: 8,
        backgroundColor: colors.primaryPale,
        justifyContent: 'center',
        alignItems: 'center',
    },

    activityContent: {
        flex: 1,
    },

    activityTitle: {
        fontSize: 12,
        color: colors.dark,
        fontWeight: '500',
        marginBottom: 2,
    },

    activityMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    activityMetaText: {
        fontSize: 10,
        color: colors.gray,
    },

    // TABLES MÁS COMPACTAS
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.grayLight,
    },

    tableCell: {
        paddingHorizontal: 6,
        justifyContent: 'center',
    },

    tableCellFlex: {
        flex: 2,
    },

    tableBadge: {
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },

    greenBadge: {
        backgroundColor: '#95D5B2',
    },

    tableBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.white,
    },

    tablePrimaryText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.dark,
        marginBottom: 2,
    },

    tableSubText: {
        fontSize: 10,
        color: colors.gray,
    },

    tableCoordsText: {
        fontSize: 10,
        color: colors.gray,
    },

    statusBadge: {
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },

    activeBadge: {
        backgroundColor: '#D4EDDA',
    },

    inactiveBadge: {
        backgroundColor: '#F8D7DA',
    },

    statusBadgeText: {
        fontSize: 10,
        fontWeight: '600',
    },

    // CONTRIBUTION CARD MÁS COMPACTA
    contributionCard: {
        borderLeftWidth: 3,
        borderLeftColor: '#52B788',
    },

    contributionStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },

    contributionItem: {
        alignItems: 'center',
        paddingHorizontal: 10,
    },

    contributionValue: {
        fontSize: 16,
        fontWeight: '800',
        color: colors.primary,
        marginBottom: 2,
    },

    contributionLabel: {
        fontSize: 10,
        color: colors.gray,
        textAlign: 'center',
    },

    // UTILITIES
    countBadge: {
        backgroundColor: colors.primary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },

    countBadgeText: {
        color: colors.white,
        fontSize: 10,
        fontWeight: '700',
    },

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
    },

    emptyStateSubtext: {
        fontSize: 12,
        color: colors.gray,
        textAlign: 'center',
        marginTop: 4,
    },
});