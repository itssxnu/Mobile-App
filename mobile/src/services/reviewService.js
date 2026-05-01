import API from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getReviewsByTarget = async (targetId) => {
    const response = await API.get(`/reviews/${targetId}`);
    return response.data;
};

export const createReview = async (formData) => {
    const token = await AsyncStorage.getItem('userToken');
    const response = await API.post('/reviews', formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const updateReview = async (id, formData) => {
    const token = await AsyncStorage.getItem('userToken');
    const response = await API.put(`/reviews/${id}`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteReview = async (id) => {
    const token = await AsyncStorage.getItem('userToken');
    const response = await API.delete(`/reviews/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};
