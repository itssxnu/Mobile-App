import API from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getEvents = async () => {
    const response = await API.get('/events');
    return response.data;
};

export const createEvent = async (formData) => {
    const token = await AsyncStorage.getItem('userToken');
    const response = await API.post('/events', formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const updateEvent = async (id, formData) => {
    const token = await AsyncStorage.getItem('userToken');
    const response = await API.put(`/events/${id}`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteEvent = async (id) => {
    const token = await AsyncStorage.getItem('userToken');
    const response = await API.delete(`/events/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};
