import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../src/config/apiConfig';

export default function ResetPassword() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [token, setToken] = useState((params.token as string) || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!token.trim() || !password || !confirmPassword) {
            Alert.alert('Required', 'Please fill in all fields.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Invalid Password', 'Password must be at least 6 characters.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Mismatch', 'Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await axios.put(`${API_URL}/auth/reset-password/${token.trim()}`, { password });
            // Navigate immediately — Alert callbacks don't fire on web
            router.replace('/(auth)/login');
        } catch (error: any) {
            if (Platform.OS === 'web') {
                window.alert(error.response?.data?.message || 'Something went wrong');
            } else {
                Alert.alert('Reset Failed', error.response?.data?.message || 'Something went wrong');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                
                <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(auth)/login')}>
                    <Ionicons name="close" size={28} color="#344e41" />
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.title}>Secure Reset</Text>
                    <Text style={styles.subtitle}>Enter the token you received and choose a new, secure password.</Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.fieldWrapper}>
                        <Text style={styles.label}>Recovery Token</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 8f2a9c..."
                            placeholderTextColor="#a3b18a"
                            value={token}
                            onChangeText={setToken}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.fieldWrapper}>
                        <Text style={styles.label}>New Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Minimum 6 characters"
                            placeholderTextColor="#a3b18a"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <View style={styles.fieldWrapper}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Retype new password"
                            placeholderTextColor="#a3b18a"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
                        {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Confirm New Password</Text>}
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#dad7cd' },
    scroll: { flexGrow: 1, padding: 24, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
    backButton: { marginBottom: 30, width: 40, height: 40, justifyContent: 'center' },
    header: { marginBottom: 40 },
    title: { fontSize: 32, fontWeight: '900', color: '#344e41', marginBottom: 12, letterSpacing: -0.5 },
    subtitle: { fontSize: 16, color: '#588157', lineHeight: 24, fontWeight: '500' },
    formContainer: { backgroundColor: '#ffffff', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#a3b18a', shadowColor: '#344e41', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4 },
    fieldWrapper: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '700', color: '#588157', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    input: { backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#a3b18a', padding: 16, borderRadius: 12, fontSize: 16, color: '#344e41', fontWeight: '500' },
    button: { backgroundColor: '#3a5a40', padding: 18, borderRadius: 14, alignItems: 'center', marginTop: 10, shadowColor: '#3a5a40', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});
