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
        if (!title || !providerName || !duration || !pricePerPerson || !category) {
            Alert.alert('Error', 'Please fill out all required fields.');
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
                // @ts-ignore
                formData.append('actionShot', {
                    uri: imageUri,
                    name: 'actionShot.jpg',
                    type: 'image/jpeg'
                });
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
            setExistingImage(`${baseUrl}${activity.actionShot}`);
        } else {
            setExistingImage(null);
        }

        setModalVisible(true);
    };

    const handleDelete = (id: string) => {
        Alert.alert('Delete Activity', 'Are you sure you want to delete this activity?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteActivity(id);
                        Alert.alert('Success', 'Activity deleted.');
                        loadData();
                    } catch (error: any) {
                        Alert.alert('Error', 'Failed to delete activity.');
                    }
                }
            }
        ]);
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


