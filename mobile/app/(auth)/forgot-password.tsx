import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';

const API_URL = 'http://192.168.1.10:5000/api/auth';

export default function ForgotPassword() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleForgot = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/forgot-password`, { email });
            Alert.alert('Temporary Token', `For testing: ${res.data.resetToken}`); // Remove in prod
            router.push('/(auth)/reset-password');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>Enter your email to receive a reset token.</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#6B7280"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <TouchableOpacity style={styles.button} onPress={handleForgot} disabled={loading}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Send Mail</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.linkText}>Back to Login</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#0D1117' },
    title: { fontSize: 32, fontWeight: '700', color: '#F0F6FF', marginBottom: 10, textAlign: 'center' },
    subtitle: { fontSize: 16, marginBottom: 40, textAlign: 'center', color: '#8b949e' },
    input: { backgroundColor: '#161B22', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#30363D', color: '#F0F6FF', fontSize: 16 },
    button: { backgroundColor: '#1f6feb', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
    linkText: { marginTop: 24, textAlign: 'center', color: '#58A6FF', fontWeight: '600', fontSize: 15 }
});
