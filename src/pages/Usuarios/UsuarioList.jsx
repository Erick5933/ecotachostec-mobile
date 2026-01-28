// src/pages/Usuarios/UsuarioList.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    TextInput,
    Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MobileLayout from '../../components/Layout/MobileLayout';
import api from '../../api/axiosConfig';
import { usuarioListStyles as styles } from '../../styles/usuarioStyles';
import { AuthContext } from '../../context/AuthContext';

export default function UsuarioList({ navigation }) {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRol, setFilterRol] = useState(''); // '', 'admin', 'user'
    const [filterEstado, setFilterEstado] = useState('activos'); // 'activos', 'inactivos', 'todos'
    const { userInfo } = useContext(AuthContext);

    useEffect(() => {
        loadUsuarios();
    }, []);

    const loadUsuarios = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/usuarios/');
            setUsuarios(response.data.results || response.data || []);
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            Alert.alert('Error', 'No se pudieron cargar los usuarios');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadUsuarios();
    }, [loadUsuarios]);

    const handleDeactivate = (id, nombre) => {
        Alert.alert(
            'Desactivar Usuario',
            `¿Está seguro que desea desactivar a ${nombre}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Desactivar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.patch(`/usuarios/${id}/`, { is_active: false });
                            Alert.alert('Éxito', 'Usuario desactivado correctamente');
                            loadUsuarios();
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo desactivar el usuario');
                            console.error(error);
                        }
                    },
                },
            ]
        );
    };

    const handleActivate = (id, nombre) => {
        Alert.alert(
            'Reactivar Usuario',
            `¿Está seguro que desea reactivar a ${nombre}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Reactivar',
                    onPress: async () => {
                        try {
                            await api.patch(`/usuarios/${id}/`, { is_active: true });
                            Alert.alert('Éxito', 'Usuario reactivado correctamente');
                            loadUsuarios();
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo reactivar el usuario');
                            console.error(error);
                        }
                    },
                },
            ]
        );
    };

    const filteredUsuarios = usuarios.filter((usuario) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            usuario.nombre?.toLowerCase().includes(query) ||
            usuario.email?.toLowerCase().includes(query) ||
            usuario.first_name?.toLowerCase().includes(query) ||
            usuario.last_name?.toLowerCase().includes(query) ||
            usuario.username?.toLowerCase().includes(query);

        const matchesRol = filterRol === '' || usuario.rol === filterRol || (filterRol === 'admin' && usuario.is_staff);
        
        const matchesEstado =
            filterEstado === 'todos' ||
            (filterEstado === 'activos' && usuario.is_active !== false) ||
            (filterEstado === 'inactivos' && usuario.is_active === false);

        return matchesSearch && matchesRol && matchesEstado;
    });

    const stats = {
        total: usuarios.length,
        activos: usuarios.filter((u) => u.is_active !== false).length,
        admins: usuarios.filter((u) => u.is_staff || u.rol === 'admin').length,
    };

    if (loading && !refreshing) {
        return (
            <MobileLayout title="Usuarios" subtitle="Gestión de usuarios" showBackButton={false}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={styles.loadingText}>Cargando usuarios...</Text>
                </View>
            </MobileLayout>
        );
    }

    return (
        <MobileLayout 
            title="Gestión de Usuarios" 
            subtitle={`${filteredUsuarios.length} usuario${filteredUsuarios.length !== 1 ? 's' : ''} encontrado${filteredUsuarios.length !== 1 ? 's' : ''}`}
            showBackButton={false}
            headerColor="#10B981"
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh}
                        colors={['#3B82F6']}
                        tintColor="#3B82F6"
                    />
                }
            >
                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <LinearGradient
                        colors={['#10B981', '#059669']}
                        style={styles.statCard}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons name="people" size={28} color="#FFFFFF" />
                        <Text style={styles.statValue}>{stats.total}</Text>
                        <Text style={styles.statLabel}>Total Usuarios</Text>
                    </LinearGradient>

                    <LinearGradient
                        colors={['#34D399', '#10B981']}
                        style={styles.statCard}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons name="checkmark-circle" size={28} color="#FFFFFF" />
                        <Text style={styles.statValue}>{stats.activos}</Text>
                        <Text style={styles.statLabel}>Activos</Text>
                    </LinearGradient>

                    <LinearGradient
                        colors={['#059669', '#047857']}
                        style={styles.statCard}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons name="shield-checkmark" size={28} color="#FFFFFF" />
                        <Text style={styles.statValue}>{stats.admins}</Text>
                        <Text style={styles.statLabel}>Administradores</Text>
                    </LinearGradient>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons
                        name="search"
                        size={20}
                        color="#64748B"
                        style={styles.searchIcon}
                    />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar por nombre o email..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#94A3B8"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#64748B" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filters */}
                <View style={styles.filtersContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {/* Filter Estado */}
                        <TouchableOpacity
                            style={[
                                styles.filterChip,
                                filterEstado === 'activos' && styles.filterChipActiveGreen
                            ]}
                            onPress={() => setFilterEstado('activos')}
                        >
                            <Ionicons 
                                name="checkmark-circle" 
                                size={16} 
                                color={filterEstado === 'activos' ? '#FFFFFF' : '#10B981'} 
                            />
                            <Text style={[
                                styles.filterChipText,
                                filterEstado === 'activos' && styles.filterChipTextActive
                            ]}>Activos</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.filterChip,
                                filterEstado === 'inactivos' && styles.filterChipActive
                            ]}
                            onPress={() => setFilterEstado('inactivos')}
                        >
                            <Ionicons 
                                name="close-circle" 
                                size={16} 
                                color={filterEstado === 'inactivos' ? '#FFFFFF' : '#EF4444'} 
                            />
                            <Text style={[
                                styles.filterChipText,
                                filterEstado === 'inactivos' && styles.filterChipTextActive
                            ]}>Inactivos</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.filterChip,
                                filterEstado === 'todos' && styles.filterChipActiveGreen
                            ]}
                            onPress={() => setFilterEstado('todos')}
                        >
                            <Ionicons 
                                name="list" 
                                size={16} 
                                color={filterEstado === 'todos' ? '#FFFFFF' : '#64748B'} 
                            />
                            <Text style={[
                                styles.filterChipText,
                                filterEstado === 'todos' && styles.filterChipTextActive
                            ]}>Todos</Text>
                        </TouchableOpacity>

                        <View style={styles.filterDivider} />

                        {/* Filter Rol */}
                        <TouchableOpacity
                            style={[
                                styles.filterChip,
                                filterRol === '' && styles.filterChipActiveGreen
                            ]}
                            onPress={() => setFilterRol('')}
                        >
                            <Ionicons 
                                name="people" 
                                size={16} 
                                color={filterRol === '' ? '#FFFFFF' : '#10B981'} 
                            />
                            <Text style={[
                                styles.filterChipText,
                                filterRol === '' && styles.filterChipTextActive
                            ]}>Todos los Roles</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.filterChip,
                                filterRol === 'admin' && styles.filterChipActiveGreen
                            ]}
                            onPress={() => setFilterRol('admin')}
                        >
                            <Ionicons 
                                name="shield-checkmark" 
                                size={16} 
                                color={filterRol === 'admin' ? '#FFFFFF' : '#047857'} 
                            />
                            <Text style={[
                                styles.filterChipText,
                                filterRol === 'admin' && styles.filterChipTextActive
                            ]}>Admins</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.filterChip,
                                filterRol === 'user' && styles.filterChipActiveGreen
                            ]}
                            onPress={() => setFilterRol('user')}
                        >
                            <Ionicons 
                                name="person" 
                                size={16} 
                                color={filterRol === 'user' ? '#FFFFFF' : '#10B981'} 
                            />
                            <Text style={[
                                styles.filterChipText,
                                filterRol === 'user' && styles.filterChipTextActive
                            ]}>Usuarios</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* Header con botón agregar (solo admin) */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Lista de Usuarios</Text>
                        <Text style={styles.headerSubtitle}>
                            {filteredUsuarios.length} resultados
                        </Text>
                    </View>
                    {(userInfo?.rol === 'admin' || userInfo?.is_staff) && (
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => navigation.navigate('UsuarioForm')}
                        >
                            <LinearGradient
                                colors={['#10B981', '#059669']}
                                style={styles.addButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Ionicons name="person-add" size={22} color="#FFFFFF" />
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Lista de Usuarios */}
                {filteredUsuarios.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons 
                            name="account-search" 
                            size={64} 
                            color="#CBD5E1" 
                        />
                        <Text style={styles.emptyStateTitle}>
                            {searchQuery || filterRol || filterEstado !== 'activos'
                                ? 'No se encontraron usuarios'
                                : 'No hay usuarios registrados'}
                        </Text>
                        <Text style={styles.emptyStateText}>
                            {searchQuery || filterRol || filterEstado !== 'activos'
                                ? 'Intenta ajustar los filtros de búsqueda'
                                : 'Comienza agregando un nuevo usuario al sistema'}
                        </Text>
                        {!searchQuery && !filterRol && filterEstado === 'activos' && (userInfo?.rol === 'admin' || userInfo?.is_staff) && (
                            <TouchableOpacity
                                onPress={() => navigation.navigate('UsuarioForm')}
                            >
                                <LinearGradient
                                    colors={['#10B981', '#059669']}
                                    style={styles.emptyStateButton}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                                    <Text style={styles.emptyStateButtonText}>Crear Usuario</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    filteredUsuarios.map((usuario, index) => (
                        <View
                            key={usuario.id}
                            style={[
                                styles.userTableRow,
                                { animationDelay: `${index * 0.1}s` }
                            ]}
                        >
                            {/* ID */}
                            <View style={styles.tableCell}>
                                <Text style={styles.tableCellLabel}>ID</Text>
                                <Text style={styles.tableCellId}>#{usuario.id}</Text>
                            </View>

                            {/* Nombre */}
                            <View style={styles.tableCell}>
                                <Text style={styles.tableCellLabel}>Nombre</Text>
                                <Text style={styles.tableCellValue} numberOfLines={1}>
                                    {usuario.first_name && usuario.last_name
                                        ? `${usuario.first_name} ${usuario.last_name}`
                                        : usuario.nombre || usuario.username || 'Sin nombre'}
                                </Text>
                            </View>

                            {/* Email */}
                            <View style={styles.tableCell}>
                                <Text style={styles.tableCellLabel}>Email</Text>
                                <View style={styles.tableCellRow}>
                                    <Ionicons name="mail" size={14} color="#64748B" />
                                    <Text style={styles.tableCellEmail} numberOfLines={1}>
                                        {usuario.email || 'Sin email'}
                                    </Text>
                                </View>
                            </View>

                            {/* Rol */}
                            <View style={styles.tableCell}>
                                <Text style={styles.tableCellLabel}>Rol</Text>
                                {usuario.is_staff || usuario.rol === 'admin' ? (
                                    <View style={styles.rolBadgeAdmin}>
                                        <Ionicons name="shield-checkmark" size={14} color="#FFFFFF" />
                                        <Text style={styles.rolBadgeText}>Admin</Text>
                                    </View>
                                ) : (
                                    <View style={styles.rolBadgeUser}>
                                        <Ionicons name="person" size={14} color="#10B981" />
                                        <Text style={styles.rolBadgeTextUser}>Usuario</Text>
                                    </View>
                                )}
                            </View>

                            {/* Estado */}
                            <View style={styles.tableCell}>
                                <Text style={styles.tableCellLabel}>Estado</Text>
                                <View
                                    style={[
                                        styles.statusBadge,
                                        usuario.is_active !== false
                                            ? styles.statusActive
                                            : styles.statusInactive,
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.statusDot,
                                            {
                                                backgroundColor: usuario.is_active !== false
                                                    ? '#10B981'
                                                    : '#EF4444',
                                            },
                                        ]}
                                    />
                                    <Text
                                        style={[
                                            styles.statusText,
                                            {
                                                color: usuario.is_active !== false
                                                    ? '#065F46'
                                                    : '#991B1B',
                                            },
                                        ]}
                                    >
                                        {usuario.is_active !== false ? 'Activo' : 'Inactivo'}
                                    </Text>
                                </View>
                            </View>

                            {/* Acciones (solo admin) */}
                            <View style={styles.tableCell}>
                                <Text style={styles.tableCellLabel}>Acciones</Text>
                                <View style={styles.actionButtons}>
                                    {(userInfo?.rol === 'admin' || userInfo?.is_staff) && (
                                        <TouchableOpacity
                                            style={styles.editButton}
                                            onPress={() =>
                                                navigation.navigate('UsuarioForm', { usuarioId: usuario.id })
                                            }
                                        >
                                            <Ionicons
                                                name="create-outline"
                                                size={20}
                                                color="#F59E0B"
                                            />
                                        </TouchableOpacity>
                                    )}

                                    {(userInfo?.rol === 'admin' || userInfo?.is_staff) && (
                                        usuario.is_active !== false ? (
                                            <TouchableOpacity
                                                style={styles.deactivateButton}
                                                onPress={() => {
                                                    handleDeactivate(usuario.id, usuario.first_name || usuario.nombre || usuario.username);
                                                }}
                                            >
                                                <Ionicons
                                                    name="trash-outline"
                                                    size={20}
                                                    color="#EF4444"
                                                />
                                            </TouchableOpacity>
                                        ) : (
                                            <TouchableOpacity
                                                style={styles.activateButton}
                                                onPress={() => {
                                                    handleActivate(usuario.id, usuario.first_name || usuario.nombre || usuario.username);
                                                }}
                                            >
                                                <Ionicons
                                                    name="checkmark-circle-outline"
                                                    size={20}
                                                    color="#10B981"
                                                />
                                            </TouchableOpacity>
                                        )
                                    )}
                                </View>
                            </View>
                        </View>
                    ))
                )}

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <View style={styles.infoCardIcon}>
                        <Ionicons name="shield-checkmark" size={24} color="#10B981" />
                    </View>
                    <View style={styles.infoCardContent}>
                        <Text style={styles.infoCardTitle}>Gestión de Permisos</Text>
                        <Text style={styles.infoCardText}>
                            Los administradores tienen acceso completo al sistema. Los usuarios regulares solo pueden visualizar datos sin capacidad de edición.
                        </Text>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </MobileLayout>
    );
}
