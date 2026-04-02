import { Stack } from 'expo-router';

// Layout for all user management / auth screens
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="register" />
      <Stack.Screen name="login" />
    </Stack>
  );
}
