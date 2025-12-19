// src/styles/deteccionesStyles.js
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const deteccionColors = {
    primary: '#2196F3',
    primaryLight: '#90CAF9',
    secondary: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    background: '#F5F7FA',
    white: '#FFFFFF',
    dark: '#263238',
    gray: '#78909C',
    grayLight: '#ECEFF1',
    info: '#00BCD4',
    success: '#8BC34A',
};

export const deteccionStyles = StyleSheet.create({
    // ========== CONTAINERS ==========
    container: {
        flex: 1,
        backgroundColor: deteccionColors.background,
    },
    screenContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    card: {
        backgroundColor: deteccionColors.white,
        borderRadius: 16,
        padding: 20,
        marginVertical: 8,
        shadowColor: deteccionColors.dark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    cardHighlight: {
        borderLeftWidth: 6,
        borderLeftColor: deteccionColors.primary,
    },

    // ========== HEADERS ==========
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 16,
        backgroundColor: deteccionColors.white,
        borderBottomWidth: 1,
        borderBottomColor: deteccionColors.grayLight,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: deteccionColors.dark,
    },
    headerSubtitle: {
        fontSize: 14,
        color: deteccionColors.gray,
        marginTop: 4,
    },

    // ========== FILTERS & CONTROLS ==========
    filterSection: {
        backgroundColor: deteccionColors.white,
        padding: 16,
        marginBottom: 8,
    },
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: deteccionColors.grayLight,
    },
    chipActive: {
        backgroundColor: deteccionColors.primary,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '500',
        color: deteccionColors.gray,
    },
    chipTextActive: {
        color: deteccionColors.white,
    },
    dateFilterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: deteccionColors.grayLight,
        padding: 12,
        borderRadius: 8,
    },

    // ========== STATS CARDS ==========
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: deteccionColors.white,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 28,
        fontWeight: '700',
        color: deteccionColors.dark,
    },
    statLabel: {
        fontSize: 12,
        color: deteccionColors.gray,
        textTransform: 'uppercase',
        marginTop: 4,
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },

    // ========== CHARTS ==========
    chartContainer: {
        backgroundColor: deteccionColors.white,
        borderRadius: 16,
        padding: 20,
        marginVertical: 12,
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: deteccionColors.dark,
    },
    chartSubtitle: {
        fontSize: 12,
        color: deteccionColors.gray,
        marginTop: 2,
    },
    chartLegend: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendText: {
        fontSize: 12,
        color: deteccionColors.gray,
    },

    // ========== DETECTION LIST ==========
    detectionItem: {
        backgroundColor: deteccionColors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: deteccionColors.grayLight,
    },
    detectionItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    detectionIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    detectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: deteccionColors.dark,
        flex: 1,
    },
    detectionCode: {
        fontSize: 13,
        color: deteccionColors.gray,
        marginTop: 2,
    },
    detectionMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: deteccionColors.grayLight,
    },
    detectionInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detectionInfoText: {
        fontSize: 13,
        color: deteccionColors.gray,
    },

    // ========== LEVEL INDICATORS ==========
    levelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    levelBar: {
        height: 8,
        flex: 1,
        borderRadius: 4,
        backgroundColor: deteccionColors.grayLight,
        overflow: 'hidden',
    },
    levelFill: {
        height: '100%',
        borderRadius: 4,
    },
    levelText: {
        fontSize: 12,
        fontWeight: '600',
        minWidth: 40,
        textAlign: 'right',
    },

    // ========== DETAIL VIEW ==========
    detailHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: deteccionColors.grayLight,
    },
    detailTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: deteccionColors.dark,
        marginBottom: 4,
    },
    detailGrid: {
        gap: 24,
    },
    detailSection: {
        backgroundColor: deteccionColors.white,
        borderRadius: 16,
        padding: 20,
        marginTop: 16,
    },
    detailSectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: deteccionColors.dark,
        marginBottom: 16,
    },
    detailItem: {
        marginBottom: 20,
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: deteccionColors.gray,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    detailValue: {
        fontSize: 18,
        color: deteccionColors.dark,
        fontWeight: '500',
    },

    // ========== MAP STYLES ==========
    mapContainer: {
        height: 300,
        borderRadius: 16,
        overflow: 'hidden',
        marginVertical: 16,
    },
    mapMarkerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapMarker: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: deteccionColors.primary,
        borderWidth: 3,
        borderColor: deteccionColors.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: deteccionColors.dark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    mapMarkerText: {
        fontSize: 24,
        color: deteccionColors.white,
    },

    // ========== TIME SERIES ==========
    timelineContainer: {
        backgroundColor: deteccionColors.white,
        borderRadius: 16,
        padding: 20,
        marginTop: 16,
    },
    timelineItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: deteccionColors.grayLight,
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: deteccionColors.primary,
        marginRight: 12,
    },
    timelineContent: {
        flex: 1,
    },
    timelineTime: {
        fontSize: 12,
        color: deteccionColors.gray,
    },
    timelineValue: {
        fontSize: 16,
        fontWeight: '600',
        color: deteccionColors.dark,
        marginTop: 2,
    },

    // ========== BUTTONS ==========
    btn: {
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    btnPrimary: {
        backgroundColor: deteccionColors.primary,
    },
    btnSecondary: {
        backgroundColor: deteccionColors.grayLight,
    },
    btnSuccess: {
        backgroundColor: deteccionColors.success,
    },
    btnText: {
        fontSize: 16,
        fontWeight: '600',
        color: deteccionColors.white,
    },
    btnSecondaryText: {
        color: deteccionColors.dark,
    },
    btnIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnIconPrimary: {
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
    },
    btnIconView: {
        backgroundColor: 'rgba(0, 188, 212, 0.1)',
    },
    btnIconExport: {
        backgroundColor: 'rgba(139, 195, 74, 0.1)',
    },

    // ========== UTILITIES ==========
    flexRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    gapSm: {
        gap: 8,
    },
    gapMd: {
        gap: 12,
    },
    gapLg: {
        gap: 16,
    },
    mtSm: {
        marginTop: 8,
    },
    mtMd: {
        marginTop: 16,
    },
    mtLg: {
        marginTop: 24,
    },
    mbSm: {
        marginBottom: 8,
    },
    mbMd: {
        marginBottom: 16,
    },
    mbLg: {
        marginBottom: 24,
    },

    // ========== LOADING & EMPTY STATES ==========
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: deteccionColors.background,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyIcon: {
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: deteccionColors.dark,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        color: deteccionColors.gray,
        textAlign: 'center',
        lineHeight: 24,
    },

    // ========== BADGES ==========
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    badgeHigh: {
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
    },
    badgeMedium: {
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
    },
    badgeLow: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
    },
    badgeIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    badgeTextHigh: {
        color: '#D32F2F',
    },
    badgeTextMedium: {
        color: '#F57C00',
    },
    badgeTextLow: {
        color: '#388E3C',
    },
});