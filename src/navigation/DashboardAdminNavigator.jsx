// src/navigation/DashboardAdminNavigator.jsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DashboardAdmin from '../pages/Dashboard/DashboardAdmin';
import TachosNavigator from './TachosNavigator';
import DeteccionesNavigator from './DeteccionesNavigator';
import UbicacionesNavigator from './UbicacionesNavigator'; // Nuevo
import UsersListScreen from '../pages/Admin/UsersList'; // Nuevo
import UserFormScreen from '../pages/Admin/UserForm'; // Nuevo
import ReportsScreen from '../pages/Admin/Reports'; // Nuevo
import StatisticsScreen from '../pages/Admin/Statistics'; // Nuevo

const Stack = createStackNavigator();

const DashboardAdminNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: '#F5F7FA' },
            }}
        >
            {/* Dashboard principal */}
            <Stack.Screen 
                name="DashboardMain" 
                component={DashboardAdmin} 
            />
            
            {/* Tachos */}
            <Stack.Screen 
                name="Tachos" 
                component={TachosNavigator} 
            />
            
            {/* Detecciones */}
            <Stack.Screen 
                name="Detecciones" 
                component={DeteccionesNavigator} 
            />
            
            {/* Ubicaciones */}
            <Stack.Screen 
                name="Ubicaciones" 
                component={UbicacionesNavigator} 
            />
            
            {/* Usuarios */}
            <Stack.Screen 
                name="UsersList" 
                component={UsersListScreen} 
            />
            
            <Stack.Screen 
                name="UserForm" 
                component={UserFormScreen} 
            />
            
            {/* Reportes */}
            <Stack.Screen 
                name="Reports" 
                component={ReportsScreen} 
            />
            
            {/* Estadísticas */}
            <Stack.Screen 
                name="Statistics" 
                component={StatisticsScreen} 
            />
        </Stack.Navigator>
    );
};

export default DashboardAdminNavigator;