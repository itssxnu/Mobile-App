import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import { Stack, router } from 'expo-router';

import { getToken } from '../src/services/authService';

const { height } = Dimensions.get('window');

const SLIDESHOW_IMAGES = [
  'https://plus.unsplash.com/premium_photo-1730145749791-28fc538d7203?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Sigiriya/Elephants
  'https://images.unsplash.com/photo-1574611122955-5baa61496637?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Train in Ella
  'https://images.unsplash.com/photo-1623595289196-007a22dd8560?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Tea plantation
  'https://images.unsplash.com/photo-1619531103472-7cc0d6479b59?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Beautiful beach
];

export default function WelcomeScreen() {
  const [sources, setSources] = useState([SLIDESHOW_IMAGES[0], SLIDESHOW_IMAGES[1]]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const currentStep = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const step = currentStep.current;
      const isTopFadingIn = step % 2 === 0;
      const nextImageIndex = (step + 2) % SLIDESHOW_IMAGES.length;

      Animated.timing(fadeAnim, {
        toValue: isTopFadingIn ? 1 : 0,
        duration: 1500,
        useNativeDriver: true,
      }).start(() => {
        setSources((prev) => {
          const newSources = [...prev];
          if (isTopFadingIn) {
            newSources[0] = SLIDESHOW_IMAGES[nextImageIndex];
          } else {
            newSources[1] = SLIDESHOW_IMAGES[nextImageIndex];
          }
          return newSources;
        });
        currentStep.current += 1;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleExplore = async () => {
    try {
      const token = await getToken();
      if (token) {
        // User is logged in, securely route to their dashboard
        router.replace('/(tabs)');
      } else {
        // No session, require login
        router.push('/(auth)/login');
      }
    } catch (error) {
      console.error('Session check failed:', error);
      router.push('/(auth)/login');
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Fullscreen Background Image Slideshow (Double Buffered) */}
      <View style={styles.bgFullscreen}>
        <Animated.Image
          source={{ uri: sources[0] }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <Animated.Image
          source={{ uri: sources[1] }}
          style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}
          resizeMode="cover"
        />
        {/* Dark gradient overlay to make text readable everywhere */}
        <View style={styles.imageOverlay} />
      </View>

      {/* Content */}
      <View style={styles.content}>

        {/* Logo */}
        <View style={styles.logoArea}>
          <View style={styles.logoMark}>
            <Text style={styles.logoEmoji}>🌴</Text>
          </View>
          <Text style={styles.appName}>HD Resorts</Text>
          <Text style={styles.country}>🇱🇰 Sri Lanka</Text>
        </View>

        {/* Hero text */}
        <View style={styles.heroArea}>
          <Text style={styles.heroTitle}>Discover Hidden{'\n'}Sri Lanka</Text>
          <Text style={styles.heroSub}>
            Uncover secret waterfalls, stay with local hosts, and explore the island like never before.
          </Text>
        </View>

        {/* CTA Buttons */}
        <View style={styles.btnGroup}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={handleExplore}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>Explore</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footNote}>
          Join thousands of explorers across Sri Lanka
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000',
  },

  // ── Background ───────────────────────────────────
  bgFullscreen: {
    ...StyleSheet.absoluteFillObject,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)', // Dark tint for full-screen white text readability
  },

  // ── Content ──────────────────────────────────────
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },

  // ── Logo ─────────────────────────────────────────
  logoArea: {
    alignItems: 'center',
    gap: 8,
  },
  logoMark: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 36,
  },
  appName: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  country: {
    fontSize: 14,
    color: '#e2e8f0',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // ── Hero ─────────────────────────────────────────
  heroArea: {
    gap: 12,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 48,
    letterSpacing: -1,
  },
  heroSub: {
    fontSize: 16,
    color: '#e2e8f0',
    lineHeight: 24,
    opacity: 0.9,
  },

  // ── Buttons ───────────────────────────────────────
  btnGroup: {
    gap: 12,
  },
  btnPrimary: {
    backgroundColor: '#3a5a40',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  btnSecondary: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3a5a40',
    backgroundColor: 'transparent',
  },
  btnSecondaryText: {
    color: '#3a5a40',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // ── Footer ────────────────────────────────────────
  footNote: {
    textAlign: 'center',
    fontSize: 13,
    color: '#588157',
    fontWeight: '500',
  },
});
