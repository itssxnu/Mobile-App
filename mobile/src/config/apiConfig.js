import Constants from 'expo-constants';

let API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
let API_BASE_URL = API_URL.replace('/api', '');

if (__DEV__) {
  // Constants.expoConfig?.hostUri contains the IP address of the Expo dev server (e.g., "192.168.1.5:8081")
  const hostUri = Constants?.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    API_BASE_URL = `http://${ip}:5000`;
    API_URL = `${API_BASE_URL}/api`;
  }
}

export { API_URL, API_BASE_URL };
