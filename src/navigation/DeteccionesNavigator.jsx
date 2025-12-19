// src/navigation/DeteccionesNavigator.jsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DeteccionListScreen from '../pages/Detecciones/DeteccionList';
import DeteccionDetailScreen from '../pages/Detecciones/DeteccionDetail';
import DeteccionFormScreen from '../pages/Detecciones/DeteccionForm';

const Stack = createStackNavigator();

const DeteccionesNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: '#F5F7FA' },
            }}
        >
            <Stack.Screen
                name="DeteccionList"
                component={DeteccionListScreen}
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