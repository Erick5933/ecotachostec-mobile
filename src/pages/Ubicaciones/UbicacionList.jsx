// src/pages/Ubicaciones/UbicacionList.jsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { getProvincias, getCiudades, getCantones } from "../../api/ubicacionApi";

export default function UbicacionList() {
    const [provincias, setProvincias] = useState([]);
    const [ciudades, setCiudades] = useState([]);
    const [cantones, setCantones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [provRes, ciuRes, canRes] = await Promise.all([
                    getProvincias(),
                    getCiudades(),
                    getCantones()
                ]);

                setProvincias(provRes.data || []);
                setCiudades(ciuRes.data || []);
                setCantones(canRes.data || []);
            } catch (error) {
                console.error("Error cargando ubicaciones:", error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text>Cargando ubicaciones...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Provincias */}
            <Text style={styles.title}>Provincias</Text>
            <FlatList
                data={provincias}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <Text style={styles.item}>{item.nombre}</Text>
                )}
            />

            {/* Ciudades */}
            <Text style={styles.title}>Ciudades</Text>
            <FlatList
                data={ciudades}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <Text style={styles.item}>
                        {item.nombre} - Prov: {item.provincia}
                    </Text>
                )}
            />

            {/* Cantones */}
            <Text style={styles.title}>Cantones</Text>
            <FlatList
                data={cantones}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <Text style={styles.item}>
                        {item.nombre} - Ciudad: {item.ciudad}
                    </Text>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: "#fff",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 20,
        marginBottom: 10,
        color: "#4CAF50",
    },
    item: {
        padding: 10,
        backgroundColor: "#f3f3f3",
        borderRadius: 8,
        marginBottom: 5,
    },
});
