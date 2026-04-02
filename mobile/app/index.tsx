import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { Stack, router } from 'expo-router';

const { height } = Dimensions.get('window');

const FEATURES = [
  { icon: '🏡', label: 'Homestays' },
  { icon: '🗺️', label: 'Attractions' },
  { icon: '🧭', label: 'Guides' },
  { icon: '🏄', label: 'Activities' },
  { icon: '🎉', label: 'Events' },
];

export default function WelcomeScreen() {
  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Background gradient layers */}
      <View style={styles.bgTop} />
      <View style={styles.bgGlow} />

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

        {/* Feature pills */}
        <View style={styles.pillRow}>
          {FEATURES.map((f) => (
            <View key={f.label} style={styles.pill}>
              <Text style={styles.pillIcon}>{f.icon}</Text>
              <Text style={styles.pillLabel}>{f.label}</Text>
            </View>
          ))}
        </View>

        {/* CTA Buttons */}
        <View style={styles.btnGroup}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => router.push('/(auth)/register')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => router.push('/(auth)/login')}

            activeOpacity={0.85}
          >
            <Text style={styles.btnSecondaryText}>Sign In</Text>
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
    backgroundColor: '#dad7cd',
  },

  // ── Background ───────────────────────────────────
  bgTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.45,
    backgroundColor: '#dad7cd',
    borderBottomWidth: 1,
    borderBottomColor: '#a3b18a',
  },
  bgGlow: {
    display: 'none',
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
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#3a5a40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 36,
  },
  appName: {
    fontSize: 30,
    fontWeight: '800',
    color: '#344e41',
    letterSpacing: -0.5,
  },
  country: {
    fontSize: 14,
    color: '#588157',
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
    color: '#344e41',
    lineHeight: 48,
    letterSpacing: -1,
  },
  heroSub: {
    fontSize: 16,
    color: '#344e41',
    lineHeight: 24,
    opacity: 0.8,
  },

  // ── Feature Pills ─────────────────────────────────
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#a3b18a',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  pillIcon: {
    fontSize: 14,
  },
  pillLabel: {
    fontSize: 14,
    color: '#344e41',
    fontWeight: '600',
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
