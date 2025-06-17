import { Stack } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <Stack />
      </View>
    </SafeAreaProvider>
  );
}
