// src/navigation/TabNavigator.jsx (modificado)
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function TabNavigator({ tabs = [], activeTintColor = '#4CAF50' }) {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Detecciones') {
                        iconName = focused ? 'search' : 'search-outline';
                    } else if (route.name === 'Tachos') {
                        iconName = focused ? 'trash' : 'trash-outline';
                    } else if (route.name === 'Ubicaciones') {
                        iconName = focused ? 'map' : 'map-outline';
                    } else if (route.name === 'Usuarios') {
                        iconName = focused ? 'people' : 'people-outline';
                    } else if (route.name === 'Perfil') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: activeTintColor,
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60,
                },
            })}
        >
            {tabs.map((tab) => (
                <Tab.Screen
                    key={tab.name}
                    name={tab.name}
                    component={tab.component}
                    options={{ title: tab.title }}
                />
            ))}
        </Tab.Navigator>
    );
}