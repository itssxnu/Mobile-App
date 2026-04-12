import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';

const API_URL = 'http://192.168.1.10:5000/api/auth';

export default function ResetPassword() {
    const router = useRouter();
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!token || !password) {
            Alert.alert('Error', 'Please enter token & new password');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.put(`${API_URL}/reset-password/${token}`, { password });
            Alert.alert('Success', 'Password has been reset.');
            router.replace('/(auth)/login');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Reset Password</Text>

            <TextInput
                style={styles.input}
                placeholder="Reset Token"
                placeholderTextColor="#6B7280"
                value={token}
                onChangeText={setToken}
                autoCapitalize="none"
            />
            
            <TextInput
                style={styles.input}
                placeholder="New Password"
                placeholderTextColor="#6B7280"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Reset Password</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                <Text style={styles.linkText}>Back to Login</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#0D1117' },
    title: { fontSize: 32, fontWeight: '700', color: '#F0F6FF', marginBottom: 40, textAlign: 'center' },
    input: { backgroundColor: '#161B22', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#30363D', color: '#F0F6FF', fontSize: 16 },
    button: { backgroundColor: '#1f6feb', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
    linkText: { marginTop: 24, textAlign: 'center', color: '#58A6FF', fontWeight: '600', fontSize: 15 }
});
