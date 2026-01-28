import React, { useEffect, useState, useContext } from 'react';
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	FlatList,
	ActivityIndicator,
	TextInput,
	RefreshControl,
	StatusBar,
	Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../context/AuthContext';
import { getDetecciones } from '../../api/deteccionApi';
import { getTachos } from '../../api/tachoApi';
import api from '../../api/axiosConfig';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../../styles/UserPortalStyles';
import { useNavigation } from '@react-navigation/native';

// Importar componentes adicionales si existen
// import EstadisticasDetecciones from './EstadisticasDetecciones';
// import TachosMap from './TachosMap';
// import NuevaDeteccionIA from './NuevaDeteccionIA';

const calcularDistancia = (lat1, lon1, lat2, lon2) => {
	const R = 6371; // Radio de la Tierra en km
	const dLat = (lat2 - lat1) * Math.PI / 180;
	const dLon = (lon2 - lon1) * Math.PI / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
};

export default function UserPortal() {
	const navigation = useNavigation();
	const { userInfo, user: userCtx } = useContext(AuthContext);
	const currentUser = userCtx || userInfo || {};
	const userId = currentUser?.id || currentUser?.user?.id || null;

	const [userLocation, setUserLocation] = useState(null);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [activeView, setActiveView] = useState('overview');

	// Data States
	const [stats, setStats] = useState({
		totalTachos: 0,
		misDetecciones: 0,
		tachosEmpresa: 0,
		tachosPublicosCerca: 0
	});

	const [tachos, setTachos] = useState([]);
	const [misTachos, setMisTachos] = useState([]);
	const [tachosEmpresa, setTachosEmpresa] = useState([]);
	const [detecciones, setDetecciones] = useState([]);
	const [misDetecciones, setMisDetecciones] = useState([]);
	const [deteccionesEmpresa, setDeteccionesEmpresa] = useState([]);
	const [empresaAsociada, setEmpresaAsociada] = useState(null);
	const [tachosCerca, setTachosCerca] = useState([]);

	// Search States
	const [searchTerm, setSearchTerm] = useState('');
	const [searchTermTachos, setSearchTermTachos] = useState('');

	useEffect(() => {
		loadPortalData();
		getUserLocation();
	}, []);

	// Helpers de coordenadas robustos para distintos esquemas
	const getLat = (t) => {
		const v = t?.ubicacion_lat ?? t?.latitud ?? t?.latitude ?? t?.lat ?? t?.coord_lat ?? t?.latitud_ubicacion;
		const n = parseFloat(v);
		return isNaN(n) ? null : n;
	};
	const getLon = (t) => {
		const v = t?.ubicacion_lon ?? t?.longitud ?? t?.longitude ?? t?.lon ?? t?.lng ?? t?.coord_lon ?? t?.longitud_ubicacion;
		const n = parseFloat(v);
		return isNaN(n) ? null : n;
	};

	// Recalcular tachos cercanos cuando cambia la ubicación o el listado
	useEffect(() => {
		if (!userLocation || tachos.length === 0) return;
		const pub = tachos.filter(t => (t.tipo || '').toLowerCase() === 'publico' && (t.estado || '').toLowerCase() === 'activo');
		const cercanos = pub.filter(t => {
			const lat = getLat(t);
			const lon = getLon(t);
			if (lat == null || lon == null) return false;
			const d = calcularDistancia(userLocation.lat, userLocation.lon, lat, lon);
			return d <= 10;
		});
		setTachosCerca(cercanos);
		setStats(prev => ({ ...prev, tachosPublicosCerca: cercanos.length }));
	}, [userLocation, tachos]);

	const loadPortalData = async () => {
		try {
			const [tachosRes, deteccionesRes] = await Promise.all([getTachos(), getDetecciones()]);
			const tachosData = tachosRes.data.results || tachosRes.data || [];
			const deteccionesData = deteccionesRes.data.results || deteccionesRes.data || [];

			// Helpers para robustez en mapeo de campos
			const getOwnerId = (t) => t.propietario ?? t.propietario_id ?? t.usuario ?? t.usuario_id ?? t.encargado ?? t.encargado_id;
			const getTipo = (t) => (t.tipo || '').toLowerCase();
			const getEstado = (t) => (t.estado || '').toLowerCase();
			const getEmpresaNombre = (t) => t.empresa_nombre || t.empresa || t.empresaNombre || null;

			// Filtrado Lógica
			const userTachos = tachosData.filter(t => getOwnerId(t) === userId);
			const tachosPersonales = userTachos.filter(t => getTipo(t) === 'personal');
			const tachosConUsuarioEncargado = tachosData.filter(t => getOwnerId(t) === userId && getTipo(t) === 'publico');

			const empresas = [...new Set(tachosConUsuarioEncargado.map(getEmpresaNombre).filter(Boolean))];
			if (empresas.length > 0) setEmpresaAsociada(empresas[0]);

			// Mis Detecciones (solo de tachos personales)
			const tachoPersonalIds = tachosPersonales.map(t => t.id);
			const userDetecciones = deteccionesData.filter(det =>
				tachoPersonalIds.includes(det.tacho) || (det.tacho_id && tachoPersonalIds.includes(det.tacho_id))
			);

			// Detecciones Empresa
			const empresaTachoIds = tachosConUsuarioEncargado.map(t => t.id);
			const empresaDetecciones = deteccionesData.filter(det =>
				empresaTachoIds.includes(det.tacho) || (det.tacho_id && empresaTachoIds.includes(det.tacho_id))
			);

			// Tachos Públicos activos
			const tachosPublicos = tachosData.filter(t => getTipo(t) === 'publico' && getEstado(t) === 'activo');

			setTachos(tachosData);
			setMisTachos(tachosPersonales);
			setTachosEmpresa(tachosConUsuarioEncargado);
			setDetecciones(deteccionesData);
			setMisDetecciones(userDetecciones);
			setDeteccionesEmpresa(empresaDetecciones);
			// tachosCerca se calculará con la ubicación del usuario en el efecto
			setTachosCerca([]);

			setStats({
				totalTachos: tachosPersonales.length,
				misDetecciones: userDetecciones.length,
				tachosEmpresa: tachosConUsuarioEncargado.length,
				tachosPublicosCerca: 0
			});

		} catch (error) {
			console.error("Error loading data", error);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	const getUserLocation = async () => {
		try {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') {
				setUserLocation({ lat: -2.90055, lon: -79.00453 }); // Fallback: Cuenca
				return;
			}
			const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
			setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
		} catch (error) {
			console.warn('Expo Location error', error);
			setUserLocation({ lat: -2.90055, lon: -79.00453 });
		}
	};

	const onRefresh = () => {
		setRefreshing(true);
		loadPortalData();
		getUserLocation();
	};

	const handleNewDetectionSaved = async (payload) => {
		try {
			await api.post('/detecciones/', payload);
			loadPortalData();
			setActiveView('mydetecciones');
		} catch (e) {
			throw e;
		}
	};

	const navigateToTacho = (tacho) => {
		if (!tacho?.id) return;
		console.log("Navigating to tacho", tacho.id);
		// Navegar al detalle dentro del tab 'Tachos'
		navigation.navigate('Tachos', {
			screen: 'TachoDetail',
			params: { id: tacho.id }
		});
	};

	const openNavigation = (tacho) => {
		const lat = getLat(tacho);
		const lon = getLon(tacho);
		if (lat == null || lon == null) return;
		const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
		Linking.openURL(url).catch(() => {});
	};

	const getClasificacionBadgeColor = (clasificacion) => {
		switch (clasificacion?.toLowerCase()) {
			case 'organico': return '#DCFCE7';
			case 'inorganico': return '#FEE2E2';
			case 'reciclable': return '#DBEAFE';
			default: return '#F1F5F9';
		}
	};

	const getClasificacionTextColor = (clasificacion) => {
		switch (clasificacion?.toLowerCase()) {
			case 'organico': return '#166534';
			case 'inorganico': return '#991B1B';
			case 'reciclable': return '#1E40AF';
			default: return '#64748B';
		}
	};

	// Helpers para mejorar la experiencia como en web
	const formatFechaLegible = (fechaString) => {
		if (!fechaString) return 'Fecha no disponible';
		const fecha = new Date(fechaString);
		const ahora = new Date();
		const diffMs = ahora - fecha;
		const min = Math.floor(diffMs / (1000 * 60));
		const hrs = Math.floor(diffMs / (1000 * 60 * 60));
		const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
		if (days <= 0) {
			if (hrs <= 0) {
				if (min <= 0) return 'Hace unos momentos';
				return `Hace ${min} min`;
			}
			return `Hace ${hrs} h`;
		}
		if (days === 1) {
			return `Ayer ${fecha.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}`;
		}
		return fecha.toLocaleDateString('es-EC', {
			day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
		});
	};

	const getUbicacionLabel = (lat, lon) => {
		const latNum = parseFloat(lat);
		const lonNum = parseFloat(lon);
		if (isNaN(latNum) || isNaN(lonNum)) return 'Ubicación desconocida';
		return `${latNum.toFixed(4)}, ${lonNum.toFixed(4)}`;
	};

	// Ubicación legible para tachos: intenta provincia, ciudad/cantón y nombres conocidos
	const getUbicacionTexto = (t) => {
		const provincia = t?.provincia || t?.province || t?.provincia_nombre || t?.provinciaName;
		const ciudad = t?.ciudad || t?.canton || t?.municipio || t?.city || t?.ciudad_nombre || t?.ciudadName;
		const nombreUbic = t?.ubicacion_nombre || t?.sector || t?.parroquia || t?.direccion || t?.address;
		if (provincia || ciudad) {
			// Mostrar como en web: Ciudad, Provincia
			return `${ciudad || ''}${provincia ? (ciudad ? ', ' : '') + provincia : ''}`.trim() || 'Sin ubicación';
		}
		if (nombreUbic) return nombreUbic;
		// Fallback: derivar desde coordenadas como en web
		const lat = getLat(t);
		const lon = getLon(t);
		if (lat != null && lon != null) return getUbicacionFromCoords(lat, lon);
		return 'Sin ubicación';
	};

	// Mapeo aproximado Ecuador (como en web) para convertir lat/lon a "Ciudad, Provincia"
	const getUbicacionFromCoords = (lat, lon) => {
		const locations = [
			{ provincia: 'Pichincha', ciudad: 'Quito', latRange: [-0.3, 0.1], lonRange: [-78.6, -78.4] },
			{ provincia: 'Guayas', ciudad: 'Guayaquil', latRange: [-2.3, -2.1], lonRange: [-79.95, -79.85] },
			{ provincia: 'Azuay', ciudad: 'Cuenca', latRange: [-2.92, -2.88], lonRange: [-79.02, -78.98] },
			{ provincia: 'Manabí', ciudad: 'Manta', latRange: [-1.06, -0.98], lonRange: [-80.75, -80.65] },
			{ provincia: 'El Oro', ciudad: 'Machala', latRange: [-3.28, -3.24], lonRange: [-79.97, -79.93] },
			{ provincia: 'Loja', ciudad: 'Loja', latRange: [-4.02, -3.98], lonRange: [-79.22, -79.18] },
			{ provincia: 'Tungurahua', ciudad: 'Ambato', latRange: [-1.28, -1.22], lonRange: [-78.65, -78.59] },
			{ provincia: 'Imbabura', ciudad: 'Ibarra', latRange: [0.35, 0.39], lonRange: [-78.15, -78.11] },
			{ provincia: 'Cotopaxi', ciudad: 'Latacunga', latRange: [-0.95, -0.91], lonRange: [-78.62, -78.58] },
			{ provincia: 'Chimborazo', ciudad: 'Riobamba', latRange: [-1.68, -1.64], lonRange: [-78.67, -78.63] },
		];
		const latNum = parseFloat(lat);
		const lonNum = parseFloat(lon);
		for (const loc of locations) {
			if (
				latNum >= loc.latRange[0] && latNum <= loc.latRange[1] &&
				lonNum >= loc.lonRange[0] && lonNum <= loc.lonRange[1]
			) {
				return `${loc.ciudad}, ${loc.provincia}`;
			}
		}
		// Fallback por región
		if (latNum > 0) return 'Región Norte';
		if (latNum < -2) return 'Región Sur';
		if (lonNum < -80) return 'Región Costa';
		return 'Región Sierra';
	};

	// SUB-VISTAS
	const renderOverview = () => (
		<View>
			{/* Activity Timeline */}
			<View style={[styles.card, styles.activityCard]}>
				<View style={styles.cardHeader}>
					<View style={styles.cardHeaderLeft}>
						<View style={styles.headerIcon}>
							<Ionicons name="pulse" size={24} color="#3B82F6" />
						</View>
						<Text style={styles.cardTitle}>Mis Actividades Recientes</Text>
					</View>
					<View style={styles.liveBadge}>
						<View style={styles.liveDot} />
						<Text style={styles.liveBadgeText}>En Vivo</Text>
					</View>
				</View>

				<View style={{ padding: 8 }}>
					{[...misDetecciones, ...deteccionesEmpresa]
						.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
						.slice(0, 6)
						.map((det, index) => {
							const isEmpresa = !!deteccionesEmpresa.find(d => d.id === det.id);
							return (
								<TouchableOpacity key={det.id || index} style={styles.activityItem} activeOpacity={0.8}>
									<View style={styles.timelineLine} />
									<View style={styles.activityIconContainer}>
										<MaterialCommunityIcons name="recycle" size={20} color="#2D6A4F" />
									</View>
									<View style={styles.activityContent}>
										<View style={styles.activityHeader}>
											<Text style={styles.activityTitle} numberOfLines={1}>
												{det.nombre || 'Detección'}
											</Text>
											<View style={{ flexDirection: 'row', alignItems: 'center' }}>
												<View style={[styles.classificationBadge, { backgroundColor: getClasificacionBadgeColor(det.clasificacion) }]}>
													<Text style={[styles.classificationText, { color: getClasificacionTextColor(det.clasificacion) }]}>
														{(det.clasificacion || 'N/A').toUpperCase()} {`${det.confianza_ia || 0}%`}
													</Text>
												</View>
												{isEmpresa && (
													<View style={{ marginLeft: 8, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, backgroundColor: 'rgba(124,58,237,0.15)' }}>
														<Text style={{ color: '#6D28D9', fontSize: 10, fontWeight: '700' }}>Empresa</Text>
													</View>
												)}
											</View>
										</View>
										<View style={styles.activityMeta}>
											<Ionicons name="location-outline" size={12} color="#94A3B8" />
											<Text style={styles.metaText}>{getUbicacionLabel(det.ubicacion_lat, det.ubicacion_lon)}</Text>
											<Ionicons name="time-outline" size={12} color="#94A3B8" />
											<Text style={styles.metaText}>{formatFechaLegible(det.created_at)}</Text>
										</View>
									</View>
								</TouchableOpacity>
							);
						})}

					{[...misDetecciones, ...deteccionesEmpresa].length === 0 && (
						<View style={styles.emptyState}>
							<Ionicons name="document-text-outline" size={40} color="#CBD5E1" />
							<Text style={styles.emptyStateText}>No hay actividad reciente</Text>
						</View>
					)}
				</View>
			</View>

			{/* Quick Actions Grid */}
			<View style={styles.quickActionsGrid}>
				<TouchableOpacity style={styles.quickActionCard} onPress={() => setActiveView('mytachos')}>
					<LinearGradient colors={['#2D6A4F', '#40916C']} style={styles.quickActionIcon}>
						<FontAwesome5 name="trash-alt" size={20} color="#FFF" />
					</LinearGradient>
					<View style={styles.quickActionContent}>
						<Text style={styles.quickActionTitle}>Mis Tachos</Text>
						<Text style={styles.quickActionDesc}>Gestiona tus tachos</Text>
					</View>
					<Ionicons name="chevron-forward" size={20} color="#94A3B8" />
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.quickActionCard}
					onPress={() => navigation.navigate('Detecciones', { screen: 'DeteccionListScreen' })}
				>
					<LinearGradient colors={['#3B82F6', '#60A5FA']} style={styles.quickActionIcon}>
						<Ionicons name="camera" size={24} color="#FFF" />
					</LinearGradient>
					<View style={styles.quickActionContent}>
						<Text style={styles.quickActionTitle}>Nueva Detección</Text>
						<Text style={styles.quickActionDesc}>Usa IA para clasificar</Text>
					</View>
					<Ionicons name="chevron-forward" size={20} color="#94A3B8" />
				</TouchableOpacity>

				{empresaAsociada && (
					<TouchableOpacity style={styles.quickActionCard} onPress={() => setActiveView('empresa')}>
						<LinearGradient colors={['#7C3AED', '#A78BFA']} style={styles.quickActionIcon}>
							<Ionicons name="business" size={24} color="#FFF" />
						</LinearGradient>
						<View style={styles.quickActionContent}>
							<Text style={styles.quickActionTitle}>Mi Empresa</Text>
							<Text style={styles.quickActionDesc}>Gestiona tachos</Text>
						</View>
						<Ionicons name="chevron-forward" size={20} color="#94A3B8" />
					</TouchableOpacity>
				)}

				<TouchableOpacity
					style={styles.quickActionCard}
					onPress={() => navigation.navigate('Ubicaciones', { screen: 'CercaDeMi' })}
				>
					<LinearGradient colors={['#EA580C', '#FB923C']} style={styles.quickActionIcon}>
						<Ionicons name="location" size={24} color="#FFF" />
					</LinearGradient>
					<View style={styles.quickActionContent}>
						<Text style={styles.quickActionTitle}>Tachos Cerca de Mí</Text>
						<Text style={styles.quickActionDesc}>Encuentra tachos públicos</Text>
					</View>
					<Ionicons name="chevron-forward" size={20} color="#94A3B8" />
				</TouchableOpacity>
			</View>
		</View>
	);

	const renderMyTachos = () => (
		<View style={styles.card}>
			<View style={styles.cardHeader}>
				<View style={styles.cardHeaderLeft}>
					<FontAwesome5 name="trash" size={20} color="#2D6A4F" style={{ marginRight: 12 }} />
					<Text style={styles.cardTitle}>Mis Tachos Personales</Text>
				</View>
			</View>

			<View style={{ padding: 16 }}>
				<View style={styles.searchContainer}>
					<Ionicons name="search" size={20} color="#94A3B8" />
					<TextInput
						style={styles.searchInput}
						placeholder="Buscar por código o nombre..."
						value={searchTerm}
						onChangeText={setSearchTerm}
					/>
				</View>
			</View>

			<FlatList
				data={misTachos.filter(t =>
					(t.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
					(t.codigo || '').toLowerCase().includes(searchTerm.toLowerCase())
				)}
				keyExtractor={item => item.id.toString()}
				renderItem={({ item }) => {
					const lat = getLat(item);
					const lon = getLon(item);
					const ubicacion = getUbicacionTexto(item);
					const nivel = Number(item.nivel_llenado) || 0;
					const nivelColor = nivel >= 80 ? '#EF4444' : (nivel >= 50 ? '#F59E0B' : '#10B981');
					return (
						<View style={styles.tachoCard}>
							<View style={styles.tachoCardHeader}>
								<View style={{ flex: 1 }}>
									<Text style={styles.rowTitle}>{item.nombre || 'Tacho'}</Text>
									<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
										<Ionicons name="pricetag-outline" size={14} color="#94A3B8" />
										<Text style={[styles.metaText, { marginRight: 8 }]}>{item.codigo || '—'}</Text>
										<Ionicons name="location-outline" size={14} color="#94A3B8" />
										<Text style={styles.metaText}>{ubicacion}</Text>
									</View>
								</View>
								<View style={[styles.statusBadge, { backgroundColor: (item.estado || '').toLowerCase() === 'activo' ? '#DCFCE7' : '#FEE2E2' }]}>
									<Text style={[styles.statusText, { color: (item.estado || '').toLowerCase() === 'activo' ? '#166534' : '#991B1B' }]}>
										{(item.estado || 'inactivo').charAt(0).toUpperCase() + (item.estado || 'inactivo').slice(1)}
									</Text>
								</View>
							</View>

							<View style={{ marginTop: 12 }}>
								<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
									<Text style={{ fontSize: 12, color: '#64748B', fontWeight: '600' }}>Llenado</Text>
									<Text style={{ fontSize: 12, color: '#1E293B', fontWeight: '700' }}>{nivel}%</Text>
								</View>
								<View style={styles.progressTrack}>
									<View style={[styles.progressFill, { width: `${nivel}%`, backgroundColor: nivelColor }]} />
								</View>
							</View>

							<View style={styles.cardActionsRow}>
								<TouchableOpacity style={styles.secondaryBtn} onPress={() => navigateToTacho(item)}>
									<Ionicons name="information-circle-outline" size={16} color="#0369A1" />
									<Text style={styles.secondaryBtnText}>Ver detalle</Text>
								</TouchableOpacity>
								{lat != null && lon != null && (
									<TouchableOpacity style={styles.secondaryBtn} onPress={() => openNavigation(item)}>
										<Ionicons name="navigate-outline" size={16} color="#0369A1" />
										<Text style={styles.secondaryBtnText}>Navegar</Text>
									</TouchableOpacity>
								)}
							</View>
						</View>
					);
				}}
				scrollEnabled={false}
			/>
			{misTachos.length === 0 && (
				<View style={styles.emptyState}>
					<Text style={styles.emptyStateText}>No tienes tachos personales asignados.</Text>
				</View>
			)}
		</View>
	);

	const renderEstadisticas = () => (
		<View style={styles.card}>
			<Text style={styles.cardTitle}>Estadísticas</Text>
			<Text style={styles.emptyStateText}>Módulo en desarrollo</Text>
		</View>
	);

	const renderMapa = () => (
		<View style={styles.card}>
			<View style={styles.cardHeader}>
				<View style={styles.cardHeaderLeft}>
					<Ionicons name="map" size={20} color="#EA580C" style={{ marginRight: 12 }} />
					<Text style={styles.cardTitle}>Tachos Públicos Cerca de Mí</Text>
				</View>
				<TouchableOpacity style={styles.primaryBtn} onPress={getUserLocation}>
					<Ionicons name="navigate" size={16} color="#FFF" />
					<Text style={styles.primaryBtnText}>Actualizar ubicación</Text>
				</TouchableOpacity>
			</View>

			<View style={{ padding: 16 }}>
				<View style={styles.searchContainer}>
					<Ionicons name="search" size={20} color="#94A3B8" />
					<TextInput
						style={styles.searchInput}
						placeholder="Buscar por código, nombre o empresa..."
						value={searchTermTachos}
						onChangeText={setSearchTermTachos}
					/>
				</View>
				{userLocation && (
					<Text style={[styles.metaText, { marginTop: 8 }]}>
						Tu ubicación: {userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)}
					</Text>
				)}
			</View>

			<FlatList
				data={tachosCerca.filter(t => (
					(t.nombre || '').toLowerCase().includes(searchTermTachos.toLowerCase()) ||
					(t.codigo || '').toLowerCase().includes(searchTermTachos.toLowerCase()) ||
					(t.empresa_nombre || '').toLowerCase().includes(searchTermTachos.toLowerCase())
				))}
				keyExtractor={item => item.id.toString()}
				renderItem={({ item }) => {
					const lat = getLat(item);
					const lon = getLon(item);
					const distancia = (userLocation && lat != null && lon != null)
						? calcularDistancia(userLocation.lat, userLocation.lon, lat, lon)
						: null;
					return (
						<TouchableOpacity style={styles.tableRow} activeOpacity={0.7} onPress={() => navigateToTacho(item)}>
							<View style={styles.rowMainInfo}>
								<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
									<Text style={styles.rowTitle}>{item.nombre || item.codigo}</Text>
									{distancia != null && (
										<View style={{ marginLeft: 8, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, backgroundColor: '#FFEDD5' }}>
											<Text style={{ color: '#EA580C', fontSize: 11, fontWeight: '700' }}>{distancia.toFixed(1)} km</Text>
										</View>
									)}
								</View>
								<View style={{ flexDirection: 'row', alignItems: 'center' }}>
									<View style={[styles.statusBadge, { backgroundColor: (item.estado || '').toLowerCase() === 'activo' ? '#DCFCE7' : '#FEF3C7' }]}>
										<Text style={[styles.statusText, { color: (item.estado || '').toLowerCase() === 'activo' ? '#166534' : '#92400E' }]}>
											{(item.estado || 'activo').charAt(0).toUpperCase() + (item.estado || 'activo').slice(1)}
										</Text>
									</View>
									<Text style={[styles.metaText, { marginLeft: 8 }]}>{item.codigo}</Text>
									<Text style={[styles.metaText, { marginLeft: 8 }]}>{item.empresa_nombre || 'Público'}</Text>
								</View>
							</View>
							<Ionicons name="chevron-forward" size={18} color="#94A3B8" />
						</TouchableOpacity>
					);
				}}
				ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#F1F5F9' }} />}
				ListEmptyComponent={() => (
					<View style={styles.emptyState}>
						<Text style={styles.emptyStateText}>No hay tachos públicos cercanos</Text>
						<Text style={styles.emptyStateSub}>Prueba actualizando tu ubicación o ampliando tu búsqueda</Text>
					</View>
				)}
				scrollEnabled={false}
			/>
		</View>
	);

	const renderEmpresa = () => (
		<View style={styles.card}>
			<View style={styles.cardHeader}>
				<View style={styles.cardHeaderLeft}>
					<Ionicons name="business" size={20} color="#7C3AED" style={{ marginRight: 12 }} />
					<Text style={styles.cardTitle}>Empresa: {empresaAsociada || 'Sin asignación'}</Text>
				</View>
			</View>

			<FlatList
				data={tachosEmpresa}
				keyExtractor={item => item.id.toString()}
				renderItem={({ item }) => {
					const lat = getLat(item);
					const lon = getLon(item);
					const ubicacion = getUbicacionTexto(item);
					const nivel = Number(item.nivel_llenado) || 0;
					const nivelColor = nivel >= 80 ? '#EF4444' : (nivel >= 50 ? '#F59E0B' : '#10B981');
					return (
						<View style={styles.tachoCard}>
							<View style={styles.tachoCardHeader}>
								<View style={{ flex: 1 }}>
									<Text style={styles.rowTitle}>{item.nombre || item.codigo}</Text>
									<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
										<Ionicons name="pricetag-outline" size={14} color="#94A3B8" />
										<Text style={[styles.metaText, { marginRight: 8 }]}>{item.codigo || '—'}</Text>
										<Ionicons name="location-outline" size={14} color="#94A3B8" />
										<Text style={styles.metaText}>{ubicacion}</Text>
									</View>
								</View>
								<View style={[styles.statusBadge, { backgroundColor: (item.estado || '').toLowerCase() === 'activo' ? '#EDE9FE' : '#FEE2E2' }]}>
									<Text style={[styles.statusText, { color: (item.estado || '').toLowerCase() === 'activo' ? '#5B21B6' : '#991B1B' }]}>
										{(item.estado || 'inactivo').charAt(0).toUpperCase() + (item.estado || 'inactivo').slice(1)}
									</Text>
								</View>
							</View>

							<View style={{ marginTop: 12 }}>
								<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
									<Text style={{ fontSize: 12, color: '#64748B', fontWeight: '600' }}>Llenado</Text>
									<Text style={{ fontSize: 12, color: '#1E293B', fontWeight: '700' }}>{nivel}%</Text>
								</View>
								<View style={styles.progressTrack}>
									<View style={[styles.progressFill, { width: `${nivel}%`, backgroundColor: nivelColor }]} />
								</View>
							</View>

							<View style={styles.cardActionsRow}>
								<TouchableOpacity style={styles.secondaryBtn} onPress={() => navigateToTacho(item)}>
									<Ionicons name="information-circle-outline" size={16} color="#0369A1" />
									<Text style={styles.secondaryBtnText}>Ver detalle</Text>
								</TouchableOpacity>
								{lat != null && lon != null && (
									<TouchableOpacity style={styles.secondaryBtn} onPress={() => openNavigation(item)}>
										<Ionicons name="navigate-outline" size={16} color="#0369A1" />
										<Text style={styles.secondaryBtnText}>Navegar</Text>
									</TouchableOpacity>
								)}
							</View>
						</View>
					);
				}}
				scrollEnabled={false}
			/>

			<View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
				<Text style={styles.cardTitle}>Detecciones de la Empresa</Text>
			</View>
			<FlatList
				data={deteccionesEmpresa.slice(0, 10)}
				keyExtractor={(d, i) => d.id?.toString() || i.toString()}
				renderItem={({ item }) => (
					<View style={styles.tableRow}>
						<View style={styles.rowMainInfo}>
							<Text style={styles.rowTitle}>{item.nombre || 'Detección'}</Text>
							<View style={styles.rowSubtitle}>
								<View style={[styles.classificationBadge, { backgroundColor: getClasificacionBadgeColor(item.clasificacion) }]}>
									<Text style={[styles.classificationText, { color: getClasificacionTextColor(item.clasificacion) }]}>
										{item.clasificacion || 'N/A'}
									</Text>
								</View>
								<Text style={[styles.metaText, { marginLeft: 8 }]}>{item.confianza_ia || 0}%</Text>
							</View>
						</View>
						<Text style={styles.metaText}>{new Date(item.created_at).toLocaleDateString()}</Text>
					</View>
				)}
				scrollEnabled={false}
			/>
		</View>
	);

	const renderDetecciones = () => (
		<View style={styles.card}>
			<View style={[styles.cardHeader, { alignItems: 'center' }]}>
				<Text style={[styles.cardTitle, { flex: 1 }]}>Detecciones</Text>
				<TouchableOpacity
					style={styles.primaryBtn}
					onPress={() => navigation.navigate('Detecciones', { screen: 'MisDetecciones' })}
				>
					<Ionicons name="analytics" size={16} color="#FFF" />
					<Text style={styles.primaryBtnText}>Abrir Mis Detecciones</Text>
				</TouchableOpacity>
			</View>

			<View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
				<Text style={styles.emptyStateSub}>
					Gestiona tus análisis personales con IA y acceso rápido al historial.
				</Text>
			</View>
		</View>
	);

	if (loading && !refreshing) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#2D6A4F" />
				<Text style={styles.emptyStateText}>Cargando Portal...</Text>
			</View>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="light-content" backgroundColor="#2D6A4F" />
			<ScrollView
				contentContainerStyle={styles.content}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2D6A4F" />}
			>
				{/* Header */}
				<View style={styles.header}>
					<LinearGradient colors={['#2D6A4F', '#40916C']} style={styles.headerGradient}>
						<View style={styles.welcomeSection}>
							<View style={styles.welcomeBadge}>
								<Ionicons name="sparkles" size={12} color="#FFF" />
								<Text style={styles.welcomeBadgeText}>Panel Personal</Text>
							</View>
							<Text style={styles.headerTitle}>Hola, {currentUser?.nombre || "Usuario"}!</Text>
							<Text style={styles.headerSubtitle}>
								{empresaAsociada ? `Encargado de: ${empresaAsociada}` : "Gestiona tus residuos de forma inteligente"}
							</Text>
						</View>

						<View style={styles.headerActions}>
							<TouchableOpacity style={styles.actionBtn} onPress={onRefresh}>
								<Ionicons name="refresh" size={20} color="#FFF" />
							</TouchableOpacity>

							<View style={styles.userCard}>
								<View style={styles.userAvatar}>
									<FontAwesome5 name="user" size={16} color="#2D6A4F" />
								</View>
								<View style={styles.userInfo}>
									<Text style={styles.userName}>{(currentUser?.nombre || '').split(' ')[0]}</Text>
									<Text style={styles.userRole}>{currentUser?.rol === 'admin' ? 'Admin' : 'Usuario'}</Text>
								</View>
							</View>
						</View>
					</LinearGradient>
				</View>

				{/* Stats Grid */}
				<View style={styles.statsGrid}>
					<LinearGradient colors={['#2D6A4F', '#40916C']} style={[styles.statCard, styles.statCardContent]}>
						<View style={styles.statValueRow}>
							<Text style={styles.statNumber}>{stats.totalTachos}</Text>
							<FontAwesome5 name="trash" size={16} color="#FFF" />
						</View>
						<Text style={styles.statLabel}>Mis Tachos</Text>
						<View style={styles.statProgress}><View style={[styles.statProgressBar, { width: '100%', backgroundColor: '#166534' }]} /></View>
					</LinearGradient>

					<LinearGradient colors={['#3B82F6', '#60A5FA']} style={[styles.statCard, styles.statCardContent]}>
						<View style={styles.statValueRow}>
							<Text style={styles.statNumber}>{stats.misDetecciones}</Text>
							<Ionicons name="scan" size={20} color="#FFF" />
						</View>
						<Text style={styles.statLabel}>Mis Detecciones</Text>
						<View style={styles.statProgress}><View style={[styles.statProgressBar, { width: '80%', backgroundColor: '#1E40AF' }]} /></View>
					</LinearGradient>

					{empresaAsociada && (
						<LinearGradient colors={['#7C3AED', '#A78BFA']} style={[styles.statCard, styles.statCardContent]}>
							<View style={styles.statValueRow}>
								<Text style={styles.statNumber}>{stats.tachosEmpresa}</Text>
								<Ionicons name="business" size={20} color="#FFF" />
							</View>
							<Text style={styles.statLabel}>Tachos de Empresa</Text>
							<View style={styles.statProgress}><View style={[styles.statProgressBar, { width: '60%', backgroundColor: '#7C3AED' }]} /></View>
						</LinearGradient>
					)}

					<LinearGradient colors={['#EA580C', '#FB923C']} style={[styles.statCard, styles.statCardContent]}>
						<View style={styles.statValueRow}>
							<Text style={styles.statNumber}>{stats.tachosPublicosCerca}</Text>
							<Ionicons name="location" size={20} color="#FFF" />
						</View>
						<Text style={styles.statLabel}>Tachos Públicos Cerca</Text>
						<View style={styles.statProgress}><View style={[styles.statProgressBar, { width: '40%', backgroundColor: '#EA580C' }]} /></View>
					</LinearGradient>
				</View>

				{/* Tab Navigation */}
				<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
					{[ 
						{ key: 'overview', label: 'Inicio', icon: 'home' },
						{ key: 'mytachos', label: 'Mis Tachos', icon: 'trash' },
						{ key: 'empresa', label: 'Mi Empresa', icon: 'business' },
						{ key: 'mydetecciones', label: 'Detecciones', icon: 'analytics' },
						{ key: 'mapa', label: 'Cerca de Mí', icon: 'location' },
						{ key: 'estadisticas', label: 'Estadísticas', icon: 'bar-chart' },
					].map(tab => (
						<TouchableOpacity
							key={tab.key}
							style={[styles.tabBtn, activeView === tab.key && styles.tabBtnActive]}
							onPress={() => {
								if (tab.key === 'mydetecciones') {
									navigation.navigate('Detecciones', { screen: 'MisDetecciones' });
									return;
								}
								if (tab.key === 'mapa') {
									// Redirigir a la pestaña inferior "Ubicaciones" (Cerca de Mí)
									navigation.navigate('Ubicaciones');
									return;
								}
								if (tab.key === 'estadisticas') {
									// Abrir la pantalla unificada de estadísticas dentro del stack de Detecciones
									navigation.navigate('Detecciones', { screen: 'DeteccionEstadisticas' });
									return;
								}
								setActiveView(tab.key);
							}}
						>
							<Ionicons
								name={activeView === tab.key ? tab.icon : `${tab.icon}-outline`}
								size={18}
								color={activeView === tab.key ? '#2D6A4F' : '#64748B'}
							/>
							<Text style={[styles.tabText, activeView === tab.key && styles.tabTextActive]}>
								{tab.label}
							</Text>
						</TouchableOpacity>
					))}
				</ScrollView>

				{/* VISTAS */}
				<View style={{ minHeight: 400 }}>
					{activeView === 'overview' && renderOverview()}
					{activeView === 'mytachos' && renderMyTachos()}
					{activeView === 'empresa' && renderEmpresa()}
					{activeView === 'mydetecciones' && renderDetecciones()}
					{activeView === 'mapa' && renderMapa()}
					{activeView === 'estadisticas' && renderEstadisticas()}
				</View>

			</ScrollView>
		</SafeAreaView>
	);
}