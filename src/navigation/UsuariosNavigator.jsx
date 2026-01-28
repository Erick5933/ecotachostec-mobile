// src/navigation/UsuariosNavigator.jsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import UsuarioList from '../pages/Usuarios/UsuarioList';
import UsuarioForm from '../pages/Usuarios/UsuarioForm';

const Stack = createStackNavigator();

const UsuariosNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: '#F8F9FA' },
            }}
        >
            <Stack.Screen name="UsuarioList" component={UsuarioList} />
            <Stack.Screen name="UsuarioForm" component={UsuarioForm} />
        </Stack.Navigator>
    );
};

export default UsuariosNavigator;
