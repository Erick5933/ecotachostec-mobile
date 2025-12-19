// src/styles/tachosStyles.js
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const colors = {
    primary: '#2D6A4F',
    primaryLight: '#40916C',
    secondary: '#FF9800',
    background: '#F8F9FA',
    white: '#FFFFFF',
    dark: '#212529',
    gray: '#6C757D',
    grayLight: '#E9ECEF',
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#DC3545',
    info: '#0096C7',
};

export const tachosStyles = StyleSheet.create({
    // ========== CONTAINERS ==========
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    screenContainer: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 16,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 20,
        marginVertical: 8,
        shadowColor: colors.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
    },

    // ========== HEADERS ==========
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 16,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.grayLight,
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.dark,
    },
    headerSubtitle: {
        fontSize: 14,
        color: colors.gray,
        marginTop: 4,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },

    // ========== FORM STYLES ==========
    formContainer: {
        flex: 1,
        padding: 16,
    },
    formGroup: {
        marginBottom: 20,
    },
    formLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.gray,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    formInput: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.grayLight,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: colors.dark,
    },
    formTextArea: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.grayLight,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: colors.dark,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    formRow: {
        flexDirection: 'row',
        gap: 12,
    },
    formCol: {
        flex: 1,
    },

    // ========== BUTTONS ==========
    btn: {
        borderRadius: 8,
        paddingVertical: 14,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    btnPrimary: {
        backgroundColor: colors.primary,
    },
    btnSecondary: {
        backgroundColor: colors.grayLight,
    },
    btnSuccess: {
        backgroundColor: colors.success,
    },
    btnDanger: {
        backgroundColor: colors.error,
    },
    btnText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.white,
    },
    btnSecondaryText: {
        color: colors.dark,
    },
    btnIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnIconPrimary: {
        backgroundColor: 'rgba(45, 106, 79, 0.1)',
    },
    btnIconView: {
        backgroundColor: 'rgba(0, 150, 199, 0.1)',
    },
    btnIconEdit: {
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
    },
    btnIconDelete: {
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
    },

    // ========== LIST STYLES ==========
    searchContainer: {
        padding: 16,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.grayLight,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.grayLight,
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    searchInput: {
        flex: 1,
        padding: 12,
        fontSize: 16,
        color: colors.dark,
    },
    listContainer: {
        padding: 16,
    },
    listItem: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    listItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    listItemTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.dark,
        flex: 1,
    },
    listItemCode: {
        fontSize: 14,
        color: colors.gray,
        marginTop: 4,
    },
    listItemDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    listItemDetailText: {
        fontSize: 13,
        color: colors.gray,
        marginLeft: 6,
    },

    // ========== DETAIL STYLES ==========
    detailHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.grayLight,
    },
    detailTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.dark,
        marginBottom: 4,
    },
    detailSubtitle: {
        fontSize: 16,
        color: colors.gray,
    },
    detailGrid: {
        gap: 20,
    },
    detailItem: {
        marginBottom: 16,
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.gray,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    detailValue: {
        fontSize: 18,
        color: colors.dark,
        fontWeight: '500',
    },
    detailSection: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 20,
        marginTop: 20,
    },
    detailSectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.dark,
        marginBottom: 16,
    },

    // ========== MAP STYLES ==========
    mapContainer: {
        height: 300,
        borderRadius: 12,
        overflow: 'hidden',
        marginVertical: 16,
    },
    map: {
        flex: 1,
    },
    mapMarkerContainer: {
        alignItems: 'center',
    },
    mapMarker: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.success,
        borderWidth: 3,
        borderColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.dark,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
    mapMarkerText: {
        fontSize: 24,
        color: colors.white,
    },

    // ========== STATUS BADGES ==========
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    badgeActive: {
        backgroundColor: '#D1FAE5',
    },
    badgeInactive: {
        backgroundColor: '#FEE2E2',
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
    badgeTextActive: {
        color: '#065F46',
    },
    badgeTextInactive: {
        color: '#991B1B',
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
    textCenter: {
        textAlign: 'center',
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
        color: colors.dark,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        color: colors.gray,
        textAlign: 'center',
        lineHeight: 24,
    },
});