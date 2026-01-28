import { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Platform,
    TextInput
    
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';


export const UbicacionModal = ({
                                   visible,
                                   onClose,
                                   items,
                                   onSelect,
                                   title,
                                   selectedValue
                               }) => {
    const [searchText, setSearchText] = useState('');

    // Filtrar items basado en la búsqueda
    const filteredItems = items.filter(item =>
        item.nombre.toLowerCase().includes(searchText.toLowerCase())
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.item,
                selectedValue === item.id.toString() && styles.selectedItem
            ]}
            onPress={() => {
                onSelect(item.id.toString());
                onClose();
            }}
            activeOpacity={0.7}
        >
            <Text style={[
                styles.itemText,
                selectedValue === item.id.toString() && styles.selectedItemText
            ]}>
                {item.nombre}
            </Text>
            {selectedValue === item.id.toString() && (
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
            )}
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <View style={styles.modalHeaderContent}>
                            <Text style={styles.modalTitle}>{title}</Text>
                            <TouchableOpacity
                                onPress={onClose}
                                style={styles.closeButton}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {/* Barra de búsqueda */}
                        {items.length > 5 && (
                            <View style={styles.searchContainer}>
                                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Buscar..."
                                    value={searchText}
                                    onChangeText={setSearchText}
                                    placeholderTextColor="#999"
                                />
                                {searchText.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearchText('')}>
                                        <Ionicons name="close-circle" size={20} color="#999" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>

                    <FlatList
                        data={filteredItems}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="search-outline" size={48} color="#ccc" />
                                <Text style={styles.emptyText}>No se encontraron resultados</Text>
                                <Text style={styles.emptySubtext}>
                                    {searchText ? `Para "${searchText}"` : "No hay opciones disponibles"}
                                </Text>
                            </View>
                        }
                        initialNumToRender={20}
                        maxToRenderPerBatch={50}
                        windowSize={10}
                        showsVerticalScrollIndicator={true}
                        contentContainerStyle={styles.listContent}
                    />

                    {/* Botón cancelar en iOS */}
                    {Platform.OS === 'ios' && (
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
        ...Platform.select({
            ios: {
                marginHorizontal: 10,
                marginBottom: 10,
            },
            android: {
                marginBottom: 0,
            }
        })
    },
    modalHeader: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalHeaderContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e3a2a',
        flex: 1,
    },
    closeButton: {
        padding: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginTop: 5,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        padding: 0,
    },
    listContent: {
        paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    selectedItem: {
        backgroundColor: '#2d6a4f',
    },
    itemText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    selectedItemText: {
        color: '#fff',
        fontWeight: '500',
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 16,
        color: '#666',
        fontSize: 16,
        fontWeight: '500',
    },
    emptySubtext: {
        textAlign: 'center',
        marginTop: 8,
        color: '#999',
        fontSize: 14,
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
        padding: 16,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
});