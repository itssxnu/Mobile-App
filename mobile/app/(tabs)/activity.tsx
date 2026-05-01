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

