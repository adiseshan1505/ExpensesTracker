import React, { createContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";

const API_URL = "http://10.12.215.255:5000"; // Ensure this matches your backend IP

type AuthContextType = {
    userToken: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; requires2FA?: boolean; message?: string }>;
    verifyOtp: (email: string, otp: string) => Promise<boolean>;
    logout: () => Promise<void>;
    unlockWithBiometric: () => Promise<boolean>;
    isBiometricEnabled: boolean;
    toggleBiometric: () => Promise<void>;
    toggleTwoFactor: () => Promise<void>;
    isTwoFactorEnabled: boolean;
    expenses: any[];
    fetchExpenses: () => Promise<void>;
    addExpense: (expense: any) => Promise<boolean>;
    deleteExpense: (id: string) => Promise<boolean>;
};

export const AuthContext = createContext<AuthContextType>({
    userToken: null,
    loading: true,
    login: async () => ({ success: false }),
    verifyOtp: async () => false,
    logout: async () => { },
    unlockWithBiometric: async () => false,
    isBiometricEnabled: false,
    toggleBiometric: async () => { },
    toggleTwoFactor: async () => { },
    isTwoFactorEnabled: false,
    expenses: [],
    fetchExpenses: async () => { },
    addExpense: async () => false,
    deleteExpense: async () => false,
});

export const AuthProvider = ({ children }: any) => {
    const [userToken, setUserToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
    const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
    const [expenses, setExpenses] = useState<any[]>([]);

    useEffect(() => {
        bootstrapAuth();
    }, []);

    const bootstrapAuth = async () => {
        const token = await SecureStore.getItemAsync("token");
        const biometricPref = await SecureStore.getItemAsync("biometric_enabled");

        setIsBiometricEnabled(biometricPref === "true");

        if (token) {
            // Only prompt for biometric if enabled
            if (biometricPref === "true") {
                const biometricSuccess = await tryBiometricUnlock();
                if (biometricSuccess) {
                    setUserToken(token);
                    fetchExpensesInternal(token);
                }
            } else {
                setUserToken(token);
                fetchExpensesInternal(token);
            }
        }
        setLoading(false);
    };

    const tryBiometricUnlock = async () => {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (!hasHardware || !isEnrolled) return true;

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: "Authenticate to continue",
        });
        return result.success;
    };

    const login = async (email: string, password: string) => {
        try {
            const res = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (data.twoFactorRequired) {
                return { success: true, requires2FA: true, message: data.message };
            }

            if (!data.token) return { success: false, message: data.error || "Login failed" };

            await SecureStore.setItemAsync("token", data.token);
            setUserToken(data.token);
            if (data.user?.isTwoFactorEnabled) setIsTwoFactorEnabled(true);
            fetchExpensesInternal(data.token);

            // Set biometric default to false on first login if not set, or keep existing
            // const currentBio = await SecureStore.getItemAsync("biometric_enabled");
            // if (currentBio === null) await SecureStore.setItemAsync("biometric_enabled", "false");

            return { success: true };
        } catch (error) {
            return { success: false, message: "Network error" };
        }
    };

    const verifyOtp = async (email: string, otp: string) => {
        try {
            const res = await fetch(`${API_URL}/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });
            const data = await res.json();

            if (!data.token) return false;

            await SecureStore.setItemAsync("token", data.token);
            setUserToken(data.token);
            if (data.user?.isTwoFactorEnabled) setIsTwoFactorEnabled(true);
            fetchExpensesInternal(data.token);
            return true;
        } catch {
            return false;
        }
    };

    const logout = async () => {
        await SecureStore.deleteItemAsync("token");
        setUserToken(null);
        setExpenses([]);
    };

    const unlockWithBiometric = async () => {
        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: "Unlock Secure Expense Tracker",
        });
        return result.success;
    };

    const toggleBiometric = async () => {
        const newState = !isBiometricEnabled;
        setIsBiometricEnabled(newState);
        await SecureStore.setItemAsync("biometric_enabled", newState ? "true" : "false");
    };

    const toggleTwoFactor = async () => {
        if (!userToken) return;
        try {
            const res = await fetch(`${API_URL}/toggle-2fa`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userToken}`
                },
            });
            const data = await res.json();
            if (data.isTwoFactorEnabled !== undefined) {
                setIsTwoFactorEnabled(data.isTwoFactorEnabled);
            }
        } catch {
            // failed
        }
    };

    // Expense Logic
    const fetchExpensesInternal = async (token: string) => {
        try {
            const res = await fetch(`${API_URL}/api/expenses`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (Array.isArray(data)) setExpenses(data);
        } catch (e) {
            console.error("Failed to fetch expenses", e);
        }
    };

    const fetchExpenses = async () => {
        if (userToken) await fetchExpensesInternal(userToken);
    };

    const addExpense = async (expense: any) => {
        if (!userToken) return false;
        try {
            const res = await fetch(`${API_URL}/api/expenses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userToken}`
                },
                body: JSON.stringify(expense),
            });
            if (res.ok) {
                await fetchExpenses();
                return true;
            }
            return false;
        } catch {
            return false;
        }
    };

    const deleteExpense = async (id: string) => {
        if (!userToken) return false;
        try {
            const res = await fetch(`${API_URL}/api/expenses/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${userToken}` },
            });
            if (res.ok) {
                await fetchExpenses();
                return true;
            }
            return false;
        } catch {
            return false;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                userToken,
                loading,
                login,
                verifyOtp,
                logout,
                unlockWithBiometric,
                isBiometricEnabled,
                toggleBiometric,
                toggleTwoFactor,
                isTwoFactorEnabled,
                expenses,
                fetchExpenses,
                addExpense,
                deleteExpense
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
