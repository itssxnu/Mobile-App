import React, { useState, useEffect } from 'react';
import {
<<<<<<< HEAD
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { Stack, router } from 'expo-router';
import { loginUser, isAuthenticated } from '../../src/services/authService';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-redirect if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        router.replace('/(tabs)');
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Required', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser(email.trim().toLowerCase(), password);
      
      Alert.alert(
        '✅ Login Successful',
        `Welcome back, ${response.user.name}!`,
        [{ text: 'Continue', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (err: any) {  // ← ADDED ": any" HERE
      const msg = err.response?.data?.message ?? 'Login failed. Please try again.';
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.screen} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoMark}><Text style={styles.logoEmoji}>🌴</Text></View>
          <Text style={styles.appName}>HD Resorts</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>
          <Text style={styles.cardSubtitle}>Welcome back to Sri Lanka's best resorts.</Text>

          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to HD Resorts?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.footerLink}> Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#dad7cd' },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  logoMark: { 
    width: 60, height: 60, borderRadius: 20, backgroundColor: '#ffffff', 
    borderWidth: 2, borderColor: '#3a5a40', justifyContent: 'center', alignItems: 'center', marginBottom: 10 
  },
  logoEmoji: { fontSize: 28 },
  appName: { fontSize: 24, fontWeight: '900', color: '#344e41' },
  card: { backgroundColor: '#ffffff', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#a3b18a' },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#344e41', marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: '#588157', marginBottom: 20 },
  fieldWrapper: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: '#588157', marginBottom: 6, textTransform: 'uppercase' },
  input: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#a3b18a', borderRadius: 12, padding: 13, color: '#344e41' },
  button: { backgroundColor: '#3a5a40', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 10 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { fontSize: 14, color: '#588157' },
  footerLink: { fontSize: 14, color: '#3a5a40', fontWeight: '700', marginLeft: 4 },
});
=======
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
>>>>>>> 9bcf77f5edade3ed4ebc57a8a96a4f1e0e2b6634
