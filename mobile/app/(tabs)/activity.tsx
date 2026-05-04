import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, SafeAreaView, Platform, ScrollView, 
    TouchableOpacity, TextInput, Alert, Image, ActivityIndicator, FlatList, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { getActivities, createActivity, deleteActivity, updateActivity } from '../../src/services/activityService';
import { getUserData } from '../../src/services/authService';
import { API_URL } from '../../src/config/apiConfig';
import ReviewList from '../../src/components/ReviewList';

export default function ActivitiesScreen() {
    const router = useRouter();
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [editingActivityId, setEditingActivityId] = useState<string | null>(null);

    // Detail Modal state
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // Form states
    const [title, setTitle] = useState('');
    const [providerName, setProviderName] = useState('');
    const [duration, setDuration] = useState('');
    const [pricePerPerson, setPricePerPerson] = useState('');
    const [category, setCategory] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [existingImage, setExistingImage] = useState<string | null>(null);

    const loadData = async () => {
        try {
            const data = await getUserData();
            if (data) {
                setCurrentUser(data);
            }
            const activitiesData = await getActivities();
            setActivities(activitiesData);
        } catch (error: any) {
            Alert.alert('Error', 'Failed to load activities.');
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
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            setExistingImage(null); // Clear the existing image preview if a new one is picked
        }
    };

    const handleSaveActivity = async () => {
        if (!title.trim() || !providerName.trim() || !duration.trim() || !pricePerPerson.trim() || !category.trim()) {
            Alert.alert('Error', 'Please fill out all required fields.');
            return;
        }

        if (Number(duration) < 0 || Number(pricePerPerson) < 0) {
            Alert.alert('Error', 'Duration and price cannot be negative values.');
            return;
        }

        if (!imageUri && !existingImage) {
            Alert.alert('Error', 'Please upload an action shot.');
            return;
        }

        setFormLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('providerName', providerName);
            formData.append('duration', duration);
            formData.append('pricePerPerson', pricePerPerson);
            formData.append('category', category);

            if (imageUri) {
                if (Platform.OS === 'web') {
                    const response = await fetch(imageUri);
                    const blob = await response.blob();
                    formData.append('actionShot', blob, 'actionShot.jpg');
                } else {
                    // @ts-ignore
                    formData.append('actionShot', {
                        uri: imageUri,
                        name: 'actionShot.jpg',
                        type: 'image/jpeg'
                    });
                }
            }

            if (editingActivityId) {
                await updateActivity(editingActivityId, formData);
                Alert.alert('Success', 'Activity updated successfully!');
            } else {
                await createActivity(formData);
                Alert.alert('Success', 'Activity created successfully!');
            }

            setModalVisible(false);
            resetForm();
            loadData();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to save activity.');
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

    const openEditModal = (activity: any) => {
        setEditingActivityId(activity._id);
        setTitle(activity.title);
        setProviderName(activity.providerName);
        setDuration(activity.duration.toString());
        setPricePerPerson(activity.pricePerPerson.toString());
        setCategory(activity.category);
        setImageUri(null);

        if (activity.actionShot) {
            const baseUrl = API_URL.replace('/api', '');
            setExistingImage(activity.actionShot.startsWith('http') ? activity.actionShot : `${baseUrl}${activity.actionShot}`);
        } else {
            setExistingImage(null);
        }

        setModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        const confirmed =
            Platform.OS === 'web'
                ? window.confirm('Are you sure you want to delete this activity?')
                : await new Promise<boolean>((resolve) =>
                    Alert.alert('Delete Activity', 'Are you sure you want to delete this activity?', [
                        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
                        { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
                    ])
                );

        if (!confirmed) return;

        try {
            await deleteActivity(id);
            loadData();
        } catch (error: any) {
            Alert.alert('Error', 'Failed to delete activity.');
        }
    };

    const resetForm = () => {
        setEditingActivityId(null);
        setTitle('');
        setProviderName('');
        setDuration('');
        setPricePerPerson('');
        setCategory('');
        setImageUri(null);
        setExistingImage(null);
    };

    // Determine if user has rights to add an activity
    const userRole = currentUser?.role?.toUpperCase();
    const canManageActivities = currentUser && (userRole === 'ADMIN' || userRole === 'PROVIDER');

    const renderActivityItem = ({ item }: { item: any }) => {
        const baseUrl = API_URL.replace('/api', '');
        const imgSource = item.actionShot ? { uri: item.actionShot.startsWith('http') ? item.actionShot : `${baseUrl}${item.actionShot}` } : null;

        // Determine if user owns this specific activity (or is an Admin)
        const currentUserId = currentUser?.id || currentUser?._id;
        const isOwner = currentUser && (currentUserId === item.host?._id || userRole === 'ADMIN');

        return (
            <TouchableOpacity style={styles.card} onPress={() => openDetailModal(item)}>
                {imgSource ? (
                    <Image source={imgSource} style={styles.cardImage} />
                ) : (
                    <View style={styles.cardPlaceholderImage}>
                        <Ionicons name="image-outline" size={32} color="#aaa" />
                    </View>
                )}
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardProvider}>By {item.providerName}</Text>

                    <View style={styles.cardDetailsRow}>
                        <Text style={styles.cardDetailText}>{item.category}</Text>
                        <Text style={styles.cardDetailText}>{item.duration} hrs</Text>
                        <Text style={styles.cardPrice}>${item.pricePerPerson}</Text>
                    </View>

                    {isOwner && (
                        <View style={styles.actionButtonsRow}>
                            <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(item)}>
                                <Ionicons name="pencil-outline" size={18} color="#1e40af" />
                                <Text style={styles.editButtonText}>Edit</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item._id)}>
                                <Ionicons name="trash-outline" size={18} color="#dc2626" />
                                <Text style={styles.deleteButtonText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#344e41" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#344e41" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Activities</Text>

                {canManageActivities ? (
                    <TouchableOpacity onPress={openCreateModal} style={styles.addButton}>
                        <Ionicons name="add" size={26} color="#344e41" />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 24 }} />
                )}
            </View>

            <FlatList
                data={activities}
                keyExtractor={(item) => item._id}
                renderItem={renderActivityItem}
                contentContainerStyle={styles.listContent}
                refreshing={refreshing}
                onRefresh={() => { setRefreshing(true); loadData(); }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="sad-outline" size={48} color="#aaa" />
                        <Text style={styles.emptyText}>No activities available right now.</Text>
                    </View>
                }
            />

            {/* Create / Edit Activity Modal */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingActivityId ? 'Edit Activity' : 'Add New Activity'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.label}>Title</Text>
                            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Scuba Diving" />

                            <Text style={styles.label}>Provider Name</Text>
                            <TextInput style={styles.input} value={providerName} onChangeText={setProviderName} placeholder="Your Company Name" />

                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={styles.label}>Duration (hrs)</Text>
                                    <TextInput style={styles.input} value={duration} onChangeText={setDuration} keyboardType="numeric" placeholder="e.g. 2" />
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={styles.label}>Price ($)</Text>
                                    <TextInput style={styles.input} value={pricePerPerson} onChangeText={setPricePerPerson} keyboardType="numeric" placeholder="e.g. 100" />
                                </View>
                            </View>

                            <Text style={styles.label}>Category</Text>
                            <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="e.g. Water Sports" />

                            <Text style={styles.label}>Action Shot</Text>
                            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                                {imageUri ? (
                                    <Image source={{ uri: imageUri }} style={styles.previewImage} />
                                ) : existingImage ? (
                                    <Image source={{ uri: existingImage }} style={styles.previewImage} />
                                ) : (
                                    <Text style={styles.imagePickerText}>Tap to select an image</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.submitButton} onPress={handleSaveActivity} disabled={formLoading}>
                                {formLoading ? <ActivityIndicator color="#fff" /> : (
                                    <Text style={styles.submitButtonText}>
                                        {editingActivityId ? 'Save Changes' : 'Create Activity'}
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
                            <Text style={styles.modalTitle}>Activity Details</Text>
                            <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {selectedItem && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {selectedItem.actionShot && (
                                    <Image
                                        source={{ uri: selectedItem.actionShot.startsWith('http') ? selectedItem.actionShot : `${API_URL.replace('/api', '')}${selectedItem.actionShot}` }}
                                        style={[styles.cardImage, { borderRadius: 12, marginBottom: 16 }]}
                                    />
                                )}
                                <Text style={[styles.cardTitle, { fontSize: 22 }]}>{selectedItem.title}</Text>
                                <Text style={styles.cardProvider}>By {selectedItem.providerName}</Text>

                                <View style={[styles.cardDetailsRow, { marginBottom: 16 }]}>
                                    <Text style={styles.cardDetailText}>{selectedItem.category}</Text>
                                    <Text style={styles.cardDetailText}>{selectedItem.duration} hrs</Text>
                                    <Text style={styles.cardPrice}>${selectedItem.pricePerPerson}</Text>
                                </View>

                                <ReviewList
                                    targetId={selectedItem._id}
                                    targetType="Activity"
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
    listContent: { padding: 16, gap: 16 },
    emptyContainer: { alignItems: 'center', marginTop: 50 },
    emptyText: { marginTop: 10, fontSize: 16, color: '#666' },

    // Card Styles
    card: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
    cardImage: { width: '100%', height: 180 },
    cardPlaceholderImage: { width: '100%', height: 180, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
    cardContent: { padding: 16 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    cardProvider: { fontSize: 14, color: '#666', marginTop: 4, marginBottom: 12 },
    cardDetailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardDetailText: { fontSize: 13, backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, color: '#475569', fontWeight: '600' },
    cardPrice: { fontSize: 16, fontWeight: 'bold', color: '#1e40af' },

    // Action Buttons
    actionButtonsRow: { flexDirection: 'row', marginTop: 16, gap: 10 },
    editButton: { flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: '#dbeafe', borderRadius: 8 },
    editButtonText: { color: '#1e40af', fontWeight: 'bold', marginLeft: 4, fontSize: 13 },
    deleteButton: { flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: '#fee2e2', borderRadius: 8 },
    deleteButtonText: { color: '#dc2626', fontWeight: 'bold', marginLeft: 4, fontSize: 13 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 12 },
    input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 15 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    imagePicker: { height: 120, backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderStyle: 'dashed', borderRadius: 10, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginTop: 5 },
    imagePickerText: { color: '#888', fontSize: 14 },
    previewImage: { width: '100%', height: '100%' },
    submitButton: { backgroundColor: '#344e41', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24, marginBottom: 20 },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
