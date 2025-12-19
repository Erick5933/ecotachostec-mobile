// src/pages/Detecciones/DeteccionList.jsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    TextInput,
    ScrollView,
    Alert,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { deteccionStyles, deteccionColors } from '../../styles/deteccionesStyles';
import { getDetecciones, getDeteccionesFiltradas } from '../../api/deteccionApi';
import { getTachos } from '../../api/tachoApi';

const { width } = Dimensions.get('window');

// Componente de gráfico de barras simple
const SimpleBarChart = ({ data, labels, height = 150 }) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data);
    const barWidth = (width - 40) / data.length - 10; // 40 padding, 10 gap

    return (
        <View style={{ height, marginVertical: 16 }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 4 }}>
                {data.map((value, index) => (
                    <View key={index} style={{ flex: 1, alignItems: 'center' }}>
                        <View
                            style={{
                                width: barWidth,
                                height: `${(value / maxValue) * 80}%`,
                                backgroundColor: index % 2 === 0 ? deteccionColors.primary : deteccionColors.secondary,
                                borderTopLeftRadius: 6,
                                borderTopRightRadius: 6,
                            }}
                        />
                        <Text
                            style={{
                                fontSize: 10,
                                color: deteccionColors.gray,
                                marginTop: 4,
                                textAlign: 'center'
                            }}
                            numberOfLines={1}
                        >
                            {labels[index]}
                        </Text>
                        <Text style={{ fontSize: 9, color: deteccionColors.gray, marginTop: 2 }}>
                            {value}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

// Componente de gráfico de pastel simple (usando anillos concéntricos)
const SimplePieChart = ({ data, size = 120 }) => {
    if (!data || data.length === 0) return null;

    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    const colors = [deteccionColors.primary, deteccionColors.secondary, deteccionColors.error,
        deteccionColors.warning, deteccionColors.info, deteccionColors.success];

    return (
        <View style={{ alignItems: 'center' }}>
            <View style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: deteccionColors.grayLight,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
            }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: deteccionColors.dark }}>
                    {total}
                </Text>
                <Text style={{ fontSize: 10, color: deteccionColors.gray }}>Total</Text>
            </View>

            {/* Leyenda */}
            <View style={{ width: '100%' }}>
                {data.map((item, index) => (
                    <View key={index} style={[deteccionStyles.flexRow, { marginBottom: 8, alignItems: 'center' }]}>
                        <View style={{
                            width: 12,
                            height: 12,
                            borderRadius: 6,
                            backgroundColor: colors[index % colors.length],
                            marginRight: 8,
                        }} />
                        <Text style={{ fontSize: 12, color: deteccionColors.gray, flex: 1 }}>
                            {item.label}
                        </Text>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: deteccionColors.dark }}>
                            {item.value} ({Math.round((item.value / total) * 100)}%)
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const DeteccionList = () => {
    const navigation = useNavigation();
    const [detecciones, setDetecciones] = useState([]);
    const [filteredDetecciones, setFilteredDetecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [tachos, setTachos] = useState([]);

    // Filtros (solo tacho y fecha)
    const [selectedTacho, setSelectedTacho] = useState('all');
    const [dateRange, setDateRange] = useState('all');

    // Estadísticas
    const [stats, setStats] = useState({
        total: 0,
        today: 0,
        thisWeek: 0,
        byLevel: { high: 0, medium: 0, low: 0 },
    });

    // Rango de fechas
    const dateRanges = [
        { id: 'all', label: 'Todas' },
        { id: 'today', label: 'Hoy' },
        { id: 'week', label: 'Esta semana' },
        { id: 'month', label: 'Este mes' },
    ];

    // Cargar detecciones y tachos
    const loadData = async () => {
        try {
            setLoading(true);

            // Cargar detecciones
            const deteccionesResponse = await getDetecciones();
            const deteccionesData = deteccionesResponse.data;
            setDetecciones(deteccionesData);

            // Cargar tachos
            const tachosResponse = await getTachos();
            setTachos(tachosResponse.data);

            // Calcular estadísticas
            calculateStats(deteccionesData);

            // Aplicar filtros iniciales
            applyFilters(deteccionesData);
        } catch (error) {
            console.error('Error cargando datos:', error);
            Alert.alert('Error', 'No se pudo cargar las detecciones');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Calcular estadísticas
    const calculateStats = (data) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const total = data.length;
        const todayCount = data.filter(d => {
            const deteccionDate = new Date(d.fecha_deteccion || d.fecha_registro);
            return deteccionDate >= today;
        }).length;

        const weekCount = data.filter(d => {
            const deteccionDate = new Date(d.fecha_deteccion || d.fecha_registro);
            return deteccionDate >= weekAgo;
        }).length;

        // Contar por nivel (asumiendo que hay un campo 'nivel' o 'confianza')
        const byLevel = {
            high: data.filter(d => (d.confianza >= 80) || d.nivel === 'high').length,
            medium: data.filter(d => (d.confianza >= 50 && d.confianza < 80) || d.nivel === 'medium').length,
            low: data.filter(d => (d.confianza < 50) || d.nivel === 'low').length,
        };

        setStats({ total, today: todayCount, thisWeek: weekCount, byLevel });
    };

    // Aplicar filtros
    const applyFilters = (data) => {
        let filtered = [...data];

        // Filtro de búsqueda
        if (searchQuery.trim()) {
            filtered = filtered.filter(d =>
                d.tacho_nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.codigo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (d.descripcion && d.descripcion.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Filtro por tacho
        if (selectedTacho !== 'all') {
            filtered = filtered.filter(d => d.tacho_id === parseInt(selectedTacho));
        }

        // Filtro por fecha
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (dateRange === 'today') {
            filtered = filtered.filter(d => {
                const deteccionDate = new Date(d.fecha_deteccion || d.fecha_registro);
                return deteccionDate >= today;
            });
        } else if (dateRange === 'week') {
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            filtered = filtered.filter(d => {
                const deteccionDate = new Date(d.fecha_deteccion || d.fecha_registro);
                return deteccionDate >= weekAgo;
            });
        } else if (dateRange === 'month') {
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            filtered = filtered.filter(d => {
                const deteccionDate = new Date(d.fecha_deteccion || d.fecha_registro);
                return deteccionDate >= monthAgo;
            });
        }

        setFilteredDetecciones(filtered);
    };

    // Datos para gráficos
    const getChartData = () => {
        // Datos para gráfico de barras (por día de la semana)
        const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const dayCounts = Array(7).fill(0);

        filteredDetecciones.forEach(d => {
            const date = new Date(d.fecha_deteccion || d.fecha_registro);
            const day = date.getDay(); // 0 = Domingo, 1 = Lunes, etc.
            dayCounts[day]++;
        });

        // Datos para gráfico de pastel (por nivel de confianza)
        const pieData = [
            { label: 'Alta Confianza', value: stats.byLevel.high },
            { label: 'Media Confianza', value: stats.byLevel.medium },
            { label: 'Baja Confianza', value: stats.byLevel.low },
        ].filter(item => item.value > 0);

        return {
            barData: {
                values: dayCounts,
                labels: daysOfWeek,
            },
            pieData,
        };
    };

    // Refrescar
    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    // Cargar datos iniciales
    useEffect(() => {
        loadData();
    }, []);

    // Aplicar filtros cuando cambian
    useEffect(() => {
        if (detecciones.length > 0) {
            applyFilters(detecciones);
        }
    }, [searchQuery, selectedTacho, dateRange]);

    // Renderizar item de detección
    const renderItem = ({ item }) => {
        const getConfianzaColor = (confianza) => {
            if (!confianza) return deteccionColors.gray;
            if (confianza >= 80) return '#4CAF50'; // Verde
            if (confianza >= 50) return '#FF9800'; // Naranja
            return '#F44336'; // Rojo
        };

        const getConfianzaLabel = (confianza) => {
            if (!confianza) return 'N/A';
            if (confianza >= 80) return 'Alta';
            if (confianza >= 50) return 'Media';
            return 'Baja';
        };

        const getTachoNombre = () => {
            if (item.tacho_nombre) return item.tacho_nombre;
            if (item.tacho_id) {
                const tacho = tachos.find(t => t.id === item.tacho_id);
                return tacho ? tacho.nombre : `Tacho #${item.tacho_id}`;
            }
            return 'No asignado';
        };

        return (
            <TouchableOpacity
                style={deteccionStyles.detectionItem}
                onPress={() => navigation.navigate('DeteccionDetail', { id: item.id })}
            >
                <View style={deteccionStyles.detectionItemHeader}>
                    <View style={deteccionStyles.flexRow}>
                        <View style={[
                            deteccionStyles.detectionIconContainer,
                            { backgroundColor: 'rgba(156, 39, 176, 0.1)' }
                        ]}>
                            <Ionicons
                                name="analytics"
                                size={22}
                                color="#9C27B0"
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={deteccionStyles.detectionTitle}>
                                {item.nombre || `Detección #${item.id}`}
                            </Text>
                            <Text style={deteccionStyles.detectionCode}>
                                Tacho: {getTachoNombre()}
                            </Text>
                        </View>
                    </View>

                    {item.confianza && (
                        <View style={[
                            deteccionStyles.badge,
                            {
                                backgroundColor: `${getConfianzaColor(item.confianza)}20`,
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                            }
                        ]}>
                            <Text style={[
                                deteccionStyles.badgeText,
                                {
                                    color: getConfianzaColor(item.confianza),
                                    fontSize: 11,
                                }
                            ]}>
                                {getConfianzaLabel(item.confianza)}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={[deteccionStyles.flexRow, { marginTop: 8, gap: 16 }]}>
                    <View style={[deteccionStyles.flexRow, { alignItems: 'center', flex: 1 }]}>
                        <Ionicons name="calendar-outline" size={14} color={deteccionColors.gray} />
                        <Text style={[deteccionStyles.detectionInfoText, { marginLeft: 4 }]}>
                            {new Date(item.fecha_deteccion || item.fecha_registro).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'short',
                            })}
                        </Text>
                    </View>

                    <View style={[deteccionStyles.flexRow, { alignItems: 'center' }]}>
                        <Ionicons name="time-outline" size={14} color={deteccionColors.gray} />
                        <Text style={[deteccionStyles.detectionInfoText, { marginLeft: 4 }]}>
                            {new Date(item.fecha_deteccion || item.fecha_registro).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </Text>
                    </View>

                    {item.confianza && (
                        <View style={[deteccionStyles.flexRow, { alignItems: 'center' }]}>
                            <Ionicons name="stats-chart-outline" size={14} color={deteccionColors.gray} />
                            <Text style={[deteccionStyles.detectionInfoText, { marginLeft: 4 }]}>
                                {item.confianza}%
                            </Text>
                        </View>
                    )}
                </View>

                {item.descripcion && (
                    <Text
                        style={{
                            fontSize: 13,
                            color: deteccionColors.gray,
                            marginTop: 8,
                            lineHeight: 18,
                        }}
                        numberOfLines={2}
                    >
                        {item.descripcion}
                    </Text>
                )}

                <View style={[deteccionStyles.flexRow, { justifyContent: 'space-between', marginTop: 12 }]}>
                    <TouchableOpacity
                        style={[deteccionStyles.btnIcon, {
                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                            width: 36,
                            height: 36,
                        }]}
                        onPress={() => navigation.navigate('DeteccionDetail', { id: item.id })}
                    >
                        <Ionicons name="eye-outline" size={18} color={deteccionColors.primary} />
                    </TouchableOpacity>

                    <View style={[deteccionStyles.flexRow, { gap: 8 }]}>
                        {item.tipo_residuo && (
                            <View style={{
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                backgroundColor: deteccionColors.grayLight,
                                borderRadius: 12,
                            }}>
                                <Text style={{ fontSize: 11, color: deteccionColors.gray }}>
                                    {item.tipo_residuo}
                                </Text>
                            </View>
                        )}

                        {item.imagen && (
                            <Ionicons name="image-outline" size={16} color={deteccionColors.gray} />
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={deteccionStyles.loadingContainer}>
                <ActivityIndicator size="large" color={deteccionColors.primary} />
                <Text style={{ color: deteccionColors.gray, marginTop: 16 }}>
                    Cargando detecciones...
                </Text>
            </View>
        );
    }

    const chartData = getChartData();

    return (
        <View style={deteccionStyles.container}>
            {/* Header */}
            <View style={deteccionStyles.header}>
                <View style={{ flex: 1 }}>
                    <Text style={deteccionStyles.headerTitle}>
                        <Ionicons name="analytics" size={24} color={deteccionColors.primary} />
                        Detecciones
                    </Text>
                    <Text style={deteccionStyles.headerSubtitle}>
                        {stats.total} detecciones registradas
                    </Text>
                </View>

                <TouchableOpacity
                    style={[deteccionStyles.btnIcon, deteccionStyles.btnIconExport]}
                    onPress={() => navigation.navigate('DeteccionForm')}
                >
                    <Ionicons name="add" size={22} color={deteccionColors.success} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[deteccionColors.primary]}
                    />
                }
            >
                {/* Barra de búsqueda */}
                <View style={deteccionStyles.filterSection}>
                    <View style={deteccionStyles.searchInputContainer}>
                        <Ionicons name="search" size={20} color={deteccionColors.gray} />
                        <TextInput
                            style={deteccionStyles.searchInput}
                            placeholder="Buscar por tacho o código..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor={deteccionColors.gray}
                            returnKeyType="search"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color={deteccionColors.gray} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Filtros */}
                <View style={deteccionStyles.filterSection}>
                    <View style={deteccionStyles.filterRow}>
                        <Ionicons name="funnel-outline" size={18} color={deteccionColors.gray} />
                        <Text style={{ color: deteccionColors.gray, fontWeight: '500' }}>Filtros:</Text>
                    </View>

                    {/* Filtro por Tacho */}
                    <Text style={[deteccionStyles.detailLabel, deteccionStyles.mbSm]}>Por Tacho:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                        <View style={deteccionStyles.chipContainer}>
                            <TouchableOpacity
                                style={[
                                    deteccionStyles.chip,
                                    selectedTacho === 'all' && deteccionStyles.chipActive
                                ]}
                                onPress={() => setSelectedTacho('all')}
                            >
                                <Text style={[
                                    deteccionStyles.chipText,
                                    selectedTacho === 'all' && deteccionStyles.chipTextActive
                                ]}>
                                    Todos
                                </Text>
                            </TouchableOpacity>

                            {tachos.map(tacho => (
                                <TouchableOpacity
                                    key={tacho.id}
                                    style={[
                                        deteccionStyles.chip,
                                        selectedTacho === tacho.id.toString() && deteccionStyles.chipActive
                                    ]}
                                    onPress={() => setSelectedTacho(tacho.id.toString())}
                                >
                                    <Text style={[
                                        deteccionStyles.chipText,
                                        selectedTacho === tacho.id.toString() && deteccionStyles.chipTextActive
                                    ]}>
                                        {tacho.nombre}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    {/* Filtro por Fecha */}
                    <Text style={[deteccionStyles.detailLabel, deteccionStyles.mbSm]}>Por Fecha:</Text>
                    <View style={deteccionStyles.chipContainer}>
                        {dateRanges.map(range => (
                            <TouchableOpacity
                                key={range.id}
                                style={[
                                    deteccionStyles.chip,
                                    dateRange === range.id && deteccionStyles.chipActive
                                ]}
                                onPress={() => setDateRange(range.id)}
                            >
                                <Text style={[
                                    deteccionStyles.chipText,
                                    dateRange === range.id && deteccionStyles.chipTextActive
                                ]}>
                                    {range.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Estadísticas */}
                <View style={[deteccionStyles.card, deteccionStyles.cardHighlight]}>
                    <Text style={deteccionStyles.chartTitle}>Resumen General</Text>

                    <View style={deteccionStyles.statsRow}>
                        <View style={deteccionStyles.statCard}>
                            <View style={[
                                deteccionStyles.statIconContainer,
                                { backgroundColor: 'rgba(33, 150, 243, 0.1)' }
                            ]}>
                                <Ionicons name="analytics" size={24} color={deteccionColors.primary} />
                            </View>
                            <Text style={deteccionStyles.statValue}>{stats.total}</Text>
                            <Text style={deteccionStyles.statLabel}>Total</Text>
                        </View>

                        <View style={deteccionStyles.statCard}>
                            <View style={[
                                deteccionStyles.statIconContainer,
                                { backgroundColor: 'rgba(76, 175, 80, 0.1)' }
                            ]}>
                                <Ionicons name="today" size={24} color="#4CAF50" />
                            </View>
                            <Text style={deteccionStyles.statValue}>{stats.today}</Text>
                            <Text style={deteccionStyles.statLabel}>Hoy</Text>
                        </View>

                        <View style={deteccionStyles.statCard}>
                            <View style={[
                                deteccionStyles.statIconContainer,
                                { backgroundColor: 'rgba(255, 152, 0, 0.1)' }
                            ]}>
                                <Ionicons name="calendar" size={24} color="#FF9800" />
                            </View>
                            <Text style={deteccionStyles.statValue}>{stats.thisWeek}</Text>
                            <Text style={deteccionStyles.statLabel}>Esta semana</Text>
                        </View>
                    </View>
                </View>

                {/* Gráficos */}
                <View style={[deteccionStyles.card, { marginTop: 12 }]}>
                    <Text style={deteccionStyles.chartTitle}>Distribución por Día</Text>
                    <Text style={deteccionStyles.chartSubtitle}>
                        Número de detecciones por día de la semana
                    </Text>

                    <SimpleBarChart
                        data={chartData.barData.values}
                        labels={chartData.barData.labels}
                        height={160}
                    />
                </View>

                <View style={[deteccionStyles.card, { marginTop: 12 }]}>
                    <Text style={deteccionStyles.chartTitle}>Nivel de Confianza</Text>
                    <Text style={deteccionStyles.chartSubtitle}>
                        Distribución según confianza de las detecciones
                    </Text>

                    <SimplePieChart data={chartData.pieData} size={120} />
                </View>

                {/* Lista de detecciones */}
                <View style={[deteccionStyles.card, { marginTop: 12, marginBottom: 20 }]}>
                    <View style={[deteccionStyles.flexRow, { justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }]}>
                        <Text style={deteccionStyles.chartTitle}>
                            Detecciones ({filteredDetecciones.length})
                        </Text>
                        <View style={[deteccionStyles.flexRow, { gap: 8 }]}>
                            <Ionicons name="filter" size={16} color={deteccionColors.gray} />
                            <Text style={{ fontSize: 12, color: deteccionColors.gray }}>
                                {selectedTacho === 'all' ? 'Todos los tachos' :
                                    tachos.find(t => t.id.toString() === selectedTacho)?.nombre || 'Filtrado'}
                                {dateRange !== 'all' && ` • ${dateRanges.find(r => r.id === dateRange)?.label}`}
                            </Text>
                        </View>
                    </View>

                    {filteredDetecciones.length === 0 ? (
                        <View style={deteccionStyles.emptyContainer}>
                            <Ionicons
                                name="analytics-outline"
                                size={80}
                                color={deteccionColors.grayLight}
                            />
                            <Text style={deteccionStyles.emptyTitle}>No hay detecciones</Text>
                            <Text style={deteccionStyles.emptyText}>
                                {searchQuery || selectedTacho !== 'all' || dateRange !== 'all'
                                    ? 'No se encontraron resultados con los filtros aplicados'
                                    : 'No hay detecciones registradas'}
                            </Text>
                            <TouchableOpacity
                                style={[deteccionStyles.btn, deteccionStyles.btnPrimary, deteccionStyles.mtLg]}
                                onPress={() => navigation.navigate('DeteccionForm')}
                            >
                                <Ionicons name="add" size={20} color={deteccionColors.white} />
                                <Text style={deteccionStyles.btnText}>Crear Primera Detección</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <FlatList
                            data={filteredDetecciones}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id.toString()}
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                        />
                    )}
                </View>
            </ScrollView>

            {/* Botón flotante para agregar */}
            <TouchableOpacity
                style={{
                    position: 'absolute',
                    right: 20,
                    bottom: 20,
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: deteccionColors.primary,
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: deteccionColors.dark,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                }}
                onPress={() => navigation.navigate('DeteccionForm')}
            >
                <Ionicons name="add" size={28} color={deteccionColors.white} />
            </TouchableOpacity>
        </View>
    );
};

export default DeteccionList;