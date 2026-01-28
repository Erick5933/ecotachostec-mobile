// src/pages/Tachos/TachosCercaDeMi.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getTachos } from '../../api/tachoApi';
import { colors } from '../../styles/mobileStyles';

// Map styling (muted/silver) to reduce saturation and improve readability
const MAP_STYLE_SILVER = [
  { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
  { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dadada' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  { featureType: 'transit.line', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
  { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9c9c9' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] }
];

const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export default function TachosCercaDeMi({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [userLoc, setUserLoc] = useState(null);
  const [tachosPublicos, setTachosPublicos] = useState([]);
  const [tachosCerca, setTachosCerca] = useState([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const getUserLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setUserLoc({ lat: -2.90055, lon: -79.00453 }); // Cuenca fallback
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserLoc({ lat: pos.coords.latitude, lon: pos.coords.longitude });
    } catch (e) {
      setUserLoc({ lat: -2.90055, lon: -79.00453 });
    }
  }, []);

  const loadTachos = useCallback(async () => {
    try {
      const res = await getTachos();
      const data = res?.data?.results || res?.data || [];

      const publicosActivos = data.filter(t => t?.tipo === 'publico' && t?.estado === 'activo');
      setTachosPublicos(publicosActivos);

      if (userLoc) {
        const cerca = publicosActivos
          .filter(t => {
            const lat = parseFloat(t.ubicacion_lat);
            const lon = parseFloat(t.ubicacion_lon);
            if (isNaN(lat) || isNaN(lon)) return false;
            const d = haversineKm(userLoc.lat, userLoc.lon, lat, lon);
            return d <= 10;
          })
          .map(t => {
            const lat = parseFloat(t.ubicacion_lat);
            const lon = parseFloat(t.ubicacion_lon);
            const d = haversineKm(userLoc.lat, userLoc.lon, lat, lon);
            return { ...t, _distKm: d };
          })
          .sort((a,b) => a._distKm - b._distKm);
        setTachosCerca(cerca);
      }
    } catch (e) {
      console.warn('Error cargando tachos', e?.message);
      setTachosPublicos([]);
      setTachosCerca([]);
    }
  }, [userLoc]);

  useEffect(() => {
    (async () => {
      await getUserLocation();
    })();
  }, [getUserLocation]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadTachos();
      setLoading(false);
    })();
  }, [userLoc, loadTachos]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await getUserLocation();
      await loadTachos();
    } finally {
      setRefreshing(false);
    }
  }, [getUserLocation, loadTachos]);

  const filtered = search
    ? tachosCerca.filter(t => {
        const s = search.toLowerCase();
        return (
          (t.nombre||'').toLowerCase().includes(s) ||
          (t.codigo||'').toLowerCase().includes(s) ||
          (t.empresa_nombre||'').toLowerCase().includes(s)
        );
      })
    : tachosCerca;

  const openTacho = (tacho) => {
    navigation.navigate('TachoDetail', { id: tacho.id });
  };

  const region = userLoc ? {
    latitude: userLoc.lat,
    longitude: userLoc.lon,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  } : null;

  return (
    <View style={styles.container}>
      {/* Header (card style) */}
      <View style={styles.headerCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="map" size={20} color="#EA580C" style={{ marginRight: 12 }} />
            <View>
              <Text style={styles.headerTitle}>Tachos Públicos Cerca de Mí</Text>
              <Text style={styles.headerSubtitle}>Encuentra tachos activos en un radio de 10km</Text>
            </View>
          </View>
          <View style={{ width: 1 }} />
        </View>
      </View>

      {/* Centered action between header and map */}
      <View style={styles.centerActions}>
        <TouchableOpacity style={styles.primaryBtn} onPress={getUserLocation}>
          <Ionicons name="navigate" size={18} color="#FFFFFF" />
          <Text style={styles.primaryBtnText}>Actualizar ubicación</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Map Section */}
        {region ? (
          <View style={styles.mapCard}>
            <View style={styles.mapWrapper}>
              <MapView
                style={styles.map}
                region={region}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                customMapStyle={MAP_STYLE_SILVER}
                showsUserLocation
                showsMyLocationButton
              >
                <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }}>
                  <View style={[styles.marker, styles.markerUser]}>
                    <Ionicons name="person" size={20} color="#FFFFFF" />
                  </View>
                  <Callout><Text>Tu ubicación</Text></Callout>
                </Marker>

                {filtered.map(t => {
                  const lat = parseFloat(t.ubicacion_lat);
                  const lon = parseFloat(t.ubicacion_lon);
                  if (isNaN(lat) || isNaN(lon)) return null;
                  return (
                    <Marker key={t.id} coordinate={{ latitude: lat, longitude: lon }}>
                      <View style={[styles.marker, styles.markerTacho]}>
                        <MaterialCommunityIcons name="trash-can" size={20} color="#FFFFFF" />
                      </View>
                      <Callout onPress={() => openTacho(t)}>
                        <View style={styles.calloutContent}>
                          <Text style={styles.calloutTitle}>{t.nombre}</Text>
                          <Text style={styles.calloutCode}>{t.codigo}</Text>
                          <Text style={styles.calloutDistance}>Distancia: {(t._distKm ?? 0).toFixed(1)} km</Text>
                          <TouchableOpacity style={styles.calloutBtn} onPress={() => openTacho(t)}>
                            <Text style={styles.calloutBtnText}>Ver detalle</Text>
                          </TouchableOpacity>
                        </View>
                      </Callout>
                    </Marker>
                  );
                })}
              </MapView>
            </View>
          </View>
        ) : null}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color={colors.gray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por código, nombre o empresa..."
              placeholderTextColor={colors.gray}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          {region ? (
            <Text style={{ color: '#64748B', marginTop: 8 }}>
              Tu ubicación: {region.latitude.toFixed(4)}, {region.longitude.toFixed(4)}
            </Text>
          ) : null}
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>
            {filtered.length} tachos encontrados en un radio de 10km
          </Text>
        </View>

        {/* List (card rows) */}
        <View style={styles.cardList}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="location-outline" size={48} color={colors.gray} />
              <Text style={styles.emptyTitle}>No hay tachos públicos cercanos</Text>
              <Text style={styles.emptyText}>Amplía el radio o actualiza tu ubicación</Text>
            </View>
          ) : (
            filtered.map((t, idx) => (
              <View key={t.id} style={[styles.itemRow, idx > 0 ? { borderTopWidth: 1, borderTopColor: '#F1F5F9' } : null]}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={styles.itemTitle}>{t.nombre}</Text>
                    <View style={styles.distancePill}>
                      <Text style={styles.distanceText}>{(t._distKm ?? 0).toFixed(1)} km</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>{(t.estado || 'activo').toLowerCase() === 'activo' ? 'Activo' : t.estado}</Text>
                    </View>
                    <Text style={styles.itemMeta}>{t.codigo}</Text>
                    <Text style={styles.itemMeta}>{t.empresa_nombre || 'Público'}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.chevronBtn} onPress={() => openTacho(t)}>
                  <Ionicons name="chevron-forward-outline" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Header
  headerCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    flex: 1,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.dark,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.gray,
    lineHeight: 18,
  },
    centerActions: {
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 8,
    },
    primaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    primaryBtnText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 14,
    },
  btnLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  btnLocationText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark,
  },

  scrollView: {
    flex: 1,
  },

  // Map Section
  mapCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  mapWrapper: {
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  marker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  markerUser: {
    backgroundColor: '#3B82F6',
  },
  markerTacho: {
    backgroundColor: colors.primary,
  },
  calloutContent: {
    maxWidth: 220,
    padding: 4,
  },
  calloutTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.dark,
    marginBottom: 2,
  },
  calloutCode: {
    fontSize: 13,
    color: colors.gray,
    marginBottom: 6,
  },
  calloutDistance: {
    fontSize: 13,
    color: colors.dark,
    marginBottom: 8,
  },
  calloutBtn: {
    backgroundColor: '#E0F2FE',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  calloutBtnText: {
    color: '#0369A1',
    fontWeight: '600',
    fontSize: 13,
  },

  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.dark,
    paddingVertical: 10,
  },

  // Summary
  summaryCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  summaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.dark,
  },

  // List (card rows)
  cardList: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  distancePill: {
    backgroundColor: '#FFEDD5',
    borderColor: '#FED7AA',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  distanceText: {
    color: '#EA580C',
    fontWeight: '700',
    fontSize: 12,
  },
  statusBadge: {
    backgroundColor: '#DCFCE7',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#065F46',
    fontWeight: '700',
    fontSize: 12,
  },
  itemMeta: {
    color: '#64748B',
    marginRight: 10,
  },
  chevronBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E0F2FE',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  viewBtnText: {
    color: '#0369A1',
    fontWeight: '600',
    fontSize: 12,
  },

  // Empty State
  emptyState: {
    paddingVertical: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.dark,
    marginTop: 16,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
});