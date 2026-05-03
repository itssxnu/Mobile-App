import Constants from 'expo-constants';

let API_URL = 'https://mobile-app-rh2v.onrender.com/api';
let API_BASE_URL = 'https://mobile-app-rh2v.onrender.com';

if (__DEV__) {
  const hostUri = Constants?.expoConfig?.hostUri;
  if (hostUri && !hostUri.includes('ngrok') && !hostUri.includes('exp.direct')) {
    const ip = hostUri.split(':')[0];
    API_BASE_URL = `http://${ip}:5000`;
    API_URL = `${API_BASE_URL}/api`;
  }
}

export { API_URL, API_BASE_URL };
