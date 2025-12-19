// src/navigation/AuthNavigator.jsx
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../pages/Auth/Login";
import RegisterScreen from "../pages/Auth/Register";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
}