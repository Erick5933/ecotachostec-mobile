// src/styles/LandingStyles.js
import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isTablet = width >= 768;

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },

    // Header Styles (SIN Blur)
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
    },
    headerBlur: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logoText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    logoHighlight: {
        color: '#4CAF50',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    loginButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    loginButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    registerButton: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    registerButtonText: {
        color: '#fff',
    },

    // Hero Section
    heroSection: {
        minHeight: height * 0.9,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 100 : 80,
        overflow: 'hidden',
        position: 'relative',
    },
    heroGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    particlesContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    particle: {
        position: 'absolute',
        width: 4,
        height: 4,
        backgroundColor: '#ffffff',
        borderRadius: 2,
        opacity: 0.4,
    },
    heroContent: {
        alignItems: 'center',
        maxWidth: 800,
        width: '100%',
        zIndex: 1,
    },
    heroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 25,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: 'rgba(76, 175, 80, 0.3)',
    },
    heroBadgeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4CAF50',
    },
    heroTitle: {
        fontSize: isSmallDevice ? 28 : isTablet ? 44 : 36,
        fontWeight: '800',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: isSmallDevice ? 36 : isTablet ? 52 : 44,
        paddingHorizontal: 10,
    },
    heroHighlight: {
        color: '#E8F5E9',
    },
    heroDescription: {
        fontSize: isSmallDevice ? 14 : 16,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
        maxWidth: 600,
        paddingHorizontal: 20,
    },
    heroActions: {
        flexDirection: isSmallDevice ? 'column' : 'row',
        gap: 12,
        marginBottom: 40,
        width: isSmallDevice ? '100%' : 'auto',
        alignItems: 'center',
    },
    heroButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 30,
        minWidth: isSmallDevice ? '100%' : 160,
        maxWidth: isSmallDevice ? '100%' : 200,
    },
    heroButtonPrimary: {
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    heroButtonSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    heroButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4CAF50',
    },
    heroButtonSecondaryText: {
        color: '#ffffff',
    },

    // Stats Section
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 25,
        marginTop: 20,
        width: '100%',
        maxWidth: 600,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: isSmallDevice ? 24 : 32,
        fontWeight: '800',
        color: '#4CAF50',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
        textAlign: 'center',
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    scrollIndicator: {
        position: 'absolute',
        bottom: 30,
        alignItems: 'center',
        gap: 8,
        zIndex: 1,
    },
    scrollText: {
        fontSize: 14,
        color: '#ffffff',
        fontWeight: '500',
    },

    // General Sections
    section: {
        padding: isSmallDevice ? 24 : 40,
        backgroundColor: '#ffffff',
    },
    darkSection: {
        padding: isSmallDevice ? 24 : 40,
    },
    sectionContainer: {
        width: '100%',
        alignSelf: 'center',
    },
    sectionHeader: {
        alignItems: 'center',
        marginBottom: 40,
        paddingHorizontal: 10,
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
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    sectionBadgeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4CAF50',
    },
    sectionBadgeLightText: {
        color: '#ffffff',
    },
    sectionTitle: {
        fontSize: isSmallDevice ? 24 : isTablet ? 36 : 32,
        fontWeight: '800',
        color: '#1a1a1a',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: isSmallDevice ? 32 : 40,
        paddingHorizontal: 20,
    },
    sectionTitleLight: {
        color: '#ffffff',
    },
    sectionDescription: {
        fontSize: isSmallDevice ? 14 : 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: 600,
        paddingHorizontal: 20,
    },
    sectionDescriptionLight: {
        color: 'rgba(255, 255, 255, 0.9)',
    },

    // Features Grid
    featuresGrid: {
        flexDirection: isSmallDevice ? 'column' : isTablet ? 'row' : 'column',
        gap: 20,
        justifyContent: 'center',
    },
    featureCard: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e9ecef',
        alignItems: 'center',
        marginBottom: isSmallDevice ? 16 : 0,
        minWidth: isSmallDevice ? '100%' : 280,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
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
        color: '#1a1a1a',
        marginBottom: 12,
        textAlign: 'center',
    },
    featureDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },

    // Tachos Grid
    tachosGrid: {
        flexDirection: isSmallDevice ? 'column' : 'row',
        flexWrap: 'wrap',
        gap: 20,
        justifyContent: 'center',
    },
    tachoFeature: {
        flex: 1,
        minWidth: isSmallDevice ? '100%' : 160,
        maxWidth: isSmallDevice ? '100%' : 180,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        marginBottom: 16,
    },
    tachoFeatureTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    tachoFeatureText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        lineHeight: 18,
    },

    // CTA Box
    ctaBox: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: isSmallDevice ? 24 : 32,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        marginTop: 40,
    },
    ctaTitle: {
        fontSize: isSmallDevice ? 20 : 24,
        fontWeight: '800',
        color: '#ffffff',
        marginBottom: 12,
        textAlign: 'center',
    },
    ctaDescription: {
        fontSize: isSmallDevice ? 14 : 16,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },

    // Final CTA
    finalCta: {
        padding: isSmallDevice ? 40 : 80,
        alignItems: 'center',
    },
    finalCtaContent: {
        alignItems: 'center',
        maxWidth: 800,
    },
    finalCtaTitle: {
        fontSize: isSmallDevice ? 24 : isTablet ? 36 : 32,
        fontWeight: '800',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: isSmallDevice ? 32 : 40,
        paddingHorizontal: 20,
    },
    finalCtaDescription: {
        fontSize: isSmallDevice ? 16 : 18,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    finalCtaActions: {
        flexDirection: isSmallDevice ? 'column' : 'row',
        gap: 16,
        width: isSmallDevice ? '100%' : 'auto',
        alignItems: 'center',
    },
    finalCtaButton: {
        minWidth: isSmallDevice ? '100%' : 200,
        maxWidth: isSmallDevice ? '100%' : 250,
    },

    // Footer
    footer: {
        backgroundColor: '#f8f9fa',
        padding: isSmallDevice ? 24 : 40,
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },
    footerContent: {
        alignItems: 'center',
    },
    footerLogo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    footerLogoText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#4CAF50',
    },
    footerCopyright: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        textAlign: 'center',
    },
    footerTagline: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: '500',
        textAlign: 'center',
    },
});