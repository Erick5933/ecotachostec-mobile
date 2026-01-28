// src/styles/usuarioStyles.js
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');


const colors = {
    primary: '#10B981',
    primaryLight: '#34D399',
    primaryDark: '#059669',
    secondary: '#3B82F6',
    info: '#0EA5E9',
    warning: '#F59E0B',
    white: '#FFFFFF',
    dark: '#111827',
    gray: '#6B7280',
    grayLight: '#E5E7EB',
    grayLighter: '#F9FAFB',
    background: '#F9FAFB',
    success: '#10B981',
    successDark: '#059669',
    successLight: '#D1FAE5',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
};

export const usuarioListStyles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },

    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: colors.gray,
        fontWeight: '600',
    },

    // Stats - Mejorados con gradientes
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },

    statCard: {
        flex: 1,
        borderRadius: 14,
        padding: 18,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        minHeight: 110,
        justifyContent: 'center',
    },

    statValue: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.white,
        marginTop: 10,
        marginBottom: 4,
    },

    statLabel: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '600',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // Search - Mejorado
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 16,
        borderWidth: 1.5,
        borderColor: colors.grayLight,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },

    searchIcon: {
        marginRight: 10,
    },

    searchInput: {
        flex: 1,
        fontSize: 14,
        color: colors.dark,
        fontWeight: '500',
    },

    // Filters - Nuevos
    filtersContainer: {
        marginBottom: 20,
    },

    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: colors.white,
        borderWidth: 1.5,
        borderColor: colors.grayLight,
    },

    filterChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },

    filterChipActiveGreen: {
        backgroundColor: '#10B981',
        borderColor: '#10B981',
    },

    filterChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.gray,
    },

    filterChipTextActive: {
        color: colors.white,
    },

    filterDivider: {
        width: 1,
        height: 30,
        backgroundColor: colors.grayLight,
        marginRight: 10,
    },

    // Header - Mejorado
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },

    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.dark,
        marginBottom: 2,
    },

    headerSubtitle: {
        fontSize: 13,
        color: colors.gray,
        fontWeight: '500',
    },

    addButton: {
        borderRadius: 12,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },

    addButtonGradient: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // User Table Row - Nuevo diseño tipo tabla
    userTableRow: {
        backgroundColor: colors.white,
        borderRadius: 12,
        marginBottom: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.grayLight,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        gap: 14,
    },

    tableCell: {
        marginBottom: 10,
    },

    tableCellLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.gray,
        textTransform: 'uppercase',
        marginBottom: 5,
        letterSpacing: 0.8,
    },

    tableCellId: {
        fontSize: 14,
        fontWeight: '700',
        color: '#10B981',
    },

    tableCellValue: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.dark,
    },

    tableCellRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },

    tableCellEmail: {
        fontSize: 14,
        color: colors.gray,
        flex: 1,
    },

    rolBadgeAdmin: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 16,
        alignSelf: 'flex-start',
    },

    rolBadgeUser: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },

    rolBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#059669',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    rolBadgeTextUser: {
        fontSize: 13,
        fontWeight: '700',
        color: '#059669',
    },

    actionButtons: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 4,
    },

    editButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // User Card - Mejorado (mantener para compatibilidad)
    userCard: {
        backgroundColor: colors.white,
        borderRadius: 14,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: colors.grayLight,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
        overflow: 'hidden',
    },

    userCardContent: {
        flexDirection: 'row',
        padding: 16,
    },

    userAvatar: {
        width: 60,
        height: 60,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },

    userAvatarText: {
        fontSize: 22,
        fontWeight: '800',
        color: colors.white,
    },

    userInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },

    userHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
        flexWrap: 'wrap',
    },

    userName: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.dark,
        flex: 1,
    },

    adminBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.purple,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },

    adminBadgeGreen: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#059669',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },

    adminBadgeText: {
        fontSize: 9,
        fontWeight: '700',
        color: colors.white,
        letterSpacing: 0.5,
    },

    userDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },

    userDetailText: {
        fontSize: 13,
        color: colors.gray,
        fontWeight: '500',
        flex: 1,
    },

    userFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },

    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 10,
    },

    statusActive: {
        backgroundColor: colors.successLight,
    },

    statusInactive: {
        backgroundColor: colors.dangerLight,
    },

    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },

    statusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },

    deactivateButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    activateButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Empty State - Mejorado
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 30,
        backgroundColor: colors.white,
        borderRadius: 14,
        marginTop: 20,
    },

    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.dark,
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },

    emptyStateText: {
        fontSize: 14,
        color: colors.gray,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },

    emptyStateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },

    emptyStateButtonText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
    },

    // Info Card - Nueva
    infoCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderRadius: 14,
        padding: 18,
        marginTop: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#10B981',
    },

    infoCardIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },

    infoCardContent: {
        flex: 1,
    },

    infoCardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.primary,
        marginBottom: 4,
    },

    infoCardText: {
        fontSize: 12,
        color: colors.gray,
        lineHeight: 18,
    },
});

// ============================================
// USUARIO FORM STYLES
// ============================================
export const usuarioFormStyles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },

    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: colors.gray,
        fontWeight: '600',
    },

    container: {
        flex: 1,
    },

    scrollContent: {
        paddingBottom: 100,
    },

    card: {
        backgroundColor: colors.white,
        borderRadius: 14,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.grayLight,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
        overflow: 'hidden',
    },

    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 16,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        backgroundColor: '#10B981',
    },

    cardHeaderText: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.white,
        letterSpacing: 0.3,
    },

    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.white,
        letterSpacing: 0.3,
    },

    cardBody: {
        padding: 18,
    },

    cardContent: {
        padding: 18,
    },

    inputGroup: {
        marginBottom: 18,
    },

    label: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.dark,
        marginBottom: 8,
    },

    optionalText: {
        fontSize: 11,
        fontWeight: '400',
        color: colors.gray,
        fontStyle: 'italic',
    },

    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.grayLighter,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: colors.grayLight,
        paddingHorizontal: 14,
        height: 50,
    },

    inputError: {
        borderColor: colors.danger,
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
    },

    inputIcon: {
        marginRight: 10,
    },

    input: {
        flex: 1,
        fontSize: 15,
        color: colors.dark,
        paddingVertical: 0,
    },

    pickerWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.grayLighter,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: colors.grayLight,
        paddingLeft: 14,
        height: 50,
    },

    picker: {
        flex: 1,
        fontSize: 15,
        color: colors.dark,
        marginLeft: 6,
    },

    errorText: {
        fontSize: 12,
        color: colors.danger,
        marginTop: 6,
        fontWeight: '500',
    },

    roleButtons: {
        flexDirection: 'row',
        gap: 12,
    },

    roleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.grayLight,
        backgroundColor: colors.white,
    },

    roleButtonActive: {
        borderColor: '#10B981',
        backgroundColor: '#10B981',
    },

    roleButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.gray,
    },

    roleButtonTextActive: {
        color: colors.white,
    },

    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: colors.grayLighter,
        borderRadius: 10,
        marginBottom: 12,
    },

    switchLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },

    switchText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.dark,
    },

    switch: {
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.grayLight,
        padding: 2,
        justifyContent: 'center',
    },

    switchActive: {
        backgroundColor: '#10B981',
    },

    switchThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },

    switchThumbActive: {
        transform: [{ translateX: 22 }],
    },

    switchDescription: {
        fontSize: 12,
        color: colors.gray,
        marginTop: 4,
    },

    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
        marginBottom: 30,
    },

    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        backgroundColor: colors.white,
        borderWidth: 2,
        borderColor: '#10B981',
        alignItems: 'center',
        justifyContent: 'center',
    },

    cancelButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#10B981',
    },

    submitButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        backgroundColor: '#10B981',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },

    submitButtonDisabled: {
        opacity: 0.6,
    },

    submitButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },

    submitButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    submitButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.white,
        letterSpacing: 0.3,
    },
});
