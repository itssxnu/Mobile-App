import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Image, ActivityIndicator, FlatList, Modal, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getReviewsByTarget, createReview, deleteReview, updateReview } from '../services/reviewService';
import { getUserData } from '../services/authService';
import { API_URL } from '../config/apiConfig';

interface ReviewListProps {
    targetId: string;
    targetType: 'Homestay' | 'Attraction' | 'Guide' | 'Activity' | 'Event';
    isItemOwner?: boolean;
}

export default function ReviewList({ targetId, targetType, isItemOwner = false }: ReviewListProps) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Modal states
    const [modalVisible, setModalVisible] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

    // Form states
    const [rating, setRating] = useState('5');
    const [comment, setComment] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [existingImage, setExistingImage] = useState<string | null>(null);

    const loadReviews = async () => {
        try {
            setLoading(true);
            const user = await getUserData();
            if (user) setCurrentUser(user);

            const fetchedReviews = await getReviewsByTarget(targetId);
            setReviews(fetchedReviews);
        } catch (error) {
            console.error('Failed to load reviews', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (targetId) {
            loadReviews();
        }
    }, [targetId]);

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

    const handleSaveReview = async () => {
        const numRating = parseInt(rating);
        if (!comment.trim() || isNaN(numRating) || numRating < 1 || numRating > 5) {
            Alert.alert('Error', 'Please provide a comment and a valid rating (1-5).');
            return;
        }

        setFormLoading(true);
        try {
            const formData = new FormData();
            formData.append('targetId', targetId);
            formData.append('targetType', targetType);
            formData.append('rating', rating);
            formData.append('comment', comment);

            if (imageUri) {
                if (Platform.OS === 'web') {
                    const response = await fetch(imageUri);
                    const blob = await response.blob();
                    formData.append('reviewPhoto', blob, 'reviewPhoto.jpg');
                } else {
                    // @ts-ignore
                    formData.append('reviewPhoto', {
                        uri: imageUri,
                        name: 'reviewPhoto.jpg',
                        type: 'image/jpeg'
                    });
                }
            }

            if (editingReviewId) {
                await updateReview(editingReviewId, formData);
                Alert.alert('Success', 'Review updated.');
            } else {
                await createReview(formData);
                Alert.alert('Success', 'Review submitted.');
            }

            setModalVisible(false);
            resetForm();
            loadReviews();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to submit review. Make sure you are logged in.');
        } finally {
            setFormLoading(false);
        }
    };

    const executeDelete = async (id: string) => {
        try {
            await deleteReview(id);
            loadReviews();
        } catch (error: any) {
            if (Platform.OS === 'web') {
                window.alert('Failed to delete review.');
            } else {
                Alert.alert('Error', 'Failed to delete review.');
            }
        }
    };

    const handleDelete = (id: string) => {
        if (Platform.OS === 'web') {
            const confirmed = window.confirm('Are you sure you want to remove this review?');
            if (confirmed) {
                executeDelete(id);
            }
        } else {
            Alert.alert('Delete Review', 'Are you sure you want to remove this review?', [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => executeDelete(id)
                }
            ]);
        }
    };

    const openEditModal = (review: any) => {
        setEditingReviewId(review._id);
        setRating(review.rating.toString());
        setComment(review.comment);
        setImageUri(null);

        if (review.reviewPhoto) {
            const baseUrl = API_URL.replace('/api', '');
            setExistingImage(review.reviewPhoto.startsWith('http') ? review.reviewPhoto : `${baseUrl}${review.reviewPhoto}`);
        } else {
            setExistingImage(null);
        }

        setModalVisible(true);
    };

    const resetForm = () => {
        setEditingReviewId(null);
        setRating('5');
        setComment('');
        setImageUri(null);
        setExistingImage(null);
    };

    const renderStars = (ratingNum: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= ratingNum ? "star" : "star-outline"}
                    size={16}
                    color="#eab308"
                />
            );
        }
        return <View style={styles.starsContainer}>{stars}</View>;
    };

    const renderReviewItem = ({ item }: { item: any }) => {
        const baseUrl = API_URL.replace('/api', '');
        const currentUserId = currentUser?.id || currentUser?._id;
        const isAuthor = currentUser && currentUserId === item.author?._id;
        const isAdmin = currentUser && currentUser?.role?.toUpperCase() === 'ADMIN';

        return (
            <View style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                    <View style={styles.authorInfo}>
                        <View style={styles.authorAvatar}>
                            <Text style={styles.authorInitials}>
                                {item.author?.name ? item.author.name.substring(0,2).toUpperCase() : 'U'}
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.authorName}>{item.author?.name || 'Unknown User'}</Text>
                            {renderStars(item.rating)}
                        </View>
                    </View>

                    {(isAuthor || isAdmin || isItemOwner) && (
                        <View style={styles.actionRow}>
                            {isAuthor && (
                                <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionBtn}>
                                    <Ionicons name="pencil" size={16} color="#64748b" />
                                </TouchableOpacity>
                            )}
                            {(isAuthor || isAdmin || isItemOwner) && (
                                <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.actionBtn}>
                                    <Ionicons name="trash" size={16} color="#ef4444" />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>

                <Text style={styles.commentText}>{item.comment}</Text>

                {item.reviewPhoto && (
                    <Image source={{ uri: item.reviewPhoto.startsWith('http') ? item.reviewPhoto : `${baseUrl}${item.reviewPhoto}` }} style={styles.reviewImage} />
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Community Reviews ({reviews.length})</Text>
                {currentUser && !isItemOwner && (
                    <TouchableOpacity style={styles.writeButton} onPress={() => { resetForm(); setModalVisible(true); }}>
                        <Ionicons name="create-outline" size={18} color="#fff" />
                        <Text style={styles.writeButtonText}>Write a Review</Text>
                    </TouchableOpacity>
                )}
            </View>

            {loading ? (
                <ActivityIndicator size="small" color="#344e41" style={{ marginVertical: 20 }} />
            ) : reviews.length === 0 ? (
                <Text style={styles.emptyText}>No reviews yet. Be the first to leave one!</Text>
            ) : (
                <FlatList
                    data={reviews}
                    keyExtractor={(item) => item._id}
                    renderItem={renderReviewItem}
                    scrollEnabled={false} // Since this is usually rendered inside another ScrollView
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            )}

            {/* Review Modal */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{editingReviewId ? 'Edit Review' : 'Write a Review'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Rating (1-5)</Text>
                        <View style={styles.ratingSelector}>
                            {[1,2,3,4,5].map(num => (
                                <TouchableOpacity
                                    key={num}
                                    onPress={() => setRating(num.toString())}
                                    style={[styles.ratingBtn, rating === num.toString() && styles.ratingBtnActive]}
                                >
                                    <Text style={[styles.ratingBtnText, rating === num.toString() && styles.ratingBtnTextActive]}>
                                        {num} <Ionicons name="star" size={12} color={rating === num.toString() ? '#fff' : '#eab308'} />
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Your Feedback</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={comment}
                            onChangeText={setComment}
                            placeholder="Share details of your experience..."
                            multiline
                            numberOfLines={4}
                        />

                        <Text style={styles.label}>Attach a Photo (Optional)</Text>
                        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                            {imageUri ? (
                                <Image source={{ uri: imageUri }} style={styles.previewImage} />
                            ) : existingImage ? (
                                <Image source={{ uri: existingImage }} style={styles.previewImage} />
                            ) : (
                                <View style={styles.imagePickerInner}>
                                    <Ionicons name="camera" size={32} color="#aaa" />
                                    <Text style={styles.imagePickerText}>Tap to select an image</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.submitButton} onPress={handleSaveReview} disabled={formLoading}>
                            {formLoading ? <ActivityIndicator color="#fff" /> : (
                                <Text style={styles.submitButtonText}>Submit Review</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderColor: '#e2e8f0' },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
    writeButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#344e41', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
    writeButtonText: { color: '#fff', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },
    emptyText: { color: '#64748b', fontStyle: 'italic', marginVertical: 12 },
    separator: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 12 },

    reviewCard: { marginBottom: 8 },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    authorInfo: { flexDirection: 'row', alignItems: 'center' },
    authorAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#cbd5e1', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    authorInitials: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    authorName: { fontSize: 14, fontWeight: '600', color: '#334155' },
    starsContainer: { flexDirection: 'row', marginTop: 2 },

    actionRow: { flexDirection: 'row', gap: 10 },
    actionBtn: { padding: 4 },

    commentText: { fontSize: 14, color: '#475569', lineHeight: 20 },
    reviewImage: { width: 120, height: 120, borderRadius: 8, marginTop: 12 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 24, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8, marginTop: 12 },

    ratingSelector: { flexDirection: 'row', gap: 8, marginBottom: 8 },
    ratingBtn: { flex: 1, paddingVertical: 10, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, alignItems: 'center' },
    ratingBtnActive: { backgroundColor: '#344e41', borderColor: '#344e41' },
    ratingBtnText: { fontWeight: 'bold', color: '#64748b' },
    ratingBtnTextActive: { color: '#fff' },

    input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, fontSize: 15 },
    textArea: { height: 100, textAlignVertical: 'top' },

    imagePicker: { height: 120, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'dashed', borderRadius: 10, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    imagePickerInner: { alignItems: 'center' },
    imagePickerText: { color: '#888', fontSize: 12, marginTop: 8 },
    previewImage: { width: '100%', height: '100%' },

    submitButton: { backgroundColor: '#344e41', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
