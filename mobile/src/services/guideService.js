import API from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getGuides = async () => {
    const response = await API.get('/guides');
    return response.data;
};

export const createGuide = async (formData) => {
    const token = await AsyncStorage.getItem('userToken');
    const response = await API.post('/guides', formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const updateGuide = async (id, formData) => {
    const token = await AsyncStorage.getItem('userToken');
    const response = await API.put(`/guides/${id}`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteGuide = async (id) => {
    const token = await AsyncStorage.getItem('userToken');
    const response = await API.delete(`/guides/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};
