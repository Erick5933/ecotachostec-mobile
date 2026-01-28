import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UbicacionList from '../pages/Ubicaciones/UbicacionList';
import UbicacionForm from '../pages/Ubicaciones/UbicacionForm';

const Stack = createNativeStackNavigator();

export default function UbicacionesNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="UbicacionList" component={UbicacionList} />
            <Stack.Screen name="UbicacionForm" component={UbicacionForm} />
        </Stack.Navigator>
    );
}
