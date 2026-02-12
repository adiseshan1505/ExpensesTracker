import React, { useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, TextInput, Alert, Modal, Switch } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { StatusBar } from "expo-status-bar";

export default function HomeScreen() {
    const { logout, expenses, fetchExpenses, addExpense, deleteExpense, isBiometricEnabled, toggleBiometric, isTwoFactorEnabled, toggleTwoFactor, userToken } = useContext(AuthContext);
    const [modalVisible, setModalVisible] = useState(false);

    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");

    useEffect(() => {
        fetchExpenses();
    }, []);

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
            <View style={styles.cardContent}>
                <View>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardCategory}>{item.category}</Text>
                </View>
                <Text style={styles.cardAmount}>Rs {item.amount}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteButton}>
                <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Secure Paisa Tracker</Text>
                <TouchableOpacity onPress={logout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.settingsContainer}>
                <View style={styles.settingRow}>
                    <Text style={styles.settingText}>Biometric Unlock</Text>
                    <Switch
                        value={isBiometricEnabled}
                        onValueChange={toggleBiometric}
                        trackColor={{ false: "#767577", true: "#5B8CFF" }}
                    />
                </View>

                <View style={styles.settingRow}>
                    <Text style={styles.settingText}>Two-Factor Auth (OTP)</Text>
                    <Switch
                        value={isTwoFactorEnabled}
                        onValueChange={toggleTwoFactor}
                        trackColor={{ false: "#767577", true: "#5B8CFF" }}
                    />
                </View>
            </View>

            <FlatList
                data={expenses}
                keyExtractor={(item) => item._id}
                renderItem={renderExpenseItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<Text style={styles.emptyText}>No expenses yet. Add one!</Text>}
            />

            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

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
        paddingTop: 40,
        paddingBottom: 20,
        backgroundColor: "#171A21",
    },
    headerTitle: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
    },
    logoutText: {
        color: "#FF5B5B",
        fontSize: 16,
    },
    settingsContainer: {
        padding: 20,
    },
    settingRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
        backgroundColor: "#1C1F26",
        padding: 15,
        borderRadius: 12,
    },
    settingText: {
        color: "#ccc",
        fontSize: 16,
    },
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: "#1C1F26",
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        color: "white",
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 4,
    },
    cardCategory: {
        color: "#888",
        fontSize: 14,
    },
    cardAmount: {
        color: "#4CAF50",
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 4,
    },
    deleteButton: {
        backgroundColor: "#FF5B5B20",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginLeft: 10,
    },
    deleteText: {
        color: "#FF5B5B",
        fontSize: 12,
        fontWeight: "600",
    },
    emptyText: {
        color: "#555",
        textAlign: "center",
        marginTop: 50,
        fontSize: 16,
    },
    fab: {
        position: "absolute",
        bottom: 30,
        right: 30,
        backgroundColor: "#5B8CFF",
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        elevation: 5,
        shadowColor: "#5B8CFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    fabText: {
        color: "white",
        fontSize: 30,
        marginTop: -4,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "85%",
        backgroundColor: "#171A21",
        borderRadius: 24,
        padding: 24,
    },
    modalTitle: {
        color: "white",
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
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
        marginTop: 10,
    },
    modalButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: "#333",
        marginRight: 10,
    },
    saveButton: {
        backgroundColor: "#5B8CFF",
        marginLeft: 10,
    },
    buttonText: {
        color: "white",
        fontWeight: "600",
        fontSize: 16,
    },
});