// src/styles/layoutStyles.js
import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

const colors = {
    primary: '#1E40AF',
    primaryLight: '#3B82F6',
    white: '#FFFFFF',
    dark: '#1E293B',
    gray: '#64748B',
    grayLight: '#E2E8F0',
    grayLighter: '#F8FAFC',
    success: '#10B981',
    danger: '#EF4444',
};

export const layoutStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.grayLighter,
    },

    // ========================================
    // HEADER
    // ========================================
    header: {
        paddingTop: Platform.OS === 'ios' ? 80 : 70,
        paddingBottom: 20,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },

    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.white,
        marginBottom: 2,
        letterSpacing: -0.3,
    },

    headerSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '400',
    },

    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    headerIconBtn: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },

    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#EF4444',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.white,
    },

    badgeText: {
        color: colors.white,
        fontSize: 10,
        fontWeight: '700',
    },

    // ========================================
    // CONTAINER
    // ========================================
    container: {
        flex: 1,
        backgroundColor: colors.grayLighter,
    },

    content: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 12,
    },

    // ========================================
    // FOOTER
    // ========================================
    footer: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.grayLight,
        alignItems: 'center',
    },

    footerText: {
        fontSize: 12,
        color: colors.gray,
        fontWeight: '500',
    },

    // ========================================
    // NAVIGATION - TAB BAR
    // ========================================
    tabBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: Platform.OS === 'ios' ? 85 : 65,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.grayLight,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        paddingBottom: Platform.OS === 'ios' ? 20 : 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },

    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        position: 'relative',
    },

    tabItemActive: {
        borderTopWidth: 3,
        borderTopColor: colors.primary,
    },

    tabIcon: {
        marginBottom: 4,
    },

    tabLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
    },

    tabLabelActive: {
        color: colors.primary,
    },

    tabLabelInactive: {
        color: colors.gray,
    },

    // ========================================
    // SIDEBAR (Para vistas especiales)
    // ========================================
    sidebar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: width * 0.75,
        backgroundColor: colors.white,
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 12,
    },

    sidebarOverlay: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 999,
    },

    sidebarHeader: {
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.grayLight,
    },

    sidebarLogoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    sidebarLogoIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },

    sidebarLogoText: {
        flex: 1,
    },

    sidebarTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.dark,
        marginBottom: 2,
    },

    sidebarSubtitle: {
        fontSize: 12,
        color: colors.gray,
    },

    sidebarNav: {
        paddingVertical: 12,
    },

    sidebarNavItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginHorizontal: 8,
        marginVertical: 4,
        borderRadius: 10,
    },

    sidebarNavItemActive: {
        backgroundColor: colors.primaryLight,
    },

    sidebarNavIcon: {
        marginRight: 12,
    },

    sidebarNavContent: {
        flex: 1,
    },

    sidebarNavLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.dark,
        marginBottom: 2,
    },

    sidebarNavDescription: {
        fontSize: 11,
        color: colors.gray,
    },

    sidebarNavItemActivLabel: {
        color: colors.white,
    },

    sidebarNavItemActivDescription: {
        color: 'rgba(255, 255, 255, 0.8)',
    },
});
