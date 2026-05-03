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
import { API_BASE_URL } from '../../src/config/apiConfig';

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
      const url = user.profilePhoto.startsWith('http') ? user.profilePhoto : `${API_BASE_URL}${user.profilePhoto}`;
      return { uri: url };
    }
    return null;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning,';
    if (hour < 18) return 'Good Afternoon,';
    return 'Good Evening,';
  };

  return (
    <View style={styles.screen}>
      {/* ── Top Navigation Bar ── */}
      <View style={styles.header}>
        <View style={styles.welcomeArea}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
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
                    else if (type === 'ATTRACTION') router.push('/(tabs)/attractions');
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
      <ScrollView contentContainerStyle={styles.feedContent} showsVerticalScrollIndicator={false}>

        {/* Featured Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Explore by Category</Text>
          <Text style={styles.sectionSubtitle}>Swipe to discover what HD Resorts has to offer</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
          decelerationRate="fast"
          snapToInterval={280 + 16} // card width + gap
        >
          {CATEGORIES.map((cat, index) => (
            <TouchableOpacity
              key={index}
              style={styles.carouselCard}
              onPress={() => router.push(cat.route as any)}
              activeOpacity={0.9}
            >
              <Image source={{ uri: cat.img }} style={styles.cardImage} />
              <View style={styles.cardOverlay}>
                <View style={[styles.iconBadge, { backgroundColor: cat.color }]}>
                  <Ionicons name={cat.icon as any} size={20} color="#fff" />
                </View>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>{cat.title}</Text>
                  <Text style={styles.cardSubtitle}>{cat.subtitle}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Quick Links Section */}
        <View style={[styles.sectionHeader, { marginTop: 32 }]}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionBox} onPress={() => router.push('/(tabs)/attractions')}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#eef4ed' }]}>
              <Ionicons name="sparkles" size={24} color="#3a5a40" />
            </View>
            <Text style={styles.quickActionText}>Hidden Gems</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionBox} onPress={() => router.push('/(tabs)/host')}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="bed" size={24} color="#d97706" />
            </View>
            <Text style={styles.quickActionText}>Find Stays</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionBox} onPress={() => router.push('/(tabs)/event')}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#fee2e2' }]}>
              <Ionicons name="ticket" size={24} color="#dc2626" />
            </View>
            <Text style={styles.quickActionText}>Book Events</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionBox} onPress={() => router.push('/(tabs)/activity')}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#e0e7ff' }]}>
              <Ionicons name="bicycle" size={24} color="#4f46e5" />
            </View>
            <Text style={styles.quickActionText}>Activities</Text>
          </TouchableOpacity>
        </View>

        {/* Become a Provider Banner */}
        {user?.role?.toUpperCase() === 'USER' && (
          <TouchableOpacity
            style={styles.providerBanner}
            onPress={() => router.push('/(tabs)/upgrade')}
            activeOpacity={0.9}
          >
            <View style={styles.providerBannerContent}>
              <Text style={styles.providerBannerTitle}>Become a Provider</Text>
              <Text style={styles.providerBannerSub}>Start earning by hosting stays, guiding tours, or creating events!</Text>
            </View>
            <View style={styles.providerBannerIcon}>
              <Ionicons name="arrow-forward" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        )}

      </ScrollView>
    </View>
  );
}

const CATEGORIES = [
  { id: 'homestays', title: 'Homestays', subtitle: 'Cozy places to stay', icon: 'home', color: '#d4a373', route: '/(tabs)/host', img: 'https://images.unsplash.com/photo-1527248647512-3a668e6dc10b?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: 'activities', title: 'Activities', subtitle: 'Thrilling experiences', icon: 'bicycle', color: '#3a5a40', route: '/(tabs)/activity', img: 'https://images.unsplash.com/photo-1776336885109-cf865af988d1?q=80&w=652&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: 'guides', title: 'Local Guides', subtitle: 'Discover secrets', icon: 'map', color: '#588157', route: '/(tabs)/guide', img: 'https://images.unsplash.com/photo-1720945489913-6c2b4ac12c94?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: 'events', title: 'Events', subtitle: 'Join the party', icon: 'calendar', color: '#bc4749', route: '/(tabs)/event', img: 'https://images.unsplash.com/photo-1566766188646-5d0310191714?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: 'attractions', title: 'Attractions', subtitle: 'Must-see spots', icon: 'camera', color: '#1e40af', route: '/(tabs)/attractions', img: 'https://images.unsplash.com/photo-1592905169881-eff95fe441ed?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
];

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#dad7cd',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#dad7cd',
  },
  welcomeArea: { gap: 2 },
  greeting: { fontSize: 13, color: '#588157', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  userName: { fontSize: 26, fontWeight: '900', color: '#344e41', letterSpacing: -0.5 },
  avatarContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#3a5a40', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarFallback: { width: '100%', height: '100%', backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: '100%', height: '100%', resizeMode: 'cover' },

  // ── Dropdown Modal ──
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.1)' },
  dropdownMenu: { position: 'absolute', top: Platform.OS === 'ios' ? 100 : 80, right: 24, width: 230, backgroundColor: '#ffffff', borderRadius: 16, padding: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 15 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12, borderRadius: 12 },
  menuIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  menuText: { fontSize: 15, fontWeight: '700', color: '#344e41' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 4, marginHorizontal: 12 },

  // ── Feed Content ──
  feedContent: { paddingBottom: 40 },

  sectionHeader: { paddingHorizontal: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#344e41' },
  sectionSubtitle: { fontSize: 14, color: '#588157', marginTop: 4 },

  // ── Carousel ──
  carouselContainer: { paddingHorizontal: 24, gap: 16 },
  carouselCard: { width: 280, height: 380, borderRadius: 24, overflow: 'hidden', backgroundColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  cardImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', justifyContent: 'flex-end', padding: 20, backgroundColor: 'rgba(0,0,0,0.5)' },
  iconBadge: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  cardTextContainer: {},
  cardTitle: { color: '#ffffff', fontSize: 24, fontWeight: '900', letterSpacing: -0.5, marginBottom: 4 },
  cardSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500' },

  // ── Quick Actions Grid ──
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, gap: 12, justifyContent: 'space-between' },
  quickActionBox: { width: '48%', backgroundColor: '#ffffff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  quickActionIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  quickActionText: { fontSize: 15, fontWeight: '700', color: '#344e41' },

  // ── Provider Banner ──
  providerBanner: { marginHorizontal: 24, marginTop: 32, backgroundColor: '#344e41', borderRadius: 20, padding: 24, flexDirection: 'row', alignItems: 'center', shadowColor: '#344e41', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  providerBannerContent: { flex: 1, paddingRight: 16 },
  providerBannerTitle: { color: '#ffffff', fontSize: 20, fontWeight: '800', marginBottom: 6 },
  providerBannerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 20 },
  providerBannerIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }
});
