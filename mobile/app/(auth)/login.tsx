import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { Stack, router } from 'expo-router';
import { loginUser, isAuthenticated } from '../../src/services/authService';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { API_URL } from '../../src/config/apiConfig';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Setup Google Auth
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  });

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

  // Handle Google Auth Response
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleLogin(id_token);
    }
  }, [response]);

  const storeData = async (data: any) => {
    await AsyncStorage.setItem('userToken', data.token);
    await AsyncStorage.setItem('userData', JSON.stringify(data.user || data)); // Fallback if user object is nested
    router.replace('/(tabs)');
  };

  const handleGoogleLogin = async (idToken: string) => {
    setLoading(true);
    try {
      // Using direct axios for the google endpoint since it's not in authService yet
      const res = await axios.post(`${API_URL}/auth/google`, { idToken });
      
      if (res.data.missingPhone) {
        // Store token temporarily or just pass to next screen? 
        // We will store it so they are "logged in" but the app forces them to complete profile
        await AsyncStorage.setItem('userToken', res.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(res.data.user));
        router.replace('/(auth)/complete-profile');
      } else {
        await storeData(res.data);
      }
    } catch (error: any) {
      Alert.alert('Google Login Failed', error.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Required', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser(email.trim().toLowerCase(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      if (err.response?.data?.unverified) {
        // Navigate immediately — Alert callbacks don't fire on web
        router.push({ pathname: '/(auth)/otp-verify', params: { email: email.trim().toLowerCase() } });
      } else {
        const msg = err.response?.data?.message ?? 'Login failed. Please try again.';
        if (Platform.OS === 'web') {
          window.alert(msg);
        } else {
          Alert.alert('Login Failed', msg);
        }
      }
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
              placeholderTextColor="#6B7280"
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
              placeholderTextColor="#6B7280"
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
          </TouchableOpacity>

          {/* Google Button */}
          <TouchableOpacity 
            style={[styles.button, styles.googleButton]} 
            onPress={() => promptAsync()} 
            disabled={loading}
          >
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
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
  googleButton: { backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#3a5a40', marginTop: 12 },
  googleButtonText: { color: '#3a5a40', fontSize: 16, fontWeight: '700' },
  forgotPassword: { marginTop: 15, textAlign: 'center', color: '#588157', fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { fontSize: 14, color: '#588157' },
  footerLink: { fontSize: 14, color: '#3a5a40', fontWeight: '700', marginLeft: 4 },
});
