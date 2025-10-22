import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { AuthProvider, useAuth } from '@/store/auth-context';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemeToggle } from '@/components/theme-toggle';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

const RouteGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const isAuthGroup = segments[0] === "auth";
    if (!user && !isAuthGroup && !isLoading)
      router.replace("/auth/login");
    else if (user && isAuthGroup && !isLoading)
      router.replace("/");
  }, [user, segments])

  return <>{children}</>
}

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
        <AuthProvider>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Stack>
            <Stack.Screen name="(tabs)" options={{
              title: 'ExpTrack',
              headerTransparent: true,
              headerRight: () => <ThemeToggle />,
            }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
          </Stack>
          <PortalHost />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

