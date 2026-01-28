// src/components/Layout/MobileLayout.jsx
import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Platform,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { layoutStyles } from '../../styles/layoutStyles';

const { width } = Dimensions.get('window');

export default function MobileLayout({
    children,
    title = "EcoTachosTec",
    subtitle = "Smart IoT System",
    showHeader = true,
    headerColor = '#10B981',
}) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <SafeAreaView style={layoutStyles.safeArea}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={headerColor}
                translucent={false}
            />

            {/* Header */}
            {showHeader && (
                <LinearGradient
                    colors={[headerColor, headerColor === '#10B981' ? '#059669' : '#3B82F6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={layoutStyles.header}
                >
                    <View style={layoutStyles.headerContent}>
                        <View style={layoutStyles.headerLeft}>
                            <Ionicons
                                name="people"
                                size={28}
                                color="#FFFFFF"
                                style={{ marginRight: 12 }}
                            />
                            <View>
                                <Text style={layoutStyles.headerTitle}>{title}</Text>
                                <Text style={layoutStyles.headerSubtitle}>{subtitle}</Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            )}

            {/* Main Content */}
            <View style={layoutStyles.container}>
                <ScrollView
                    style={layoutStyles.content}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 16 }}
                >
                    {children}
                </ScrollView>
            </View>

            {/* Footer */}
            <View style={layoutStyles.footer}>
                <Text style={layoutStyles.footerText}>
                    © 2025 EcoTachosTec
                </Text>
            </View>
        </SafeAreaView>
    );
}
