import API from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getActivities = async () => {
    const response = await API.get('/activities');
    return response.data;
};

export const createActivity = async (formData) => {
    const token = await AsyncStorage.getItem('userToken');
    const response = await API.post('/activities', formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const updateActivity = async (id, formData) => {
    const token = await AsyncStorage.getItem('userToken');
    const response = await API.put(`/activities/${id}`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteActivity = async (id) => {
    const token = await AsyncStorage.getItem('userToken');
    const response = await API.delete(`/activities/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};
