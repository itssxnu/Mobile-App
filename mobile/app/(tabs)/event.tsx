import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, SafeAreaView, Platform, ScrollView, 
    TouchableOpacity, TextInput, Alert, Image, ActivityIndicator, FlatList, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { getEvents, createEvent, deleteEvent, updateEvent } from '../../src/services/eventService';
import { getUserData } from '../../src/services/authService';
import { API_URL } from '../../src/config/apiConfig';
import ReviewList from '../../src/components/ReviewList';

export default function EventsScreen() {
    const router = useRouter();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [editingEventId, setEditingEventId] = useState<string | null>(null);

    // Detail Modal state
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // Form states
    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [existingImage, setExistingImage] = useState<string | null>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getUserData();
            if (data) {
                setCurrentUser(data);
            }
            const eventsData = await getEvents();
            setEvents(eventsData);
        } catch (error: any) {
            Alert.alert('Error', 'Failed to load events.');
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
            aspect: [4, 5],
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            setExistingImage(null);
        }
    };

    const handleSaveEvent = async () => {
        if (!eventName || !eventDate || !location || !description) {
            Alert.alert('Error', 'Please fill out all required fields.');
            return;
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(eventDate)) {
            Alert.alert('Error', 'Please enter date in YYYY-MM-DD format.');
            return;
        }

        const todayString = new Date().toISOString().split('T')[0];
        if (eventDate < todayString) {
            Alert.alert('Error', 'Event date cannot be in the past.');
            return;
        }

        if (!imageUri && !existingImage) {
            Alert.alert('Error', 'Please upload an event poster.');
            return;
        }

        setFormLoading(true);
        try {
            const formData = new FormData();
            formData.append('eventName', eventName);
            formData.append('eventDate', new Date(eventDate).toISOString());
            formData.append('location', location);
            formData.append('description', description);

            if (imageUri) {
                if (Platform.OS === 'web') {
                    const response = await fetch(imageUri);
                    const blob = await response.blob();
                    formData.append('eventPoster', blob, 'eventPoster.jpg');
                } else {
                    // @ts-ignore
                    formData.append('eventPoster', {
                        uri: imageUri,
                        name: 'eventPoster.jpg',
                        type: 'image/jpeg'
                    });
                }
            }

            if (editingEventId) {
                await updateEvent(editingEventId, formData);
                Alert.alert('Success', 'Event updated successfully!');
            } else {
                await createEvent(formData);
                Alert.alert('Success', 'Event created successfully!');
            }
            
            setModalVisible(false);
            resetForm();
            loadData();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to save event. Ensure date format is YYYY-MM-DD.');
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

    const openEditModal = (event: any) => {
        setEditingEventId(event._id);
        setEventName(event.eventName);
        
        // Format the ISO string back to YYYY-MM-DD for the input
        if (event.eventDate) {
            const dateObj = new Date(event.eventDate);
            setEventDate(dateObj.toISOString().split('T')[0]);
        } else {
            setEventDate('');
        }
        
        setLocation(event.location);
        setDescription(event.description);
        setImageUri(null);
        
        if (event.eventPoster) {
            const baseUrl = API_URL.replace('/api', '');
            setExistingImage(event.eventPoster.startsWith('http') ? event.eventPoster : `${baseUrl}${event.eventPoster}`);
        } else {
            setExistingImage(null);
        }
        
        setModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        const confirmed =
            Platform.OS === 'web'
                ? window.confirm('Are you sure you want to delete this event?')
                : await new Promise<boolean>((resolve) =>
                    Alert.alert('Cancel Event', 'Are you sure you want to delete this event?', [
                        { text: 'No', style: 'cancel', onPress: () => resolve(false) },
                        { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
                    ])
                );

        if (!confirmed) return;

        try {
            await deleteEvent(id);
            loadData();
        } catch (error: any) {
            Alert.alert('Error', 'Failed to delete event.');
        }
    };

    const resetForm = () => {
        setEditingEventId(null);
        setEventName('');
        setEventDate('');
        setLocation('');
        setDescription('');
        setImageUri(null);
        setExistingImage(null);
    };

    const userRole = currentUser?.role?.toUpperCase();
    const canManageEvents = currentUser && (userRole === 'ADMIN' || userRole === 'PROVIDER');

    const formatDate = (isoString: string) => {
        const options: Intl.DateTimeFormatOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(isoString).toLocaleDateString(undefined, options);
    };

    const renderEventItem = ({ item }: { item: any }) => {
        const baseUrl = API_URL.replace('/api', '');
        const imgSource = item.eventPoster ? { uri: item.eventPoster.startsWith('http') ? item.eventPoster : `${baseUrl}${item.eventPoster}` } : null;

        const currentUserId = currentUser?.id || currentUser?._id;
        const isOwner = currentUser && (currentUserId === item.host?._id || userRole === 'ADMIN');

        return (
            <TouchableOpacity style={styles.card} onPress={() => openDetailModal(item)}>
                {imgSource ? (
                    <Image source={imgSource} style={styles.cardImage} />
                ) : (
                    <View style={styles.cardPlaceholderImage}>
                        <Ionicons name="calendar-outline" size={48} color="#aaa" />
                    </View>
                )}
                
                <View style={styles.dateBadge}>
                    <Text style={styles.dateBadgeDay}>{new Date(item.eventDate).getDate()}</Text>
                    <Text style={styles.dateBadgeMonth}>{new Date(item.eventDate).toLocaleString('default', { month: 'short' }).toUpperCase()}</Text>
                </View>

                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.eventName}</Text>
                    
                    <Text style={styles.cardDate}>
                        <Ionicons name="time-outline" size={14} color="#1e40af" /> {formatDate(item.eventDate)}
                    </Text>

                    <Text style={styles.cardLocation}>
                        <Ionicons name="location-outline" size={14} color="#666" /> {item.location}
                    </Text>

                    <Text style={styles.cardDescription} numberOfLines={3}>{item.description}</Text>

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

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#344e41" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Upcoming Events</Text>
                
                {canManageEvents ? (
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
                    data={events}
                    keyExtractor={(item) => item._id}
                    renderItem={renderEventItem}
                    contentContainerStyle={styles.listContent}
                    refreshing={refreshing}
                    onRefresh={() => { setRefreshing(true); loadData(); }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="sad-outline" size={48} color="#aaa" />
                            <Text style={styles.emptyText}>No upcoming events right now.</Text>
                        </View>
                    }
                />
            )}

            {/* Create / Edit Event Modal */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingEventId ? 'Edit Event' : 'Submit Event'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.label}>Event Name</Text>
                            <TextInput style={styles.input} value={eventName} onChangeText={setEventName} placeholder="e.g. Kandy Perahera" />

                            <Text style={styles.label}>Event Date (YYYY-MM-DD)</Text>
                            <TextInput style={styles.input} value={eventDate} onChangeText={setEventDate} placeholder="e.g. 2026-08-15" />

                            <Text style={styles.label}>Location</Text>
                            <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="e.g. Kandy Lake" />

                            <Text style={styles.label}>Description</Text>
                            <TextInput 
                                style={[styles.input, styles.textArea]} 
                                value={description} 
                                onChangeText={setDescription} 
                                placeholder="What's happening at this event?"
                                multiline
                                numberOfLines={4}
                            />

                            <Text style={styles.label}>Event Poster / Flyer</Text>
                            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                                {imageUri ? (
                                    <Image source={{ uri: imageUri }} style={styles.previewImage} />
                                ) : existingImage ? (
                                    <Image source={{ uri: existingImage }} style={styles.previewImage} />
                                ) : (
                                    <Text style={styles.imagePickerText}>Tap to select an image</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.submitButton} onPress={handleSaveEvent} disabled={formLoading}>
                                {formLoading ? <ActivityIndicator color="#fff" /> : (
                                    <Text style={styles.submitButtonText}>
                                        {editingEventId ? 'Save Changes' : 'Submit Event'}
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
                            <Text style={styles.modalTitle}>Event Details</Text>
                            <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {selectedItem && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {selectedItem.eventPoster && (
                                    <Image 
                                        source={{ uri: selectedItem.eventPoster.startsWith('http') ? selectedItem.eventPoster : `${API_URL.replace('/api', '')}${selectedItem.eventPoster}` }} 
                                        style={[styles.cardImage, { borderRadius: 12, marginBottom: 16 }]} 
                                    />
                                )}
                                <Text style={[styles.cardTitle, { fontSize: 24 }]}>{selectedItem.eventName}</Text>
                                
                                <Text style={[styles.cardDate, { fontSize: 16, marginTop: 8 }]}>
                                    <Ionicons name="time-outline" size={16} color="#1e40af" /> {formatDate(selectedItem.eventDate)}
                                </Text>

                                <Text style={[styles.cardLocation, { fontSize: 16, marginBottom: 16 }]}>
                                    <Ionicons name="location-outline" size={16} color="#666" /> {selectedItem.location}
                                </Text>

                                <Text style={{ fontSize: 16, color: '#444', marginBottom: 20, lineHeight: 24 }}>{selectedItem.description}</Text>

                                <ReviewList 
                                    targetId={selectedItem._id} 
                                    targetType="Event" 
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

    listContent: { padding: 16, gap: 20, paddingBottom: 30 },
    emptyContainer: { alignItems: 'center', marginTop: 50 },
    emptyText: { marginTop: 10, fontSize: 16, color: '#666' },

    // Card Styles
    card: { backgroundColor: '#fff', borderRadius: 16, overflow: 'visible', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
    cardImage: { width: '100%', height: 180, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
    cardPlaceholderImage: { width: '100%', height: 180, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
    
    dateBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
    dateBadgeDay: { fontSize: 18, fontWeight: '900', color: '#1e40af' },
    dateBadgeMonth: { fontSize: 10, fontWeight: '700', color: '#64748b' },

    cardContent: { padding: 16 },
    cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 6 },
    
    cardDate: { fontSize: 14, fontWeight: '600', color: '#1e40af', marginBottom: 4 },
    cardLocation: { fontSize: 14, color: '#64748b', marginBottom: 12 },
    cardDescription: { fontSize: 14, color: '#475569', lineHeight: 20 },

    // Action Buttons
    actionButtonsRow: { flexDirection: 'row', marginTop: 16, gap: 10 },
    editButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, backgroundColor: '#dbeafe', borderRadius: 8 },
    editButtonText: { color: '#1e40af', fontWeight: 'bold', marginLeft: 4, fontSize: 13 },
    deleteButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, backgroundColor: '#fee2e2', borderRadius: 8 },
    deleteButtonText: { color: '#dc2626', fontWeight: 'bold', marginLeft: 4, fontSize: 13 },

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
