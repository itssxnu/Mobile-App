import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, Platform, Modal, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAllUsers, updateUserRole, deleteUserById } from '../../src/services/userService';

export default function AdminDashboard() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadUsers = async () => {
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to load users.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const [roleModalVisible, setRoleModalVisible] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const handleRoleChange = (userId: string) => {
        setSelectedUserId(userId);
        setRoleModalVisible(true);
    };

    const updateRole = async (userId: string, role: string, providerType?: string) => {
        setRoleModalVisible(false);
        try {
            await updateUserRole(userId, role, providerType);
            Alert.alert("Success", "User role updated successfully.");
            loadUsers();
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Failed to update role.");
        }
    };

    const executeDelete = async (userId: string) => {
        try {
            await deleteUserById(userId);
            if (Platform.OS === 'web') {
                window.alert("User has been removed.");
            } else {
                Alert.alert("Deleted", "User has been removed.");
            }
            loadUsers();
        } catch (error: any) {
            if (Platform.OS === 'web') {
                window.alert("Failed to delete user.");
            } else {
                Alert.alert("Error", "Failed to delete user.");
            }
        }
    };

    const handleDelete = (userId: string) => {
        if (Platform.OS === 'web') {
            const confirmed = window.confirm("Are you absolutely sure you want to permanently delete this user?");
            if (confirmed) {
                executeDelete(userId);
            }
        } else {
            Alert.alert(
                "Delete User",
                "Are you absolutely sure you want to permanently delete this user?",
                [
                    { text: "Cancel", style: "cancel" },
                    { 
                        text: "Delete", 
                        style: "destructive",
                        onPress: () => executeDelete(userId)
                    }
                ]
            );
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.userCard}>
            <View style={styles.userInfo}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                    <View style={styles.roleBadgeContainer}>
                        <View style={[styles.badge, item.role === 'ADMIN' ? styles.badgeAdmin : item.role === 'PROVIDER' ? styles.badgeProvider : styles.badgeUser]}>
                            <Text style={styles.badgeText}>{item.role}</Text>
                        </View>
                        {item.providerType && (
                            <View style={[styles.badge, styles.badgeType]}>
                                <Text style={styles.badgeTextType}>{item.providerType}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleRoleChange(item._id)}>
                    <Ionicons name="options-outline" size={20} color="#1e40af" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item._id)}>
                    <Ionicons name="trash-outline" size={20} color="#dc2626" />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#1e40af" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/(tabs)/')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#344e41" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>System Admin</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Role Selection Modal */}
            <Modal visible={roleModalVisible} transparent animationType="fade">
                <TouchableWithoutFeedback onPress={() => setRoleModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Select New Role</Text>
                                <Text style={styles.modalSubtitle}>Change permissions for this user.</Text>
                                
                                <TouchableOpacity style={styles.modalBtnAdmin} onPress={() => updateRole(selectedUserId!, 'ADMIN')}>
                                    <Text style={styles.modalBtnTextAdmin}>Make ADMIN</Text>
                                </TouchableOpacity>

                                <Text style={styles.modalSectionLabel}>PROVIDERS</Text>
                                
                                <View style={styles.providerGrid}>
                                    <TouchableOpacity style={styles.modalBtnProvider} onPress={() => updateRole(selectedUserId!, 'PROVIDER', 'HOST')}>
                                        <Text style={styles.modalBtnTextProvider}>Host</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.modalBtnProvider} onPress={() => updateRole(selectedUserId!, 'PROVIDER', 'GUIDE')}>
                                        <Text style={styles.modalBtnTextProvider}>Guide</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.modalBtnProvider} onPress={() => updateRole(selectedUserId!, 'PROVIDER', 'ACTIVITY')}>
                                        <Text style={styles.modalBtnTextProvider}>Activity</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.modalBtnProvider} onPress={() => updateRole(selectedUserId!, 'PROVIDER', 'EVENT')}>
                                        <Text style={styles.modalBtnTextProvider}>Event</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.modalBtnProvider} onPress={() => updateRole(selectedUserId!, 'PROVIDER', 'ATTRACTION')}>
                                        <Text style={styles.modalBtnTextProvider}>Attraction</Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity style={styles.modalBtnUser} onPress={() => updateRole(selectedUserId!, 'USER')}>
                                    <Text style={styles.modalBtnTextUser}>Make standard USER</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.modalCancel} onPress={() => setRoleModalVisible(false)}>
                                    <Text style={styles.modalCancelText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            <FlatList
                data={users}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                refreshing={refreshing}
                onRefresh={() => { setRefreshing(true); loadUsers(); }}
                ListEmptyComponent={<Text style={styles.emptyText}>No users found.</Text>}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#dad7cd', paddingTop: Platform.OS === 'android' ? 25 : 0 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#dad7cd' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#dad7cd' },
    backButton: { padding: 8, marginLeft: -8 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1e40af' },
    list: { padding: 16, gap: 12 },
    userCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    avatarText: { fontSize: 18, fontWeight: '700', color: '#475569' },
    userName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    userEmail: { fontSize: 13, color: '#64748b', marginBottom: 6 },
    roleBadgeContainer: { flexDirection: 'row', gap: 6 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    badgeUser: { backgroundColor: '#f1f5f9' },
    badgeProvider: { backgroundColor: '#fef3c7' },
    badgeAdmin: { backgroundColor: '#dbeafe' },
    badgeType: { backgroundColor: '#ecfdf5' },
    badgeText: { fontSize: 10, fontWeight: '800', color: '#334155' },
    badgeTextType: { fontSize: 10, fontWeight: '800', color: '#047857' },
    actions: { flexDirection: 'row', gap: 8 },
    actionBtn: { padding: 8, backgroundColor: '#f8fafc', borderRadius: 8 },
    emptyText: { textAlign: 'center', marginTop: 40, color: '#64748b' },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { backgroundColor: '#ffffff', borderRadius: 24, padding: 24, width: '100%', maxWidth: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginBottom: 4, textAlign: 'center' },
    modalSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 20, textAlign: 'center' },
    
    modalBtnAdmin: { backgroundColor: '#dbeafe', padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
    modalBtnTextAdmin: { color: '#1e40af', fontWeight: '700', fontSize: 15 },
    
    modalSectionLabel: { fontSize: 11, fontWeight: '800', color: '#94a3b8', letterSpacing: 1, marginBottom: 10, alignSelf: 'center' },
    
    providerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between', marginBottom: 16 },
    modalBtnProvider: { backgroundColor: '#fef3c7', padding: 12, borderRadius: 10, width: '48%', alignItems: 'center' },
    modalBtnTextProvider: { color: '#92400e', fontWeight: '700', fontSize: 14 },
    
    modalBtnUser: { backgroundColor: '#f1f5f9', padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
    modalBtnTextUser: { color: '#475569', fontWeight: '700', fontSize: 15 },
    
    modalCancel: { padding: 12, alignItems: 'center', marginTop: 8 },
    modalCancelText: { color: '#94a3b8', fontWeight: '600', fontSize: 15 }
});