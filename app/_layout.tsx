import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 300,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          presentation: 'card',
        }}
      >
        <Stack.Screen 
          name="chat" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_bottom',
            animationDuration: 250,
          }} 
        />
        <Stack.Screen 
          name="sessions" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 300,
          }} 
        />
        <Stack.Screen 
          name="foods" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 300,
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="food-detail" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 300,
            presentation: 'card',
          }} 
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar 
        style={colorScheme === 'dark' ? 'light' : 'dark'} 
        backgroundColor="transparent"
        translucent={Platform.OS === 'android'}
      />
    </ThemeProvider>
  );
}
