import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, Platform, ScrollView,
    TouchableOpacity, TextInput, Alert, Image, ActivityIndicator, FlatList, Modal, Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { getGuides, createGuide, deleteGuide, updateGuide } from '../../src/services/guideService';
import { getUserData } from '../../src/services/authService';
import { API_URL } from '../../src/config/apiConfig';
import ReviewList from '../../src/components/ReviewList';

export default function GuidesScreen() {
    const router = useRouter();
    const [guides, setGuides] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [editingGuideId, setEditingGuideId] = useState<string | null>(null);

    // Detail Modal state
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // Form states
    const [name, setName] = useState('');
    const [languagesSpoken, setLanguagesSpoken] = useState('');
    const [vehicleType, setVehicleType] = useState('');
    const [dailyRate, setDailyRate] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [existingImage, setExistingImage] = useState<string | null>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getUserData();
            if (data) {
                setCurrentUser(data);
            }
            const guidesData = await getGuides();
            setGuides(guidesData);
        } catch (error: any) {
            Alert.alert('Error', 'Failed to load guides.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            setExistingImage(null);
        }
    };

    const handleSaveGuide = async () => {
        if (!name.trim() || !languagesSpoken.trim() || !vehicleType.trim() || !dailyRate.trim() || !phoneNumber.trim()) {
            Alert.alert('Error', 'Please fill out all required fields.');
            return;
        }

        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phoneNumber.trim())) {
            Alert.alert('Error', 'Phone number must be exactly 10 digits.');
            return;
        }

        if (Number(dailyRate) < 0) {
            Alert.alert('Error', 'Daily rate cannot be a negative value.');
            return;
        }

        if (!imageUri && !existingImage) {
            Alert.alert('Error', 'Please upload a profile headshot.');
            return;
        }

        setFormLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('languagesSpoken', languagesSpoken);
            formData.append('vehicleType', vehicleType);
            formData.append('dailyRate', dailyRate);
            formData.append('phoneNumber', phoneNumber);

            if (imageUri) {
                if (Platform.OS === 'web') {
                    const response = await fetch(imageUri);
                    const blob = await response.blob();
                    formData.append('profileHeadshot', blob, 'profileHeadshot.jpg');
                } else {
                    // @ts-ignore
                    formData.append('profileHeadshot', {
                        uri: imageUri,
                        name: 'profileHeadshot.jpg',
                        type: 'image/jpeg'
                    });
                }
            }

            if (editingGuideId) {
                await updateGuide(editingGuideId, formData);
                Alert.alert('Success', 'Guide profile updated successfully!');
            } else {
                await createGuide(formData);
                Alert.alert('Success', 'Guide profile created successfully!');
            }

            setModalVisible(false);
            resetForm();
            loadData();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to save guide profile.');
        } finally {
            setFormLoading(false);
        }
    };

    const openCreateModal = () => {
        resetForm();
        setModalVisible(true);
    };

    const openDetailModal = (item: any) => {
        setSelectedItem(item);
        setDetailModalVisible(true);
    };

    const openEditModal = (guide: any) => {
        setEditingGuideId(guide._id);
        setName(guide.name);
        setLanguagesSpoken(guide.languagesSpoken);
        setVehicleType(guide.vehicleType);
        setDailyRate(guide.dailyRate ? guide.dailyRate.toString() : '');
        setPhoneNumber(guide.phoneNumber);
        setImageUri(null);

        if (guide.profileHeadshot) {
            const baseUrl = API_URL.replace('/api', '');
            setExistingImage(guide.profileHeadshot.startsWith('http') ? guide.profileHeadshot : `${baseUrl}${guide.profileHeadshot}`);
        } else {
            setExistingImage(null);
        }

        setModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        const confirmed =
            Platform.OS === 'web'
                ? window.confirm('Are you sure you want to delete this profile?')
                : await new Promise<boolean>((resolve) =>
                    Alert.alert('Delete Guide Profile', 'Are you sure you want to delete this profile?', [
                        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
                        { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
                    ])
                );

        if (!confirmed) return;

        try {
            await deleteGuide(id);
            loadData();
        } catch (error: any) {
            Alert.alert('Error', 'Failed to delete profile.');
        }
    };

    const handleCall = (phone: string) => {
        Linking.openURL(`tel:${phone}`).catch((err) => {
            Alert.alert('Error', 'Unable to open dialer.');
        });
    };

    const resetForm = () => {
        setEditingGuideId(null);
        setName('');
        setLanguagesSpoken('');
        setVehicleType('');
        setDailyRate('');
        setPhoneNumber('');
        setImageUri(null);
        setExistingImage(null);
    };

    const userRole = currentUser?.role?.toUpperCase();
    const canManageGuides = currentUser && (userRole === 'ADMIN' || userRole === 'PROVIDER');

    const renderGuideItem = ({ item }: { item: any }) => {
        const baseUrl = API_URL.replace('/api', '');
        const imgSource = item.profileHeadshot ? { uri: item.profileHeadshot.startsWith('http') ? item.profileHeadshot : `${baseUrl}${item.profileHeadshot}` } : null;

        const currentUserId = currentUser?.id || currentUser?._id;
        const isOwner = currentUser && (currentUserId === item.host?._id || userRole === 'ADMIN');

        return (
            <TouchableOpacity style={styles.card} onPress={() => openDetailModal(item)}>
                <View style={styles.cardHeader}>
                    {imgSource ? (
                        <Image source={imgSource} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Ionicons name="person-outline" size={32} color="#aaa" />
                        </View>
                    )}
                    <View style={styles.cardHeaderInfo}>
                        <Text style={styles.cardTitle}>{item.name}</Text>
                        <Text style={styles.cardLanguages}>
                            <Ionicons name="language-outline" size={14} color="#666" /> {item.languagesSpoken}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardDetailsRow}>
                    <Text style={styles.cardDetailText}>Vehicle: {item.vehicleType}</Text>
                    <Text style={styles.cardPrice}>${item.dailyRate}/day</Text>
                </View>

                <View style={styles.actionButtonsRow}>
                    <TouchableOpacity style={styles.callButton} onPress={() => handleCall(item.phoneNumber)}>
                        <Ionicons name="call-outline" size={18} color="#fff" />
                        <Text style={styles.callButtonText}>Call</Text>
                    </TouchableOpacity>

                    {isOwner && (
                        <View style={styles.ownerActions}>
                            <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(item)}>
                                <Ionicons name="pencil-outline" size={18} color="#1e40af" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item._id)}>
                                <Ionicons name="trash-outline" size={18} color="#dc2626" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#344e41" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Local Guides</Text>

                {canManageGuides ? (
                    <TouchableOpacity onPress={openCreateModal} style={styles.addButton}>
                        <Ionicons name="add" size={26} color="#344e41" />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 24 }} />
                )}
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#344e41" />
                </View>
            ) : (
                <FlatList
                    data={guides}
                    keyExtractor={(item) => item._id}
                    renderItem={renderGuideItem}
                    contentContainerStyle={styles.listContent}
                    refreshing={refreshing}
                    onRefresh={() => { setRefreshing(true); loadData(); }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="sad-outline" size={48} color="#aaa" />
                            <Text style={styles.emptyText}>No guides available.</Text>
                        </View>
                    }
                />
            )}

            {/* Create / Edit Guide Modal */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingGuideId ? 'Edit Profile' : 'Register as Guide'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.imagePickerContainer}>
                                <TouchableOpacity style={styles.imagePickerAvatar} onPress={pickImage}>
                                    {imageUri ? (
                                        <Image source={{ uri: imageUri }} style={styles.previewAvatar} />
                                    ) : existingImage ? (
                                        <Image source={{ uri: existingImage }} style={styles.previewAvatar} />
                                    ) : (
                                        <Ionicons name="camera-outline" size={32} color="#888" />
                                    )}
                                </TouchableOpacity>
                                <Text style={styles.imagePickerHelpText}>Tap to add headshot</Text>
                            </View>

                            <Text style={styles.label}>Name</Text>
                            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Kamal Perera" />

                            <Text style={styles.label}>Languages Spoken</Text>
                            <TextInput style={styles.input} value={languagesSpoken} onChangeText={setLanguagesSpoken} placeholder="e.g. English, Sinhala" />

                            <Text style={styles.label}>Vehicle Type</Text>
                            <TextInput style={styles.input} value={vehicleType} onChangeText={setVehicleType} placeholder="e.g. Tuk-tuk, None, Van" />

                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={styles.label}>Daily Rate ($)</Text>
                                    <TextInput style={styles.input} value={dailyRate} onChangeText={setDailyRate} keyboardType="numeric" placeholder="e.g. 30" />
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={styles.label}>Phone Number</Text>
                                    <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" placeholder="e.g. +9477..." />
                                </View>
                            </View>

                            <TouchableOpacity style={styles.submitButton} onPress={handleSaveGuide} disabled={formLoading}>
                                {formLoading ? <ActivityIndicator color="#fff" /> : (
                                    <Text style={styles.submitButtonText}>
                                        {editingGuideId ? 'Save Changes' : 'Register'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Detail Modal */}
            <Modal visible={detailModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { height: '95%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Guide Details</Text>
                            <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {selectedItem && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                                    {selectedItem.profileHeadshot ? (
                                        <Image
                                            source={{ uri: selectedItem.profileHeadshot.startsWith('http') ? selectedItem.profileHeadshot : `${API_URL.replace('/api', '')}${selectedItem.profileHeadshot}` }}
                                            style={{ width: 120, height: 120, borderRadius: 60 }}
                                        />
                                    ) : (
                                        <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }}>
                                            <Ionicons name="person" size={60} color="#ccc" />
                                        </View>
                                    )}
                                    <Text style={[styles.cardTitle, { fontSize: 24, marginTop: 12 }]}>{selectedItem.name}</Text>
                                    <Text style={styles.cardLanguages}>{selectedItem.languagesSpoken}</Text>
                                </View>

                                <View style={[styles.cardDetailsRow, { marginBottom: 16, backgroundColor: '#f8fafc', padding: 16, borderRadius: 12 }]}>
                                    <View>
                                        <Text style={{ fontSize: 12, color: '#64748b' }}>Vehicle</Text>
                                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1e293b' }}>{selectedItem.vehicleType}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={{ fontSize: 12, color: '#64748b' }}>Daily Rate</Text>
                                        <Text style={[styles.cardPrice, { fontSize: 20 }]}>${selectedItem.dailyRate}</Text>
                                    </View>
                                </View>

                                <TouchableOpacity style={[styles.callButton, { marginBottom: 24, paddingVertical: 16 }]} onPress={() => handleCall(selectedItem.phoneNumber)}>
                                    <Ionicons name="call" size={20} color="#fff" />
                                    <Text style={[styles.callButtonText, { fontSize: 18 }]}>Call Guide</Text>
                                </TouchableOpacity>

                                <ReviewList
                                    targetId={selectedItem._id}
                                    targetType="Guide"
                                    isItemOwner={currentUser && (currentUser?.id || currentUser?._id) === selectedItem.host?._id}
                                />
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#dad7cd', paddingTop: Platform.OS === 'android' ? 25 : 0 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#dad7cd' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#dad7cd' },
    backButton: { padding: 8, marginLeft: -8 },
    addButton: { padding: 8, marginRight: -8 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#344e41' },

    listContent: { padding: 16, gap: 16, paddingBottom: 30 },
    emptyContainer: { alignItems: 'center', marginTop: 50 },
    emptyText: { marginTop: 10, fontSize: 16, color: '#666' },

    // Card Styles
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 16 },
    avatarPlaceholder: { width: 60, height: 60, borderRadius: 30, marginRight: 16, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
    cardHeaderInfo: { flex: 1 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    cardLanguages: { fontSize: 14, color: '#666', marginTop: 4 },

    cardDetailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    cardDetailText: { fontSize: 13, backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, color: '#475569', fontWeight: '600' },
    cardPrice: { fontSize: 16, fontWeight: 'bold', color: '#1e40af' },

    // Action Buttons
    actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    callButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, backgroundColor: '#344e41', borderRadius: 8, marginRight: 10 },
    callButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 8, fontSize: 15 },

    ownerActions: { flexDirection: 'row', gap: 10 },
    editButton: { padding: 10, backgroundColor: '#dbeafe', borderRadius: 8 },
    deleteButton: { padding: 10, backgroundColor: '#fee2e2', borderRadius: 8 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },

    imagePickerContainer: { alignItems: 'center', marginBottom: 16 },
    imagePickerAvatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    previewAvatar: { width: '100%', height: '100%' },
    imagePickerHelpText: { fontSize: 12, color: '#888', marginTop: 8 },

    label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 8 },
    input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 15 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    submitButton: { backgroundColor: '#344e41', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 30, marginBottom: 20 },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
