import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ActivityDashboard() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/(tabs)/')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#344e41" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Activity Dashboard</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.placeholderCard}>
                    <Text style={styles.emoji}>🏄‍♂️</Text>
                    <Text style={styles.title}>Welcome to Activities</Text>
                    <Text style={styles.sub}>
                        This is the dedicated file for the Activity Provider dashboard. Your team member can build equipment inventory and booking features here!
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#dad7cd', paddingTop: Platform.OS === 'android' ? 25 : 0 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#dad7cd' },
    backButton: { padding: 8, marginLeft: -8 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#344e41' },
    content: { padding: 24 },
    placeholderCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 24, alignItems: 'center', shadowColor: '#344e41', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
    emoji: { fontSize: 48, marginBottom: 16 },
    title: { fontSize: 20, fontWeight: '800', color: '#344e41', marginBottom: 8, textAlign: 'center' },
    sub: { fontSize: 14, color: '#588157', textAlign: 'center', lineHeight: 22 },
});
