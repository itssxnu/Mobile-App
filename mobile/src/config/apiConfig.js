import Constants from 'expo-constants';

let API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://172.20.10.6:5000/api';
let API_BASE_URL = API_URL.replace('/api', '');

if (__DEV__) {
  const hostUri = Constants?.expoConfig?.hostUri;
  if (hostUri && !hostUri.includes('ngrok') && !hostUri.includes('exp.direct')) {
    const ip = hostUri.split(':')[0];
    API_BASE_URL = `http://${ip}:5000`;
    API_URL = `${API_BASE_URL}/api`;
  }
}

export { API_URL, API_BASE_URL };
