// src/navigation/DeteccionesNavigator.jsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DeteccionesScreen from '../pages/Detecciones/DeteccionesScreen';
import DeteccionDetailScreen from '../pages/Detecciones/DeteccionDetail';
import DeteccionFormScreen from '../pages/Detecciones/DeteccionForm';
import MisDeteccionesScreen from '../pages/Detecciones/MisDetecciones';
import EstadisticasDeteccionesMobile from '../pages/Detecciones/EstadisticasDeteccionesMobile';
import DeteccionList from '../pages/Detecciones/DeteccionList';

const Stack = createStackNavigator();


const DeteccionesNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="MisDetecciones"
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: '#F5F7FA' },
            }}
        >
            <Stack.Screen
                name="MisDetecciones"
                component={MisDeteccionesScreen}
            />
            <Stack.Screen
                name="DeteccionEstadisticas"
                component={EstadisticasDeteccionesMobile}
            />
            {/* Lista completa para administradores */}
            <Stack.Screen
                name="DeteccionesAllList"
                component={DeteccionList}
            />
            <Stack.Screen
                name="DeteccionListScreen"
                component={DeteccionesScreen}
            />
            <Stack.Screen
                name="DeteccionDetail"
                component={DeteccionDetailScreen}
            />
            <Stack.Screen
                name="DeteccionForm"
                component={DeteccionFormScreen}
            />
        </Stack.Navigator>
    );
};

export default DeteccionesNavigator;