import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Modal, 
  TouchableWithoutFeedback,
  ScrollView,
  Platform
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getUserData, logout } from '../../src/services/authService';

export default function DashboardScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchUser = async () => {
        const data = await getUserData();
        if (data) {
          setUser(data);
        } else {
          router.replace('/(auth)/login');
        }
      };
      fetchUser();
    }, [])
  );

  const handleLogout = async () => {
    setMenuVisible(false);
    await logout();
    router.replace('/(auth)/login');
  };

  const getProfileImageUrl = () => {
    if (user?.profilePhoto) {
      const API_BASE = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'http://172.20.10.6:5000';
      return { uri: `${API_BASE}${user.profilePhoto}` };
    }
    return null;
  };

  return (
    <View style={styles.screen}>
      {/* ── Top Navigation Bar ── */}
      <View style={styles.header}>
        <View style={styles.welcomeArea}>
          <Text style={styles.greeting}>Good Morning,</Text>
          <Text style={styles.userName}>{user?.name || 'Explorer'}</Text>
        </View>

        <TouchableOpacity 
          style={styles.avatarContainer} 
          onPress={() => setMenuVisible(true)}
          activeOpacity={0.8}
        >
          {getProfileImageUrl() ? (
            <Image source={getProfileImageUrl() as any} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Ionicons name="person" size={24} color="#dad7cd" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Dropdown Menu Modal ── */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dropdownMenu}>
                
                {/* Profile Item */}
                <TouchableOpacity 
                  style={styles.menuItem} 
                  onPress={() => {
                    setMenuVisible(false);
                    router.push('/profile');
                  }}
                >
                  <View style={styles.menuIconBox}>
                    <Ionicons name="person-circle-outline" size={22} color="#344e41" />
                  </View>
                  <Text style={styles.menuText}>My Profile</Text>
                </TouchableOpacity>

                {/* Conditional Action based on Role */}
                {user?.role?.toUpperCase() === 'USER' ? (
                  <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); router.push('/(tabs)/upgrade'); }}>
                    <View style={styles.menuIconBox}>
                      <Ionicons name="briefcase-outline" size={22} color="#344e41" />
                    </View>
                    <Text style={styles.menuText}>Become a Provider</Text>
                  </TouchableOpacity>
                ) : user?.role?.toUpperCase() === 'PROVIDER' ? (
                  <TouchableOpacity style={styles.menuItem} onPress={() => { 
                      setMenuVisible(false); 
                      const type = user?.providerType?.toUpperCase();
                      if (type === 'HOST') router.push('/(tabs)/host');
                      else if (type === 'GUIDE') router.push('/(tabs)/guide');
                      else if (type === 'ACTIVITY') router.push('/(tabs)/activity');
                      else if (type === 'EVENT') router.push('/(tabs)/event');
                  }}>
                    <View style={[styles.menuIconBox, { backgroundColor: '#eef4ed' }]}>
                      <Ionicons name="bar-chart-outline" size={22} color="#3a5a40" />
                    </View>
                    <Text style={styles.menuText}>Provider Dashboard</Text>
                  </TouchableOpacity>
                ) : user?.role?.toUpperCase() === 'ADMIN' ? (
                  <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); router.push('/(tabs)/admin'); }}>
                    <View style={[styles.menuIconBox, { backgroundColor: '#f0f4f8' }]}>
                      <Ionicons name="shield-checkmark-outline" size={22} color="#1e40af" />
                    </View>
                    <Text style={[styles.menuText, { color: '#1e40af' }]}>Admin Dashboard</Text>
                  </TouchableOpacity>
                ) : null}

                <View style={styles.divider} />

                {/* Logout Item */}
                <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                  <View style={[styles.menuIconBox, { backgroundColor: '#fee2e2' }]}>
                    <Ionicons name="log-out-outline" size={22} color="#dc2626" />
                  </View>
                  <Text style={[styles.menuText, { color: '#dc2626' }]}>Sign Out</Text>
                </TouchableOpacity>

              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ── Main Feed ── */}
      <ScrollView contentContainerStyle={styles.feedContent}>
        <View style={styles.placeholderCard}>
          <Text style={styles.emoji}>🌍</Text>
          <Text style={styles.title}>Welcome to HD Resorts</Text>
          <Text style={styles.sub}>
            This is the main dashboard! This is where people can see all the awesome homestays, activities, guides, and events that providers have published.
          </Text>
        </View>
      </ScrollView>
      
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#dad7cd',
    paddingTop: Platform.OS === 'ios' ? 50 : 20, // Avoid safe area
  },
  
  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  welcomeArea: {
    gap: 2,
  },
  greeting: {
    fontSize: 14,
    color: '#588157',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#344e41',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#3a5a40',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3a5a40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  // ── Dropdown Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  dropdownMenu: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    right: 24,
    width: 220,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#a3b18a',
    shadowColor: '#344e41',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderRadius: 12,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#344e41',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
    marginHorizontal: 12,
  },

  // ── Feed Content ──
  feedContent: {
    padding: 24,
    paddingTop: 8,
  },
  placeholderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a3b18a',
  },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#344e41',
    marginBottom: 8,
  },
  sub: {
    fontSize: 15,
    color: '#588157',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
});
