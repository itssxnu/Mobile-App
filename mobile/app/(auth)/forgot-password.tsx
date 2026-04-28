import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../src/config/apiConfig';

export default function ForgotPassword() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleForgot = async () => {
        if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/auth/forgot-password`, { email: email.trim().toLowerCase() });
            
            // Pop up the success message
            Alert.alert(
                'Email Sent', 
                'If an account with that email exists, we have sent a recovery token to it. Please check your inbox and spam folders.',
                [{ text: 'Enter Token', onPress: () => router.push('/(auth)/reset-password') }]
            );
        } catch (error: any) {
            Alert.alert('Recovery Failed', error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color="#344e41" />
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.title}>Forgot Password?</Text>
                    <Text style={styles.subtitle}>Enter your email address and we'll send you a secure recovery token.</Text>
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. john@example.com"
                        placeholderTextColor="#a3b18a"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <TouchableOpacity style={styles.button} onPress={handleForgot} disabled={loading}>
                        {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Send Recovery Token</Text>}
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
    label: { fontSize: 13, fontWeight: '700', color: '#588157', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    input: { backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#a3b18a', padding: 16, borderRadius: 12, fontSize: 16, color: '#344e41', marginBottom: 24, fontWeight: '500' },
    button: { backgroundColor: '#3a5a40', padding: 18, borderRadius: 14, alignItems: 'center', shadowColor: '#3a5a40', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});
