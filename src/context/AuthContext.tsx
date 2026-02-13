import React, { createContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.12.215.255:5000";

type AuthContextType = {
    userToken: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; requires2FA?: boolean; message?: string }>;
    register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    verifyOtp: (email: string, otp: string) => Promise<boolean>;
    logout: () => Promise<void>;

    toggleTwoFactor: () => Promise<void>;
    isTwoFactorEnabled: boolean;
    expenses: any[];
    fetchExpenses: () => Promise<void>;
    addExpense: (expense: any) => Promise<boolean>;
    deleteExpense: (id: string) => Promise<boolean>;
    budget: number;
    updateBudget: (amount: number) => Promise<boolean>;
    userName: string | null;
    profilePicture: string | null;
    updateProfile: (name: string, profilePicture: string) => Promise<boolean>;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
};

export const AuthContext = createContext<AuthContextType>({
    userToken: null,
    loading: true,
    login: async () => ({ success: false }),
    register: async () => ({ success: false }),
    verifyOtp: async () => false,
    logout: async () => { },

    toggleTwoFactor: async () => { },
    isTwoFactorEnabled: false,
    expenses: [],
    fetchExpenses: async () => { },
    addExpense: async () => false,
    deleteExpense: async () => false,
    budget: 0,
    updateBudget: async () => false,
    userName: null,
    profilePicture: null,
    updateProfile: async () => false,
    theme: 'dark',
    toggleTheme: () => { },
});

export const AuthProvider = ({ children }: any) => {
    const [userToken, setUserToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
    const [budget, setBudget] = useState(0);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [userName, setUserName] = useState<string | null>(null);
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    useEffect(() => {
        bootstrapAuth();
    }, []);

    const logout = async () => {
        await SecureStore.deleteItemAsync("token");
        setUserToken(null);
        setExpenses([]);
    };

    // Helper for centralized error handling and logout
    const authorizedFetch = async (url: string, options: any = {}) => {
        try {
            const res = await fetch(url, options);
            if (res.status === 401) {
                await logout();
                return null;
            }
            return res;
        } catch (error) {
            alert("Network Error: Please check your internet connection.");
            return null;
        }
    };

    const fetchExpensesInternal = async (token: string) => {
        const res = await authorizedFetch(`${API_URL}/api/expenses`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res) return;

        try {
            const data = await res.json();
            if (Array.isArray(data)) setExpenses(data);
        } catch (e) {
            console.error("Failed to fetch expenses", e);
        }
    };

    const fetchUserData = async (token: string) => {
        const res = await authorizedFetch(`${API_URL}/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res) return;

        try {
            const data = await res.json();
            if (data.user) {
                setBudget(data.user.budget || 0);
                setIsTwoFactorEnabled(data.user.isTwoFactorEnabled);
                if (data.user.name) setUserName(data.user.name);
                if (data.user.profilePicture) setProfilePicture(data.user.profilePicture);
            }
        } catch { }
    };

    const bootstrapAuth = async () => {
        const token = await SecureStore.getItemAsync("token");
        // Auto-login disabled as per request
        // if (token) {
        //     setUserToken(token);
        //     fetchExpensesInternal(token);
        //     fetchUserData(token);
        // }
        setLoading(false);
    };

    const register = async (name: string, email: string, password: string) => {
        try {
            const res = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await res.json();

            if (res.ok) {
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.error || "Registration failed" };
            }
        } catch {
            return { success: false, message: "Network error" };
        }
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
            if (data.user?.budget) setBudget(data.user.budget);
            if (data.user?.name) setUserName(data.user.name);
            if (data.user?.profilePicture) setProfilePicture(data.user.profilePicture);
            fetchExpensesInternal(data.token);

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
            if (data.user?.budget) setBudget(data.user.budget);
            if (data.user?.name) setUserName(data.user.name);
            if (data.user?.profilePicture) setProfilePicture(data.user.profilePicture);
            fetchExpensesInternal(data.token);
            return true;
        } catch {
            return false;
        }
    };

    const toggleTwoFactor = async () => {
        if (!userToken) return;
        const res = await authorizedFetch(`${API_URL}/toggle-2fa`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`
            },
        });
        if (!res) return;

        try {
            const data = await res.json();
            if (data.isTwoFactorEnabled !== undefined) {
                setIsTwoFactorEnabled(data.isTwoFactorEnabled);
            }
        } catch { }
    };

    const fetchExpenses = async () => {
        if (userToken) await fetchExpensesInternal(userToken);
    };

    const addExpense = async (expense: any) => {
        if (!userToken) return false;
        const res = await authorizedFetch(`${API_URL}/api/expenses`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`
            },
            body: JSON.stringify(expense),
        });
        if (res && res.ok) {
            await fetchExpenses();
            return true;
        }
        return false;
    };

    const deleteExpense = async (id: string) => {
        if (!userToken) return false;
        const res = await authorizedFetch(`${API_URL}/api/expenses/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${userToken}` },
        });
        if (res && res.ok) {
            await fetchExpenses();
            return true;
        }
        return false;
    };

    const updateBudget = async (amount: number) => {
        if (!userToken) return false;
        const res = await authorizedFetch(`${API_URL}/budget`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`
            },
            body: JSON.stringify({ budget: amount }),
        });
        if (!res) return false;

        try {
            const data = await res.json();
            if (res.ok) {
                setBudget(data.budget);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    };

    const updateProfile = async (name: string, picture: string) => {
        if (!userToken) return false;
        const res = await authorizedFetch(`${API_URL}/profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`
            },
            body: JSON.stringify({ name, profilePicture: picture }),
        });
        if (!res) return false;

        try {
            const data = await res.json();
            if (res.ok && data.user) {
                if (data.user.name) setUserName(data.user.name);
                if (data.user.profilePicture) setProfilePicture(data.user.profilePicture);
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
                register,
                verifyOtp,
                logout,

                toggleTwoFactor,
                isTwoFactorEnabled,
                expenses,
                fetchExpenses,
                addExpense,
                deleteExpense,
                budget,
                updateBudget,
                userName,
                profilePicture,
                updateProfile,
                theme,
                toggleTheme
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
