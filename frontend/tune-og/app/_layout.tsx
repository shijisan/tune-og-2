import { PlayerProvider } from '@/context/playerContext';
import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SQLiteProvider } from "expo-sqlite";
import { migrate } from '@/database/migrate';
import { Suspense, useRef } from 'react';
import { View } from 'react-native';
import YoutubeWebView from '@/web-view/YoutubeWebView';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <>
      <Suspense fallback={<View />} />
      <SQLiteProvider databaseName='tune-og.db' onInit={migrate} useSuspense>
      <YoutubeWebView />
        <PlayerProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider value={NAV_THEME[colorScheme ?? 'dark']}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
            </ThemeProvider>
          </GestureHandlerRootView>
          
        </PlayerProvider>
      </SQLiteProvider>
    </>

  );
}
