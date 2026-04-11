import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.205.117.13:5000/api/users';

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch users. Are you an admin?');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        Alert.alert('WARNING', `Are you sure you want to completely delete ${name}?`, [
            { text: 'Cancel', style: 'cancel' },
            { 
                text: 'Delete', 
                style: 'destructive',
                onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem('userToken');
                        await axios.delete(`${API_URL}/${id}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        setUsers(users.filter((u: any) => u._id !== id));
                        Alert.alert('Deleted', 'User removed');
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete user');
                    }
                }
            }
        ]);
    };

    const handleRoleUpdate = async (id: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        Alert.alert('Confirm', `Change role to ${newRole}?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Update',
                onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem('userToken');
                        await axios.put(`${API_URL}/${id}/role`, { role: newRole }, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        fetchUsers();
                        Alert.alert('Success', 'Role updated');
                    } catch (error) {
                        Alert.alert('Error', 'Failed to update role');
                    }
                }
            }
        ]);
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.email}>{item.email}</Text>
                <Text style={styles.role}>Role: <Text style={{color: item.role === 'admin' ? '#DA3633' : '#58A6FF'}}>{item.role.toUpperCase()}</Text></Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity style={[styles.btn, styles.roleBtn]} onPress={() => handleRoleUpdate(item._id, item.role)}>
                    <Text style={styles.btnText}>Toggle Role</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.deleteBtn]} onPress={() => handleDelete(item._id, item.name)}>
                    <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return <ActivityIndicator style={{flex: 1}} size="large" />;
    }

    return (
        <View style={styles.container}>
            <FlatList 
                data={users}
                ListHeaderComponent={<Text style={styles.title}>User Management</Text>}
                keyExtractor={(item: any) => item._id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: '#0D1117' },
    title: { fontSize: 32, fontWeight: '700', color: '#F0F6FF', marginBottom: 24, textAlign: 'center', marginTop: 20 },
    card: { backgroundColor: '#161B22', padding: 20, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#30363D' },
    name: { fontSize: 20, fontWeight: '700', color: '#F0F6FF' },
    email: { color: '#6B7280', marginVertical: 6, fontSize: 16 },
    role: { fontWeight: '600', color: '#6B7280', fontSize: 14 },
    actions: { flexDirection: 'row', marginTop: 20, justifyContent: 'flex-end' },
    btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginLeft: 12 },
    roleBtn: { backgroundColor: '#238636' },
    deleteBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#DA3633' },
    btnText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
    deleteBtnText: { color: '#DA3633', fontWeight: '700', fontSize: 14 }
});