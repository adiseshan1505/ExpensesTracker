import React, { useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default function LoginScreen() {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;

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

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.card,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Login to continue</Text>

                <TextInput
                    placeholder="Email"
                    placeholderTextColor="#777"
                    style={styles.input}
                />

                <TextInput
                    placeholder="Password"
                    placeholderTextColor="#777"
                    secureTextEntry
                    style={styles.input}
                />

                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity>
                    <Text style={styles.link}>Create new account</Text>
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
