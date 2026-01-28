// src/pages/Detecciones/DeteccionForm.jsx
import { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Switch,
} from "react-native";
import { Picker } from '@react-native-picker/picker';
import { getDeteccionById, createDeteccion, updateDeteccion } from "../../api/deteccionApi";
import { getTachos } from "../../api/tachoApi";


export default function DeteccionFormScreen({ route, navigation }) {
    const { id } = route.params || {};
    const isEditing = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [tachos, setTachos] = useState([]);
    const [formData, setFormData] = useState({
        tacho: "",
        codigo: "",
        nombre: "",
        ubicacion_lat: "",
        ubicacion_lon: "",
        descripcion: "",
        activo: true,
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadTachos();
        if (isEditing) {
            loadDeteccion();
        }
    }, [id]);

    const loadTachos = async () => {
        try {
            const response = await getTachos();
            setTachos(response.data);
        } catch (error) {
            console.error("Error loading tachos:", error);
        }
    };

    const loadDeteccion = async () => {
        try {
            setLoading(true);
            const response = await getDeteccionById(id);
            setFormData(response.data);
        } catch (error) {
            console.error("Error loading deteccion:", error);
            Alert.alert("Error", "No se pudo cargar la detección");
        } finally {
            setLoading(false);
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.tacho) newErrors.tacho = "Selecciona un tacho";
        if (!formData.codigo.trim()) newErrors.codigo = "El código es requerido";
        if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido";
        if (!formData.ubicacion_lat.trim()) newErrors.ubicacion_lat = "La latitud es requerida";
        if (!formData.ubicacion_lon.trim()) newErrors.ubicacion_lon = "La longitud es requerida";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            Alert.alert("Error", "Por favor completa todos los campos requeridos");
            return;
        }

        try {
            setLoading(true);

            if (isEditing) {
                await updateDeteccion(id, formData);
                Alert.alert("Éxito", "Detección actualizada correctamente");
            } else {
                await createDeteccion(formData);
                Alert.alert("Éxito", "Detección creada correctamente");
            }

            navigation.goBack();
        } catch (error) {
            console.error("Error saving deteccion:", error);
            Alert.alert("Error", "No se pudo guardar la detección");
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#4CAF50" />
            </View>
        );
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
            <View style={{ padding: 20 }}>
                <Text style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: '#333',
                    marginBottom: 20,
                }}>
                    {isEditing ? 'Editar Detección' : 'Nueva Detección'}
                </Text>

                {/* Tacho */}
                <View style={{ marginBottom: 20 }}>
                    <Text style={{ marginBottom: 8, color: '#555', fontWeight: '500' }}>
                        Tacho *
                    </Text>
                    <View style={{
                        borderWidth: 1,
                        borderColor: errors.tacho ? '#f44336' : '#ddd',
                        borderRadius: 8,
                        backgroundColor: '#fff',
                    }}>
                        <Picker
                            selectedValue={formData.tacho}
                            onValueChange={(value) => setFormData({ ...formData, tacho: value })}
                        >
                            <Picker.Item label="Seleccionar tacho" value="" />
                            {tachos.map((t) => (
                                <Picker.Item key={t.id} label={`${t.codigo} - ${t.nombre}`} value={t.id} />
                            ))}
                        </Picker>
                    </View>
                    {errors.tacho && (
                        <Text style={{ color: '#f44336', fontSize: 12, marginTop: 5 }}>
                            {errors.tacho}
                        </Text>
                    )}
                </View>

                {/* Código */}
                <View style={{ marginBottom: 20 }}>
                    <Text style={{ marginBottom: 8, color: '#555', fontWeight: '500' }}>
                        Código *
                    </Text>
                    <TextInput
                        value={formData.codigo}
                        onChangeText={(text) => setFormData({ ...formData, codigo: text })}
                        placeholder="Ej: DET-001"
                        style={{
                            borderWidth: 1,
                            borderColor: errors.codigo ? '#f44336' : '#ddd',
                            padding: 14,
                            borderRadius: 8,
                            fontSize: 16,
                            backgroundColor: '#fff',
                        }}
                    />
                    {errors.codigo && (
                        <Text style={{ color: '#f44336', fontSize: 12, marginTop: 5 }}>
                            {errors.codigo}
                        </Text>
                    )}
                </View>

                {/* Nombre */}
                <View style={{ marginBottom: 20 }}>
                    <Text style={{ marginBottom: 8, color: '#555', fontWeight: '500' }}>
                        Nombre *
                    </Text>
                    <TextInput
                        value={formData.nombre}
                        onChangeText={(text) => setFormData({ ...formData, nombre: text })}
                        placeholder="Nombre de la detección"
                        style={{
                            borderWidth: 1,
                            borderColor: errors.nombre ? '#f44336' : '#ddd',
                            padding: 14,
                            borderRadius: 8,
                            fontSize: 16,
                            backgroundColor: '#fff',
                        }}
                    />
                    {errors.nombre && (
                        <Text style={{ color: '#f44336', fontSize: 12, marginTop: 5 }}>
                            {errors.nombre}
                        </Text>
                    )}
                </View>

                {/* Ubicación */}
                <View style={{ marginBottom: 20 }}>
                    <Text style={{ marginBottom: 8, color: '#555', fontWeight: '500' }}>
                        Latitud *
                    </Text>
                    <TextInput
                        value={formData.ubicacion_lat}
                        onChangeText={(text) => setFormData({ ...formData, ubicacion_lat: text })}
                        placeholder="Ej: -2.170998"
                        keyboardType="numeric"
                        style={{
                            borderWidth: 1,
                            borderColor: errors.ubicacion_lat ? '#f44336' : '#ddd',
                            padding: 14,
                            borderRadius: 8,
                            fontSize: 16,
                            backgroundColor: '#fff',
                        }}
                    />
                    {errors.ubicacion_lat && (
                        <Text style={{ color: '#f44336', fontSize: 12, marginTop: 5 }}>
                            {errors.ubicacion_lat}
                        </Text>
                    )}
                </View>

                <View style={{ marginBottom: 20 }}>
                    <Text style={{ marginBottom: 8, color: '#555', fontWeight: '500' }}>
                        Longitud *
                    </Text>
                    <TextInput
                        value={formData.ubicacion_lon}
                        onChangeText={(text) => setFormData({ ...formData, ubicacion_lon: text })}
                        placeholder="Ej: -79.922359"
                        keyboardType="numeric"
                        style={{
                            borderWidth: 1,
                            borderColor: errors.ubicacion_lon ? '#f44336' : '#ddd',
                            padding: 14,
                            borderRadius: 8,
                            fontSize: 16,
                            backgroundColor: '#fff',
                        }}
                    />
                    {errors.ubicacion_lon && (
                        <Text style={{ color: '#f44336', fontSize: 12, marginTop: 5 }}>
                            {errors.ubicacion_lon}
                        </Text>
                    )}
                </View>

                {/* Descripción */}
                <View style={{ marginBottom: 20 }}>
                    <Text style={{ marginBottom: 8, color: '#555', fontWeight: '500' }}>
                        Descripción (Opcional)
                    </Text>
                    <TextInput
                        value={formData.descripcion}
                        onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
                        placeholder="Descripción adicional"
                        multiline
                        numberOfLines={4}
                        style={{
                            borderWidth: 1,
                            borderColor: '#ddd',
                            padding: 14,
                            borderRadius: 8,
                            fontSize: 16,
                            backgroundColor: '#fff',
                            textAlignVertical: 'top',
                        }}
                    />
                </View>

                {/* Estado Activo */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                    padding: 16,
                    borderRadius: 8,
                    marginBottom: 30,
                }}>
                    <Text style={{ fontSize: 16, fontWeight: '500', color: '#555' }}>
                        Activo
                    </Text>
                    <Switch
                        value={formData.activo}
                        onValueChange={(value) => setFormData({ ...formData, activo: value })}
                        trackColor={{ false: '#ccc', true: '#4CAF50' }}
                    />
                </View>

                {/* Botones */}
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 30 }}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{
                            flex: 1,
                            backgroundColor: '#f5f5f5',
                            padding: 16,
                            borderRadius: 8,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: '#ddd',
                        }}
                    >
                        <Text style={{ color: '#666', fontWeight: 'bold', fontSize: 16 }}>
                            Cancelar
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={loading}
                        style={{
                            flex: 1,
                            backgroundColor: loading ? '#ccc' : '#4CAF50',
                            padding: 16,
                            borderRadius: 8,
                            alignItems: 'center',
                        }}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                                {isEditing ? 'Actualizar' : 'Crear'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}