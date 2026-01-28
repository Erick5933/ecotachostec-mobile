// src/pages/Auth/Profile.jsx
import { useState, useContext, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Alert
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from "../../context/AuthContext";
import { getProfile, updateProfile } from "../../api/authApi";
import { profileStyles } from "../../styles/authStyles";


export default function ProfileScreen() {
    const { userInfo, logout, userToken } = useContext(AuthContext);

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [formData, setFormData] = useState({
        nombre: "",
        email: "",
        telefono: "",
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const response = await getProfile();
            setProfileData(response.data);
            setFormData({
                nombre: response.data.nombre || "",
                email: response.data.email || "",
                telefono: response.data.telefono || "",
            });
        } catch (error) {
            console.error("Error loading profile:", error);
            Alert.alert("Error", "No se pudo cargar el perfil");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            setLoading(true);
            await updateProfile(formData);
            Alert.alert("Éxito", "Perfil actualizado correctamente");
            setIsEditing(false);
            loadProfile();
        } catch (error) {
            console.error("Error updating profile:", error);
            Alert.alert("Error", "No se pudo actualizar el perfil");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            "Cerrar Sesión",
            "¿Estás seguro que deseas cerrar sesión?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Sí, cerrar",
                    onPress: () => logout(),
                    style: "destructive"
                }
            ]
        );
    };

    if (loading && !profileData) {
        return (
            <View style={profileStyles.loadingContainer}>
                <ActivityIndicator size="large" color="#2d6a4f" />
            </View>
        );
    }

    return (
        <ScrollView style={profileStyles.scrollView}>
            <View style={profileStyles.content}>
                {/* Header con Avatar */}
                <View style={profileStyles.profileHeader}>
                    <View style={profileStyles.avatarContainer}>
                        <Ionicons name="person" size={50} color="#fff" />
                    </View>
                    <Text style={profileStyles.profileName}>
                        {profileData?.nombre || "Usuario"}
                    </Text>
                    <Text style={profileStyles.profileRole}>
                        {profileData?.rol === 'admin' ? 'Administrador' : 'Usuario'}
                    </Text>
                </View>

                {/* Información del Perfil */}
                <View style={profileStyles.infoCard}>
                    <View style={profileStyles.infoHeader}>
                        <Text style={profileStyles.infoTitle}>
                            Información Personal
                        </Text>
                        {!isEditing && (
                            <TouchableOpacity
                                onPress={() => setIsEditing(true)}
                                style={profileStyles.editButton}
                            >
                                <Text style={profileStyles.editButtonText}>Editar</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Nombre */}
                    <View style={profileStyles.fieldContainer}>
                        <Text style={profileStyles.fieldLabel}>
                            Nombre
                        </Text>
                        {isEditing ? (
                            <TextInput
                                value={formData.nombre}
                                onChangeText={(text) => setFormData({ ...formData, nombre: text })}
                                style={profileStyles.profileInput}
                            />
                        ) : (
                            <Text style={profileStyles.fieldValue}>
                                {profileData?.nombre || "No especificado"}
                            </Text>
                        )}
                    </View>

                    {/* Email */}
                    <View style={profileStyles.fieldContainer}>
                        <Text style={profileStyles.fieldLabel}>
                            Email
                        </Text>
                        <Text style={profileStyles.fieldValue}>
                            {profileData?.email || "No especificado"}
                        </Text>
                        <Text style={profileStyles.fieldInfo}>
                            (El email no se puede cambiar)
                        </Text>
                    </View>

                    {/* Teléfono */}
                    <View style={profileStyles.fieldContainer}>
                        <Text style={profileStyles.fieldLabel}>
                            Teléfono
                        </Text>
                        {isEditing ? (
                            <TextInput
                                value={formData.telefono}
                                onChangeText={(text) => setFormData({ ...formData, telefono: text })}
                                keyboardType="phone-pad"
                                style={profileStyles.profileInput}
                            />
                        ) : (
                            <Text style={profileStyles.fieldValue}>
                                {profileData?.telefono || "No especificado"}
                            </Text>
                        )}
                    </View>

                    {/* Fecha de Registro */}
                    <View style={profileStyles.fieldContainer}>
                        <Text style={profileStyles.fieldLabel}>
                            Miembro desde
                        </Text>
                        <Text style={profileStyles.fieldValue}>
                            {profileData?.fecha_registro
                                ? new Date(profileData.fecha_registro).toLocaleDateString('es-ES')
                                : "No disponible"
                            }
                        </Text>
                    </View>

                    {/* Botones de Edición */}
                    {isEditing && (
                        <View style={profileStyles.actionButtons}>
                            <TouchableOpacity
                                onPress={() => {
                                    setIsEditing(false);
                                    setFormData({
                                        nombre: profileData?.nombre || "",
                                        email: profileData?.email || "",
                                        telefono: profileData?.telefono || "",
                                    });
                                }}
                                style={profileStyles.cancelButton}
                            >
                                <Text style={profileStyles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleUpdate}
                                disabled={loading}
                                style={[
                                    profileStyles.saveButton,
                                    loading && profileStyles.saveButtonDisabled
                                ]}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={profileStyles.saveButtonText}>Guardar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Botón Cerrar Sesión */}
                <TouchableOpacity
                    onPress={handleLogout}
                    style={profileStyles.logoutButton}
                >
                    <Ionicons name="log-out-outline" size={24} color="#fff" />
                    <Text style={profileStyles.logoutButtonText}>
                        Cerrar Sesión
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}