// src/navigation/TabNavigator.jsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';

const Tab = createBottomTabNavigator();

export default function TabNavigator({ tabs = [], activeTintColor = '#1E40AF' }) {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    let IconComponent = Ionicons;

                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Detecciones') {
                        iconName = focused ? 'analytics' : 'analytics-outline';
                    } else if (route.name === 'Tachos') {
                        iconName = 'trash-can';
                        IconComponent = MaterialCommunityIcons;
                    } else if (route.name === 'Ubicaciones') {
                        iconName = focused ? 'location' : 'location-outline';
                    } else if (route.name === 'Usuarios') {
                        iconName = focused ? 'people' : 'people-outline';
                    } else if (route.name === 'Perfil') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return (
                        <IconComponent
                            name={iconName}
                            size={size}
                            color={color}
                            style={{ marginBottom: 4 }}
                        />
                    );
                },
                tabBarActiveTintColor: activeTintColor,
                tabBarInactiveTintColor: '#64748B',
                tabBarStyle: {
                    // Mantener suficiente espacio inferior para gestos; fondo blanco por diseño
                    paddingBottom: Platform.OS === 'ios' ? 44 : 20,
                    paddingTop: 8,
                    height: Platform.OS === 'ios' ? 112 : 92,
                    backgroundColor: '#FFFFFF',
                    
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: 2,
                },
                headerShown: false,
            })}
        >
            {tabs.map((tab) => (
                <Tab.Screen
                    key={tab.name}
                    name={tab.name}
                    component={tab.component}
                    options={{
                        title: tab.title || tab.name,
                        tabBarAccessibilityLabel: tab.title || tab.name,
                    }}
                />
            ))}
        </Tab.Navigator>
    );
}

