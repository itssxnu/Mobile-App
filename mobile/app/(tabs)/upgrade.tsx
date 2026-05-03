import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { upgradeAccount } from '../../src/services/userService';

const PROVIDER_TYPES = [
    {
        id: 'HOST',
        title: 'Homestay Host',
        description: 'List your beautiful properties, villas, or cozy rooms for travelers.',
        icon: 'home',
        color: '#d4a373'
    },
    {
        id: 'GUIDE',
        title: 'Local Guide',
        description: 'Share your local knowledge and take travelers on unforgettable tours.',
        icon: 'map',
        color: '#588157'
    },
    {
        id: 'ACTIVITY',
        title: 'Activity Provider',
        description: 'Offer thrilling experiences like surfing, hiking, or cooking classes.',
        icon: 'bicycle',
        color: '#3a5a40'
    },
    {
        id: 'EVENT',
        title: 'Event Organizer',
        description: 'Host cultural events, parties, or workshops for the community.',
        icon: 'calendar',
        color: '#bc4749'
    }
];

export default function UpgradeScreen() {
    const router = useRouter();
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const executeUpgrade = async () => {
        setLoading(true);
        try {
            await upgradeAccount(selectedType);
            // Navigate immediately — Alert callbacks don't fire on web
            if (Platform.OS === 'web') {
                window.alert("Success! Your account has been upgraded.");
            } else {
                Alert.alert("Success!", "Your account has been upgraded.");
            }
            router.replace('/(tabs)');
        } catch (error: any) {
            if (Platform.OS === 'web') {
                window.alert(error.response?.data?.message || "Something went wrong.");
            } else {
                Alert.alert("Upgrade Failed", error.response?.data?.message || "Something went wrong.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = async () => {
        if (!selectedType) return;

        if (Platform.OS === 'web') {
            const confirmed = window.confirm("Are you sure you want to upgrade your account? This will unlock new tools and dashboards.");
            if (confirmed) {
                executeUpgrade();
            }
        } else {
            Alert.alert(
                "Confirm Upgrade",
                "Are you sure you want to upgrade your account? This will unlock new tools and dashboards.",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Upgrade",
                        style: "default",
                        onPress: executeUpgrade
                    }
                ]
            );
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#344e41" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Become a Provider</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Unlock Your Potential</Text>
                    <Text style={styles.subtitle}>
                        Choose how you want to contribute to the HD Resorts community and start earning.
                    </Text>
                </View>

                <View style={styles.cardsContainer}>
                    {PROVIDER_TYPES.map((type) => {
                        const isSelected = selectedType === type.id;
                        return (
                            <TouchableOpacity
                                key={type.id}
                                style={[
                                    styles.card,
                                    isSelected && styles.cardSelected,
                                    isSelected && { borderColor: type.color }
                                ]}
                                onPress={() => setSelectedType(type.id)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: `${type.color}15` }]}>
                                    <Ionicons name={type.icon as any} size={28} color={type.color} />
                                </View>
                                <View style={styles.cardContent}>
                                    <Text style={styles.cardTitle}>{type.title}</Text>
                                    <Text style={styles.cardDesc}>{type.description}</Text>
                                </View>
                                <View style={[styles.radioCircle, isSelected && { borderColor: type.color }]}>
                                    {isSelected && <View style={[styles.radioInner, { backgroundColor: type.color }]} />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.button, !selectedType && styles.buttonDisabled]} 
                    onPress={handleUpgrade}
                    disabled={!selectedType || loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.buttonText}>Confirm Upgrade</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#dad7cd',
        paddingTop: Platform.OS === 'android' ? 25 : 0
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#dad7cd',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#344e41',
    },
    scroll: {
        padding: 24,
        paddingBottom: 40,
    },
    titleContainer: {
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#344e41',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#588157',
        lineHeight: 24,
        fontWeight: '500',
    },
    cardsContainer: {
        gap: 16,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
        shadowColor: '#344e41',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardSelected: {
        backgroundColor: '#f8fdf8',
        shadowOpacity: 0.1,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardContent: {
        flex: 1,
        marginRight: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#344e41',
        marginBottom: 4,
    },
    cardDesc: {
        fontSize: 13,
        color: '#588157',
        lineHeight: 18,
    },
    radioCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#a3b18a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    footer: {
        padding: 24,
        backgroundColor: '#dad7cd',
        borderTopWidth: 1,
        borderTopColor: 'rgba(163, 177, 138, 0.3)',
    },
    button: {
        backgroundColor: '#3a5a40',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#3a5a40',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        backgroundColor: '#a3b18a',
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    }
});
