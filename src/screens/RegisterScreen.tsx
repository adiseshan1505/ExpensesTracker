import React, { useRef, useEffect, useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Dimensions, Alert } from "react-native";
import { AuthContext } from "../context/AuthContext";

const { width } = Dimensions.get("window");

export default function RegisterScreen({ navigation }: any) {
    const { register } = useContext(AuthContext);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert("Missing fields", "Please fill all fields");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        const res = await register(name, email, password);

        if (res.success) {
            Alert.alert("Success", "Account created! Please login.");
            navigation.navigate("Login");
        } else {
            Alert.alert("Registration Failed", res.message || "Something went wrong");
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.appTitle}>Welcome to Secure Paisa Tracker</Text>
                <Text style={styles.appMotto}>All your expenses are safe!!!</Text>
            </View>
            <Animated.View
                style={[
                    styles.card,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Sign up to get started</Text>

                <TextInput
                    placeholder="Name"
                    placeholderTextColor="#777"
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                />

                <TextInput
                    placeholder="Email"
                    placeholderTextColor="#777"
                    style={styles.input}
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />

                <TextInput
                    placeholder="Password"
                    placeholderTextColor="#777"
                    secureTextEntry
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                />

                <TextInput
                    placeholder="Confirm Password"
                    placeholderTextColor="#777"
                    secureTextEntry
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />

                <TouchableOpacity style={styles.button} onPress={handleRegister}>
                    <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                    <Text style={styles.link}>Already have an account? Login</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0F1115",
        alignItems: "center",
        justifyContent: "center",
    },
    headerContainer: {
        alignItems: "center",
        marginBottom: 30,
    },
    appTitle: {
        color: "#5B8CFF",
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 8,
    },
    appMotto: {
        color: "#888",
        fontSize: 16,
        fontStyle: "italic",
    },
    card: {
        width: width * 0.9,
        backgroundColor: "#171A21",
        borderRadius: 24,
        padding: 24,
    },
    title: {
        color: "white",
        fontSize: 28,
        fontWeight: "700",
        marginBottom: 4,
    },
    subtitle: {
        color: "#888",
        marginBottom: 24,
    },
    input: {
        backgroundColor: "#0F1115",
        borderRadius: 14,
        padding: 14,
        color: "white",
        marginBottom: 14,
    },
    button: {
        backgroundColor: "#5B8CFF",
        padding: 16,
        borderRadius: 14,
        alignItems: "center",
        marginTop: 10,
        marginBottom: 18,
    },
    buttonText: {
        color: "white",
        fontWeight: "600",
        fontSize: 16,
    },
    link: {
        color: "#5B8CFF",
        textAlign: "center",
        marginTop: 6,
    },
});