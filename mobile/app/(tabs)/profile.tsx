import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Alert, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getUserData, logout } from '../../src/services/authService';
import { updateProfile, deleteAccount } from '../../src/services/userService';
import { API_BASE_URL } from '../../src/config/apiConfig';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); // Read-only or editable? Let's make it read-only for simplicity, or editable but backend ignores it (actually backend updateMe only updates name/photo right now). We'll make it read-only.
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const data = await getUserData();
      if (data) {
        setUser(data);
        setName(data.name);
        setEmail(data.email);
        if (data.profilePhoto) {
          setProfilePhoto(data.profilePhoto.startsWith('http') ? data.profilePhoto : `${API_BASE_URL}${data.profilePhoto}`);
        }
      }
    };
    loadUser();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfilePhoto(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Name cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());

      // If profilePhoto is a local URI (not the one from the server), we upload it
      if (profilePhoto && !profilePhoto.startsWith('http')) {
        if (Platform.OS === 'web') {
          const response = await fetch(profilePhoto);
          const blob = await response.blob();
          formData.append('profilePhoto', blob, 'photo.jpg');
        } else {
          const filename = profilePhoto.split('/').pop() || 'photo.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image/jpeg`;
          formData.append('profilePhoto', {
            uri: Platform.OS === 'android' ? profilePhoto : profilePhoto.replace('file://', ''),
            name: filename,
            type: type,
          } as any);
        }
      }

      await updateProfile(formData);
      // Navigate immediately — Alert callbacks don't fire on web
      router.back();
    } catch (err: any) {
      if (Platform.OS === 'web') {
        window.alert(err.response?.data?.message || 'Something went wrong.');
      } else {
        Alert.alert('Update Failed', err.response?.data?.message || 'Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const executeDeleteAccount = async () => {
    try {
      await deleteAccount();
      await logout();
      router.replace('/(auth)/login');
    } catch (err: any) {
      if (Platform.OS === 'web') {
        window.alert(err.response?.data?.message || 'Could not delete account.');
      } else {
        Alert.alert('Error', err.response?.data?.message || 'Could not delete account.');
      }
    }
  };

  const handleDeleteAccount = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to permanently delete your account? This action cannot be undone.');
      if (confirmed) {
        executeDeleteAccount();
      }
    } else {
      Alert.alert(
        'Delete Account',
        'Are you sure you want to permanently delete your account? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive', 
            onPress: executeDeleteAccount
          }
        ]
      );
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#344e41" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper} activeOpacity={0.8}>
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Ionicons name="person" size={50} color="#dad7cd" />
              </View>
            )}
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={16} color="#ffffff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHelpText}>Tap to change photo</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. John Doe"
              placeholderTextColor="#a3b18a"
            />
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Email Address (Read-only)</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={email}
              editable={false}
            />
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Save Changes</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Account Settings</Text>
          
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color="#344e41" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Ionicons name="trash-outline" size={20} color="#dc2626" />
            <Text style={styles.deleteText}>Delete Account Permanently</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#dad7cd' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 30, paddingBottom: 15,
    backgroundColor: '#dad7cd', borderBottomWidth: 1, borderBottomColor: '#a3b18a'
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#344e41' },
  scroll: { padding: 24, paddingBottom: 60 },
  
  // Avatar
  avatarSection: { alignItems: 'center', marginBottom: 32, marginTop: 10 },
  avatarWrapper: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: '#ffffff',
    borderWidth: 3, borderColor: '#3a5a40', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#344e41', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 8
  },
  avatarFallback: { width: '100%', height: '100%', borderRadius: 60, backgroundColor: '#3a5a40', justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: '100%', height: '100%', borderRadius: 60, resizeMode: 'cover' },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0, backgroundColor: '#588157',
    width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#dad7cd'
  },
  avatarHelpText: { marginTop: 12, fontSize: 13, color: '#588157', fontWeight: '600' },

  // Card & Form
  card: { backgroundColor: '#ffffff', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#a3b18a', marginBottom: 32 },
  fieldWrapper: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: '#588157', marginBottom: 6, textTransform: 'uppercase' },
  input: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#a3b18a', borderRadius: 12, padding: 14, color: '#344e41', fontSize: 16, fontWeight: '500' },
  inputDisabled: { backgroundColor: '#f1f5f9', color: '#6B7280', borderColor: '#e2e8f0' },
  
  primaryButton: { backgroundColor: '#3a5a40', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 10 },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },

  // Danger Zone
  dangerZone: { gap: 12 },
  dangerTitle: { fontSize: 14, fontWeight: '800', color: '#344e41', textTransform: 'uppercase', marginBottom: 4, paddingLeft: 4 },
  signOutButton: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#ffffff', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#a3b18a' },
  signOutText: { fontSize: 16, fontWeight: '700', color: '#344e41' },
  deleteButton: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fef2f2', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#fca5a5' },
  deleteText: { fontSize: 16, fontWeight: '700', color: '#dc2626' },
});
