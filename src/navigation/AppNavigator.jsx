// src/navigation/AppNavigator.jsx
import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import LandingScreen from '../pages/Dashboard/LandingScreen';
import LoginScreen from '../pages/Auth/Login';
import RegisterScreen from '../pages/Auth/Register';
import DeteccionesNavigator from './DeteccionesNavigator';
import TachosNavigator from './TachosNavigator';
import UsuariosNavigator from './UsuariosNavigator';
import UbicacionesNavigator from './UbicacionesNavigator';
import ProfileScreen from '../pages/Auth/Profile';
import DashboardUser from '../pages/Dashboard/DashboardUser';
import DashboardAdmin from '../pages/Dashboard/DashboardAdmin';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { userToken, userInfo } = useContext(AuthContext);

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {userToken ? (
                // Usuario autenticado
                userInfo?.is_staff || userInfo?.rol === 'admin' ? (
                    // Admin
                    <Stack.Screen name="MainTabs">
                        {() => (
                            <TabNavigator
                                DashboardComponent={DashboardAdmin}
                                tabs={[
                                    {
                                        name: 'Dashboard',
                                        component: DashboardAdmin,
                                        title: 'Panel Admin'
                                    },
                                    {
                                        name: 'Usuarios',
                                        component: UsuariosNavigator,
                                        title: 'Usuarios'
                                    },
                                    {
                                        name: 'Ubicaciones',
                                        component: UbicacionesNavigator,
                                        title: 'Ubicaciones'
                                    },
                                    {
                                        name: 'Tachos',
                                        component: TachosNavigator,
                                        title: 'Tachos'
                                    },
                                    {
                                        name: 'Detecciones',
                                        component: DeteccionesNavigator, // CAMBIADO
                                        title: 'Detecciones'
                                    },
                                    {
                                        name: 'Perfil',
                                        component: ProfileScreen,
                                        title: 'Perfil'
                                    },
                                ]}
                                activeTintColor="#9C27B0"
                            />
                        )}
                    </Stack.Screen>
                ) : (
                    // Usuario normal
                    <Stack.Screen name="MainTabs">
                        {() => (
                            <TabNavigator
                                DashboardComponent={DashboardUser}
                                tabs={[
                                    {
                                        name: 'Dashboard',
                                        component: DashboardUser,
                                        title: 'Inicio'
                                    },
                                    {
                                        name: 'Detecciones',
                                        component: DeteccionesNavigator, // CAMBIADO
                                        title: 'Detecciones'
                                    },
                                    {
                                        name: 'Tachos',
                                        component: TachosNavigator,
                                        title: 'Tachos'
                                    },
                                    {
                                        name: 'Perfil',
                                        component: ProfileScreen,
                                        title: 'Perfil'
                                    },
                                ]}
                                activeTintColor="#4CAF50"
                            />
                        )}
                    </Stack.Screen>
                )
            ) : (
                // No autenticado
                <>
                    <Stack.Screen name="Landing" component={LandingScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                </>
            )}
        </Stack.Navigator>
    );
}