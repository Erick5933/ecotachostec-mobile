import React, { useEffect, useMemo, useState, useContext, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MobileLayout from '../../components/Layout/MobileLayout';
import { getDetecciones } from '../../api/deteccionApi';
import { getTachos } from '../../api/tachoApi';
import { AuthContext } from '../../context/AuthContext';
import { BarChart, PieChart } from 'react-native-chart-kit';


const COLORS = {
  primary: '#2563EB',
  card: '#FFFFFF',
  border: '#E2E8F0',
  text: '#1F2937',
  gray: '#64748B',
  bg: '#F8FAFC',
  organico: '#10B981',
  inorganico: '#F59E0B',
  reciclable: '#3B82F6',
  otro: '#9CA3AF',
};

const pad = (n) => Math.max(0, Math.min(100, n));

const StatCard = ({ icon, iconColor, title, value, subtitle }) => (
  <View style={{ flex: 1, backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <View style={{ padding: 10, backgroundColor: '#F1F5F9', borderRadius: 12 }}>
        {icon}
      </View>
      <Text style={{ fontSize: 14, color: COLORS.gray, fontWeight: '700' }}>{title}</Text>
    </View>
    <Text style={{ fontSize: 28, fontWeight: '900', color: COLORS.text }}>{value}</Text>
    {!!subtitle && (
      <Text style={{ marginTop: 6, fontSize: 12, color: COLORS.gray }}>{subtitle}</Text>
    )}
  </View>
);

const SegmentedBar = ({ data }) => {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <View>
      <View style={{ height: 24, borderRadius: 12, overflow: 'hidden', backgroundColor: '#E5E7EB', flexDirection: 'row' }}>
        {data.map((d, idx) => (
          <View key={idx} style={{ width: `${pad((d.value / total) * 100)}%`, backgroundColor: d.color, height: '100%' }} />
        ))}
      </View>
      <View style={{ marginTop: 16 }}>
        {data.map((d, idx) => (
          <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingVertical: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: d.color }} />
              <Text style={{ color: COLORS.text, fontWeight: '600', fontSize: 15 }}>{d.label}</Text>
            </View>
            <Text style={{ color: COLORS.gray, fontWeight: '700', fontSize: 15 }}>{total ? Math.round((d.value / total) * 100) : 0}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default function EstadisticasDeteccionesMobile({ navigation }) {
  const { userInfo } = useContext(AuthContext);
  const userId = userInfo?.id || userInfo?.user?.id || null;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tachos, setTachos] = useState([]);
  const [detecciones, setDetecciones] = useState([]);

  const getOwnerId = (t) => t.propietario ?? t.propietario_id ?? t.usuario ?? t.usuario_id ?? t.encargado ?? t.encargado_id;
  const getTipo = (t) => (t.tipo || '').toLowerCase();
  const getTachoId = (d) => {
    const raw = d.tacho_id ?? d.tacho;
    if (typeof raw === 'number') return raw;
    if (typeof raw === 'string') {
      const n = parseInt(raw, 10);
      return Number.isNaN(n) ? (d.tacho?.id ?? null) : n;
    }
    return d.tacho?.id ?? null;
  };
  const getClasificacion = (d) => (d.clasificacion || d.nombre || d.clase_detectada || 'otro').toLowerCase();
  const getConfianza = (d) => {
    const raw = d.confianza_ia ?? d.confianza ?? 0;
    let n = Number(String(raw).replace(',', '.'));
    if (Number.isNaN(n)) n = 0;
    if (n <= 1) return n * 100;
    return n;
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [tachosRes, detRes] = await Promise.all([getTachos(), getDetecciones()]);
      const tachosData = tachosRes.data?.results || tachosRes.data || [];
      const detData = detRes.data?.results || detRes.data || [];
      setTachos(tachosData);
      setDetecciones(detData);
    } catch (e) {
      console.warn('Error cargando datos de estadísticas', e?.message);
      setTachos([]);
      setDetecciones([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  }, [loadData]);

  const computeGroup = (items) => {
    const total = items.length;
    const porClasificacion = items.reduce((acc, d) => {
      const tipo = getClasificacion(d);
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {});
    const confianzaPromedio = total > 0 ? (items.reduce((s, d) => s + getConfianza(d), 0) / total) : 0;
    return { total, porClasificacion, confianzaPromedio };
  };

  const { statsMis, statsEmpresa, statsPublicas } = useMemo(() => {
    const userTachos = userId ? tachos.filter(t => getOwnerId(t) === userId) : [];
    const personales = new Set(userTachos.filter(t => getTipo(t) === 'personal').map(t => t.id));
    // Contar todos los tachos públicos, independientemente del estado, para reflejar web
    const publicos = new Set(tachos.filter(t => getTipo(t) === 'publico').map(t => t.id));
    const empresa = new Set(userTachos.filter(t => getTipo(t) === 'publico').map(t => t.id));

    const mis = detecciones.filter(d => {
      const tId = getTachoId(d);
      return tId && personales.has(tId);
    });

    const deEmpresa = detecciones.filter(d => {
      const tId = getTachoId(d);
      return tId && empresa.has(tId);
    });

    const isDetPublica = (d) => {
      const tipoDet = (d.tacho_tipo || d.tipo_tacho || d.tipo || '').toLowerCase();
      if (tipoDet === 'publico') return true;
      const tId = getTachoId(d);
      return !!tId && publicos.has(tId);
    };

    const publicas = detecciones.filter(isDetPublica);

    return {
      statsMis: computeGroup(mis),
      statsEmpresa: computeGroup(deEmpresa),
      statsPublicas: computeGroup(publicas),
    };
  }, [tachos, detecciones, userId]);

  const prepararDatosPie = (stats) => {
    // Base labels/values sin color; colores se asignan dinámicamente en cada render
    return Object.entries(stats.porClasificacion).map(([tipo, count]) => ({
      label: tipo.charAt(0).toUpperCase() + tipo.slice(1),
      value: count,
    }));
  };

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 32; // Con padding

  const chartConfig = {
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: 12,
      fontWeight: '600',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#E2E8F0',
      strokeWidth: 1,
    },
  };

  // Preparar datos para gráfico de barras comparativo
  const datosBarras = {
    labels: ['Mis Detecciones', 'Mi Empresa', 'Públicas'],
    datasets: [
      {
        data: [statsMis.total, statsEmpresa.total, statsPublicas.total],
        colors: [
          () => COLORS.organico,
          () => COLORS.inorganico, 
          () => COLORS.reciclable,
        ],
      },
      {
        data: [statsMis.confianzaPromedio, statsEmpresa.confianzaPromedio, statsPublicas.confianzaPromedio],
        colors: [
          () => COLORS.organico,
          () => COLORS.inorganico,
          () => COLORS.reciclable,
        ],
      },
    ],
    legend: ['Cantidad', 'Confianza %'],
  };

  // Generar paleta pastel diferente en cada render
  const makePastelPalette = (n) => {
    const startHue = Math.floor(Math.random() * 360);
    const step = 360 / Math.max(1, n);
    const sat = 60; // saturación moderada
    const light = 75; // claro, estilo pastel
    const colors = [];
    for (let i = 0; i < n; i++) {
      const h = (startHue + i * step) % 360;
      colors.push(`hsl(${Math.round(h)}, ${sat}%, ${light}%)`);
    }
    return colors;
  };

  const pieMisData = useMemo(() => {
    const base = prepararDatosPie(statsMis);
    const colors = makePastelPalette(base.length);
    return base.map((d, i) => ({ ...d, color: colors[i] }));
  }, [statsMis.total, statsMis.porClasificacion]);

  const piePublicasData = useMemo(() => {
    const base = prepararDatosPie(statsPublicas);
    const colors = makePastelPalette(base.length);
    return base.map((d, i) => ({ ...d, color: colors[i] }));
  }, [statsPublicas.total, statsPublicas.porClasificacion]);

  if (loading) {
    return (
      <MobileLayout title="Estadísticas" subtitle="Detecciones">
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 12, color: COLORS.gray }}>Cargando estadísticas...</Text>
        </View>
      </MobileLayout>
    );
  }

  const allZero = statsMis.total === 0 && statsEmpresa.total === 0 && statsPublicas.total === 0;

  return (
    <MobileLayout title="Estadísticas de Detecciones" subtitle="Resumen" headerBgColor="#10B981">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {allZero ? (
          <View style={{ margin: 16, padding: 24, alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border }}>
            <MaterialCommunityIcons name="brain" size={42} color={COLORS.gray} />
            <Text style={{ marginTop: 10, fontSize: 16, fontWeight: '700', color: COLORS.text }}>No hay datos de detecciones</Text>
            <Text style={{ marginTop: 6, fontSize: 13, color: COLORS.gray, textAlign: 'center' }}>Crea algunas detecciones para ver estadísticas</Text>
          </View>
        ) : (
          <>
            {/* Tarjetas de Resumen - Estilo Web */}
            <View style={{ paddingVertical: 16 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
                {/* Mis Detecciones */}
                <View style={{ 
                backgroundColor: COLORS.card, 
                borderRadius: 16, 
                padding: 20, 
                borderWidth: 1, 
                borderColor: COLORS.border,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
                width: 240,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <View style={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: 12, 
                    backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <MaterialCommunityIcons name="brain" size={24} color={COLORS.organico} />
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.text }} numberOfLines={1} ellipsizeMode="tail">Mis Detecciones</Text>
                </View>
                <Text style={{ fontSize: 36, fontWeight: '900', color: COLORS.text, marginBottom: 8 }}>
                  {statsMis.total}
                </Text>
                <Text style={{ fontSize: 13, color: COLORS.gray }}>
                  Confianza promedio: {statsMis.confianzaPromedio.toFixed(1)}%
                </Text>
                </View>

                {/* Mi Empresa */}
                <View style={{ 
                  backgroundColor: COLORS.card, 
                  borderRadius: 16, 
                  padding: 20, 
                  borderWidth: 1, 
                  borderColor: COLORS.border,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                  width: 240,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <View style={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 12, 
                      backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <MaterialCommunityIcons name="trending-up" size={24} color={COLORS.reciclable} />
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.text }} numberOfLines={1} ellipsizeMode="tail">Mi Empresa</Text>
                  </View>
                  <Text style={{ fontSize: 36, fontWeight: '900', color: COLORS.text, marginBottom: 8 }}>
                    {statsEmpresa.total}
                  </Text>
                  <Text style={{ fontSize: 13, color: COLORS.gray }}>
                    Confianza promedio: {statsEmpresa.confianzaPromedio.toFixed(1)}%
                  </Text>
                </View>

                {/* Públicas */}
                <View style={{ 
                backgroundColor: COLORS.card, 
                borderRadius: 16, 
                padding: 20, 
                borderWidth: 1, 
                borderColor: COLORS.border,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
                width: 240,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <View style={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: 12, 
                    backgroundColor: 'rgba(245, 158, 11, 0.1)', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <MaterialCommunityIcons name="chart-bar" size={24} color={COLORS.inorganico} />
                  </View>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.text }} numberOfLines={1} ellipsizeMode="tail">Públicas</Text>
                </View>
                <Text style={{ fontSize: 36, fontWeight: '900', color: COLORS.text, marginBottom: 8 }}>
                  {statsPublicas.total}
                </Text>
                <Text style={{ fontSize: 13, color: COLORS.gray }}>
                  Confianza promedio: {statsPublicas.confianzaPromedio.toFixed(1)}%
                </Text>
              </View>
              </ScrollView>
            </View>

            {/* Gráfico de Barras - Comparación Total */}
            <View style={{ margin: 16, marginBottom: 12, backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 16 }}>Comparación Total</Text>
              
              <BarChart
                data={{
                  labels: ['Mis\nDetecciones', 'Mi\nEmpresa', 'Públicas'],
                  datasets: [
                    {
                      data: [statsMis.total || 0, statsEmpresa.total || 0, statsPublicas.total || 0],
                      color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
                    },
                  ],
                }}
                width={chartWidth - 32}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                  barPercentage: 0.6,
                }}
                style={{
                  borderRadius: 12,
                }}
                showValuesOnTopOfBars
                withInnerLines={true}
                fromZero
              />

              {/* Leyenda de confianza */}
              <View style={{ marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <View style={{ width: 12, height: 12, backgroundColor: '#3B82F6', borderRadius: 2, marginRight: 8 }} />
                  <Text style={{ fontSize: 12, color: COLORS.gray, fontWeight: '600' }}>Cantidad</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 12, height: 12, backgroundColor: COLORS.organico, borderRadius: 2, marginRight: 8 }} />
                  <Text style={{ fontSize: 12, color: COLORS.gray, fontWeight: '600' }}>Confianza %</Text>
                </View>
              </View>

              {/* Stats detalladas */}
              <View style={{ marginTop: 16, gap: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, color: COLORS.text, fontWeight: '700' }}>Mis Detecciones</Text>
                  <View style={{ flexDirection: 'row', gap: 16 }}>
                    <Text style={{ fontSize: 13, color: COLORS.gray }}>Cantidad: <Text style={{ fontWeight: '700', color: COLORS.text }}>{statsMis.total}</Text></Text>
                    <Text style={{ fontSize: 13, color: COLORS.gray }}>Confianza: <Text style={{ fontWeight: '700', color: COLORS.text }}>{statsMis.confianzaPromedio.toFixed(1)}%</Text></Text>
                  </View>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, color: COLORS.text, fontWeight: '700' }}>Mi Empresa</Text>
                  <View style={{ flexDirection: 'row', gap: 16 }}>
                    <Text style={{ fontSize: 13, color: COLORS.gray }}>Cantidad: <Text style={{ fontWeight: '700', color: COLORS.text }}>{statsEmpresa.total}</Text></Text>
                    <Text style={{ fontSize: 13, color: COLORS.gray }}>Confianza: <Text style={{ fontWeight: '700', color: COLORS.text }}>{statsEmpresa.confianzaPromedio.toFixed(1)}%</Text></Text>
                  </View>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, color: COLORS.text, fontWeight: '700' }}>Públicas</Text>
                  <View style={{ flexDirection: 'row', gap: 16 }}>
                    <Text style={{ fontSize: 13, color: COLORS.gray }}>Cantidad: <Text style={{ fontWeight: '700', color: COLORS.text }}>{statsPublicas.total}</Text></Text>
                    <Text style={{ fontSize: 13, color: COLORS.gray }}>Confianza: <Text style={{ fontWeight: '700', color: COLORS.text }}>{statsPublicas.confianzaPromedio.toFixed(1)}%</Text></Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Distribución Mis Detecciones */}
            {statsMis.total > 0 && (
              <View style={{ marginHorizontal: 16, marginBottom: 12, backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 16 }}>Distribución Mis Detecciones</Text>
                
                {/* Gráfico de Pastel */}
                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                  <PieChart
                    data={pieMisData.map(d => ({
                      name: d.label,
                      population: d.value,
                      color: d.color,
                      legendFontColor: COLORS.gray,
                      legendFontSize: 13,
                    }))}
                    width={chartWidth - 32}
                    height={200}
                    chartConfig={{
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="0"
                    hasLegend={true}
                    center={[10, 0]}
                    absolute
                  />
                </View>

                {/* Barra segmentada */}
                <SegmentedBar data={prepararDatosPie(statsMis)} />
              </View>
            )}

            {/* Distribución Detecciones Públicas */}
            {statsPublicas.total > 0 && (
              <View style={{ marginHorizontal: 16, marginBottom: 20, backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 16 }}>Distribución Detecciones Públicas</Text>
                
                {/* Gráfico de Pastel */}
                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                  <PieChart
                    data={piePublicasData.map(d => ({
                      name: d.label,
                      population: d.value,
                      color: d.color,
                      legendFontColor: COLORS.gray,
                      legendFontSize: 13,
                    }))}
                    width={chartWidth - 32}
                    height={200}
                    chartConfig={{
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="0"
                    hasLegend={true}
                    center={[10, 0]}
                    absolute
                  />
                </View>

                {/* Barra segmentada */}
                <SegmentedBar data={prepararDatosPie(statsPublicas)} />
              </View>
            )}

            {/* Botón de acción */}
            <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
              <TouchableOpacity
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  backgroundColor: COLORS.primary, 
                  paddingVertical: 14, 
                  borderRadius: 12,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                onPress={() => navigation.navigate('MisDetecciones')}
              >
                <Ionicons name="arrow-back" size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 15 }}>Volver a Mis Detecciones</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </MobileLayout>
  );
}