import { Pressable, StyleSheet, View } from 'react-native';
import { Link, Stack } from 'expo-router';

import { Colors, Fonts } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function DemoLanding() {
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].tint;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.card}>
        <ThemedText type="title" style={styles.title}>
          This is WMT project demo page
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Use this screen to validate startup flow before entering the app.
        </ThemedText>
        <Link href="/(tabs)" asChild>
          <Pressable style={[styles.button, { backgroundColor: tint }]}
            onPress={() => {}}>
            <ThemedText style={styles.buttonText}>Enter App</ThemedText>
          </Pressable>
        </Link>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    padding: 24,
    borderRadius: 24,
    gap: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  title: {
    textAlign: 'center',
    fontFamily: Fonts.rounded,
    fontSize: 28,
    lineHeight: 34,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
