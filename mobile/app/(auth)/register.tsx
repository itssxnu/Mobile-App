import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert, Image,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { registerUser } from '../../src/services/authService';
import * as ImagePicker from 'expo-image-picker';

type FormErrors = Partial<Record<'name' | 'email' | 'phone' | 'password' | 'confirmPassword', string>>;

interface FieldProps {
  label: string; value: string; onChangeText: (text: string) => void;
  placeholder: string; secure?: boolean; error?: string; onClearError?: () => void;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
}

const Field = ({ label, value, onChangeText, placeholder, secure = false, keyboardType = 'default', error, onClearError }: FieldProps) => (
  <View style={styles.fieldWrapper}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, error ? styles.inputError : null]}
      value={value}
      onChangeText={(text) => { onChangeText(text); if (error && onClearError) onClearError(); }}
      placeholder={placeholder}
      placeholderTextColor="#6B7280"
      secureTextEntry={secure}
      keyboardType={keyboardType}
      autoCapitalize={secure || keyboardType === 'email-address' ? 'none' : 'words'}
    />
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const pickImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission Needed', 'Please allow gallery access to upload a photo.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) setProfilePhoto(result.assets[0].uri);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!name.trim()) newErrors.name = 'Full name is required.';
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Valid email is required.';
    if (!phone.trim()) newErrors.phone = 'Phone number is required.';
    if (!password || password.length < 6) newErrors.password = 'Min. 6 characters required.';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    if (loading) return; // prevent double-submit

    setLoading(true);

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('email', email.trim().toLowerCase());
    formData.append('phone', phone.trim());
    formData.append('password', password);

    if (profilePhoto) {
      if (Platform.OS === 'web') {
        try {
          const res = await fetch(profilePhoto);
          const blob = await res.blob();
          formData.append('profilePhoto', blob, 'photo.jpg');
        } catch {
          // If blob fetch fails, skip photo — don't block registration
        }
      } else {
        const filename = profilePhoto.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        formData.append('profilePhoto', {
          uri: Platform.OS === 'android' ? profilePhoto : profilePhoto.replace('file://', ''),
          name: filename,
          type: type,
        } as any);
      }
    }

    try {
      const response = await registerUser(formData);

      if (response.token) {
        // Auto-verified: token returned — go straight to the app
        router.replace('/(tabs)');
      } else if (response.unverified || response.email) {
        // OTP verification required (when email is re-enabled)
        router.push({ pathname: '/(auth)/otp-verify', params: { email: email.trim().toLowerCase() } });
      } else {
        router.replace('/(tabs)');
      }

    } catch (err: any) {
      const statusCode = err.response?.status;
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setRegisterError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoMark}><Text style={styles.logoEmoji}>🌴</Text></View>
          <Text style={styles.appName}>HD Resorts</Text>
          <Text style={styles.tagline}>Sri Lanka's hidden gems, discovered.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create Account</Text>
          <Text style={styles.cardSubtitle}>Join thousands of explorers discovering Sri Lanka's best.</Text>

          <TouchableOpacity onPress={pickImage} style={styles.photoContainer}>
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}><Text style={styles.placeholderIcon}>📸</Text></View>
            )}
            <Text style={styles.photoLabel}>{profilePhoto ? 'Change Photo' : 'Set Profile Photo'}</Text>
          </TouchableOpacity>

          <Field label="Full Name" value={name} onChangeText={setName} placeholder="e.g. Sahan Perera" error={errors.name} onClearError={() => setErrors(prev => ({ ...prev, name: undefined }))} />
          <Field label="Email Address" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" error={errors.email} onClearError={() => setErrors(prev => ({ ...prev, email: undefined }))} />
          <Field label="Phone Number" value={phone} onChangeText={setPhone} placeholder="07XXXXXXXX" keyboardType="phone-pad" error={errors.phone} onClearError={() => setErrors(prev => ({ ...prev, phone: undefined }))} />
          <Field label="Password" value={password} onChangeText={setPassword} placeholder="Min. 6 characters" secure error={errors.password} onClearError={() => setErrors(prev => ({ ...prev, password: undefined }))} />
          <Field label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Re-enter password" secure error={errors.confirmPassword} onClearError={() => setErrors(prev => ({ ...prev, confirmPassword: undefined }))} />

          {registerError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>⚠️ {registerError}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={() => { setRegisterError(null); handleRegister(); }} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Account</Text>}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.footerLink}> Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#dad7cd' },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 },
  header: { alignItems: 'center', marginBottom: 32 },
  logoMark: { width: 72, height: 72, borderRadius: 24, backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#3a5a40', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  logoEmoji: { fontSize: 32 },
  appName: { fontSize: 26, fontWeight: '900', color: '#344e41', letterSpacing: -0.5 },
  tagline: { fontSize: 14, color: '#588157', marginTop: 4, fontWeight: '500' },
  card: { backgroundColor: '#ffffff', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#a3b18a' },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#344e41', marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: '#588157', lineHeight: 20, marginBottom: 16 },
  photoContainer: { alignItems: 'center', marginVertical: 12 },
  imagePlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#a3b18a', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  placeholderIcon: { fontSize: 30 },
  imagePreview: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#3a5a40' },
  photoLabel: { fontSize: 11, fontWeight: '700', color: '#3a5a40', marginTop: 6, textTransform: 'uppercase' },
  fieldWrapper: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: '#588157', marginBottom: 6, textTransform: 'uppercase' },
  input: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#a3b18a', borderRadius: 12, padding: 13, color: '#344e41' },
  inputError: { borderColor: '#F87171', borderWidth: 2 },
  errorText: { fontSize: 12, color: '#F87171', marginTop: 5 },
  button: { backgroundColor: '#3a5a40', borderRadius: 14, padding: 15, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, alignItems: 'center' },
  footerText: { fontSize: 14, color: '#588157' },
  footerLink: { fontSize: 14, color: '#3a5a40', fontWeight: '700', marginLeft: 4 },
  errorBanner: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FCA5A5', borderRadius: 12, padding: 12, marginTop: 8, marginBottom: 4 },
  errorBannerText: { color: '#B91C1C', fontSize: 13, fontWeight: '600', textAlign: 'center' },
});