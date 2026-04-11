import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

const API_URL = 'http://10.205.117.13:5000/api/auth'; // Ensure this matches your backend

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Setup Google Auth. Replace clientId with your actual Web Client ID from Google Cloud Console
    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            handleGoogleLogin(id_token);
        }
    }, [response]);

    const handleGoogleLogin = async (idToken: string) => {
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/google`, { idToken });
            await storeData(res.data);
        } catch (error: any) {
            Alert.alert('Google Login Failed', error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }

    const storeData = async (data: any) => {
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(data));
        router.replace('/(tabs)');
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/login`, {
                email,
                password
            });
            await storeData(res.data);
        } catch (error: any) {
            Alert.alert('Login Failed', error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome Back</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#6B7280"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#6B7280"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Login</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.googleButton]} onPress={() => promptAsync()} disabled={loading}>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                <Text style={[styles.linkText, { marginTop: 15, color: '#6B7280' }]}>Forgot Password?</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#0D1117' },
    title: { fontSize: 32, fontWeight: '700', color: '#F0F6FF', marginBottom: 40, textAlign: 'center' },
    input: { backgroundColor: '#161B22', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#30363D', color: '#F0F6FF', fontSize: 16 },
    button: { backgroundColor: '#1f6feb', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    googleButton: { backgroundColor: '#161B22', borderWidth: 1, borderColor: '#30363D' },
    googleButtonText: { color: '#F0F6FF', fontSize: 16, fontWeight: '700' },
    buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
    linkText: { marginTop: 24, textAlign: 'center', color: '#58A6FF', fontWeight: '600', fontSize: 15 }
});
s