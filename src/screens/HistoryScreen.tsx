import React, { useContext, useState, useMemo } from "react";
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, LayoutAnimation, Platform, UIManager } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

export default function HistoryScreen() {
    const { expenses, budget, theme } = useContext(AuthContext);
    const [expandedDate, setExpandedDate] = useState<string | null>(null);

    const isDark = theme === 'dark';
    const bgStyle = { backgroundColor: isDark ? "#0F1115" : "#F5F7FA" };
    const textStyle = { color: isDark ? "white" : "#333" };
    const cardStyle = { backgroundColor: isDark ? "#1C1F26" : "white" };
    const subTextStyle = { color: isDark ? "#888" : "#666" };

    const groupedExpenses = useMemo(() => {
        const sortedAsc = [...expenses].sort((a, b) => {
            const dateA = new Date(a.date || a.createdAt).getTime();
            const dateB = new Date(b.date || b.createdAt).getTime();
            return dateA - dateB;
        });

        const groups: { [key: string]: { date: string, total: number, balance: number, items: any[] } } = {};
        let runningSpent = 0;

        for (const expense of sortedAsc) {
            runningSpent += (expense.amount || 0);
            const dateObj = new Date(expense.date || expense.createdAt);
            const dateKey = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD

            if (!groups[dateKey]) {
                groups[dateKey] = {
                    date: dateKey,
                    total: 0,
                    balance: 0,
                    items: []
                };
            }
            groups[dateKey].items.push(expense);
            groups[dateKey].total += expense.amount;
            groups[dateKey].balance = budget - runningSpent; // Balance after this transaction (or day)
        }

        const groupArray = Object.values(groups).sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        return groupArray;
    }, [expenses, budget]);

    const toggleExpand = (date: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedDate(expandedDate === date ? null : date);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const renderTransaction = (item: any) => (
        <View key={item._id} style={[styles.transactionRow, { borderTopColor: isDark ? "#333" : "#eee" }]}>
            <View style={{ flex: 1 }}>
                <Text style={[styles.transactionTitle, textStyle]}>{item.title}</Text>
                <Text style={[styles.transactionCategory, subTextStyle]}>{item.category}</Text>
            </View>
            <Text style={styles.transactionAmount}>- Rs {item.amount}</Text>
        </View>
    );

    const renderDateGroup = ({ item }: any) => {
        const isExpanded = expandedDate === item.date;
        return (
            <View style={[styles.groupCard, cardStyle]}>
                <TouchableOpacity onPress={() => toggleExpand(item.date)} style={styles.groupHeader}>
                    <View style={styles.dateInfo}>
                        <Ionicons name="calendar-outline" size={20} color="#5B8CFF" />
                        <Text style={[styles.dateText, textStyle]}>{formatDate(item.date)}</Text>
                    </View>
                    <View style={styles.groupSummary}>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={[styles.dailySpent, { color: "#FF5B5B" }]}>Spent: Rs {item.total}</Text>
                            <Text style={[styles.dailyBalance, { color: "#4CAF50" }]}>Bal: Rs {item.balance.toFixed(2)}</Text>
                        </View>
                        <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={isDark ? "#888" : "#ccc"} style={{ marginLeft: 10 }} />
                    </View>
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.transactionsList}>
                        {item.items.map(renderTransaction)}
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, bgStyle]}>
            <StatusBar style={isDark ? "light" : "dark"} />
            <Text style={[styles.headerTitle, textStyle]}>History</Text>

            <FlatList
                data={groupedExpenses}
                keyExtractor={(item) => item.date}
                renderItem={renderDateGroup}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, subTextStyle]}>No history available</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    groupCard: {
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    groupHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
    },
    dateInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    dateText: {
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 12,
    },
    groupSummary: {
        flexDirection: "row",
        alignItems: "center",
    },
    dailySpent: {
        fontSize: 12,
        fontWeight: "600",
    },
    dailyBalance: {
        fontSize: 12,
        fontWeight: "600",
        marginTop: 2,
    },
    transactionsList: {
        paddingBottom: 16,
        paddingHorizontal: 16,
    },
    transactionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderTopWidth: 1,
    },
    transactionTitle: {
        fontSize: 14,
        fontWeight: "500",
    },
    transactionCategory: {
        fontSize: 12,
        marginTop: 2,
    },
    transactionAmount: {
        color: "#FF5B5B",
        fontSize: 14,
        fontWeight: "bold",
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
    }
});
