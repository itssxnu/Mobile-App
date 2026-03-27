import { Pressable, StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].tint;

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#DCE7F5', dark: '#111A24' }}
      headerImage={
        <ThemedView style={styles.hero}>
          <ThemedView style={styles.heroHalo} lightColor="#F2F7FF" darkColor="#1C2A3A" />
          <ThemedView style={styles.heroPanel} lightColor="#FFFFFF" darkColor="#1A222C" />
          <View style={styles.heroMark}>
            <IconSymbol size={28} name="checkmark.seal.fill" color={tint} />
            <ThemedText style={styles.heroMarkText}>Test Bench</ThemedText>
          </View>
        </ThemedView>
      }>
      <ThemedView style={styles.titleRow}>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
          Sample Test Screen
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          UI-only layout to validate navigation, spacing, and theme behavior.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.sectionCard} lightColor="#F7F8FA" darkColor="#1C2026">
        <ThemedText type="subtitle">Quick Checks</ThemedText>
        <View style={styles.cardRow}>
          <ThemedView style={styles.statCard} lightColor="#FFFFFF" darkColor="#151A1F">
            <ThemedText type="defaultSemiBold">Layout</ThemedText>
            <ThemedText style={styles.statValue}>OK</ThemedText>
            <ThemedText style={styles.statHint}>Spacing + cards</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statCard} lightColor="#FFFFFF" darkColor="#151A1F">
            <ThemedText type="defaultSemiBold">Theme</ThemedText>
            <ThemedText style={styles.statValue}>OK</ThemedText>
            <ThemedText style={styles.statHint}>Light and dark</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statCard} lightColor="#FFFFFF" darkColor="#151A1F">
            <ThemedText type="defaultSemiBold">Tabs</ThemedText>
            <ThemedText style={styles.statValue}>OK</ThemedText>
            <ThemedText style={styles.statHint}>Home + Explore</ThemedText>
          </ThemedView>
        </View>
      </ThemedView>

      <ThemedView style={styles.sectionCard} lightColor="#F7F8FA" darkColor="#1C2026">
        <ThemedText type="subtitle">Mock Form</ThemedText>
        <View style={styles.formRow}>
          <View style={styles.field}>
            <ThemedText style={styles.fieldLabel}>Title</ThemedText>
            <View style={styles.fieldInput} />
          </View>
          <View style={styles.field}>
            <ThemedText style={styles.fieldLabel}>Category</ThemedText>
            <View style={styles.fieldInput} />
          </View>
        </View>
        <View style={styles.field}>
          <ThemedText style={styles.fieldLabel}>Notes</ThemedText>
          <View style={[styles.fieldInput, styles.fieldInputLarge]} />
        </View>
        <View style={styles.actionRow}>
          <Pressable style={[styles.primaryButton, { backgroundColor: tint }]} onPress={() => {}}>
            <ThemedText style={styles.primaryButtonText}>Run Sample</ThemedText>
          </Pressable>
          <Pressable style={styles.ghostButton} onPress={() => {}}>
            <ThemedText type="defaultSemiBold">Reset</ThemedText>
          </Pressable>
        </View>
      </ThemedView>

      <ThemedView style={styles.sectionCard} lightColor="#F7F8FA" darkColor="#1C2026">
        <ThemedText type="subtitle">Backend Status</ThemedText>
        <ThemedText style={styles.bodyText}>
          API calls are intentionally skipped for this screen. Current backend exposes GET / only.
        </ThemedText>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: tint }]} />
          <ThemedText type="defaultSemiBold">UI-only mode</ThemedText>
        </View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  heroHalo: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.9,
  },
  heroPanel: {
    position: 'absolute',
    width: 160,
    height: 120,
    borderRadius: 24,
    opacity: 0.85,
  },
  heroMark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  heroMarkText: {
    fontSize: 16,
    fontWeight: '600',
  },
  titleRow: {
    gap: 6,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.75,
  },
  sectionCard: {
    padding: 16,
    borderRadius: 20,
    gap: 12,
    marginBottom: 14,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    gap: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statHint: {
    fontSize: 12,
    opacity: 0.65,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  field: {
    flex: 1,
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    opacity: 0.75,
  },
  fieldInput: {
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  fieldInputLarge: {
    height: 90,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  ghostButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.75,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
});
