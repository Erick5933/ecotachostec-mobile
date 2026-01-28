// src/navigation/TachosNavigator.jsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TachoList from '../pages/Tachos/TachoList';
import TachoForm from '../pages/Tachos/TachoForm';
import TachoDetail from '../pages/Tachos/TachoDetail';

const Stack = createStackNavigator();


const TachosNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: '#F8F9FA' },
            }}
        >
            <Stack.Screen name="TachoList" component={TachoList} />
            <Stack.Screen name="TachoForm" component={TachoForm} />
            <Stack.Screen name="TachoDetail" component={TachoDetail} />
        </Stack.Navigator>
    );
};

export default TachosNavigator;