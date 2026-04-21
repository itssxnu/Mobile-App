import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { updateProfile } from '../../src/services/userService';

export default function CompleteProfileScreen() {
    const router = useRouter();
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const handleComplete = async () => {
        if (!phone.trim()) {
            Alert.alert('Required', 'Please enter your phone number.');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('phone', phone.trim());

            await updateProfile(formData);
            
            // We use replace so they can't go back to this screen
            router.replace('/(tabs)/');
        } catch (error: any) {
            Alert.alert('Update Failed', error.response?.data?.message || 'Could not save phone number.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                
                <View style={styles.header}>
                    <Text style={styles.title}>Almost there!</Text>
                    <Text style={styles.subtitle}>We just need your phone number to complete your HD Resorts profile.</Text>
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="07XXXXXXXX"
                        placeholderTextColor="#a3b18a"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                    />

                    <TouchableOpacity style={styles.button} onPress={handleComplete} disabled={loading}>
                        {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Complete Profile</Text>}
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#dad7cd' },
    scroll: { flexGrow: 1, padding: 24, paddingTop: Platform.OS === 'ios' ? 100 : 80, justifyContent: 'center' },
    header: { marginBottom: 40 },
    title: { fontSize: 32, fontWeight: '900', color: '#344e41', marginBottom: 12, letterSpacing: -0.5 },
    subtitle: { fontSize: 16, color: '#588157', lineHeight: 24, fontWeight: '500' },
    formContainer: { backgroundColor: '#ffffff', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#a3b18a', shadowColor: '#344e41', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4 },
    label: { fontSize: 13, fontWeight: '700', color: '#588157', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    input: { backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#a3b18a', padding: 16, borderRadius: 12, fontSize: 18, color: '#344e41', fontWeight: '600', marginBottom: 24 },
    button: { backgroundColor: '#3a5a40', padding: 18, borderRadius: 14, alignItems: 'center', shadowColor: '#3a5a40', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});
