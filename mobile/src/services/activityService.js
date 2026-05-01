import API from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getActivities = async () => {
    const response = await API.get('/activities');
    return response.data;
};

