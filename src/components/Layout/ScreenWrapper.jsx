// src/components/Layout/ScreenWrapper.jsx
/**
 * Envuelve las pantallas con el MobileLayout
 * Uso: <ScreenWrapper title="Mi Pantalla">{children}</ScreenWrapper>
 */
import React from 'react';
import MobileLayout from './MobileLayout';

export default function ScreenWrapper({
    children,
    title = "EcoTachosTec",
    subtitle = "Smart IoT System",
    showHeader = true,
    headerBgColor = '#1E40AF',
}) {
    return (
        <MobileLayout
            title={title}
            subtitle={subtitle}
            showHeader={showHeader}
            headerBgColor={headerBgColor}
        >
            {children}
        </MobileLayout>
    );
}
