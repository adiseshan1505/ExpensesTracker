import React, { useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput, Alert, Modal, Switch, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from "../context/AuthContext";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
    const { logout, expenses, fetchExpenses, addExpense, deleteExpense, isTwoFactorEnabled, toggleTwoFactor, budget, updateBudget, userName, theme, toggleTheme, profilePicture, updateProfile } = useContext(AuthContext);
    const [modalVisible, setModalVisible] = useState(false);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [budgetModalVisible, setBudgetModalVisible] = useState(false);
    const [profileModalVisible, setProfileModalVisible] = useState(false);
    const [editName, setEditName] = useState("");

    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const [newBudget, setNewBudget] = useState("");

    useEffect(() => {
        fetchExpenses();
    }, []);

    const getGreeting = () => {
        const date = new Date();
        const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        const ist = new Date(utc + (3600000 * 5.5));
        const hours = ist.getHours();

        if (hours < 12) return "Good Morning";
        if (hours < 17) return "Good Afternoon";
        return "Good Evening";
    };

    const isDark = theme === 'dark';
    const bgStyle = { backgroundColor: isDark ? "#0F1115" : "#F5F7FA" };
    const textStyle = { color: isDark ? "white" : "#333" };
    const cardStyle = { backgroundColor: isDark ? "#1C1F26" : "white" };
    const subTextStyle = { color: isDark ? "#888" : "#666" };

    const totalExpenses = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
    const remainingBalance = budget - totalExpenses;

    const handleAddExpense = async () => {
        if (!title || !amount || !category) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }

        const expenseAmount = parseFloat(amount);
        const success = await addExpense({
            title,
            amount: expenseAmount,
            category,
            date: new Date(date)
        });

        if (success) {
            setModalVisible(false);
            setTitle("");
            setAmount("");
            setCategory("");

            const projectedBalance = budget - (totalExpenses + expenseAmount);
            if (projectedBalance < 500) {
                Alert.alert("Low Balance Warning", "Your balance is below 500! You need to ask for money.");
            }
        } else {
            Alert.alert("Error", "Failed to add expense");
        }
    };

    const handleUpdateBudget = async () => {
        if (!newBudget) return;
        const success = await updateBudget(parseFloat(newBudget));
        if (success) {
            setBudgetModalVisible(false);
            setNewBudget("");
        } else {
            Alert.alert("Error", "Failed to update budget");
        }
    };

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
            await updateProfile(editName || userName || "User", base64Img);
        }
    };

    const handleSaveProfile = async () => {
        await updateProfile(editName, profilePicture || "");
        setProfileModalVisible(false);
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
        <View style={[styles.card, cardStyle]}>
            <View style={styles.cardIcon}>
                <Ionicons name="receipt-outline" size={24} color="#5B8CFF" />
            </View>
            <View style={styles.cardContent}>
                <View>
                    <Text style={[styles.cardTitle, textStyle]}>{item.title}</Text>
                    <Text style={[styles.cardCategory, subTextStyle]}>{item.category}</Text>
                </View>
                <Text style={[styles.cardAmount, textStyle]}>Rs {item.amount}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={20} color="#FF5B5B" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, bgStyle]}>
            <StatusBar style="light" />

            { }
            { }
            <View style={[styles.header, { marginTop: 10 }]}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={[styles.greeting, textStyle]}>{getGreeting()} {userName}</Text>
                    <Text style={[styles.headerTitle, textStyle]} numberOfLines={1} adjustsFontSizeToFit>Secure Paisa Tracker</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={toggleTheme} style={[styles.settingsButton, { marginRight: 10, backgroundColor: isDark ? "#1C1F26" : "#E0E0E0" }]}>
                        <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={24} color={isDark ? "white" : "#333"} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={logout} style={[styles.settingsButton, { marginRight: 10, backgroundColor: "#FF5B5B" }]}>
                        <Ionicons name="log-out-outline" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSettingsVisible(true)} style={[styles.settingsButton, { backgroundColor: isDark ? "#1C1F26" : "#E0E0E0" }]}>
                        <Ionicons name="settings-outline" size={24} color={isDark ? "white" : "#333"} />
                    </TouchableOpacity>
                </View>
            </View>

            { }
            <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Remaining Balance</Text>
                <Text style={styles.summaryAmount}>Rs {remainingBalance.toFixed(2)}</Text>

                <View style={styles.statsRow}>
                    <View>
                        <Text style={styles.statLabel}>Total Budget</Text>
                        <Text style={styles.statValue}>Rs {budget}</Text>
                    </View>
                    <View>
                        <Text style={styles.statLabel}>Total Spent</Text>
                        <Text style={styles.statValue}>Rs {totalExpenses.toFixed(2)}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.editBudgetButton} onPress={() => setBudgetModalVisible(true)}>
                    <Text style={styles.editBudgetText}>Edit Budget</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.listHeader}>
                <Text style={[styles.listTitle, textStyle]}>Recent Transactions</Text>
            </View>

            <FlatList
                data={expenses.slice(0, 5)}
                keyExtractor={(item) => item._id}
                renderItem={renderExpenseItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="wallet-outline" size={64} color="#555" />
                        <Text style={[styles.emptyText, subTextStyle]}>No expenses yet. Add one!</Text>
                    </View>
                }
            />

            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>

            { }
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
                        <TextInput
                            placeholder="Date (YYYY-MM-DD)"
                            placeholderTextColor="#999"
                            style={styles.input}
                            value={date}
                            onChangeText={setDate}
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

            { }
            <Modal
                animationType="fade"
                transparent={true}
                visible={budgetModalVisible}
                onRequestClose={() => setBudgetModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Update Monthly Budget</Text>
                        <TextInput
                            placeholder="Enter total budget amount"
                            placeholderTextColor="#999"
                            style={styles.input}
                            keyboardType="numeric"
                            value={newBudget}
                            onChangeText={setNewBudget}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setBudgetModalVisible(false)}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleUpdateBudget}>
                                <Text style={styles.buttonText}>Update</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            { }
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
                                <Text style={styles.settingText}>Two-Factor Auth (OTP)</Text>
                                <Text style={styles.settingSubtext}>Verify via email on login</Text>
                            </View>
                            <Switch
                                value={isTwoFactorEnabled}
                                onValueChange={toggleTwoFactor}
                                trackColor={{ false: "#767577", true: "#5B8CFF" }}
                            />
                        </View>

                        <TouchableOpacity onPress={() => { setSettingsVisible(false); setProfileModalVisible(true); setEditName(userName || ""); }} style={styles.settingRow}>
                            <View>
                                <Text style={styles.settingText}>View Profile</Text>
                                <Text style={styles.settingSubtext}>Edit name & picture</Text>
                            </View>
                            <Ionicons name="person-circle-outline" size={24} color={isDark ? "white" : "#333"} />
                        </TouchableOpacity>


                    </View>
                </View>
            </Modal>

            {/* Profile Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={profileModalVisible}
                onRequestClose={() => setProfileModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Profile</Text>

                        <View style={{ alignItems: 'center', marginBottom: 20 }}>
                            <TouchableOpacity onPress={handlePickImage} style={styles.profileImageContainer}>
                                {profilePicture ? (
                                    <Image source={{ uri: profilePicture }} style={styles.profileImage} />
                                ) : (
                                    <View style={styles.placeholderImage}>
                                        <Ionicons name="person" size={40} color="#ccc" />
                                    </View>
                                )}
                                <View style={styles.editIconBadge}>
                                    <Ionicons name="camera" size={14} color="white" />
                                </View>
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            placeholder="Your Name"
                            placeholderTextColor="#999"
                            style={styles.input}
                            value={editName}
                            onChangeText={setEditName}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setProfileModalVisible(false)}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveProfile}>
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
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 20,
    },
    greeting: {
        fontSize: 14,
        fontWeight: "500",
        marginBottom: 4,
        color: "#888"
    },
    headerTitle: {
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
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.2)",
        paddingTop: 16,
    },
    statLabel: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 12,
        marginBottom: 4,
    },
    statValue: {
        color: "white",
        fontSize: 18,
        fontWeight: "600",
    },
    editBudgetButton: {
        backgroundColor: "rgba(255,255,255,0.2)",
        marginTop: 16,
        padding: 10,
        borderRadius: 12,
        alignItems: "center",
    },
    editBudgetText: {
        color: "white",
        fontWeight: "600",
        fontSize: 14,
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
    profileImageContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
        position: 'relative',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    placeholderImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#2C2F36",
        alignItems: "center",
        justifyContent: "center",
    },
    editIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: "#5B8CFF",
        padding: 6,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#171A21",
    },
});