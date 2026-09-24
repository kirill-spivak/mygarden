import { ActivityIndicator, View, Text } from "react-native";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { SignUpScreen } from "./screens/SignUpScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const Stack = createNativeStackNavigator();

const RootStack = () => {
    const { user, loading } = useAuth();

    // if (loading) {
    // return (
    // <ActivityIndicator
    // style={{
    // flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
    // }}
    // />
    // );
    // }

    return (
        <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    {user ? (
                        <Stack.Screen
                            name="Home"
                            component={HomeScreen}
                        ></Stack.Screen>
                    ) : (
                        <Stack.Screen name="SignUp" component={SignUpScreen} />
                    )}
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaView>
    );
};

export default function App() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <RootStack />
            </AuthProvider>
        </SafeAreaProvider>
    );
}
