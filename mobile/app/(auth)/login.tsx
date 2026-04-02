import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';

// Placeholder — to be implemented by the Login team member
export default function LoginScreen() {
  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.card}>
        <Text style={styles.emoji}>🔐</Text>
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.sub}>
          This screen will be implemented by the Login team member.{'\n'}
          POST /api/auth/login coming soon.
        </Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
          <Text style={styles.btnText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1, backgroundColor: '#0D1117',
    justifyContent: 'center', alignItems: 'center', padding: 28,
  },
  card: {
    backgroundColor: '#161B22', borderRadius: 24, padding: 32,
    borderWidth: 1, borderColor: '#21262D', alignItems: 'center', gap: 12, width: '100%',
  },
  emoji: { fontSize: 40 },
  title: { fontSize: 24, fontWeight: '700', color: '#F0F6FF' },
  sub: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
  btn: {
    marginTop: 8, paddingVertical: 12, paddingHorizontal: 24,
    borderRadius: 12, borderWidth: 1, borderColor: '#30363D',
  },
  btnText: { color: '#8B949E', fontSize: 15, fontWeight: '600' },
});
