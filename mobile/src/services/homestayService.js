import API from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getHomestays = async () => {
    const response = await API.get('/homestays');
    return response.data;
};

export const createHomestay = async (formData) => {
    const token = await AsyncStorage.getItem('userToken');
    const response = await API.post('/homestays', formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const updateHomestay = async (id, formData) => {
    const token = await AsyncStorage.getItem('userToken');
    const response = await API.put(`/homestays/${id}`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteHomestay = async (id) => {
    const token = await AsyncStorage.getItem('userToken');
    const response = await API.delete(`/homestays/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};
