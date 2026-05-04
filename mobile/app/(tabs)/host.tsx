import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, SafeAreaView, Platform, ScrollView, 
    TouchableOpacity, TextInput, Alert, Image, ActivityIndicator, FlatList, Modal, Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { getHomestays, createHomestay, deleteHomestay, updateHomestay } from '../../src/services/homestayService';
import { getUserData } from '../../src/services/authService';
import { API_URL } from '../../src/config/apiConfig';
import ReviewList from '../../src/components/ReviewList';

export default function HomestaysScreen() {
    const router = useRouter();
    const [homestays, setHomestays] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [editingHomestayId, setEditingHomestayId] = useState<string | null>(null);

    // Detail Modal state
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // Form states
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [pricePerNight, setPricePerNight] = useState('');
    const [amenities, setAmenities] = useState('');
    const [hostContact, setHostContact] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [existingImage, setExistingImage] = useState<string | null>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getUserData();
            if (data) {
                setCurrentUser(data);
            }
            const homestaysData = await getHomestays();
            setHomestays(homestaysData);
        } catch (error: any) {
            Alert.alert('Error', 'Failed to load homestays.');
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
            aspect: [16, 9],
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            setExistingImage(null);
        }
    };

    const handleSaveHomestay = async () => {
        if (!title.trim() || !description.trim() || !location.trim() || !pricePerNight.trim() || !amenities.trim() || !hostContact.trim()) {
            Alert.alert('Error', 'Please fill out all required fields.');
            return;
        }

        if (Number(pricePerNight) < 0) {
            Alert.alert('Error', 'Price cannot be a negative value.');
            return;
        }

        if (!imageUri && !existingImage) {
            Alert.alert('Error', 'Please upload a property cover photo.');
            return;
        }

        setFormLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('location', location);
            formData.append('pricePerNight', pricePerNight);
            formData.append('amenities', amenities);
            formData.append('hostContact', hostContact);

            if (imageUri) {
                if (Platform.OS === 'web') {
                    const response = await fetch(imageUri);
                    const blob = await response.blob();
                    formData.append('propertyCoverPhoto', blob, 'propertyCoverPhoto.jpg');
                } else {
                    // @ts-ignore
                    formData.append('propertyCoverPhoto', {
                        uri: imageUri,
                        name: 'propertyCoverPhoto.jpg',
                        type: 'image/jpeg'
                    });
                }
            }

            if (editingHomestayId) {
                await updateHomestay(editingHomestayId, formData);
                Alert.alert('Success', 'Property updated successfully!');
            } else {
                await createHomestay(formData);
                Alert.alert('Success', 'Property created successfully!');
            }
            
            setModalVisible(false);
            resetForm();
            loadData();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to save property.');
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

    const openEditModal = (homestay: any) => {
        setEditingHomestayId(homestay._id);
        setTitle(homestay.title);
        setDescription(homestay.description);
        setLocation(homestay.location);
        setPricePerNight(homestay.pricePerNight ? homestay.pricePerNight.toString() : '');
        setAmenities(homestay.amenities);
        setHostContact(homestay.hostContact);
        setImageUri(null);
        
        if (homestay.propertyCoverPhoto) {
            const baseUrl = API_URL.replace('/api', '');
            setExistingImage(homestay.propertyCoverPhoto.startsWith('http') ? homestay.propertyCoverPhoto : `${baseUrl}${homestay.propertyCoverPhoto}`);
        } else {
            setExistingImage(null);
        }
        
        setModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        const confirmed =
            Platform.OS === 'web'
                ? window.confirm('Are you sure you want to delete this property?')
                : await new Promise<boolean>((resolve) =>
                    Alert.alert('Delete Property', 'Are you sure you want to delete this property?', [
                        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
                        { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
                    ])
                );

        if (!confirmed) return;

        try {
            await deleteHomestay(id);
            loadData();
        } catch (error: any) {
            Alert.alert('Error', 'Failed to delete property.');
        }
    };

    const handleContact = (contactInfo: string) => {
        // Simple logic: if it contains an @ it's likely an email, otherwise assume phone number
        if (contactInfo.includes('@')) {
            Linking.openURL(`mailto:${contactInfo}`);
        } else {
            Linking.openURL(`tel:${contactInfo}`);
        }
    };

    const resetForm = () => {
        setEditingHomestayId(null);
        setTitle('');
        setDescription('');
        setLocation('');
        setPricePerNight('');
        setAmenities('');
        setHostContact('');
        setImageUri(null);
        setExistingImage(null);
    };

    const userRole = currentUser?.role?.toUpperCase();
    const canManageHomestays = currentUser && (userRole === 'ADMIN' || userRole === 'PROVIDER');

    const renderHomestayItem = ({ item }: { item: any }) => {
        const baseUrl = API_URL.replace('/api', '');
        const imgSource = item.propertyCoverPhoto ? { uri: item.propertyCoverPhoto.startsWith('http') ? item.propertyCoverPhoto : `${baseUrl}${item.propertyCoverPhoto}` } : null;

        const currentUserId = currentUser?.id || currentUser?._id;
        const isOwner = currentUser && (currentUserId === item.host?._id || userRole === 'ADMIN');

        return (
            <TouchableOpacity style={styles.card} onPress={() => openDetailModal(item)}>
                {imgSource ? (
                    <Image source={imgSource} style={styles.cardImage} />
                ) : (
                    <View style={styles.cardPlaceholderImage}>
                        <Ionicons name="home-outline" size={48} color="#aaa" />
                    </View>
                )}
                <View style={styles.cardContent}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.cardPrice}>${item.pricePerNight}<Text style={styles.cardPriceSub}>/nt</Text></Text>
                    </View>
                    
                    <Text style={styles.cardLocation}>
                        <Ionicons name="location-outline" size={14} color="#666" /> {item.location}
                    </Text>

                    <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>

                    <View style={styles.amenitiesContainer}>
                        <Ionicons name="sparkles-outline" size={14} color="#475569" />
                        <Text style={styles.amenitiesText}>{item.amenities}</Text>
                    </View>

                    <View style={styles.actionButtonsRow}>
                        <TouchableOpacity style={styles.contactButton} onPress={() => handleContact(item.hostContact)}>
                            <Text style={styles.contactButtonText}>Contact Host</Text>
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
                <Text style={styles.headerTitle}>Homestays</Text>
                
                {canManageHomestays ? (
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
                    data={homestays}
                    keyExtractor={(item) => item._id}
                    renderItem={renderHomestayItem}
                    contentContainerStyle={styles.listContent}
                    refreshing={refreshing}
                    onRefresh={() => { setRefreshing(true); loadData(); }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="sad-outline" size={48} color="#aaa" />
                            <Text style={styles.emptyText}>No properties available right now.</Text>
                        </View>
                    }
                />
            )}

            {/* Create / Edit Homestay Modal */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingHomestayId ? 'Edit Listing' : 'Become a Host'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.label}>Property Title</Text>
                            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Sunny Villa by the Beach" />

                            <Text style={styles.label}>Location</Text>
                            <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="e.g. Unawatuna" />

                            <Text style={styles.label}>Description</Text>
                            <TextInput 
                                style={[styles.input, styles.textArea]} 
                                value={description} 
                                onChangeText={setDescription} 
                                placeholder="Describe your property..."
                                multiline
                                numberOfLines={4}
                            />

                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={styles.label}>Price / Night ($)</Text>
                                    <TextInput style={styles.input} value={pricePerNight} onChangeText={setPricePerNight} keyboardType="numeric" placeholder="e.g. 50" />
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={styles.label}>Contact Info</Text>
                                    <TextInput style={styles.input} value={hostContact} onChangeText={setHostContact} placeholder="Phone or Email" />
                                </View>
                            </View>

                            <Text style={styles.label}>Amenities</Text>
                            <TextInput style={styles.input} value={amenities} onChangeText={setAmenities} placeholder="e.g. WiFi, AC, Pool" />

                            <Text style={styles.label}>Property Cover Photo</Text>
                            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                                {imageUri ? (
                                    <Image source={{ uri: imageUri }} style={styles.previewImage} />
                                ) : existingImage ? (
                                    <Image source={{ uri: existingImage }} style={styles.previewImage} />
                                ) : (
                                    <Text style={styles.imagePickerText}>Tap to select an image</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.submitButton} onPress={handleSaveHomestay} disabled={formLoading}>
                                {formLoading ? <ActivityIndicator color="#fff" /> : (
                                    <Text style={styles.submitButtonText}>
                                        {editingHomestayId ? 'Save Changes' : 'List Property'}
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
                            <Text style={styles.modalTitle}>Homestay Details</Text>
                            <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {selectedItem && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {selectedItem.propertyCoverPhoto && (
                                    <Image 
                                        source={{ uri: selectedItem.propertyCoverPhoto.startsWith('http') ? selectedItem.propertyCoverPhoto : `${API_URL.replace('/api', '')}${selectedItem.propertyCoverPhoto}` }} 
                                        style={[styles.cardImage, { borderRadius: 12, marginBottom: 16 }]} 
                                    />
                                )}
                                <View style={styles.cardHeaderRow}>
                                    <Text style={[styles.cardTitle, { fontSize: 24 }]}>{selectedItem.title}</Text>
                                    <Text style={styles.cardPrice}>${selectedItem.pricePerNight}<Text style={styles.cardPriceSub}>/nt</Text></Text>
                                </View>
                                
                                <Text style={[styles.cardLocation, { fontSize: 16 }]}>
                                    <Ionicons name="location-outline" size={16} color="#666" /> {selectedItem.location}
                                </Text>

                                <Text style={{ fontSize: 16, color: '#444', marginBottom: 20, lineHeight: 24 }}>{selectedItem.description}</Text>

                                <View style={styles.amenitiesContainer}>
                                    <Ionicons name="sparkles-outline" size={16} color="#475569" />
                                    <Text style={[styles.amenitiesText, { fontSize: 14 }]}>{selectedItem.amenities}</Text>
                                </View>

                                <TouchableOpacity style={[styles.contactButton, { marginBottom: 24, paddingVertical: 16 }]} onPress={() => handleContact(selectedItem.hostContact)}>
                                    <Text style={[styles.contactButtonText, { fontSize: 18 }]}>Contact Host</Text>
                                </TouchableOpacity>

                                <ReviewList 
                                    targetId={selectedItem._id} 
                                    targetType="Homestay" 
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
    card: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
    cardImage: { width: '100%', height: 200 },
    cardPlaceholderImage: { width: '100%', height: 200, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
    cardContent: { padding: 16 },
    cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', flex: 1, marginRight: 10 },
    cardPrice: { fontSize: 18, fontWeight: '800', color: '#1e40af' },
    cardPriceSub: { fontSize: 12, fontWeight: '500', color: '#64748b' },
    
    cardLocation: { fontSize: 14, color: '#64748b', marginBottom: 12 },
    cardDescription: { fontSize: 14, color: '#475569', lineHeight: 20, marginBottom: 12 },
    
    amenitiesContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', padding: 8, borderRadius: 8, marginBottom: 16 },
    amenitiesText: { fontSize: 12, color: '#475569', marginLeft: 6, fontWeight: '600' },

    // Action Buttons
    actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    contactButton: { flex: 1, paddingVertical: 12, backgroundColor: '#344e41', borderRadius: 8, alignItems: 'center', marginRight: 10 },
    contactButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    
    ownerActions: { flexDirection: 'row', gap: 10 },
    editButton: { padding: 10, backgroundColor: '#dbeafe', borderRadius: 8 },
    deleteButton: { padding: 10, backgroundColor: '#fee2e2', borderRadius: 8 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    
    label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 12 },
    input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 15 },
    textArea: { height: 100, textAlignVertical: 'top' },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    imagePicker: { height: 160, backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderStyle: 'dashed', borderRadius: 10, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginTop: 5 },
    imagePickerText: { color: '#888', fontSize: 14 },
    previewImage: { width: '100%', height: '100%' },
    
    submitButton: { backgroundColor: '#344e41', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24, marginBottom: 20 },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
