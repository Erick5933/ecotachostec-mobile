// src/navigation/CercaDeMiNavigator.jsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TachosCercaDeMi from '../pages/Tachos/TachosCercaDeMi';
import TachoDetail from '../pages/Tachos/TachoDetail';

const Stack = createStackNavigator();

export default function CercaDeMiNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#F8F9FA' },
      }}
    >
      <Stack.Screen name="CercaDeMi" component={TachosCercaDeMi} />
      <Stack.Screen name="TachoDetail" component={TachoDetail} />
    </Stack.Navigator>
  );
}
