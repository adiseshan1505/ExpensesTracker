import React, { useRef, useEffect, useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Dimensions, Alert } from "react-native";
import { AuthContext } from "../context/AuthContext";

const { width } = Dimensions.get("window");

export default function LoginScreen({ navigation }: any) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [requires2FA, setRequires2FA] = useState(false);
    const [timer, setTimer] = useState(0);
    const { login, verifyOtp } = useContext(AuthContext);

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

    useEffect(() => {
        let interval: any;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Missing fields", "Enter email and password");
            return;
        }

        const res = await login(email, password);

        if (res.success && res.requires2FA) {
            setRequires2FA(true);
            setTimer(20);
            Alert.alert("2FA Required", res.message || "OTP sent to email");
        } else if (!res.success) {
            Alert.alert("Login Failed", res.message || "Invalid credentials");
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            Alert.alert("Missing OTP", "Enter the OTP sent to your email");
            return;
        }
        const success = await verifyOtp(email, otp);
        if (!success) {
            Alert.alert("Verification Failed", "Invalid OTP");
        }
    };

    const handleResendOtp = async () => {
        setTimer(20);
        const res = await login(email, password);
        if (res.success) {
            Alert.alert("OTP Resent", "Check your email for the new code");
        } else {
            Alert.alert("Error", res.message || "Failed to resend OTP");
        }
    };

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
                <Text style={styles.title}>{requires2FA ? "Verify OTP" : "Welcome Back"}</Text>
                <Text style={styles.subtitle}>{requires2FA ? "Enter code sent to email" : "Login to continue"}</Text>

                {requires2FA ? (
                    <>
                        <TextInput
                            placeholder="Enter OTP"
                            placeholderTextColor="#777"
                            style={styles.input}
                            keyboardType="number-pad"
                            value={otp}
                            onChangeText={setOtp}
                        />
                        <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
                            <Text style={styles.buttonText}>Verify OTP</Text>
                        </TouchableOpacity>

                        {timer > 0 ? (
                            <Text style={styles.timerText}>Resend OTP in {timer}s</Text>
                        ) : (
                            <TouchableOpacity onPress={handleResendOtp}>
                                <Text style={styles.link}>Resend OTP</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity onPress={() => setRequires2FA(false)}>
                            <Text style={styles.link}>Back to Login</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
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

                        <TouchableOpacity style={styles.button} onPress={handleLogin}>
                            <Text style={styles.buttonText}>Login</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                            <Text style={styles.link}>Create new account</Text>
                        </TouchableOpacity>
                    </>
                )}
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
    timerText: {
        color: "#888",
        textAlign: "center",
        marginTop: 10,
        fontSize: 14,
    },
});