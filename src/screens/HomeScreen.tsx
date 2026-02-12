import React, { useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, TextInput, Alert, Modal, Switch, Dimensions } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
    const { logout, expenses, fetchExpenses, addExpense, deleteExpense, isBiometricEnabled, toggleBiometric, isTwoFactorEnabled, toggleTwoFactor } = useContext(AuthContext);
    const [modalVisible, setModalVisible] = useState(false);
    const [settingsVisible, setSettingsVisible] = useState(false);

    // New Expense State
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");

    useEffect(() => {
        fetchExpenses();
    }, []);

    const totalExpenses = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);

    const handleAddExpense = async () => {
        if (!title || !amount || !category) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }

        const success = await addExpense({
            title,
            amount: parseFloat(amount),
            category
        });

        if (success) {
            setModalVisible(false);
            setTitle("");
            setAmount("");
            setCategory("");
        } else {
            Alert.alert("Error", "Failed to add expense");
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert(
            "Delete Expense",
            "Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => await deleteExpense(id)
                }
            ]
        );
    };

    const renderExpenseItem = ({ item }: any) => (
        <View style={styles.card}>
            <View style={styles.cardIcon}>
                <Ionicons name="receipt-outline" size={24} color="#5B8CFF" />
            </View>
            <View style={styles.cardContent}>
                <View>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardCategory}>{item.category}</Text>
                </View>
                <Text style={styles.cardAmount}>Rs {item.amount}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={20} color="#FF5B5B" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Welcome Back</Text>
                    <Text style={styles.headerTitle}>Secure Paisa Tracker</Text>
                </View>
                <TouchableOpacity onPress={() => setSettingsVisible(true)} style={styles.settingsButton}>
                    <Ionicons name="settings-outline" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Total Balance Card */}
            <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total Spent</Text>
                <Text style={styles.summaryAmount}>Rs {totalExpenses.toFixed(2)}</Text>
                <View style={styles.summaryFooter}>
                    <Text style={styles.summaryFooterText}>Keep tracking your expenses securely</Text>
                </View>
            </View>

            <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Recent Transactions</Text>
            </View>

            <FlatList
                data={expenses}
                keyExtractor={(item) => item._id}
                renderItem={renderExpenseItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="wallet-outline" size={64} color="#333" />
                        <Text style={styles.emptyText}>No expenses yet. Add one!</Text>
                    </View>
                }
            />

            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>

            {/* Add Expense Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>New Expense</Text>

                        <TextInput
                            placeholder="Title (e.g. Lunch)"
                            placeholderTextColor="#999"
                            style={styles.input}
                            value={title}
                            onChangeText={setTitle}
                        />
                        <TextInput
                            placeholder="Amount (e.g. 500)"
                            placeholderTextColor="#999"
                            style={styles.input}
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                        />
                        <TextInput
                            placeholder="Category (e.g. Food)"
                            placeholderTextColor="#999"
                            style={styles.input}
                            value={category}
                            onChangeText={setCategory}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleAddExpense}>
                                <Text style={styles.buttonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Settings Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={settingsVisible}
                onRequestClose={() => setSettingsVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.settingsContent}>
                        <View style={styles.settingsHeader}>
                            <Text style={styles.modalTitle}>Settings</Text>
                            <TouchableOpacity onPress={() => setSettingsVisible(false)}>
                                <Ionicons name="close" size={24} color="#ccc" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.settingRow}>
                            <View>
                                <Text style={styles.settingText}>Biometric Unlock</Text>
                                <Text style={styles.settingSubtext}>Use FaceID/Fingerprint to login</Text>
                            </View>
                            <Switch
                                value={isBiometricEnabled}
                                onValueChange={toggleBiometric}
                                trackColor={{ false: "#767577", true: "#5B8CFF" }}
                            />
                        </View>

                        <View style={styles.settingRow}>
                            <View>
                                <Text style={styles.settingText}>Two-Factor Auth (OTP)</Text>
                                <Text style={styles.settingSubtext}>Verify via email on login</Text>
                            </View>
                            <Switch
                                value={isTwoFactorEnabled}
                                onValueChange={toggleTwoFactor}
                                trackColor={{ false: "#767577", true: "#5B8CFF" }}
                            />
                        </View>

                        <TouchableOpacity style={styles.logoutButton} onPress={() => { setSettingsVisible(false); logout(); }}>
                            <Text style={styles.logoutButtonText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0F1115",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
    },
    greeting: {
        color: "#888",
        fontSize: 14,
        marginBottom: 4,
    },
    headerTitle: {
        color: "white",
        fontSize: 24,
        fontWeight: "bold",
    },
    settingsButton: {
        padding: 8,
        backgroundColor: "#1C1F26",
        borderRadius: 12,
    },
    summaryCard: {
        marginHorizontal: 20,
        backgroundColor: "#5B8CFF",
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        elevation: 5,
        shadowColor: "#5B8CFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    summaryLabel: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 14,
        marginBottom: 8,
    },
    summaryAmount: {
        color: "white",
        fontSize: 36,
        fontWeight: "bold",
    },
    summaryFooter: {
        marginTop: 16,
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.2)",
        paddingTop: 12,
    },
    summaryFooterText: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 12,
    },
    listHeader: {
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    listTitle: {
        color: "white",
        fontSize: 18,
        fontWeight: "600",
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: "#1C1F26",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
    },
    cardIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: "rgba(91, 140, 255, 0.1)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 2,
    },
    cardCategory: {
        color: "#888",
        fontSize: 12,
    },
    cardAmount: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    deleteButton: {
        padding: 8,
        marginLeft: 8,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 60,
    },
    emptyText: {
        color: "#555",
        marginTop: 16,
        fontSize: 16,
    },
    fab: {
        position: "absolute",
        bottom: 30,
        right: 30,
        backgroundColor: "#5B8CFF",
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
        elevation: 5,
        shadowColor: "#5B8CFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.8)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "85%",
        backgroundColor: "#171A21",
        borderRadius: 24,
        padding: 24,
    },
    settingsContent: {
        width: "90%",
        backgroundColor: "#171A21",
        borderRadius: 24,
        padding: 24,
    },
    modalTitle: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 24,
    },
    settingsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    settingRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        backgroundColor: "#1C1F26",
        padding: 16,
        borderRadius: 16,
    },
    settingText: {
        color: "white",
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 4,
    },
    settingSubtext: {
        color: "#888",
        fontSize: 12,
    },
    input: {
        backgroundColor: "#0F1115",
        color: "white",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },
    modalButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: "#333",
        marginRight: 8,
    },
    saveButton: {
        backgroundColor: "#5B8CFF",
        marginLeft: 8,
    },
    buttonText: {
        color: "white",
        fontWeight: "600",
        fontSize: 16,
    },
    logoutButton: {
        backgroundColor: "#FF5B5B",
        padding: 16,
        borderRadius: 16,
        alignItems: "center",
        marginTop: 12,
    },
    logoutButtonText: {
        color: "white",
        fontWeight: "600",
        fontSize: 16,
    },
});