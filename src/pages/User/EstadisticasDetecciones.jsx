import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { styles as globalStyles } from '../../styles/UserPortalStyles';

const { width } = Dimensions.get('window');

export default function EstadisticasDetecciones({ misDetecciones, deteccionesEmpresa }) {

    // Datos para gráfico circular (Clasificación)
    const clasificacionData = [
        {
            name: 'Orgánico',
            population: misDetecciones.filter(d => d.clasificacion?.toLowerCase() === 'organico').length,
            color: '#10B981',
            legendFontColor: '#64748B',
            legendFontSize: 12,
        },
        {
            name: 'Inorgánico',
            population: misDetecciones.filter(d => d.clasificacion?.toLowerCase() === 'inorganico').length,
            color: '#EF4444',
            legendFontColor: '#64748B',
            legendFontSize: 12,
        },
        {
            name: 'Reciclable',
            population: misDetecciones.filter(d => d.clasificacion?.toLowerCase() === 'reciclable').length,
            color: '#3B82F6',
            legendFontColor: '#64748B',
            legendFontSize: 12,
        },
    ].filter(item => item.population > 0);

    // Configuración del gráfico
    const chartConfig = {
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        color: (opacity = 1) => `rgba(45, 106, 79, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.7,
        decimalPlaces: 0,
    };

    return (
        <View>
            {/* Resumen Cards */}
            <View style={globalStyles.statsGrid}>
                <View style={styles.miniStatCard}>
                    <Text style={styles.miniStatValue}>{misDetecciones.length}</Text>
                    <Text style={styles.miniStatLabel}>Total</Text>
                </View>
                <View style={[styles.miniStatCard, { borderLeftColor: '#10B981' }]}>
                    <Text style={styles.miniStatValue}>{clasificacionData.find(d => d.name === 'Orgánico')?.population || 0}</Text>
                    <Text style={styles.miniStatLabel}>Orgánico</Text>
                </View>
                <View style={[styles.miniStatCard, { borderLeftColor: '#3B82F6' }]}>
                    <Text style={styles.miniStatValue}>{clasificacionData.find(d => d.name === 'Reciclable')?.population || 0}</Text>
                    <Text style={styles.miniStatLabel}>Reciclable</Text>
                </View>
            </View>

            {/* Gráfico Circular */}
            {clasificacionData.length > 0 ? (
                <View style={globalStyles.card}>
                    <View style={globalStyles.cardHeader}>
                        <View style={globalStyles.cardHeaderLeft}>
                            <Ionicons name="pie-chart-outline" size={18} color="#3B82F6" style={{ marginRight: 8 }} />
                            <Text style={globalStyles.cardTitle}>Por Clasificación</Text>
                        </View>
                    </View>
                    <View style={{ alignItems: 'center', padding: 16 }}>
                        <PieChart
                            data={clasificacionData}
                            width={width - 64}
                            height={220}
                            chartConfig={chartConfig}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            absolute
                        />
                    </View>
                </View>
            ) : (
                <View style={globalStyles.emptyState}>
                    <Text style={globalStyles.emptyStateText}>No hay datos suficientes para gráficos</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    miniStatCard: {
        width: (width - 48) / 3.2,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        elevation: 2,
        borderLeftWidth: 4,
        borderLeftColor: '#6366F1', // default color
        marginBottom: 16,
        alignItems: 'center',
    },
    miniStatValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1E293B',
    },
    miniStatLabel: {
        fontSize: 10,
        color: '#64748B',
        marginTop: 4,
        textTransform: 'uppercase',
    }
});
