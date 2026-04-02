import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { registerUser } from '../../src/services/authService';

type FormErrors = Partial<Record<'name' | 'email' | 'password' | 'confirmPassword', string>>;

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secure?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  error?: string;
  onClearError?: () => void;
}

// ── Field helper ───────────────────────────────────────────────
const Field = ({
  label, value, onChangeText, placeholder,
  secure = false, keyboardType = 'default', error, onClearError
}: FieldProps) => (
  <View style={styles.fieldWrapper}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, error ? styles.inputError : null]}
      value={value}
      onChangeText={(text) => {
        onChangeText(text);
        if (error && onClearError) onClearError();
      }}
      placeholder={placeholder}
      placeholderTextColor="#6B7280"
      secureTextEntry={secure}
      keyboardType={keyboardType}
      autoCapitalize={secure || keyboardType === 'email-address' ? 'none' : 'words'}
      autoComplete={secure ? 'off' : undefined}
    />
    {error ? (
      <Text style={styles.errorText}>{error}</Text>
    ) : null}
  </View>
);

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // ── Validation ────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!name.trim()) newErrors.name = 'Full name is required.';
    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Enter a valid email address.';
    }
    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await registerUser({ name: name.trim(), email: email.trim().toLowerCase(), password });
      Alert.alert(
        '🎉 Welcome to HD Resorts!',
        'Your account has been created successfully.',
        [{ text: 'Continue', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Something went wrong. Please try again.';
      Alert.alert('Registration Failed', msg);
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

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoMark}>
            <Text style={styles.logoEmoji}>🌴</Text>
          </View>
          <Text style={styles.appName}>HD Resorts</Text>
          <Text style={styles.tagline}>Sri Lanka's hidden gems, discovered.</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create Account</Text>
          <Text style={styles.cardSubtitle}>
            Join thousands of explorers discovering Sri Lanka's best.
          </Text>

          <Field label="Full Name" value={name} onChangeText={setName}
            placeholder="e.g. Sahan Perera" error={errors.name} onClearError={() => setErrors(prev => ({ ...prev, name: undefined }))} />
          <Field label="Email Address" value={email} onChangeText={setEmail}
            placeholder="you@example.com" keyboardType="email-address" error={errors.email} onClearError={() => setErrors(prev => ({ ...prev, email: undefined }))} />
          <Field label="Password" value={password} onChangeText={setPassword}
            placeholder="Min. 6 characters" secure error={errors.password} onClearError={() => setErrors(prev => ({ ...prev, password: undefined }))} />
          <Field label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword}
            placeholder="Re-enter your password" secure error={errors.confirmPassword} onClearError={() => setErrors(prev => ({ ...prev, confirmPassword: undefined }))} />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.footerLink}> Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#dad7cd' },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 },
  header: { alignItems: 'center', marginBottom: 32 },
  logoMark: {
    width: 72, height: 72, borderRadius: 24, backgroundColor: '#ffffff',
    borderWidth: 2, borderColor: '#3a5a40', justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
  },
  logoEmoji: { fontSize: 32 },
  appName: { fontSize: 26, fontWeight: '900', color: '#344e41', letterSpacing: -0.5 },
  tagline: { fontSize: 14, color: '#588157', marginTop: 4, fontWeight: '500' },
  card: {
    backgroundColor: '#ffffff', borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: '#a3b18a', gap: 4,
  },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#344e41', marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: '#588157', lineHeight: 20, marginBottom: 16 },
  fieldWrapper: { marginBottom: 16 },
  label: {
    fontSize: 13, fontWeight: '700', color: '#588157', marginBottom: 6,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#a3b18a',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: '#344e41',
  },
  inputError: { borderColor: '#F87171', borderWidth: 2 },
  errorText: { fontSize: 12, color: '#F87171', marginTop: 5, fontWeight: '600' },
  button: {
    backgroundColor: '#3a5a40', borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  footerText: { fontSize: 14, color: '#588157', fontWeight: '500' },
  footerLink: { fontSize: 14, color: '#3a5a40', fontWeight: '700' },
});
