import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { verifyEmail, resendVerification } from '../../src/services/authService';

export default function OTPVerifyScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const email = params.email as string;

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    if (!email) {
        Alert.alert("Error", "No email provided for verification.");
        router.replace('/(auth)/login');
        return null;
    }

    const handleVerify = async () => {
        if (!otp || otp.length !== 6) {
            Alert.alert('Invalid Code', 'Please enter the 6-digit verification code.');
            return;
        }

        setLoading(true);
        try {
            await verifyEmail(email, otp.trim());
            // Navigate immediately — Alert callbacks don't fire on web
            router.replace('/(tabs)/');
        } catch (error: any) {
            if (Platform.OS === 'web') {
                window.alert(error.response?.data?.message || 'Invalid or expired code. Please try again.');
            } else {
                Alert.alert('Verification Failed', error.response?.data?.message || 'Invalid or expired code.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        try {
            await resendVerification(email);
            Alert.alert('Code Resent', 'A new 6-digit verification code has been sent to your email.');
        } catch (error: any) {
            Alert.alert('Failed to Resend', error.response?.data?.message || 'Something went wrong.');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                
                <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(auth)/login')}>
                    <Ionicons name="arrow-back" size={28} color="#344e41" />
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.title}>Verify Email</Text>
                    <Text style={styles.subtitle}>We've sent a 6-digit secure verification code to <Text style={{fontWeight: '700'}}>{email}</Text>.</Text>
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.label}>Verification Code</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="• • • • • •"
                        placeholderTextColor="#a3b18a"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        maxLength={6}
                        textAlign="center"
                    />

                    <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
                        {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Verify & Continue</Text>}
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.resendButton} onPress={handleResend} disabled={resendLoading}>
                        {resendLoading ? <ActivityIndicator color="#588157" /> : <Text style={styles.resendText}>Didn't receive it? Resend Code</Text>}
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
    label: { fontSize: 13, fontWeight: '700', color: '#588157', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },
    input: { backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#a3b18a', padding: 16, borderRadius: 12, fontSize: 28, color: '#344e41', fontWeight: '800', marginBottom: 24, letterSpacing: 10 },
    button: { backgroundColor: '#3a5a40', padding: 18, borderRadius: 14, alignItems: 'center', shadowColor: '#3a5a40', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
    resendButton: { marginTop: 24, alignItems: 'center' },
    resendText: { color: '#588157', fontSize: 15, fontWeight: '600' }
});
