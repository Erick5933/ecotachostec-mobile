// src/pages/Tachos/TachoList.jsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    TextInput,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { tachosStyles, colors } from '../../styles/mobileStyles';
import { getTachos, deleteTacho } from '../../api/tachoApi';

const TachoList = () => {
    const navigation = useNavigation();
    const [tachos, setTachos] = useState([]);
    const [filteredTachos, setFilteredTachos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Cargar tachos
    const loadTachos = async () => {
        try {
            const response = await getTachos();
            setTachos(response.data);
            setFilteredTachos(response.data);
        } catch (error) {
            console.error('Error cargando tachos:', error);
            Alert.alert('Error', 'No se pudo cargar la lista de tachos');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Filtrar tachos
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredTachos(tachos);
        } else {
            const filtered = tachos.filter(t =>
                t.codigo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.descripcion?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredTachos(filtered);
        }
    }, [searchQuery, tachos]);

    // Eliminar tacho
    const handleDelete = (id, nombre) => {
        Alert.alert(
            'Confirmar Eliminación',
            `¿Está seguro que desea eliminar el tacho "${nombre}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteTacho(id);
                            setTachos(prev => prev.filter(t => t.id !== id));
                            Alert.alert('Éxito', 'Tacho eliminado correctamente');
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo eliminar el tacho');
                        }
                    },
                },
            ]
        );
    };

    // Refrescar
    const onRefresh = () => {
        setRefreshing(true);
        loadTachos();
    };

    // Cargar datos iniciales
    useEffect(() => {
        loadTachos();
    }, []);

    // Renderizar item de lista
    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={tachosStyles.listItem}
            onPress={() => navigation.navigate('TachoDetail', { id: item.id })}
        >
            <View style={tachosStyles.listItemHeader}>
                <View style={{ flex: 1 }}>
                    <View style={[tachosStyles.flexRow, tachosStyles.gapMd]}>
                        <View style={[tachosStyles.btnIcon, tachosStyles.btnIconPrimary]}>
                            <Ionicons name="trash-outline" size={20} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={tachosStyles.listItemTitle}>{item.nombre}</Text>
                            <Text style={tachosStyles.listItemCode}>
                                <Ionicons name="barcode-outline" size={12} /> {item.codigo}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={[
                    tachosStyles.badge,
                    item.estado === 'activo' ? tachosStyles.badgeActive : tachosStyles.badgeInactive
                ]}>
                    <View style={[
                        tachosStyles.badgeIndicator,
                        { backgroundColor: item.estado === 'activo' ? '#10B981' : '#EF4444' }
                    ]} />
                    <Text style={[
                        tachosStyles.badgeText,
                        item.estado === 'activo' ? tachosStyles.badgeTextActive : tachosStyles.badgeTextInactive
                    ]}>
                        {item.estado || 'activo'}
                    </Text>
                </View>
            </View>

            <View style={tachosStyles.listItemDetailRow}>
                <Ionicons name="location-outline" size={14} color={colors.gray} />
                <Text style={tachosStyles.listItemDetailText}>
                    {Number(item.ubicacion_lat)?.toFixed(4)}, {Number(item.ubicacion_lon)?.toFixed(4)}
                </Text>
            </View>

            {item.descripcion && (
                <View style={[tachosStyles.listItemDetailRow, tachosStyles.mtSm]}>
                    <Ionicons name="document-text-outline" size={14} color={colors.gray} />
                    <Text style={tachosStyles.listItemDetailText} numberOfLines={1}>
                        {item.descripcion}
                    </Text>
                </View>
            )}

            <View style={[tachosStyles.flexRow, tachosStyles.gapSm, tachosStyles.mtMd]}>
                <TouchableOpacity
                    style={[tachosStyles.btnIcon, tachosStyles.btnIconView]}
                    onPress={() => navigation.navigate('TachoDetail', { id: item.id })}
                >
                    <Ionicons name="eye-outline" size={18} color={colors.info} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[tachosStyles.btnIcon, tachosStyles.btnIconEdit]}
                    onPress={() => navigation.navigate('TachoForm', { id: item.id })}
                >
                    <Ionicons name="create-outline" size={18} color={colors.warning} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[tachosStyles.btnIcon, tachosStyles.btnIconDelete]}
                    onPress={() => handleDelete(item.id, item.nombre)}
                >
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    // Estado de carga
    if (loading) {
        return (
            <View style={tachosStyles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[tachosStyles.emptyText, tachosStyles.mtMd]}>Cargando tachos...</Text>
            </View>
        );
    }

    return (
        <View style={tachosStyles.container}>
            {/* Header */}
            <View style={tachosStyles.header}>
                <View style={tachosStyles.headerTitleContainer}>
                    <Text style={tachosStyles.headerTitle}>
                        <Ionicons name="trash" size={24} color={colors.primary} /> Tachos
                    </Text>
                    <Text style={tachosStyles.headerSubtitle}>
                        {tachos.length} tachos registrados
                    </Text>
                </View>
                <View style={tachosStyles.headerActions}>
                    <TouchableOpacity
                        style={[tachosStyles.btnIcon, tachosStyles.btnIconPrimary]}
                        onPress={() => navigation.navigate('TachoForm')}
                    >
                        <Ionicons name="add" size={22} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Barra de búsqueda */}
            <View style={tachosStyles.searchContainer}>
                <View style={tachosStyles.searchInputContainer}>
                    <Ionicons name="search" size={20} color={colors.gray} />
                    <TextInput
                        style={tachosStyles.searchInput}
                        placeholder="Buscar por código, nombre o descripción..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={colors.gray}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={colors.gray} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Lista */}
            <FlatList
                data={filteredTachos}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={tachosStyles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                    />
                }
                ListEmptyComponent={
                    <View style={tachosStyles.emptyContainer}>
                        <Ionicons name="trash-outline" size={80} color={colors.grayLight} />
                        <Text style={tachosStyles.emptyTitle}>No hay tachos</Text>
                        <Text style={tachosStyles.emptyText}>
                            {searchQuery ? 'No se encontraron resultados para tu búsqueda' : 'No hay tachos registrados aún'}
                        </Text>
                        <TouchableOpacity
                            style={[tachosStyles.btn, tachosStyles.btnPrimary, tachosStyles.mtLg]}
                            onPress={() => navigation.navigate('TachoForm')}
                        >
                            <Ionicons name="add" size={20} color={colors.white} />
                            <Text style={tachosStyles.btnText}>Crear Primer Tacho</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
};

export default TachoList;