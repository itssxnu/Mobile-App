import { View, Text, StyleSheet } from 'react-native';

export default function ExploreScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.emoji}>🗺️</Text>
      <Text style={styles.title}>Attractions</Text>
      <Text style={styles.sub}>
        This screen will be implemented by the Attractions team member.{'\n'}
        GET /api/attractions coming soon.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0D1117',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F0F6FF',
    marginBottom: 8,
  },
  sub: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});
